/**
 * PRECISION EARNINGS ANNUALIZATION ENGINE
 * 
 * Legal Requirement: Auto-Enrolment Retirement Savings System Act 2024
 * Minimum earnings threshold: €20,000 per annum
 * Maximum pensionable earnings: €80,000 per annum (2025)
 * 
 * CRITICAL: All pay frequencies must be accurately converted to annual equivalents
 * Uses precise day/week counting to eliminate rounding errors
 */

import { PayFrequency } from '../types/employee';

/**
 * Standard constants for pay period conversions
 * Based on precise calculations, not approximations
 */
export const PAY_PERIOD_CONSTANTS = {
  /** Exact days per year (accounting for leap years in 4-year average) */
  DAYS_PER_YEAR: 365.25,
  
  /** Standard weeks per year */
  WEEKS_PER_YEAR: 52.1429, // 365.25 / 7
  
  /** Standard fortnights per year */
  FORTNIGHTS_PER_YEAR: 26.0714, // 365.25 / 14
  
  /** Standard four-week periods per year */
  FOUR_WEEK_PERIODS_PER_YEAR: 13.0357, // 365.25 / 28
  
  /** Standard months per year */
  MONTHS_PER_YEAR: 12,
  
  /** Standard daily working days (5-day week) */
  WORKING_DAYS_PER_YEAR: 260.71, // 52.1429 * 5
} as const;

/**
 * Result of earnings annualization calculation
 */
export interface AnnualizedEarnings {
  /** Original gross pay amount */
  grossPay: number;
  
  /** Pay frequency */
  payFrequency: PayFrequency;
  
  /** Annualized gross earnings */
  annualGross: number;
  
  /** Conversion factor used */
  conversionFactor: number;
  
  /** Number of pay periods per year */
  periodsPerYear: number;
  
  /** Whether earnings meet minimum AE threshold (€20,000) */
  meetsMinimumThreshold: boolean;
  
  /** Pensionable earnings (capped at €80,000) */
  pensionableEarnings: number;
  
  /** Calculation timestamp */
  calculatedAt: Date;
}

/**
 * Convert gross pay to annual equivalent with maximum precision
 * 
 * @param grossPay - Gross pay amount for the period
 * @param payFrequency - Pay frequency
 * @returns Annualized earnings
 * 
 * @example
 * // Weekly pay of €600
 * annualizeEarnings(600, PayFrequency.WEEKLY) 
 * // Returns: { annualGross: 31285.74, ... }
 */
export function annualizeEarnings(
  grossPay: number,
  payFrequency: PayFrequency
): AnnualizedEarnings {
  // Validate inputs
  if (grossPay < 0) {
    throw new Error('Gross pay cannot be negative');
  }
  
  if (!Object.values(PayFrequency).includes(payFrequency)) {
    throw new Error(`Invalid pay frequency: ${payFrequency}`);
  }
  
  // Get conversion factor and periods per year
  const { factor, periodsPerYear } = getAnnualizationFactor(payFrequency);
  
  // Calculate annual gross (using high-precision arithmetic)
  const annualGross = multiplyPrecise(grossPay, factor);
  
  // Check minimum threshold (€20,000)
  const meetsMinimumThreshold = annualGross >= 20000;
  
  // Calculate pensionable earnings (capped at €80,000)
  const pensionableEarnings = Math.min(annualGross, 80000);
  
  return {
    grossPay,
    payFrequency,
    annualGross,
    conversionFactor: factor,
    periodsPerYear,
    meetsMinimumThreshold,
    pensionableEarnings,
    calculatedAt: new Date(),
  };
}

/**
 * Get annualization factor for a pay frequency
 * 
 * @param payFrequency - Pay frequency
 * @returns Conversion factor and periods per year
 */
