// Cloudflare Workers function for create-ai-sandbox API
export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    // Check for demo mode - Cloudflare doesn't have E2B by default
    const isDemo = !env.E2B_API_KEY;
    
    if (isDemo) {
      console.log('[create-ai-sandbox] Demo mode: Creating mock sandbox...');
      const mockSandboxId = 'demo-cf-' + Date.now().toString();
      const mockHost = 'demo.edu-bricks.local';
      
      return new Response(JSON.stringify({
        success: true,
        sandboxId: mockSandboxId,
        url: `https://${mockHost}`,
        message: 'Demo sandbox created - AI code generation available, live preview requires E2B setup',
        isDemo: true,
        structure: 'Demo project structure:\n├── src/\n│   ├── App.jsx\n│   ├── main.jsx\n│   └── index.css\n├── index.html\n└── package.json'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // If E2B_API_KEY is available, implement actual sandbox creation
    // For now, return demo mode
    return new Response(JSON.stringify({
      success: true,
      sandboxId: 'demo-cf-' + Date.now(),
      url: 'https://demo.edu-bricks.local',
      message: 'Cloudflare Workers demo mode',
      isDemo: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('[create-ai-sandbox] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create sandbox',
      isDemo: true
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
