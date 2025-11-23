import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import * as UserModel from '../models/user.model';
import { UnauthorizedError, ValidationError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function register(email: string, password: string): Promise<AuthTokens> {
  const existingUser = await UserModel.findUserByEmail(email);
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.createUser(email, passwordHash);

  logger.info('User registered', { userId: user.id, email: user.email });

  return generateTokens(user);
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const user = await UserModel.findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  logger.info('User logged in', { userId: user.id, email: user.email });

  return generateTokens(user);
}

export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
    const user = await UserModel.findUserById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return generateTokens(user);
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  const user = await UserModel.findUserById(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid current password');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await UserModel.updateUser(userId, { passwordHash });

  logger.info('Password changed', { userId });
}

function generateTokens(user: UserModel.User): AuthTokens {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions);

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as SignOptions);

  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60,
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await UserModel.findUserByEmail(email);
  if (!user) {
    return;
  }

  const resetToken = jwt.sign(
    { userId: user.id, type: 'password_reset' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  logger.info('Password reset requested', { userId: user.id, email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    if (decoded.type !== 'password_reset') {
      throw new UnauthorizedError('Invalid reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await UserModel.updateUser(decoded.userId, { passwordHash });

    logger.info('Password reset completed', { userId: decoded.userId });
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired reset token');
  }
}
