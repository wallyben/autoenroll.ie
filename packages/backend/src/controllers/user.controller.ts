import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as UserModel from '../models/user.model';
import * as AuthService from '../services/auth.service';
import { logger } from '../utils/logger';

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await UserModel.findUserById(req.user!.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found', timestamp: new Date().toISOString() },
      });
      return;
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get profile error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (email) {
      const existing = await UserModel.findUserByEmail(email);
      if (existing && existing.id !== req.user!.userId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email already in use', timestamp: new Date().toISOString() },
        });
        return;
      }
    }

    const updatedUser = await UserModel.updateUser(req.user!.userId, { email });
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Update profile error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Old and new passwords required', timestamp: new Date().toISOString() },
      });
      return;
    }

    await AuthService.changePassword(req.user!.userId, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      data: { message: 'Password changed successfully' },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Change password error', { error });
    res.status(error.statusCode || 500).json({
      success: false,
      error: { code: error.code || 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function deleteAccount(req: AuthRequest, res: Response): Promise<void> {
  try {
    await UserModel.deleteUser(req.user!.userId);

    logger.info('User account deleted', { userId: req.user!.userId });

    res.status(200).json({
      success: true,
      data: { message: 'Account deleted successfully' },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Delete account error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}
