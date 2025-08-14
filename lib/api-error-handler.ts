// Standardized API Error Handling Utility
// Provides consistent error responses and proper JSON formatting for all API routes

import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  details?: any;
  message?: string;
  timestamp?: string;
}

/**
 * Standard HTTP status codes for API responses
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Common error codes used throughout the application
 */
export const ERROR_CODES = {
  // Environment and configuration errors
  MISSING_ENV_VAR: 'MISSING_ENV_VAR',
  INVALID_ENV_VAR: 'INVALID_ENV_VAR',
  CONFIG_ERROR: 'CONFIG_ERROR',
  
  // Authentication and authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_API_KEY: 'INVALID_API_KEY',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_PARAMETER: 'MISSING_PARAMETER',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  MALFORMED_JSON: 'MALFORMED_JSON',
  
  // Sandbox errors
  SANDBOX_NOT_FOUND: 'SANDBOX_NOT_FOUND',
  SANDBOX_CREATION_FAILED: 'SANDBOX_CREATION_FAILED',
  SANDBOX_TIMEOUT: 'SANDBOX_TIMEOUT',
  SANDBOX_RECONNECTION_FAILED: 'SANDBOX_RECONNECTION_FAILED',
  
  // AI service errors
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  AI_TIMEOUT: 'AI_TIMEOUT',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
  AI_INVALID_MODEL: 'AI_INVALID_MODEL',
  
  // Package installation errors
  PACKAGE_INSTALL_FAILED: 'PACKAGE_INSTALL_FAILED',
  PACKAGE_NOT_FOUND: 'PACKAGE_NOT_FOUND',
  NPM_ERROR: 'NPM_ERROR',
  
  // File system errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',
  
  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T = any>(
  data?: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    timestamp: new Date().toISOString()
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string | Error | ApiError,
  statusCode?: number,
  errorCode?: string,
  details?: any
): NextResponse<ApiResponse> {
  let finalErrorCode = errorCode;
  let finalMessage = '';
  let finalStatusCode = statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let finalDetails = details;
  
  // Handle different error types
  if (typeof error === 'string') {
    finalMessage = error;
    finalErrorCode = finalErrorCode || ERROR_CODES.UNKNOWN_ERROR;
  } else if (error instanceof Error) {
    finalMessage = error.message;
    finalErrorCode = finalErrorCode || ERROR_CODES.INTERNAL_ERROR;
    
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      finalDetails = finalDetails || { stack: error.stack };
    }
  } else if (isApiError(error)) {
    finalMessage = error.message;
    finalErrorCode = error.code;
    finalStatusCode = error.statusCode;
    finalDetails = finalDetails || error.details;
  } else {
    finalMessage = 'An unknown error occurred';
    finalErrorCode = ERROR_CODES.UNKNOWN_ERROR;
  }
  
  const response: ApiResponse = {
    success: false,
    error: finalMessage,
    errorCode: finalErrorCode,
    timestamp: new Date().toISOString()
  };
  
  if (finalDetails) {
    response.details = finalDetails;
  }
  
  return NextResponse.json(response, {
    status: finalStatusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * Type guard to check if an object is an ApiError
 */
function isApiError(obj: any): obj is ApiError {
  return obj && typeof obj === 'object' && 
         typeof obj.code === 'string' && 
         typeof obj.message === 'string' && 
         typeof obj.statusCode === 'number';
}

/**
 * Creates specific error responses for common scenarios
 */
export const ErrorResponses = {
  // Environment variable errors
  missingEnvVar: (varName: string) => 
    createErrorResponse(
      `Missing required environment variable: ${varName}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.MISSING_ENV_VAR,
      { variable: varName }
    ),
  
  invalidEnvVar: (varName: string, reason?: string) =>
    createErrorResponse(
      `Invalid environment variable: ${varName}${reason ? ` - ${reason}` : ''}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INVALID_ENV_VAR,
      { variable: varName, reason }
    ),
  
  // Validation errors
  missingParameter: (paramName: string) =>
    createErrorResponse(
      `Missing required parameter: ${paramName}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.MISSING_PARAMETER,
      { parameter: paramName }
    ),
  
  invalidInput: (message: string, details?: any) =>
    createErrorResponse(
      message,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_INPUT,
      details
    ),
  
  malformedJson: (details?: any) =>
    createErrorResponse(
      'Request body contains malformed JSON',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.MALFORMED_JSON,
      details
    ),
  
  // Sandbox errors
  sandboxNotFound: (sandboxId?: string) =>
    createErrorResponse(
      `No active sandbox found${sandboxId ? ` (ID: ${sandboxId})` : ''}`,
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.SANDBOX_NOT_FOUND,
      { sandboxId }
    ),
  
  sandboxCreationFailed: (reason: string) =>
    createErrorResponse(
      `Failed to create sandbox: ${reason}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.SANDBOX_CREATION_FAILED,
      { reason }
    ),
  
  sandboxReconnectionFailed: (sandboxId: string, reason: string) =>
    createErrorResponse(
      `Failed to reconnect to sandbox ${sandboxId}: ${reason}`,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_CODES.SANDBOX_RECONNECTION_FAILED,
      { sandboxId, reason }
    ),
  
  sandboxTimeout: (operation?: string) =>
    createErrorResponse(
      `Sandbox operation timed out${operation ? `: ${operation}` : ''}`,
      HTTP_STATUS.GATEWAY_TIMEOUT,
      ERROR_CODES.SANDBOX_TIMEOUT,
      { operation }
    ),
  
  // AI service errors
  aiServiceError: (provider: string, reason: string) =>
    createErrorResponse(
      `AI service error (${provider}): ${reason}`,
      HTTP_STATUS.BAD_GATEWAY,
      ERROR_CODES.AI_SERVICE_ERROR,
      { provider, reason }
    ),
  
  aiTimeout: (provider: string) =>
    createErrorResponse(
      `AI service timeout (${provider})`,
      HTTP_STATUS.GATEWAY_TIMEOUT,
      ERROR_CODES.AI_TIMEOUT,
      { provider }
    ),
  
  // Package installation errors
  packageInstallFailed: (packages: string[], reason: string) =>
    createErrorResponse(
      `Failed to install packages: ${packages.join(', ')} - ${reason}`,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.PACKAGE_INSTALL_FAILED,
      { packages, reason }
    ),
  
  // Method not allowed
  methodNotAllowed: (method: string, allowedMethods: string[]) =>
    createErrorResponse(
      `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      HTTP_STATUS.METHOD_NOT_ALLOWED,
      ERROR_CODES.UNKNOWN_ERROR,
      { method, allowedMethods }
    )
};

/**
 * Middleware function to handle JSON parsing errors
 */
export async function safeParseJSON<T = any>(
  request: Request,
  defaultValue?: T
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json();
    return { success: true, data: body };
  } catch (error) {
    console.error('[api-error-handler] JSON parsing error:', error);
    return {
      success: false,
      error: ErrorResponses.malformedJson({
        error: error instanceof Error ? error.message : 'Invalid JSON format'
      })
    };
  }
}

/**
 * Wrapper function to handle async API route errors
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('[api-error-handler] Unhandled API error:', error);
      
      // Handle specific error types
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return ErrorResponses.malformedJson({ originalError: error.message });
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return createErrorResponse(
          'Network error occurred while processing request',
          HTTP_STATUS.BAD_GATEWAY,
          ERROR_CODES.NETWORK_ERROR
        );
      }
      
      // Default error handling
      return createErrorResponse(error as Error);
    }
  };
}

/**
 * Validates that required parameters are present in request body
 */
export function validateRequiredParams<T extends Record<string, any>>(
  data: T,
  requiredParams: (keyof T)[]
): { valid: true } | { valid: false; error: NextResponse } {
  const missing: string[] = [];
  
  for (const param of requiredParams) {
    if (data[param] === undefined || data[param] === null || data[param] === '') {
      missing.push(String(param));
    }
  }
  
  if (missing.length > 0) {
    return {
      valid: false,
      error: createErrorResponse(
        `Missing required parameters: ${missing.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.MISSING_PARAMETER,
        { missingParams: missing }
      )
    };
  }
  
  return { valid: true };
}

/**
 * Helper to log API errors consistently
 */
export function logApiError(routeName: string, error: any, context?: any): void {
  const timestamp = new Date().toISOString();
  console.error(`[${routeName}] ${timestamp} API Error:`, {
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error,
    context
  });
}