import { NextRequest, NextResponse } from 'next/server';
import { Sandbox } from '@e2b/code-interpreter';
import { safeParseJSON, createErrorResponse, createSuccessResponse, ErrorResponses, logApiError, validateRequiredParams, withErrorHandling } from '@/lib/api-error-handler';
import { validateE2BApiKey } from '@/lib/env-validation';
import { appConfig } from '@/config/app.config';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
}

export const POST = withErrorHandling(async function POST(request: NextRequest) {
  try {
    // Safe JSON parsing with proper error handling
    const parseResult = await safeParseJSON(request, {});
    if (!parseResult.success) {
      return parseResult.error;
    }
    
    const { packages, sandboxId } = parseResult.data;
    
    // Validate required parameters
    const validation = validateRequiredParams(parseResult.data, ['packages']);
    if (!validation.valid) {
      return validation.error;
    }
    
    // Validate packages array format
    if (!Array.isArray(packages) || packages.length === 0) {
      return createErrorResponse(
        'Packages must be a non-empty array',
        400,
        'INVALID_PACKAGES_FORMAT',
        { packages }
      );
    }
    
    // Validate and deduplicate package names
    const validPackages = [...new Set(packages)]
      .filter(pkg => pkg && typeof pkg === 'string' && pkg.trim() !== '')
      .map(pkg => pkg.trim());
    
    if (validPackages.length === 0) {
      return createErrorResponse(
        'No valid package names provided',
        400,
        'NO_VALID_PACKAGES',
        { originalPackages: packages }
      );
    }
    
    // Log if duplicates were found
    if (packages.length !== validPackages.length) {
      console.log(`[install-packages] Cleaned packages: removed ${packages.length - validPackages.length} invalid/duplicate entries`);
      console.log(`[install-packages] Original:`, packages);
      console.log(`[install-packages] Cleaned:`, validPackages);
    }
    
    // Try to get sandbox - either from global or reconnect
    let sandbox = global.activeSandbox;
    
    if (!sandbox && sandboxId) {
      console.log(`[install-packages] Reconnecting to sandbox ${sandboxId}...`);
      
      // Validate E2B API key before attempting reconnection
      const keyValidation = validateE2BApiKey();
      if (!keyValidation.valid) {
        logApiError('install-packages', keyValidation.error, { step: 'sandbox-reconnect-validation', sandboxId });
        return ErrorResponses.missingEnvVar('E2B_API_KEY');
      }
      
      try {
        sandbox = await Sandbox.connect(sandboxId, { apiKey: process.env.E2B_API_KEY });
        global.activeSandbox = sandbox;
        console.log(`[install-packages] Successfully reconnected to sandbox ${sandboxId}`);
      } catch (error) {
        logApiError('install-packages', error, { step: 'sandbox-reconnection', sandboxId });
        return ErrorResponses.sandboxReconnectionFailed(
          sandboxId, 
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
    
    if (!sandbox) {
      return ErrorResponses.sandboxNotFound(sandboxId);
    }
    
    console.log('[install-packages] Installing packages:', packages);
    
    // Create a response stream for real-time updates
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Function to send progress updates with error handling
    const sendProgress = async (data: any) => {
      try {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        await writer.write(encoder.encode(message));
      } catch (writeError) {
        console.error('[install-packages] Error writing to stream:', writeError);
        // Don't throw here to avoid breaking the stream
      }
    };
    
    // Start installation in background
    (async (sandboxInstance) => {
      try {
        await sendProgress({ 
          type: 'start', 
          message: `Installing ${validPackages.length} package${validPackages.length > 1 ? 's' : ''}...`,
          packages: validPackages 
        });
        
        // Kill any existing Vite process first
        await sendProgress({ type: 'status', message: 'Stopping development server...' });
        
        await sandboxInstance.runCode(`
import subprocess
import os
import signal

# Try to kill any existing Vite process
try:
    with open('/tmp/vite-process.pid', 'r') as f:
        pid = int(f.read().strip())
        os.kill(pid, signal.SIGTERM)
        print("Stopped existing Vite process")
except:
    print("No existing Vite process found")
        `);
        
        // Check which packages are already installed
        await sendProgress({ 
          type: 'status', 
          message: 'Checking installed packages...' 
        });
        
        const checkResult = await sandboxInstance.runCode(`
import os
import json

os.chdir('/home/user/app')

# Read package.json to check installed packages
try:
    with open('package.json', 'r') as f:
        package_json = json.load(f)
    
    dependencies = package_json.get('dependencies', {})
    dev_dependencies = package_json.get('devDependencies', {})
    all_deps = {**dependencies, **dev_dependencies}
    
    # Check which packages need to be installed
    packages_to_check = ${JSON.stringify(validPackages)}
    already_installed = []
    need_install = []
    
    for pkg in packages_to_check:
        # Handle scoped packages
        if pkg.startswith('@'):
            pkg_name = pkg
        else:
            # Extract package name without version
            pkg_name = pkg.split('@')[0]
        
        if pkg_name in all_deps:
            already_installed.append(pkg_name)
        else:
            need_install.append(pkg)
    
    print(f"Already installed: {already_installed}")
    print(f"Need to install: {need_install}")
    print(f"NEED_INSTALL:{json.dumps(need_install)}")
    
except Exception as e:
    print(f"Error checking packages: {e}")
    print(f"NEED_INSTALL:{json.dumps(packages_to_check)}")
        `);
        
        // Parse packages that need installation
        let packagesToInstall = validPackages;
        
        // Check if checkResult has the expected structure
        if (checkResult && checkResult.results && checkResult.results[0] && checkResult.results[0].text) {
          const outputLines = checkResult.results[0].text.split('\n');
          for (const line of outputLines) {
            if (line.startsWith('NEED_INSTALL:')) {
              try {
                packagesToInstall = JSON.parse(line.substring('NEED_INSTALL:'.length));
              } catch (e) {
                console.error('Failed to parse packages to install:', e);
              }
            }
          }
        } else {
          console.error('[install-packages] Invalid checkResult structure:', checkResult);
          // If we can't check, just try to install all packages
          packagesToInstall = validPackages;
        }
        
        
        if (packagesToInstall.length === 0) {
          await sendProgress({ 
            type: 'success', 
            message: 'All packages are already installed',
            installedPackages: [],
            alreadyInstalled: validPackages
          });
          return;
        }
        
        // Install only packages that aren't already installed
        const packageList = packagesToInstall.join(' ');
        // Only send the npm install command message if we're actually installing new packages
        await sendProgress({ 
          type: 'info', 
          message: `Installing ${packagesToInstall.length} new package(s): ${packagesToInstall.join(', ')}`
        });
        
        let installResult;
        try {
          installResult = await sandboxInstance.runCode(`
import subprocess
import os
import signal
import time

os.chdir('/home/user/app')

# Set up timeout handler
def timeout_handler(signum, frame):
    raise TimeoutError("npm install timeout after 60 seconds")

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(60)  # 60 second timeout

try:
    # Run npm install with output capture
    packages_to_install = ${JSON.stringify(packagesToInstall)}
    cmd_args = ['npm', 'install', '--legacy-peer-deps'] + packages_to_install

    print(f"Running command: {' '.join(cmd_args)}")

    process = subprocess.Popen(
        cmd_args,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Stream output with timeout
    start_time = time.time()
    while True:
        if time.time() - start_time > 60:
            process.kill()
            raise TimeoutError("npm install exceeded 60 second timeout")
            
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())

    # Get the return code
    rc = process.poll()

    # Capture any stderr
    stderr = process.stderr.read()
    if stderr:
        print("STDERR:", stderr)
        if 'ERESOLVE' in stderr:
            print("ERESOLVE_ERROR: Dependency conflict detected - using --legacy-peer-deps flag")

    print(f"\\nInstallation completed with code: {rc}")

    # Verify packages were installed
    import json
    try:
        with open('/home/user/app/package.json', 'r') as f:
            package_json = json.load(f)
        
        installed = []
        failed = []
        for pkg in packages_to_install:
            if pkg in package_json.get('dependencies', {}) or pkg in package_json.get('devDependencies', {}):
                installed.append(pkg)
                print(f"✓ Verified {pkg}")
            else:
                failed.append(pkg)
                print(f"✗ Package {pkg} not found in dependencies")
        
        print(f"\\nVerified installed packages: {installed}")
        print(f"Failed packages: {failed}")
        print(f"INSTALL_STATUS:SUCCESS:{rc}")
    except Exception as verify_error:
        print(f"Error verifying installation: {verify_error}")
        print(f"INSTALL_STATUS:VERIFY_ERROR:{rc}")

except TimeoutError as e:
    print(f"INSTALL_STATUS:TIMEOUT:{str(e)}")
    raise e
except Exception as e:
    print(f"INSTALL_STATUS:ERROR:{str(e)}")
    raise e
finally:
    signal.alarm(0)  # Clear alarm
        `, { timeout: appConfig.packages.installTimeout }); // Use config timeout
        } catch (installError) {
          logApiError('install-packages', installError, { step: 'npm-install', packages: packagesToInstall });
          
          await sendProgress({ 
            type: 'error', 
            message: `npm install failed: ${installError instanceof Error ? installError.message : 'Unknown error'}`,
            packages: packagesToInstall
          });
          return;
        }
        
        // Send npm output
        const output = installResult?.output || installResult?.logs?.stdout?.join('\n') || '';
        const npmOutputLines = output.split('\n').filter((line: string) => line.trim());
        for (const line of npmOutputLines) {
          if (line.includes('STDERR:')) {
            const errorMsg = line.replace('STDERR:', '').trim();
            if (errorMsg && errorMsg !== 'undefined') {
              await sendProgress({ type: 'error', message: errorMsg });
            }
          } else if (line.includes('ERESOLVE_ERROR:')) {
            const msg = line.replace('ERESOLVE_ERROR:', '').trim();
            await sendProgress({ 
              type: 'warning', 
              message: `Dependency conflict resolved with --legacy-peer-deps: ${msg}` 
            });
          } else if (line.includes('npm WARN')) {
            await sendProgress({ type: 'warning', message: line });
          } else if (line.trim() && !line.includes('undefined')) {
            await sendProgress({ type: 'output', message: line });
          }
        }
        
        // Check if installation was successful
        const installedMatch = output.match(/Verified installed packages: \[(.*?)\]/);
        let installedPackages: string[] = [];
        
        if (installedMatch && installedMatch[1]) {
          installedPackages = installedMatch[1]
            .split(',')
            .map((p: string) => p.trim().replace(/'/g, ''))
            .filter((p: string) => p.length > 0);
        }
        
        if (installedPackages.length > 0) {
          await sendProgress({ 
            type: 'success', 
            message: `Successfully installed: ${installedPackages.join(', ')}`,
            installedPackages 
          });
        } else {
          await sendProgress({ 
            type: 'error', 
            message: 'Failed to verify package installation' 
          });
        }
        
        // Restart Vite dev server
        await sendProgress({ type: 'status', message: 'Restarting development server...' });
        
        await sandboxInstance.runCode(`
import subprocess
import os
import time

os.chdir('/home/user/app')

# Kill any existing Vite processes
subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(1)

# Start Vite dev server
env = os.environ.copy()
env['FORCE_COLOR'] = '0'

process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

print(f'✓ Vite dev server restarted with PID: {process.pid}')

# Store process info for later
with open('/tmp/vite-process.pid', 'w') as f:
    f.write(str(process.pid))

# Wait a bit for Vite to start up
time.sleep(3)

# Touch files to trigger Vite reload
subprocess.run(['touch', '/home/user/app/package.json'])
subprocess.run(['touch', '/home/user/app/vite.config.js'])

print("Vite restarted and should now recognize all packages")
        `);
        
        await sendProgress({ 
          type: 'complete', 
          message: 'Package installation complete and dev server restarted!',
          installedPackages 
        });
        
      } catch (error) {
        logApiError('install-packages', error, { step: 'stream-processing' });
        
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during package installation';
        await sendProgress({ 
          type: 'error', 
          message: errorMessage,
          errorCode: 'PACKAGE_INSTALL_ERROR'
        });
      } finally {
        try {
          await writer.close();
        } catch (closeError) {
          console.error('[install-packages] Error closing writer:', closeError);
        }
      }
    })(sandbox);
    
    // Return the stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    logApiError('install-packages', error, { step: 'initialization' });
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to initialize package installation stream',
      500,
      'STREAM_INITIALIZATION_FAILED'
    );
  }
});