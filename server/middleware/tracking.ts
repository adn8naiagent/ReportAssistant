import { Request, Response, NextFunction } from 'express';
import { createSession, updateSessionActivity } from '../utils/tracking';

// Extend Express Request type to include sessionId
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

const SESSION_COOKIE_NAME = 'ta_session_id';

/**
 * Parse cookies from request header
 */
function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.split('=');
    const trimmedName = name?.trim();
    if (trimmedName) {
      cookies[trimmedName] = rest.join('=').trim();
    }
    return cookies;
  }, {} as Record<string, string>);
}

/**
 * Fetch geolocation data from ipapi.co
 */
async function getGeolocation(ipAddress: string | null): Promise<{ country: string | null; city: string | null }> {
  if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.')) {
    return { country: null, city: null };
  }

  try {
    const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      headers: { 'User-Agent': 'TeachAssist.ai/1.0' },
    });

    if (!geoResponse.ok) {
      return { country: null, city: null };
    }

    const geoData = await geoResponse.json();
    return {
      country: geoData.country_name || null,
      city: geoData.city || null,
    };
  } catch (error) {
    console.error('Geolocation fetch error:', error);
    return { country: null, city: null };
  }
}

/**
 * Tracking middleware for capturing user sessions and activity
 * Automatically creates sessions for new visitors and updates activity for returning users
 */
export async function trackingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get IP address from various possible headers
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      null;

    // Get user agent
    const userAgent = req.headers['user-agent'] || null;

    // Get referrer
    const referrer = req.headers['referer'] || req.headers['referrer'] || null;

    // Get landing page (current URL)
    const landingPage = req.originalUrl || req.url || null;

    // Parse cookies and check if session already exists
    const cookies = parseCookies(req.headers.cookie);
    let sessionId = cookies[SESSION_COOKIE_NAME];

    if (!sessionId) {
      // Fetch geolocation data
      const { country, city } = await getGeolocation(ipAddress);

      // Create a new session
      sessionId = await createSession({
        ipAddress,
        userAgent,
        referrer,
        landingPage,
        userId: (req.user as any)?.id || null, // Get userId from auth middleware if available
        country,
        city,
      });

      // Set session cookie (30 days expiration)
      res.cookie(SESSION_COOKIE_NAME, sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    } else {
      // Update existing session's last activity
      await updateSessionActivity(sessionId);
    }

    // Attach sessionId to request for use in route handlers
    req.sessionId = sessionId;

    next();
  } catch (error) {
    // Log error but don't block the request
    console.error('Tracking middleware error:', error);
    next();
  }
}
