import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import { logger } from '../utils/logger';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const tokens = await AuthService.register(email, password);

    res.status(201).json({
      success: true,
      data: tokens,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Registration error', { error });
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const tokens = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      data: tokens,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Login error', { error });
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: tokens,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Token refresh error', { error });
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    await AuthService.requestPasswordReset(email);

    res.status(200).json({
      success: true,
      data: { message: 'Password reset email sent if account exists' },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Password reset request error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Token and new password are required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    await AuthService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      data: { message: 'Password reset successful' },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Password reset error', { error });
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
