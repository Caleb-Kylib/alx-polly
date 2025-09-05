/**
 * Environment variable validation and configuration
 */

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SECRET_KEY?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Validates and returns environment variables
 * Throws an error if required variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ] as const;

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL (https://*.supabase.co)'
    );
  }

  // Validate Supabase anon key format (should be a JWT)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!anonKey.includes('.') || anonKey.split('.').length !== 3) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY must be a valid JWT token'
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  };
}

// Validate environment variables on module load
let envConfig: EnvConfig;
try {
  envConfig = getEnvConfig();
} catch (error) {
  console.error('Environment configuration error:', error);
  // In development, we might want to continue with warnings
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

export { envConfig };
