import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as StripeService from '../services/stripe.service';
import { logger } from '../utils/logger';

export async function createOneTimeCheckout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { uploadId } = req.body;

    if (!uploadId) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Upload ID required', timestamp: new Date().toISOString() },
      });
      return;
    }

    const checkout = await StripeService.createOneTimeCheckout(
      uploadId,
      req.user!.userId,
      req.user?.email
    );

    res.status(201).json({
      success: true,
      data: {
        checkoutUrl: checkout.sessionUrl,
        sessionId: checkout.sessionId,
      },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Create one-time checkout error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function createSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Payment method required', timestamp: new Date().toISOString() },
      });
      return;
    }

    const subscription = await StripeService.createSubscription(
      req.user!.userId,
      req.user!.email,
      paymentMethodId
    );

    res.status(201).json({
      success: true,
      data: subscription,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Create subscription error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function cancelSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await StripeService.cancelSubscription(req.user!.userId);

    res.status(200).json({
      success: true,
      data: result,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Cancel subscription error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function getSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    const subscription = await StripeService.getSubscriptionStatus(req.user!.userId);

    res.status(200).json({
      success: true,
      data: subscription,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get subscription error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function webhookHandler(req: any, res: Response): Promise<void> {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    await StripeService.handleWebhook(signature, req.body);

    res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error('Webhook error', { error });
    res.status(400).json({ error: error.message });
  }
}
