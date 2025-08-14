import { NextRequest, NextResponse } from 'next/server';
import type { ConversationState } from '@/types/conversation';
import { safeParseJSON, createErrorResponse, createSuccessResponse, ErrorResponses, logApiError, withErrorHandling } from '@/lib/api-error-handler';

declare global {
  var conversationState: ConversationState | null;
}

// GET: Retrieve current conversation state
export const GET = withErrorHandling(async function GET() {
  try {
    if (!global.conversationState) {
      return createSuccessResponse(
        { state: null },
        'No active conversation'
      );
    }
    
    return createSuccessResponse(
      { state: global.conversationState },
      'Conversation state retrieved successfully'
    );
  } catch (error) {
    logApiError('conversation-state', error, { operation: 'GET' });
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to retrieve conversation state',
      500,
      'CONVERSATION_STATE_READ_FAILED'
    );
  }
});

// POST: Reset or update conversation state
export const POST = withErrorHandling(async function POST(request: NextRequest) {
  try {
    // Safe JSON parsing with proper error handling
    const parseResult = await safeParseJSON(request, {});
    if (!parseResult.success) {
      return parseResult.error;
    }
    
    const { action, data } = parseResult.data;
    
    // Validate required action parameter
    if (!action || typeof action !== 'string') {
      return ErrorResponses.missingParameter('action');
    }
    
    switch (action) {
      case 'reset':
        global.conversationState = {
          conversationId: `conv-${Date.now()}`,
          startedAt: Date.now(),
          lastUpdated: Date.now(),
          context: {
            messages: [],
            edits: [],
            projectEvolution: { majorChanges: [] },
            userPreferences: {}
          }
        };
        
        console.log('[conversation-state] Reset conversation state');
        
        return createSuccessResponse(
          { state: global.conversationState },
          'Conversation state reset successfully'
        );
        
      case 'clear-old':
        // Clear old conversation data but keep recent context
        if (!global.conversationState) {
          return createErrorResponse(
            'No active conversation to clear',
            400,
            'NO_ACTIVE_CONVERSATION'
          );
        }
        
        // Keep only recent data
        global.conversationState.context.messages = global.conversationState.context.messages.slice(-5);
        global.conversationState.context.edits = global.conversationState.context.edits.slice(-3);
        global.conversationState.context.projectEvolution.majorChanges = 
          global.conversationState.context.projectEvolution.majorChanges.slice(-2);
        
        console.log('[conversation-state] Cleared old conversation data');
        
        return createSuccessResponse(
          { state: global.conversationState },
          'Old conversation data cleared successfully'
        );
        
      case 'update':
        if (!global.conversationState) {
          return createErrorResponse(
            'No active conversation to update',
            400,
            'NO_ACTIVE_CONVERSATION'
          );
        }
        
        // Update specific fields if provided
        if (data) {
          if (data.currentTopic) {
            global.conversationState.context.currentTopic = data.currentTopic;
          }
          if (data.userPreferences) {
            global.conversationState.context.userPreferences = {
              ...global.conversationState.context.userPreferences,
              ...data.userPreferences
            };
          }
          
          global.conversationState.lastUpdated = Date.now();
        }
        
        return createSuccessResponse(
          { state: global.conversationState },
          'Conversation state updated successfully'
        );
        
      default:
        return createErrorResponse(
          `Invalid action: ${action}. Valid actions are: reset, clear-old, update`,
          400,
          'INVALID_ACTION',
          { action, validActions: ['reset', 'clear-old', 'update'] }
        );
    }
  } catch (error) {
    logApiError('conversation-state', error, { operation: 'POST' });
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to process conversation state operation',
      500,
      'CONVERSATION_STATE_OPERATION_FAILED'
    );
  }
});

// DELETE: Clear conversation state
export const DELETE = withErrorHandling(async function DELETE() {
  try {
    global.conversationState = null;
    
    console.log('[conversation-state] Cleared conversation state');
    
    return createSuccessResponse(
      null,
      'Conversation state cleared successfully'
    );
  } catch (error) {
    logApiError('conversation-state', error, { operation: 'DELETE' });
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to clear conversation state',
      500,
      'CONVERSATION_STATE_CLEAR_FAILED'
    );
  }
});

// OPTIONS: Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}