function getAnnualizationFactor(payFrequency: PayFrequency): {
  factor: number;
  periodsPerYear: number;
} {
  switch (payFrequency) {
    case PayFrequency.WEEKLY:
      return {
        factor: PAY_PERIOD_CONSTANTS.WEEKS_PER_YEAR,
        periodsPerYear: PAY_PERIOD_CONSTANTS.WEEKS_PER_YEAR,
      };
      
    case PayFrequency.FORTNIGHTLY:
      return {
        factor: PAY_PERIOD_CONSTANTS.FORTNIGHTS_PER_YEAR,
        periodsPerYear: PAY_PERIOD_CONSTANTS.FORTNIGHTS_PER_YEAR,
      };
      
    case PayFrequency.FOUR_WEEKLY:
      return {
        factor: PAY_PERIOD_CONSTANTS.FOUR_WEEK_PERIODS_PER_YEAR,
        periodsPerYear: PAY_PERIOD_CONSTANTS.FOUR_WEEK_PERIODS_PER_YEAR,
      };
      
    case PayFrequency.MONTHLY:
      return {
        factor: PAY_PERIOD_CONSTANTS.MONTHS_PER_YEAR,
        periodsPerYear: PAY_PERIOD_CONSTANTS.MONTHS_PER_YEAR,
      };
      
    case PayFrequency.ANNUALLY:
      return {
        factor: 1,
        periodsPerYear: 1,
      };
      
    default:
      throw new Error(`Unsupported pay frequency: ${payFrequency}`);
  }
}

/**
 * Convert annual earnings back to pay period amount
 * 
 * @param annualEarnings - Annual earnings amount
 * @param payFrequency - Target pay frequency
 * @returns Pay period amount
 */
export function deannualizeEarnings(
  annualEarnings: number,
  payFrequency: PayFrequency
): number {
  const { factor } = getAnnualizationFactor(payFrequency);
  return dividePrecise(annualEarnings, factor);
}

/**
 * Calculate pensionable pay for a pay period
 * (Used for contribution deductions)
 * 
 * @param grossPay - Gross pay for period
 * @param payFrequency - Pay frequency
 * @returns Pensionable pay amount for this period
 */
export function calculatePensionablePayForPeriod(
  grossPay: number,
  payFrequency: PayFrequency
): number {
  const annualized = annualizeEarnings(grossPay, payFrequency);
  
  // If doesn't meet minimum, no pensionable earnings
  if (!annualized.meetsMinimumThreshold) {
    return 0;
  }
  
  // Convert pensionable earnings back to period amount
  return deannualizeEarnings(annualized.pensionableEarnings, payFrequency);
}

/**
 * High-precision multiplication to avoid floating-point errors
 * Multiplies and rounds to 2 decimal places (cent precision)
 * 
 * @param a - First number
 * @param b - Second number
 * @returns Product rounded to 2 decimals
 */
export function multiplyPrecise(a: number, b: number): number {
  // Multiply by 100 to work in cents, round, then divide back
  return Math.round(a * b * 100) / 100;
}

/**
 * High-precision division to avoid floating-point errors
 * Divides and rounds to 2 decimal places (cent precision)
 * 
 * @param a - Dividend
 * @param b - Divisor
 * @returns Quotient rounded to 2 decimals
 */
export function dividePrecise(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  // Multiply by 100 to work in cents, round, then divide back
  return Math.round((a / b) * 100) / 100;
}

/**
 * Calculate average annual earnings from multiple pay periods
 * (Used for variable pay scenarios)
 * 
 * @param payAmounts - Array of gross pay amounts
 * @param payFrequency - Pay frequency
 * @returns Average annual earnings
 */
export function calculateAverageAnnualEarnings(
  payAmounts: number[],
  payFrequency: PayFrequency
): number {
  if (payAmounts.length === 0) {
    return 0;
  }
  
  // Calculate total of all pay amounts
  const total = payAmounts.reduce((sum, amount) => sum + amount, 0);
  
  // Calculate average per period
  const averagePerPeriod = dividePrecise(total, payAmounts.length);
  
  // Annualize the average
  const annualized = annualizeEarnings(averagePerPeriod, payFrequency);
  
  return annualized.annualGross;
}

