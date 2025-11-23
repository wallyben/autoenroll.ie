/**
 * Volume Pricing Bundle Types
 * 
 * P1 Feature: Bulk report purchases at discounted rates
 * 
 * Pricing:
 * - Single report: €49
 * - 10-pack: €39/report (€390 total, 20% discount)
 * - 50-pack: €29/report (€1,450 total, 41% discount)
 * - 200-pack: €19/report (€3,800 total, 61% discount)
 */

export enum BundleSize {
  SINGLE = 1,
  SMALL = 10,
  MEDIUM = 50,
  LARGE = 200,
}

export interface BundlePricing {
  bundleSize: BundleSize;
  pricePerReport: number; // in cents
  totalPrice: number; // in cents
  discountPercent: number;
  stripePriceId?: string; // Stripe price ID for checkout
}

export interface Bundle {
  id: string;
  userId: string;
  bundleSize: BundleSize;
  creditsTotal: number;
  creditsRemaining: number;
  pricePerReport: number; // in cents
  totalPaid: number; // in cents
  purchaseDate: Date;
  expiryDate?: Date; // Optional: credits expire after 1 year
  stripePaymentIntentId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED';
}

export interface CreditBalance {
  userId: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  activeBundles: Array<{
    bundleId: string;
    creditsRemaining: number;
    purchaseDate: Date;
    expiryDate?: Date;
  }>;
  recentTransactions: Array<{
    bundleId: string;
    type: 'PURCHASE' | 'USAGE' | 'EXPIRY';
    credits: number;
    date: Date;
    description: string;
  }>;
}

export interface BundlePurchaseRequest {
  bundleSize: BundleSize;
  paymentMethodId: string; // Stripe payment method
  billingEmail?: string;
}

export interface BundlePurchaseResponse {
  bundle: Bundle;
  stripePaymentIntentId: string;
  creditsAdded: number;
  totalCreditsRemaining: number;
}

/**
 * Default bundle pricing configurations
 */
export const BUNDLE_PRICING: Record<BundleSize, BundlePricing> = {
  [BundleSize.SINGLE]: {
    bundleSize: BundleSize.SINGLE,
    pricePerReport: 4900, // €49.00
    totalPrice: 4900,
    discountPercent: 0,
  },
  [BundleSize.SMALL]: {
    bundleSize: BundleSize.SMALL,
    pricePerReport: 3900, // €39.00
    totalPrice: 39000, // €390.00
    discountPercent: 20,
  },
  [BundleSize.MEDIUM]: {
    bundleSize: BundleSize.MEDIUM,
    pricePerReport: 2900, // €29.00
    totalPrice: 145000, // €1,450.00
    discountPercent: 41,
  },
  [BundleSize.LARGE]: {
    bundleSize: BundleSize.LARGE,
    pricePerReport: 1900, // €19.00
    totalPrice: 380000, // €3,800.00
    discountPercent: 61,
  },
};

/**
 * Get bundle pricing by size
 */
export function getBundlePricing(bundleSize: BundleSize): BundlePricing {
  return BUNDLE_PRICING[bundleSize];
}

/**
 * Calculate optimal bundle for target report count
 */
export function recommendBundle(targetReports: number): {
  recommended: BundleSize;
  savings: number; // in cents
  reasoning: string;
} {
  if (targetReports <= 1) {
    return {
      recommended: BundleSize.SINGLE,
      savings: 0,
      reasoning: 'Single report purchase',
    };
  }

  if (targetReports <= 10) {
    const singleCost = targetReports * BUNDLE_PRICING[BundleSize.SINGLE].pricePerReport;
    const bundleCost = BUNDLE_PRICING[BundleSize.SMALL].totalPrice;
    const savings = singleCost - bundleCost;

    return {
      recommended: BundleSize.SMALL,
      savings,
      reasoning: `Save €${(savings / 100).toFixed(2)} with 10-pack vs ${targetReports} single purchases`,
    };
  }

  if (targetReports <= 50) {
    const smallBundles = Math.ceil(targetReports / 10);
    const smallCost = smallBundles * BUNDLE_PRICING[BundleSize.SMALL].totalPrice;
    const mediumCost = BUNDLE_PRICING[BundleSize.MEDIUM].totalPrice;
    const savings = smallCost - mediumCost;

    return {
      recommended: BundleSize.MEDIUM,
      savings,
      reasoning: `Save €${(savings / 100).toFixed(2)} with 50-pack vs ${smallBundles}x 10-packs`,
    };
  }

  const mediumBundles = Math.ceil(targetReports / 50);
  const mediumCost = mediumBundles * BUNDLE_PRICING[BundleSize.MEDIUM].totalPrice;
  const largeCost = BUNDLE_PRICING[BundleSize.LARGE].totalPrice;
  const savings = mediumCost - largeCost;

  return {
    recommended: BundleSize.LARGE,
    savings,
    reasoning: `Save €${(savings / 100).toFixed(2)} with 200-pack vs ${mediumBundles}x 50-packs`,
  };
}
