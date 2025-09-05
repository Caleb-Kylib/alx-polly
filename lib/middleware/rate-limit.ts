import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '../rate-limit';

/**
 * Rate limiting middleware for API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  rateLimitType: 'auth' | 'pollCreation' | 'api' = 'api'
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const clientIP = getClientIP(req.headers);
    const rateLimitResult = checkRateLimit(clientIP, rateLimitType);
    
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }
    
    // Add rate limit headers to response
    const response = await handler(req);
    response.headers.set('X-RateLimit-Limit', '5');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    
    return response;
  };
}
