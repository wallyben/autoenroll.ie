/**
 * PRSI (Pay Related Social Insurance) Type Definitions
 * 
 * Legal Reference: Social Welfare Consolidation Act 2005
 * Updated for Auto-Enrolment Retirement Savings System Act 2024
 * 
 * PRSI Classification determines eligibility for Auto-Enrolment
 * Only certain PRSI classes qualify for the AE scheme
 */

/**
 * PRSI Class determines social insurance contributions and benefits
 * 
 * AE-Qualifying Classes: A, H
 * Non-Qualifying Classes: B, C, D, E, J, K, M, P, S
 */
export enum PRSIClass {
  /** Class A: Standard employees under 66 (AE QUALIFYING) */
  A = 'A',
  
  /** Class B: Permanent/pensionable public servants recruited before April 1995 (NON-QUALIFYING) */
  B = 'B',
  
  /** Class C: Commissioned officers in Defence Forces (NON-QUALIFYING) */
  C = 'C',
  
  /** Class D: Permanent/pensionable public servants recruited from April 1995 (NON-QUALIFYING) */
  D = 'D',
  
  /** Class E: Unestablished public servants not in Class A (NON-QUALIFYING) */
  E = 'E',
  
  /** Class H: Non-PAYE earners with income < €5,000 (AE QUALIFYING if other conditions met) */
  H = 'H',
  
  /** Class J: Employees with income < €38 per week (NON-QUALIFYING) */
  J = 'J',
  
  /** Class K: Employees entitled to civil/military pension over €127.50 per week (NON-QUALIFYING) */
  K = 'K',
  
  /** Class M: Employees under 16 years (NON-QUALIFYING) */
  M = 'M',
  
  /** Class P: Employees over 66 years (NON-QUALIFYING) */
  P = 'P',
  
  /** Class S: Self-employed persons (NON-QUALIFYING) */
  S = 'S',
}

/**
 * PRSI Subclasses provide additional classification detail
 */
export enum PRSISubclass {
  /** A0: Standard rate, full benefits */
  A0 = 'A0',
  
  /** A1: Modified rate for public service recruited post-1995 */
  A1 = 'A1',
  
  /** A2: Modified rate for share fishermen */
  A2 = 'A2',
  
  /** A3: Modified rate, reduced illness benefit */
  A3 = 'A3',
  
  /** A8: Reduced rate for earnings below €352/week */
  A8 = 'A8',
  
  /** A9: Reduced rate for earnings below €352/week (certain employments) */
  A9 = 'A9',
}

/**
 * PRSI contribution rates by income band
 * Updated annually - these are 2025 rates
 */
export interface PRSIContributionRate {
  /** Weekly earnings threshold */
  weeklyEarningsLower: number;
  weeklyEarningsUpper: number | null;
  
  /** Employee contribution rate (%) */
  employeeRate: number;
  
  /** Employer contribution rate (%) */
  employerRate: number;
  
  /** Effective date for these rates */
  effectiveFrom: Date;
}

/**
 * PRSI Rate Bands for 2025
 * Source: Department of Social Protection
 */
export const PRSI_RATES_2025: PRSIContributionRate[] = [
  {
    weeklyEarningsLower: 0,
    weeklyEarningsUpper: 352,
    employeeRate: 0,
    employerRate: 8.8,
    effectiveFrom: new Date('2025-01-01'),
  },
  {
    weeklyEarningsLower: 352.01,
    weeklyEarningsUpper: null, // No upper limit
    employeeRate: 4.0,
    employerRate: 11.05,
    effectiveFrom: new Date('2025-01-01'),
  },
];

/**
 * PRSI classes that qualify for Auto-Enrolment
 */
export const AE_QUALIFYING_PRSI_CLASSES: PRSIClass[] = [
  PRSIClass.A,
  PRSIClass.H,
];

/**
 * Detailed PRSI classification information
 */
export interface PRSIClassification {
  /** Main PRSI class */
  class: PRSIClass;
  
  /** Optional subclass for finer classification */
  subclass?: PRSISubclass;
  
  /** Whether this classification qualifies for AE */
  qualifiesForAE: boolean;
  
  /** Reason if not qualifying */
  nonQualifyingReason?: string;
  
  /** Weekly earnings (for rate calculation) */
  weeklyEarnings: number;
  
  /** Applicable employee contribution rate (%) */
  employeeContributionRate: number;
  
  /** Applicable employer contribution rate (%) */
  employerContributionRate: number;
}

/**
 * PRSI exemptions and special cases
 */
export interface PRSIExemption {
  /** Type of exemption */
  type: PRSIExemptionType;
  
  /** Reason for exemption */
  reason: string;
  
  /** Supporting documentation required */
  requiresDocumentation: boolean;
  
  /** Effective date of exemption */
  effectiveFrom: Date;
  
  /** Expiry date (if temporary) */
  expiryDate?: Date;
}

export enum PRSIExemptionType {
  /** Employee over age 66 */
  AGE_OVER_66 = 'AGE_OVER_66',
  
  /** Earnings below €38 per week */
  LOW_EARNINGS = 'LOW_EARNINGS',
  
  /** Existing occupational pension scheme member */
  EXISTING_PENSION = 'EXISTING_PENSION',
  
  /** Entitled to civil/military pension */
  CIVIL_MILITARY_PENSION = 'CIVIL_MILITARY_PENSION',
  
  /** Director with >50% shareholding */
  CONTROLLING_DIRECTOR = 'CONTROLLING_DIRECTOR',
  
  /** Self-employed individual */
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  
  /** Under 16 years */
  UNDER_AGE_16 = 'UNDER_AGE_16',
  
  /** Spouse employed by spouse */
  SPOUSAL_EMPLOYMENT = 'SPOUSAL_EMPLOYMENT',
}

/**
 * PRSI calculation result
 */
export interface PRSICalculation {
  /** Classification details */
  classification: PRSIClassification;
  
  /** Any applicable exemptions */
  exemptions: PRSIExemption[];
  
  /** Gross weekly earnings */
  weeklyEarnings: number;
  
  /** Employee PRSI amount (EUR per week) */
  employeeContribution: number;
  
  /** Employer PRSI amount (EUR per week) */
  employerContribution: number;
  
  /** Total PRSI (EUR per week) */
  totalContribution: number;
  
  /** Whether employee qualifies for AE based on PRSI */
  aeQualifying: boolean;
  
  /** Calculation timestamp */
  calculatedAt: Date;
}
