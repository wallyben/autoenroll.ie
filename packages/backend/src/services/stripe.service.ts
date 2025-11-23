import Stripe from 'stripe';
import { config } from '../config';
import { logger } from '../utils/logger';
import * as BillingModel from '../models/billing.model';
import { ValidationError } from '../middleware/error.middleware';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

// One-off payment for report unlock (€49)
export async function createOneTimeCheckout(
  uploadId: string,
  userId: string,
  email?: string
): Promise<{ sessionUrl: string; sessionId: string }> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // ONE-OFF payment (not subscription)
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Auto-Enrolment Compliance Report',
              description: 'Complete employee eligibility analysis, contribution calculations, and PDF compliance report',
              images: ['https://autoenroll.ie/logo.png'], // Optional: add your logo
            },
            unit_amount: 4900, // €49.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${config.cors.origin}/reports/${uploadId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.cors.origin}/upload/${uploadId}?canceled=true`,
      metadata: {
        uploadId,
        userId,
        type: 'one-time-report',
      },
      customer_email: email,
      payment_intent_data: {
        metadata: {
          uploadId,
          userId,
        },
      },
    });

    logger.info('One-time checkout session created', { 
      uploadId, 
      userId, 
      sessionId: session.id 
    });

    return {
      sessionUrl: session.url!,
      sessionId: session.id,
    };
  } catch (error) {
    logger.error('One-time checkout creation error', { error, uploadId, userId });
    throw new ValidationError('Failed to create checkout session');
  }
}

export async function createSubscription(userId: string, email: string, paymentMethodId: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: config.stripe.priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    await BillingModel.createSubscription(
      userId,
      customer.id,
      subscription.id,
      config.stripe.priceId,
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000)
    );

    logger.info('Subscription created', { userId, subscriptionId: subscription.id });

    return {
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      status: subscription.status,
    };
  } catch (error) {
    logger.error('Subscription creation error', { error, userId });
    throw new ValidationError('Failed to create subscription');
  }
}

export async function cancelSubscription(userId: string) {
  try {
    const billing = await BillingModel.findSubscriptionByUserId(userId);
    if (!billing) {
      throw new ValidationError('No active subscription found');
    }

    const subscription = await stripe.subscriptions.update(billing.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await BillingModel.updateSubscription(billing.id, {
      cancelAtPeriodEnd: true,
    });

    logger.info('Subscription cancelled', { userId, subscriptionId: subscription.id });

    return {
      subscriptionId: subscription.id,
      cancelAt: new Date(subscription.cancel_at! * 1000),
    };
  } catch (error) {
    logger.error('Subscription cancellation error', { error, userId });
    throw error;
  }
}

export async function reactivateSubscription(userId: string) {
  try {
    const billing = await BillingModel.findSubscriptionByUserId(userId);
    if (!billing) {
      throw new ValidationError('No subscription found');
    }

    const subscription = await stripe.subscriptions.update(billing.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await BillingModel.updateSubscription(billing.id, {
      cancelAtPeriodEnd: false,
    });

    logger.info('Subscription reactivated', { userId, subscriptionId: subscription.id });

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  } catch (error) {
    logger.error('Subscription reactivation error', { error, userId });
    throw error;
  }
}

export async function getSubscriptionStatus(userId: string) {
  const billing = await BillingModel.findSubscriptionByUserId(userId);
  if (!billing) {
    return null;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(billing.stripeSubscriptionId);
    
    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    };
  } catch (error) {
    logger.error('Failed to retrieve subscription', { error, userId });
    return null;
  }
}

export async function handleWebhook(signature: string, body: Buffer) {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripe.webhookSecret
    );

    logger.info('Stripe webhook received', { type: event.type });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        logger.debug('Unhandled webhook event', { type: event.type });
    }

    return { received: true };
  } catch (error) {
    logger.error('Webhook handling error', { error });
    throw error;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Check if this is a one-time report payment
  if (session.metadata?.type === 'one-time-report') {
    const uploadId = session.metadata.uploadId;
    const userId = session.metadata.userId;

    // Mark upload as PAID in database
    // Note: You'll need to add this function to upload.model.ts
    logger.info('One-time report payment completed', {
      uploadId,
      userId,
      sessionId: session.id,
      amountPaid: session.amount_total,
    });

    // TODO: Store payment record in database
    // await UploadModel.updatePaymentStatus(uploadId, 'PAID', session.id);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const billing = await BillingModel.findSubscriptionByStripeId(subscription.id);
  if (billing) {
    await BillingModel.updateSubscription(billing.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
    logger.info('Subscription updated via webhook', { subscriptionId: subscription.id });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const billing = await BillingModel.findSubscriptionByStripeId(subscription.id);
  if (billing) {
    await BillingModel.updateSubscription(billing.id, {
      status: 'canceled',
    });
    logger.info('Subscription deleted via webhook', { subscriptionId: subscription.id });
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info('Payment succeeded', { invoiceId: invoice.id });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  logger.warn('Payment failed', { invoiceId: invoice.id });
}
