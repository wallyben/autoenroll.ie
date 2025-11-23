import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Content Security Policy Configuration
 * Prevents XSS, clickjacking, and other code injection attacks
 */
export const cspMiddleware = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      'https://js.stripe.com',
      'https://cdn.jsdelivr.net', // For CDN libraries if needed
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS and inline styles
      'https://fonts.googleapis.com',
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
      'data:',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https:', // Allow HTTPS images (for Stripe logos, etc.)
    ],
    connectSrc: [
      "'self'",
      'https://api.stripe.com',
      config.nodeEnv === 'development' ? 'http://localhost:*' : '',
    ].filter(Boolean),
    frameSrc: [
      'https://js.stripe.com',
      'https://hooks.stripe.com',
    ],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    manifestSrc: ["'self'"],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"], // Prevent clickjacking
    baseUri: ["'self'"],
    ...(config.nodeEnv === 'production' ? { upgradeInsecureRequests: [] } : {}),
  },
  reportOnly: false,
});

/**
 * Additional Security Headers
 */
export const securityHeadersMiddleware = helmet({
  // Prevents browsers from MIME-sniffing
  xContentTypeOptions: false, // Will be set separately
  
  // Prevents clickjacking attacks
  xFrameOptions: {
    action: 'deny',
  },
  
  // Enforces HTTPS
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // Removes X-Powered-By header
  hidePoweredBy: true,
  
  // Sets Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

/**
 * Additional security headers manually set
 */
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection (for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

/**
 * CORS Configuration with Production Whitelist
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = config.nodeEnv === 'production'
    ? [
        'https://autoenroll.ie',
        'https://www.autoenroll.ie',
        'https://app.autoenroll.ie',
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
      ];

  const origin = req.headers.origin as string | undefined;

  // Check if origin is allowed
  let isAllowed = origin && allowedOrigins.includes(origin);

  // In development, also allow GitHub Codespaces and similar cloud IDE URLs
  if (!isAllowed && config.nodeEnv !== 'production' && origin) {
    // Allow GitHub Codespaces URLs (pattern: https://*-3000.app.github.dev)
    if (origin.match(/https:\/\/.*-3000\.app\.github\.dev$/)) {
      isAllowed = true;
    }
    // Allow Gitpod URLs
    if (origin.match(/https:\/\/3000-.*\.gitpod\.io$/)) {
      isAllowed = true;
    }
  }

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  next();
};

/**
 * Audit Logging Middleware
 * Logs security-relevant events WITHOUT PII
 */
export const auditLogMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Paths that should be audited
  const auditPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/password-reset',
    '/api/uploads',
    '/api/billing/checkout',
    '/api/billing/subscription',
  ];

  const shouldAudit = auditPaths.some(path => req.path.startsWith(path));

  if (shouldAudit) {
    const startTime = Date.now();

    // Capture response
    const originalSend = res.send;
    res.send = function (data: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log security event (NO PII)
      logger.info('Security audit log', {
        method: req.method,
        path: req.path,
        statusCode,
        duration,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: (req as any).user?.userId || 'anonymous',
        timestamp: new Date().toISOString(),
        // DO NOT LOG: email, passwords, file contents, PPSN, names
      });

      // Log failed authentication attempts
      if (req.path.includes('/login') && statusCode >= 400) {
        logger.warn('Failed login attempt', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString(),
          // DO NOT LOG: email, password
        });
      }

      // Log failed payment attempts
      if (req.path.includes('/checkout') && statusCode >= 400) {
        logger.warn('Failed payment attempt', {
          ip: req.ip,
          userId: (req as any).user?.userId,
          timestamp: new Date().toISOString(),
        });
      }

      return originalSend.call(this, data);
    };
  }

  next();
};

/**
 * Secure Session Configuration
 */
export const secureCookieConfig = {
  httpOnly: true, // Prevent XSS access
  secure: config.nodeEnv === 'production', // HTTPS only in production
  sameSite: 'strict' as const, // CSRF protection
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
  domain: config.nodeEnv === 'production' ? '.autoenroll.ie' : undefined,
};

/**
 * Request Sanitization Middleware
 * Removes potentially dangerous characters from request body
 */
export const sanitizeRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query as any);
  }
  
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  
  next();
};

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove null bytes
      obj[key] = obj[key].replace(/\0/g, '');
      
      // Limit string length to prevent DoS
      if (obj[key].length > 10000) {
        obj[key] = obj[key].substring(0, 10000);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

/**
 * IP-based Request Tracking
 * Tracks suspicious patterns for security monitoring
 */
const suspiciousPatterns = new Map<string, { count: number; firstSeen: number }>();

export const ipTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const pattern = suspiciousPatterns.get(ip);

  if (pattern) {
    const timeDiff = now - pattern.firstSeen;
    
    // If more than 100 requests in 1 minute from same IP
    if (pattern.count > 100 && timeDiff < 60000) {
      logger.error('Suspicious activity detected', {
        ip,
        requestCount: pattern.count,
        timeWindow: timeDiff,
        path: req.path,
      });
    }
    
    pattern.count++;
    
    // Reset after 5 minutes
    if (timeDiff > 300000) {
      suspiciousPatterns.delete(ip);
    }
  } else {
    suspiciousPatterns.set(ip, { count: 1, firstSeen: now });
  }

  next();
};

/**
 * Apply all security middleware in correct order
 */
export function applySecurityMiddleware(app: any) {
  // 1. Basic security headers
  app.use(securityHeadersMiddleware);
  
  // 2. Additional headers
  app.use(additionalSecurityHeaders);
  
  // 3. CSP headers
  app.use(cspMiddleware);
  
  // 4. CORS with whitelist
  app.use(corsMiddleware);
  
  // 5. Request sanitization
  app.use(sanitizeRequestMiddleware);
  
  // 6. IP tracking
  app.use(ipTrackingMiddleware);
  
  // 7. Audit logging
  app.use(auditLogMiddleware);
  
  logger.info('Security middleware applied', {
    environment: config.nodeEnv,
    features: [
      'CSP',
      'CORS_WHITELIST',
      'HSTS',
      'XSS_PROTECTION',
      'CLICKJACK_PROTECTION',
      'AUDIT_LOGGING',
      'IP_TRACKING',
      'REQUEST_SANITIZATION',
    ],
  });
}
