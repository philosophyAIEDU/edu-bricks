// Environment Variable Validation Utility
// Provides centralized validation for all required environment variables

export interface EnvironmentVariable {
  key: string;
  required: boolean;
  description: string;
  validationFn?: (value: string) => boolean;
}

export const ENV_VARIABLES: Record<string, EnvironmentVariable> = {
  E2B_API_KEY: {
    key: 'E2B_API_KEY',
    required: true,
    description: 'E2B API key for sandbox creation and management',
    validationFn: (value: string) => value.startsWith('e2b_') && value.length > 10
  },
  FIRECRAWL_API_KEY: {
    key: 'FIRECRAWL_API_KEY',
    required: false, // Optional for some features
    description: 'Firecrawl API key for web scraping capabilities'
  },
  ANTHROPIC_API_KEY: {
    key: 'ANTHROPIC_API_KEY',
    required: false, // At least one AI provider is required
    description: 'Anthropic API key for Claude models'
  },
  OPENAI_API_KEY: {
    key: 'OPENAI_API_KEY',
    required: false, // At least one AI provider is required
    description: 'OpenAI API key for GPT models'
  },
  GEMINI_API_KEY: {
    key: 'GEMINI_API_KEY',
    required: false, // At least one AI provider is required
    description: 'Google Gemini API key for Gemini models'
  },
  GROQ_API_KEY: {
    key: 'GROQ_API_KEY',
    required: false, // At least one AI provider is required
    description: 'Groq API key for fast inference'
  },
  ANTHROPIC_BASE_URL: {
    key: 'ANTHROPIC_BASE_URL',
    required: false,
    description: 'Custom Anthropic API base URL (optional)'
  },
  NEXT_PUBLIC_APP_URL: {
    key: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'Public app URL for internal API calls'
  }
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  missingAIProviders: boolean;
}

/**
 * Validates all environment variables
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequired: string[] = [];
  
  // Check individual variables
  for (const envVar of Object.values(ENV_VARIABLES)) {
    const value = process.env[envVar.key];
    
    if (!value || value.trim() === '') {
      if (envVar.required) {
        missingRequired.push(envVar.key);
        errors.push(`Missing required environment variable: ${envVar.key} - ${envVar.description}`);
      } else {
        warnings.push(`Optional environment variable not set: ${envVar.key} - ${envVar.description}`);
      }
      continue;
    }
    
    // Run custom validation if provided
    if (envVar.validationFn && !envVar.validationFn(value)) {
      errors.push(`Invalid format for ${envVar.key}: ${envVar.description}`);
    }
  }
  
  // Check that at least one AI provider is configured
  const aiProviders = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY'];
  const hasAIProvider = aiProviders.some(key => process.env[key] && process.env[key].trim() !== '');
  
  let missingAIProviders = false;
  if (!hasAIProvider) {
    missingAIProviders = true;
    errors.push('No AI provider configured. At least one of the following is required: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingRequired,
    missingAIProviders
  };
}

/**
 * Validates a specific environment variable
 */
export function validateEnvironmentVariable(key: string): { valid: boolean; error?: string } {
  const envVar = ENV_VARIABLES[key];
  if (!envVar) {
    return { valid: false, error: `Unknown environment variable: ${key}` };
  }
  
  const value = process.env[key];
  
  if (!value || value.trim() === '') {
    if (envVar.required) {
      return { valid: false, error: `Missing required environment variable: ${key}` };
    }
    return { valid: true }; // Optional variable not set is OK
  }
  
  if (envVar.validationFn && !envVar.validationFn(value)) {
    return { valid: false, error: `Invalid format for ${key}` };
  }
  
  return { valid: true };
}

/**
 * Gets a validated environment variable value
 */
export function getValidatedEnvVar(key: string): string | null {
  const validation = validateEnvironmentVariable(key);
  if (!validation.valid) {
    console.error(`[env-validation] ${validation.error}`);
    return null;
  }
  
  return process.env[key] || null;
}

/**
 * Throws an error if required environment variables are missing
 */
export function ensureRequiredEnvVars(): void {
  const validation = validateEnvironmentVariables();
  if (!validation.valid) {
    const errorMessage = `Environment validation failed:\n${validation.errors.join('\n')}`;
    throw new Error(errorMessage);
  }
}

/**
 * Logs validation results to console
 */
export function logValidationResults(): void {
  const validation = validateEnvironmentVariables();
  
  if (validation.valid) {
    console.log('[env-validation] ✅ All environment variables validated successfully');
    if (validation.warnings.length > 0) {
      console.log('[env-validation] ⚠️ Warnings:');
      validation.warnings.forEach(warning => console.log(`  ${warning}`));
    }
  } else {
    console.error('[env-validation] ❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`  ${error}`));
    
    if (validation.warnings.length > 0) {
      console.log('[env-validation] ⚠️ Warnings:');
      validation.warnings.forEach(warning => console.log(`  ${warning}`));
    }
  }
}

/**
 * Runtime check for E2B API key specifically
 */
export function validateE2BApiKey(): { valid: boolean; error?: string } {
  const key = process.env.E2B_API_KEY;
  
  if (!key) {
    return {
      valid: false,
      error: 'E2B_API_KEY environment variable is not configured. Get your API key at https://e2b.dev'
    };
  }
  
  if (key.trim() === '' || key === 'your_e2b_api_key_here') {
    return {
      valid: false,
      error: 'E2B_API_KEY is not properly configured. Please set a valid API key.'
    };
  }
  
  // Basic format validation for E2B keys
  if (!key.startsWith('e2b_') && key.length < 10) {
    return {
      valid: false,
      error: 'E2B_API_KEY appears to have an invalid format. Please check your API key.'
    };
  }
  
  return { valid: true };
}

/**
 * Runtime check for AI provider keys
 */
export function validateAIProviderKeys(): { valid: boolean; availableProviders: string[]; error?: string } {
  const providers = [
    { key: 'ANTHROPIC_API_KEY', name: 'Anthropic (Claude)' },
    { key: 'OPENAI_API_KEY', name: 'OpenAI (GPT)' },
    { key: 'GEMINI_API_KEY', name: 'Google (Gemini)' },
    { key: 'GROQ_API_KEY', name: 'Groq' }
  ];
  
  const availableProviders: string[] = [];
  
  for (const provider of providers) {
    const key = process.env[provider.key];
    if (key && key.trim() !== '' && !key.includes('your_') && !key.includes('_here')) {
      availableProviders.push(provider.name);
    }
  }
  
  if (availableProviders.length === 0) {
    return {
      valid: false,
      availableProviders: [],
      error: 'No AI provider API keys are configured. Please set at least one: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY'
    };
  }
  
  return {
    valid: true,
    availableProviders
  };
}