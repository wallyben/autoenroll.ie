import Stripe from 'stripe';
import { PRICING_TIERS } from '@autoenroll/common';
import { STRIPE_SECRET } from './config';

const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET, { apiVersion: '2024-06-20' }) : null;

export async function createCheckoutSession(tierId: string, successUrl: string, cancelUrl: string) {
  const tier = PRICING_TIERS.find((t) => t.id === tierId);
  if (!tier) throw new Error('Unknown tier');
  if (!stripe) {
    return { url: `${successUrl}?mockCheckout=true&tier=${tier.id}` };
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: `AutoEnroll ${tier.name}` },
          recurring: { interval: 'month' },
          unit_amount: tier.priceCents
        },
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl
  });
  return { url: session.url };
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  if (!stripe) return { url: `${returnUrl}?mockPortal=true` };
  const portalSession = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  return { url: portalSession.url };
}
