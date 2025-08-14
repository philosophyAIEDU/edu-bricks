import { NextResponse } from 'next/server';
import { parseJavaScriptFile, buildComponentTree } from '@/lib/file-parser';
import { FileManifest, FileInfo, RouteInfo } from '@/types/file-manifest';
import type { SandboxState } from '@/types/sandbox';
import { createErrorResponse, createSuccessResponse, ErrorResponses, logApiError, withErrorHandling } from '@/lib/api-error-handler';

declare global {
  var activeSandbox: any;
}

export const GET = withErrorHandling(async function GET() {
  try {
    if (!global.activeSandbox) {
      return ErrorResponses.sandboxNotFound();
    }

    console.log('[get-sandbox-files] Fetching and analyzing file structure...');
    
    // Get all React/JS/CSS files with proper error handling
    let result;
    try {
      result = await global.activeSandbox.runCode(`
import os
import json
import traceback

def get_files_content(directory='/home/user/app', extensions=['.jsx', '.js', '.tsx', '.ts', '.css', '.json']):
    files_content = {}
    errors = []
    
    try:
        for root, dirs, files in os.walk(directory):
            # Skip node_modules and other unwanted directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]
            
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, '/home/user/app')
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            # Only include files under 50KB to avoid huge responses
                            if len(content) < 50000:
                                files_content[relative_path] = content
                            else:
                                errors.append(f"File {relative_path} too large ({len(content)} bytes), skipped")
                    except Exception as e:
                        errors.append(f"Error reading {relative_path}: {str(e)}")
    except Exception as e:
        errors.append(f"Error walking directory: {str(e)}")
        
    return files_content, errors

try:
    # Get the files
    files, file_errors = get_files_content()
    
    # Get basic directory structure
    structure = []
    try:
        for root, dirs, files_in_dir in os.walk('/home/user/app'):
            if any(skip in root for skip in ['node_modules', '.git', 'dist', 'build']):
                continue
                
            level = root.replace('/home/user/app', '').count(os.sep)
            indent = ' ' * 2 * level
            structure.append(f"{indent}{os.path.basename(root) or 'app'}/")
            
            if len(structure) > 50:  # Prevent excessive output
                break
                
            sub_indent = ' ' * 2 * (level + 1)
            for file in files_in_dir[:20]:  # Limit files per directory
                structure.append(f"{sub_indent}{file}")
    except Exception as e:
        structure.append(f"Error getting directory structure: {str(e)}")

    result = {
        'success': True,
        'files': files,
        'structure': '\\n'.join(structure),
        'file_count': len(files),
        'errors': file_errors
    }
    
except Exception as e:
    result = {
        'success': False,
        'error': str(e),
        'traceback': traceback.format_exc()
    }

print(json.dumps(result))
      `);
    } catch (sandboxError) {
      logApiError('get-sandbox-files', sandboxError, { step: 'sandbox-code-execution' });
      return createErrorResponse(
        'Failed to execute file retrieval code in sandbox',
        500,
        'SANDBOX_EXECUTION_FAILED',
        { error: sandboxError instanceof Error ? sandboxError.message : String(sandboxError) }
      );
    }

    // Parse sandbox output with error handling
    let parsedResult;
    try {
      const output = result.logs?.stdout?.join('') || '';
      if (!output.trim()) {
        return createErrorResponse(
          'No output received from sandbox file retrieval',
          500,
          'NO_SANDBOX_OUTPUT'
        );
      }
      
      parsedResult = JSON.parse(output);
      
      // Check if the sandbox operation was successful
      if (!parsedResult.success) {
        return createErrorResponse(
          `Sandbox file retrieval failed: ${parsedResult.error}`,
          500,
          'SANDBOX_OPERATION_FAILED',
          { 
            sandboxError: parsedResult.error,
            traceback: parsedResult.traceback 
          }
        );
      }
    } catch (parseError) {
      logApiError('get-sandbox-files', parseError, { step: 'output-parsing', output: result.logs?.stdout });
      return createErrorResponse(
        'Failed to parse sandbox file retrieval output',
        500,
        'OUTPUT_PARSE_FAILED',
        { parseError: parseError instanceof Error ? parseError.message : String(parseError) }
      );
    }
    
    // Build enhanced file manifest with error handling
    let fileManifest: FileManifest;
    try {
      fileManifest = {
        files: {},
        routes: [],
        componentTree: {},
        entryPoint: '',
        styleFiles: [],
        timestamp: Date.now(),
      };
      
      // Process each file
      for (const [relativePath, content] of Object.entries(parsedResult.files)) {
        if (typeof content !== 'string') {
          console.warn(`[get-sandbox-files] Skipping non-string content for ${relativePath}`);
          continue;
        }
        
        const fullPath = `/home/user/app/${relativePath}`;
        
        // Create base file info
        const fileInfo: FileInfo = {
          content: content as string,
          type: 'utility',
          path: fullPath,
          relativePath,
          lastModified: Date.now(),
        };
        
        // Parse JavaScript/JSX files with error handling
        if (relativePath.match(/\.(jsx?|tsx?)$/)) {
          try {
            const parseResult = parseJavaScriptFile(content as string, fullPath);
            Object.assign(fileInfo, parseResult);
          } catch (parseError) {
            console.warn(`[get-sandbox-files] Failed to parse JS file ${relativePath}:`, parseError);
            // Continue with basic file info
          }
          
          // Identify entry point
          if (relativePath === 'src/main.jsx' || relativePath === 'src/index.jsx') {
            fileManifest.entryPoint = fullPath;
          }
          
          // Identify App.jsx
          if (relativePath === 'src/App.jsx' || relativePath === 'App.jsx') {
            fileManifest.entryPoint = fileManifest.entryPoint || fullPath;
          }
        }
        
        // Track style files
        if (relativePath.endsWith('.css')) {
          fileManifest.styleFiles.push(fullPath);
          fileInfo.type = 'style';
        }
        
        fileManifest.files[fullPath] = fileInfo;
      }
      
      // Build component tree with error handling
      try {
        fileManifest.componentTree = buildComponentTree(fileManifest.files);
      } catch (treeError) {
        console.warn('[get-sandbox-files] Failed to build component tree:', treeError);
        fileManifest.componentTree = {};
      }
      
      // Extract routes with error handling
      try {
        fileManifest.routes = extractRoutes(fileManifest.files);
      } catch (routeError) {
        console.warn('[get-sandbox-files] Failed to extract routes:', routeError);
        fileManifest.routes = [];
      }
      
    } catch (manifestError) {
      logApiError('get-sandbox-files', manifestError, { step: 'manifest-building' });
      return createErrorResponse(
        'Failed to build file manifest',
        500,
        'MANIFEST_BUILD_FAILED',
        { error: manifestError instanceof Error ? manifestError.message : String(manifestError) }
      );
    }
    
    // Update global file cache with manifest
    try {
      if (global.sandboxState?.fileCache) {
        global.sandboxState.fileCache.manifest = fileManifest;
      }
    } catch (cacheError) {
      console.warn('[get-sandbox-files] Failed to update global cache:', cacheError);
      // Non-fatal, continue
    }

    return createSuccessResponse({
      files: parsedResult.files,
      structure: parsedResult.structure,
      fileCount: Object.keys(parsedResult.files).length,
      manifest: fileManifest,
      warnings: parsedResult.errors?.length > 0 ? parsedResult.errors : undefined
    }, `Successfully retrieved ${Object.keys(parsedResult.files).length} files from sandbox`);

  } catch (error) {
    logApiError('get-sandbox-files', error, { step: 'general-error' });
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to retrieve sandbox files',
      500,
      'SANDBOX_FILES_RETRIEVAL_FAILED'
    );
  }
});

function extractRoutes(files: Record<string, FileInfo>): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  // Look for React Router usage
  for (const [path, fileInfo] of Object.entries(files)) {
    if (fileInfo.content.includes('<Route') || fileInfo.content.includes('createBrowserRouter')) {
      // Extract route definitions (simplified)
      const routeMatches = fileInfo.content.matchAll(/path=["']([^"']+)["'].*(?:element|component)={([^}]+)}/g);
      
      for (const match of routeMatches) {
        const [, routePath, componentRef] = match;
        routes.push({
          path: routePath,
          component: path,
        });
      }
    }
    
    // Check for Next.js style pages
    if (fileInfo.relativePath.startsWith('pages/') || fileInfo.relativePath.startsWith('src/pages/')) {
      const routePath = '/' + fileInfo.relativePath
        .replace(/^(src\/)?pages\//, '')
        .replace(/\.(jsx?|tsx?)$/, '')
        .replace(/index$/, '');
        
      routes.push({
        path: routePath,
        component: path,
      });
    }
  }
  
  return routes;
}