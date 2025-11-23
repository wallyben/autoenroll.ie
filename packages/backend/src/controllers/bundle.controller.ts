/**
 * Bundle Controller
 * 
 * P1 Feature: Volume pricing bundles for bulk report purchases
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as BundleModel from '../models/bundle.model';
import { 
  BundleSize, 
  BUNDLE_PRICING, 
  getBundlePricing as getPricingInfo,
  recommendBundle,
} from '@autoenroll/common';
import { logger } from '../utils/logger';

// Mock Stripe service (replace with actual Stripe integration)
const mockStripePayment = async (amount: number, paymentMethodId: string): Promise<string> => {
  // In production, integrate with Stripe:
  // const paymentIntent = await stripe.paymentIntents.create({ amount, currency: 'eur', payment_method: paymentMethodId });
  // return paymentIntent.id;
  
  return `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * GET /api/bundles/pricing
 * Get available bundle pricing options
 */
export async function getBundlePricing(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pricing = Object.values(BUNDLE_PRICING).map(p => ({
      bundleSize: p.bundleSize,
      pricePerReport: p.pricePerReport / 100, // Convert to euros
      totalPrice: p.totalPrice / 100,
      discountPercent: p.discountPercent,
      savings: p.bundleSize > 1 
        ? ((BUNDLE_PRICING[BundleSize.SINGLE].pricePerReport * p.bundleSize) - p.totalPrice) / 100
        : 0,
    }));

    res.status(200).json({
      success: true,
      data: { pricing },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get bundle pricing error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

/**
 * POST /api/bundles/purchase
 * Purchase a new bundle
 */
export async function purchaseBundle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { bundleSize, paymentMethodId, billingEmail } = req.body;

    // Validate bundle size
    if (!Object.values(BundleSize).includes(bundleSize)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_BUNDLE_SIZE', message: 'Invalid bundle size', timestamp: new Date().toISOString() },
      });
      return;
    }

    // Get pricing
    const pricing = getPricingInfo(bundleSize);

    // Process payment with Stripe
    const stripePaymentIntentId = await mockStripePayment(pricing.totalPrice, paymentMethodId);

    // Set expiry date (1 year from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Create bundle
    const bundle = await BundleModel.createBundle({
      userId: req.user!.userId,
      bundleSize,
      creditsTotal: bundleSize,
      pricePerReport: pricing.pricePerReport,
      totalPaid: pricing.totalPrice,
      stripePaymentIntentId,
      expiryDate,
    });

    // Get updated credit balance
    const creditBalance = await BundleModel.getUserCreditBalance(req.user!.userId);

    res.status(201).json({
      success: true,
      data: {
        bundle,
        creditsAdded: bundleSize,
        totalCreditsRemaining: creditBalance,
      },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Purchase bundle error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

/**
 * GET /api/bundles/credits
 * Get user's current credit balance and details
 */
export async function getCreditBalance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const creditBalance = await BundleModel.getCreditBalanceDetails(req.user!.userId);

    res.status(200).json({
      success: true,
      data: creditBalance,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get credit balance error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

/**
 * GET /api/bundles
 * Get user's bundle purchase history
 */
export async function getUserBundles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { activeOnly } = req.query;
    const bundles = await BundleModel.getUserBundles(req.user!.userId, activeOnly === 'true');

    res.status(200).json({
      success: true,
      data: { bundles },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get user bundles error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

/**
 * POST /api/bundles/recommend
 * Get bundle recommendation based on target report count
 */
export async function getRecommendation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { targetReports } = req.body;

    if (!targetReports || targetReports < 1) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_TARGET', message: 'Target reports must be >= 1', timestamp: new Date().toISOString() },
      });
      return;
    }

    const recommendation = recommendBundle(targetReports);

    res.status(200).json({
      success: true,
      data: recommendation,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get recommendation error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}
