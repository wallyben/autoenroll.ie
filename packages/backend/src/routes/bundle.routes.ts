/**
 * Bundle Routes
 * 
 * P1 Feature: Volume pricing bundles API endpoints
 */

import { Router } from 'express';
import * as BundleController from '../controllers/bundle.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/bundles/pricing
 * Get available bundle pricing options
 */
router.get('/pricing', BundleController.getBundlePricing);

/**
 * POST /api/bundles/purchase
 * Purchase a new bundle
 * Body: { bundleSize, paymentMethodId, billingEmail? }
 */
router.post('/purchase', BundleController.purchaseBundle);

/**
 * GET /api/bundles/credits
 * Get user's current credit balance and details
 */
router.get('/credits', BundleController.getCreditBalance);

/**
 * GET /api/bundles
 * Get user's bundle purchase history
 */
router.get('/', BundleController.getUserBundles);

/**
 * POST /api/bundles/recommend
 * Get bundle recommendation based on target report count
 * Body: { targetReports }
 */
router.post('/recommend', BundleController.getRecommendation);

export default router;
