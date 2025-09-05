/**
 * Simple in-memory rate limiting utility
 * In production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  // Authentication attempts
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
  },
  // Poll creation
  pollCreation: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 3,
  },
  // General API calls
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 30,
  },
} as const;

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the rate limit (IP, user ID, etc.)
 * @param type - Type of rate limit to apply
 * @returns Object indicating if request is allowed and remaining attempts
 */
export function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const config = RATE_LIMITS[type];
  const now = Date.now();
  const key = `${type}:${identifier}`;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // No entry or window has expired, create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: newEntry.resetTime,
    };
  }
  
  if (entry.count >= config.maxAttempts) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 * @param headers - Request headers
 * @returns Client IP address
 */
export function getClientIP(headers: Headers): string {
  // Check various headers for the real IP
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  const cfConnectingIP = headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

/**
 * Clean up expired rate limit entries
 * This should be called periodically to prevent memory leaks
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
