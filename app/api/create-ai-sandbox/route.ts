import { NextResponse } from 'next/server';
import { Sandbox } from '@e2b/code-interpreter';
import type { SandboxState } from '@/types/sandbox';
import { appConfig } from '@/config/app.config';
import { validateE2BApiKey } from '@/lib/env-validation';
import { createErrorResponse, createSuccessResponse, ErrorResponses, logApiError, withErrorHandling } from '@/lib/api-error-handler';

// Store active sandbox globally
declare global {
  var activeSandbox: any;
  var sandboxData: any;
  var existingFiles: Set<string>;
  var sandboxState: SandboxState;
}

export const POST = withErrorHandling(async function POST() {
  let sandbox: any = null;

  try {
    // Check for demo mode first - force demo mode on Netlify
    const isNetlify = process.env.NETLIFY === 'true';
    const isDemo = process.env.DEMO_MODE === 'true' || !process.env.E2B_API_KEY || isNetlify;
    
    if (isDemo) {
      console.log('[create-ai-sandbox] Demo mode: Creating mock sandbox...');
      const mockSandboxId = 'demo-' + Date.now().toString();
      const mockHost = 'demo.edu-bricks.local';
      
      // Store mock sandbox data
      global.activeSandbox = {
        sandboxId: mockSandboxId,
        kill: async () => {},
        getHost: () => mockHost
      };
      
      global.sandboxData = {
        sandboxId: mockSandboxId,
        url: `https://${mockHost}`,
        isDemo: true
      };
      
      return NextResponse.json({
        sandboxId: mockSandboxId,
        url: `https://${mockHost}`,
        message: 'Demo sandbox created - AI code generation available, live preview requires E2B setup',
        isDemo: true
      });
    }

    // Validate E2B API key using centralized validation
    const keyValidation = validateE2BApiKey();
    if (!keyValidation.valid) {
      logApiError('create-ai-sandbox', keyValidation.error, { step: 'api-key-validation' });
      return ErrorResponses.missingEnvVar('E2B_API_KEY');
    }

    console.log('[create-ai-sandbox] Creating E2B sandbox...');
    
    // Kill existing sandbox if any
    if (global.activeSandbox) {
      console.log('[create-ai-sandbox] Killing existing sandbox...');
      try {
        await global.activeSandbox.kill();
      } catch (e) {
        console.error('Failed to close existing sandbox:', e);
      }
      global.activeSandbox = null;
    }
    
    // Clear existing files tracking
    if (global.existingFiles) {
      global.existingFiles.clear();
    } else {
      global.existingFiles = new Set<string>();
    }

    // Create base sandbox with reduced timeout for Vercel
    console.log(`[create-ai-sandbox] Creating base E2B sandbox with 2 minute timeout...`);
    
    try {
      sandbox = await Sandbox.create({ 
        apiKey: process.env.E2B_API_KEY,
        timeoutMs: 120000 // 2 minutes max for Vercel compatibility
      });
    } catch (sandboxError) {
      console.log('[create-ai-sandbox] E2B sandbox creation failed, enabling demo mode...');
      // Fall back to demo mode if E2B fails
      const mockSandboxId = 'demo-fallback-' + Date.now().toString();
      const mockHost = 'demo.edu-bricks.local';
      
      global.activeSandbox = {
        sandboxId: mockSandboxId,
        kill: async () => {},
        getHost: () => mockHost
      };
      
      global.sandboxData = {
        sandboxId: mockSandboxId,
        url: `https://${mockHost}`,
        isDemo: true
      };
      
      return NextResponse.json({
        sandboxId: mockSandboxId,
        url: `https://${mockHost}`,
        message: 'Demo mode activated - AI code generation available (E2B sandbox creation failed)',
        isDemo: true,
        warning: 'Live preview not available - E2B sandbox creation failed'
      });
    }
    
    const sandboxId = (sandbox as any).sandboxId || Date.now().toString();
    const host = (sandbox as any).getHost(appConfig.e2b.vitePort);
    
    console.log(`[create-ai-sandbox] Sandbox created: ${sandboxId}`);
    console.log(`[create-ai-sandbox] Sandbox host: ${host}`);

    // Set up a basic Vite React app using Python to write files
    console.log('[create-ai-sandbox] Setting up Vite React app...');
    
    // Write all files in a single Python script to avoid multiple executions
    const setupScript = `
import os
import json

print('Setting up React app with Vite and Tailwind...')

# Create directory structure
os.makedirs('/home/user/app/src', exist_ok=True)

# Package.json
package_json = {
    "name": "sandbox-app",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite --host",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    },
    "devDependencies": {
        "@vitejs/plugin-react": "^4.0.0",
        "vite": "^4.3.9",
        "tailwindcss": "^3.3.0",
        "postcss": "^8.4.31",
        "autoprefixer": "^10.4.16"
    }
}

with open('/home/user/app/package.json', 'w') as f:
    json.dump(package_json, f, indent=2)
print('✓ package.json')

# Vite config for E2B - with allowedHosts
vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// E2B-compatible Vite configuration
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: false,
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1']
  }
})"""

with open('/home/user/app/vite.config.js', 'w') as f:
    f.write(vite_config)
print('✓ vite.config.js')

# Tailwind config - standard without custom design tokens
tailwind_config = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}"""

with open('/home/user/app/tailwind.config.js', 'w') as f:
    f.write(tailwind_config)
print('✓ tailwind.config.js')

# PostCSS config
postcss_config = """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}"""

with open('/home/user/app/postcss.config.js', 'w') as f:
    f.write(postcss_config)
print('✓ postcss.config.js')

# Index.html
index_html = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sandbox App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>"""

with open('/home/user/app/index.html', 'w') as f:
    f.write(index_html)
print('✓ index.html')

# Main.jsx
main_jsx = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)"""

with open('/home/user/app/src/main.jsx', 'w') as f:
    f.write(main_jsx)
print('✓ src/main.jsx')

# App.jsx with explicit Tailwind test
app_jsx = """function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <p className="text-lg text-gray-400">
          Sandbox Ready<br/>
          Start building your React app with Vite and Tailwind CSS!
        </p>
      </div>
    </div>
  )
}

export default App"""

with open('/home/user/app/src/App.jsx', 'w') as f:
    f.write(app_jsx)
print('✓ src/App.jsx')

# Index.css with explicit Tailwind directives
index_css = """@tailwind base;
@tailwind components;
@tailwind utilities;

/* Force Tailwind to load */
@layer base {
  :root {
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: rgb(17 24 39);
}"""

with open('/home/user/app/src/index.css', 'w') as f:
    f.write(index_css)
print('✓ src/index.css')

print('\\nAll files created successfully!')
`;

    // Execute the setup script
    try {
      console.log('[create-ai-sandbox] Executing setup script...');
      await sandbox.runCode(setupScript);
    } catch (setupError) {
      logApiError('create-ai-sandbox', setupError, { step: 'setup-script' });
      // Try to kill sandbox on setup failure
      try {
        await sandbox.kill();
      } catch (killError) {
        console.error('[create-ai-sandbox] Failed to cleanup sandbox after setup error:', killError);
      }
      return createErrorResponse(
        `Failed to set up Vite React application: ${setupError instanceof Error ? setupError.message : 'Unknown setup error'}`,
        500,
        'SANDBOX_SETUP_FAILED'
      );
    }
    
    // Install dependencies
    console.log('[create-ai-sandbox] Installing dependencies...');
    try {
      await sandbox.runCode(`
import subprocess
import sys

print('Installing npm packages...')
result = subprocess.run(
    ['npm', 'install'],
    cwd='/home/user/app',
    capture_output=True,
    text=True,
    timeout=120  # 2 minute timeout for npm install
)

if result.returncode == 0:
    print('✓ Dependencies installed successfully')
else:
    print(f'⚠ Warning: npm install had issues: {result.stderr}')
    # Continue anyway as it might still work
    `);
    } catch (installError) {
      console.warn('[create-ai-sandbox] Dependencies installation had issues, continuing anyway:', installError);
      // Don't fail the entire process for dependency installation issues
    }
    
    // Start Vite dev server
    console.log('[create-ai-sandbox] Starting Vite dev server...');
    try {
      await sandbox.runCode(`
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

print(f'✓ Vite dev server started with PID: {process.pid}')
print('Waiting for server to be ready...')
      `);
    } catch (viteError) {
      console.warn('[create-ai-sandbox] Vite server start had issues, continuing anyway:', viteError);
      // Don't fail for Vite startup issues - the server may still work
    }
    
    // Wait for Vite to be fully ready
    await new Promise(resolve => setTimeout(resolve, appConfig.e2b.viteStartupDelay));
    
    // Force Tailwind CSS to rebuild by touching the CSS file
    await sandbox.runCode(`
import os
import time

# Touch the CSS file to trigger rebuild
css_file = '/home/user/app/src/index.css'
if os.path.exists(css_file):
    os.utime(css_file, None)
    print('✓ Triggered CSS rebuild')
    
# Also ensure PostCSS processes it
time.sleep(2)
print('✓ Tailwind CSS should be loaded')
    `);

    // Store sandbox globally
    global.activeSandbox = sandbox;
    global.sandboxData = {
      sandboxId,
      url: `https://${host}`
    };
    
    // Set extended timeout on the sandbox instance if method available
    if (typeof sandbox.setTimeout === 'function') {
      sandbox.setTimeout(appConfig.e2b.timeoutMs);
      console.log(`[create-ai-sandbox] Set sandbox timeout to ${appConfig.e2b.timeoutMinutes} minutes`);
    }
    
    // Initialize sandbox state
    global.sandboxState = {
      fileCache: {
        files: {},
        lastSync: Date.now(),
        sandboxId
      },
      sandbox,
      sandboxData: {
        sandboxId,
        url: `https://${host}`
      }
    };
    
    // Track initial files
    global.existingFiles.add('src/App.jsx');
    global.existingFiles.add('src/main.jsx');
    global.existingFiles.add('src/index.css');
    global.existingFiles.add('index.html');
    global.existingFiles.add('package.json');
    global.existingFiles.add('vite.config.js');
    global.existingFiles.add('tailwind.config.js');
    global.existingFiles.add('postcss.config.js');
    
    console.log('[create-ai-sandbox] Sandbox ready at:', `https://${host}`);
    
    return createSuccessResponse(
      {
        sandboxId,
        url: `https://${host}`,
        filesTracked: Array.from(global.existingFiles || []),
        vitePort: appConfig.e2b.vitePort,
        timeout: appConfig.e2b.timeoutMinutes
      },
      'Sandbox created and Vite React app initialized successfully'
    );

  } catch (error) {
    logApiError('create-ai-sandbox', error, { step: 'general-error' });
    
    // Clean up on error
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch (killError) {
        console.error('[create-ai-sandbox] Failed to cleanup sandbox on error:', killError);
      }
    }
    
    // Return standardized error response
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create sandbox',
      500,
      'SANDBOX_CREATION_FAILED',
      process.env.NODE_ENV === 'development' && error instanceof Error ? { stack: error.stack } : undefined
    );
  }
});

// OPTIONS: Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}