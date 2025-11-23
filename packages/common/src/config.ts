// AE eligibility thresholds (Irish auto-enrolment rules 2024)
export const AE_ELIGIBLE_MIN_AGE = 23;
export const AE_ELIGIBLE_MAX_AGE = 60;
export const AE_LOWER_THRESHOLD_ANNUAL = 20000;
export const AE_UPPER_THRESHOLD_ANNUAL = 80000;

// Validation bounds
export const MIN_EMPLOYMENT_AGE = 16;
export const MAX_EMPLOYMENT_AGE = 75;
export const PAY_PERIOD_STALENESS_MONTHS = 18;
export const MAGIC_LINK_EXPIRATION_MINUTES = 10;

// Contribution escalation schedule
export const CONTRIBUTION_ESCALATION = [
  { year: 1, employee: 0.015, employer: 0.015, state: 0.005 },
  { year: 2, employee: 0.03, employer: 0.03, state: 0.01 },
  { year: 3, employee: 0.045, employer: 0.045, state: 0.015 },
  { year: 4, employee: 0.06, employer: 0.06, state: 0.02 }
];

// Pricing tiers
export const PRICING_TIERS = [
  { id: 'starter', name: 'Starter', priceCents: 1900, uploadsPerMonth: 20 },
  { id: 'growth', name: 'Growth', priceCents: 4900, uploadsPerMonth: 200 },
  { id: 'enterprise', name: 'Enterprise', priceCents: 0, uploadsPerMonth: -1 }
];
