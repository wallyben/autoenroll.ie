import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// Standard rate limiter for most endpoints
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.headers['user-agent'],
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        timestamp: new Date().toISOString(),
      },
    });
  },
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in 1 minute.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful auth attempts
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      email: req.body?.email,
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again in 1 minute.',
        timestamp: new Date().toISOString(),
      },
    });
  },
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads. Please wait before uploading again.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      userId: (req as any).user?.userId,
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'Too many file uploads. Please wait before uploading again.',
        timestamp: new Date().toISOString(),
      },
    });
  },
});

// Rate limiter for validation/processing endpoints
export const validationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 validations per minute
  message: {
    success: false,
    error: {
      code: 'VALIDATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many validation requests. Please slow down.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Validation rate limit exceeded', {
      ip: req.ip,
      userId: (req as any).user?.userId,
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'VALIDATION_RATE_LIMIT_EXCEEDED',
        message: 'Too many validation requests. Please slow down.',
        timestamp: new Date().toISOString(),
      },
    });
  },
});

// Aggressive rate limiter for expensive operations (PDF generation, reports)
export const expensiveOperationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    success: false,
    error: {
      code: 'OPERATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many resource-intensive requests. Please wait before trying again.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Expensive operation rate limit exceeded', {
      ip: req.ip,
      userId: (req as any).user?.userId,
      operation: req.path,
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'OPERATION_RATE_LIMIT_EXCEEDED',
        message: 'Too many resource-intensive requests. Please wait before trying again.',
        timestamp: new Date().toISOString(),
      },
    });
  },
});

// Payment rate limiter (prevent payment spam/fraud)
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 payment attempts per 5 minutes
  message: {
    success: false,
    error: {
      code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
      message: 'Too many payment attempts. Please wait 5 minutes before trying again.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.error('Payment rate limit exceeded - possible fraud', {
      ip: req.ip,
      userId: (req as any).user?.userId,
      uploadId: req.body?.uploadId,
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
        message: 'Too many payment attempts. Please wait 5 minutes before trying again.',
        timestamp: new Date().toISOString(),
      },
    });
  },
});
