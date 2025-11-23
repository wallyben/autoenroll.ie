import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as stagingController from '../controllers/staging-dates.controller';

const router = Router();

/**
 * Get user's staging date configuration
 * GET /api/staging-dates
 */
router.get('/', authMiddleware, stagingController.getStagingConfig);

/**
 * Create or update staging date configuration
 * POST /api/staging-dates
 * Body: { frequency, dates, effectiveFrom, effectiveTo? }
 */
router.post('/', authMiddleware, stagingController.createOrUpdateStagingConfig);

/**
 * Calculate next staging date
 * GET /api/staging-dates/next
 * Query: ?referenceDate=2025-11-23
 */
router.get('/next', authMiddleware, stagingController.calculateNextStagingDate);

/**
 * Get all staging dates for a year
 * GET /api/staging-dates/year/:year
 */
router.get('/year/:year', authMiddleware, stagingController.getStagingDatesForYear);

/**
 * Delete staging date configuration
 * DELETE /api/staging-dates/:id
 */
router.delete('/:id', authMiddleware, stagingController.deleteStagingConfig);

export default router;
