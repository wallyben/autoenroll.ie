import { PricingTier } from './types';

export const AE_LOWER_THRESHOLD_ANNUAL = 20000;
export const AE_UPPER_THRESHOLD_ANNUAL = 80000;
export const AE_ELIGIBLE_MIN_AGE = 23;
export const AE_ELIGIBLE_MAX_AGE = 60;

export const CONTRIBUTION_ESCALATION = [
  { year: 1, employee: 0.015, employer: 0.015, state: 0.005 },
  { year: 2, employee: 0.025, employer: 0.025, state: 0.005 },
  { year: 3, employee: 0.035, employer: 0.035, state: 0.005 },
  { year: 4, employee: 0.06, employer: 0.06, state: 0.005 }
];

export const PRICING_TIERS: PricingTier[] = [
  { id: 'starter', name: 'Starter', priceCents: 1900, uploadsPerMonth: 20 },
  { id: 'growth', name: 'Growth', priceCents: 4900, uploadsPerMonth: 200 },
  { id: 'enterprise', name: 'Enterprise', priceCents: 14900, uploadsPerMonth: 2000 }
];