/**
 * Project annual earnings from year-to-date figures
 * 
 * @param ytdEarnings - Year-to-date earnings
 * @param periodsCompleted - Number of pay periods completed
 * @param totalPeriodsInYear - Total pay periods in year
 * @returns Projected annual earnings
 */
export function projectAnnualEarnings(
  ytdEarnings: number,
  periodsCompleted: number,
  totalPeriodsInYear: number
): number {
  if (periodsCompleted === 0 || periodsCompleted > totalPeriodsInYear) {
    throw new Error('Invalid period counts');
  }
  
  // Calculate average per period
  const averagePerPeriod = dividePrecise(ytdEarnings, periodsCompleted);
  
  // Project to full year
  return multiplyPrecise(averagePerPeriod, totalPeriodsInYear);
}

/**
 * Validate earnings amounts for data quality
 * 
 * @param grossPay - Gross pay amount
 * @param payFrequency - Pay frequency
 * @returns Validation result with warnings
 */
export function validateEarnings(
  grossPay: number,
  payFrequency: PayFrequency
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for negative or zero pay
  if (grossPay < 0) {
    errors.push('Gross pay cannot be negative');
  } else if (grossPay === 0) {
    warnings.push('Gross pay is zero - employee may be unpaid leave');
  }
  
  // Check for unreasonably low pay
  const annualized = annualizeEarnings(grossPay, payFrequency);
  
  if (annualized.annualGross < 1000 && annualized.annualGross > 0) {
    warnings.push('Annual earnings below €1,000 - may indicate data entry error');
  }
  
  // Check for unreasonably high pay (potential data error)
  if (annualized.annualGross > 500000) {
    warnings.push('Annual earnings exceed €500,000 - please verify data accuracy');
  }
  
  // Check minimum wage compliance (2025: €12.70/hour, 39-hour week = €25,770 annually)
  const MINIMUM_WAGE_ANNUAL_2025 = 25770;
  if (annualized.annualGross < MINIMUM_WAGE_ANNUAL_2025 && annualized.annualGross > 0) {
    warnings.push(`Annual earnings (€${annualized.annualGross.toFixed(2)}) below minimum wage (€${MINIMUM_WAGE_ANNUAL_2025})`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate earnings for partial year (e.g., mid-year joiners)
 * 
 * @param grossPay - Gross pay per period
 * @param payFrequency - Pay frequency
 * @param startDate - Employment start date
 * @param endDate - End date (defaults to today)
 * @returns Pro-rata annual earnings
 */
export function calculateProRataEarnings(
  grossPay: number,
  payFrequency: PayFrequency,
  startDate: Date,
  endDate: Date = new Date()
): number {
  // Calculate days worked
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysWorked = Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay);
  
  // Calculate proportion of year
  const proportionOfYear = daysWorked / PAY_PERIOD_CONSTANTS.DAYS_PER_YEAR;
  
  // Annualize earnings
  const annualized = annualizeEarnings(grossPay, payFrequency);
  
  // Pro-rate to days worked
  return multiplyPrecise(annualized.annualGross, proportionOfYear);
}

/**
 * Earnings band classification for reporting
 * 
 * @param annualEarnings - Annual earnings
 * @returns Earnings band string
 */
export function getEarningsBand(annualEarnings: number): string {
  if (annualEarnings < 20000) return 'Below €20k (Not AE Qualifying)';
  if (annualEarnings < 30000) return '€20k-€30k';
  if (annualEarnings < 40000) return '€30k-€40k';
  if (annualEarnings < 50000) return '€40k-€50k';
  if (annualEarnings < 60000) return '€50k-€60k';
  if (annualEarnings < 80000) return '€60k-€80k';
  if (annualEarnings < 100000) return '€80k-€100k';
  return 'Over €100k';
}
