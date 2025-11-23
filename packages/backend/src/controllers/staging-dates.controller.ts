import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import * as stagingModel from '../models/staging-dates.model';
import {
  calculateNextStagingDate as calcNextStaging,
  getStagingDatesForYear as getYearDates,
  validateStagingConfig as validateConfig,
  StagingFrequency,
} from '@autoenroll/common';

/**
 * Get user's staging date configuration
 */
export async function getStagingConfig(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const config = await stagingModel.getStagingConfig(userId);

    if (!config) {
      return res.status(404).json({
        error: 'No staging date configuration found',
        message: 'Using default quarterly staging dates (1 Jan, Apr, Jul, Oct)',
      });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Error getting staging config:', error);
    res.status(500).json({ error: 'Failed to get staging configuration' });
  }
}

/**
 * Create or update staging date configuration
 */
export async function createOrUpdateStagingConfig(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { frequency, dates, effectiveFrom, effectiveTo } = req.body;

    // Validate input
    const validationErrors = validateConfig({
      frequency,
      dates,
      effectiveFrom: new Date(effectiveFrom),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
      userId,
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Check if user already has a config
    const existing = await stagingModel.getStagingConfig(userId);

    let config;
    if (existing) {
      config = await stagingModel.updateStagingConfig(existing.id!, {
        frequency: frequency as StagingFrequency,
        dates,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
      });
      logger.info(`Updated staging config for user ${userId}`);
    } else {
      config = await stagingModel.createStagingConfig(
        userId,
        frequency as StagingFrequency,
        dates,
        new Date(effectiveFrom),
        effectiveTo ? new Date(effectiveTo) : undefined
      );
      logger.info(`Created staging config for user ${userId}`);
    }

    res.json({
      success: true,
      data: config,
      message: existing ? 'Configuration updated' : 'Configuration created',
    });
  } catch (error) {
    logger.error('Error creating/updating staging config:', error);
    res.status(500).json({ error: 'Failed to save staging configuration' });
  }
}

/**
 * Calculate next staging date
 */
export async function calculateNextStagingDate(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { referenceDate } = req.query;

    const config = await stagingModel.getStagingConfig(userId);
    const refDate = referenceDate ? new Date(referenceDate as string) : new Date();

    const result = calcNextStaging(config, refDate);

    res.json({
      success: true,
      data: result,
      usingDefaultConfig: !config,
    });
  } catch (error) {
    logger.error('Error calculating next staging date:', error);
    res.status(500).json({ error: 'Failed to calculate next staging date' });
  }
}

/**
 * Get all staging dates for a year
 */
export async function getStagingDatesForYear(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { year } = req.params;

    const config = await stagingModel.getStagingConfig(userId);
    const dates = getYearDates(parseInt(year, 10), config);

    res.json({
      success: true,
      data: {
        year: parseInt(year, 10),
        dates,
        count: dates.length,
      },
      usingDefaultConfig: !config,
    });
  } catch (error) {
    logger.error('Error getting staging dates for year:', error);
    res.status(500).json({ error: 'Failed to get staging dates for year' });
  }
}

/**
 * Delete staging date configuration
 */
export async function deleteStagingConfig(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Verify ownership
    const existing = await stagingModel.getStagingConfig(userId);
    if (!existing || existing.id !== id) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    await stagingModel.deleteStagingConfig(id);

    logger.info(`Deleted staging config ${id} for user ${userId}`);

    res.json({
      success: true,
      message: 'Configuration deleted. Default staging dates will be used.',
    });
  } catch (error) {
    logger.error('Error deleting staging config:', error);
    res.status(500).json({ error: 'Failed to delete staging configuration' });
  }
}
