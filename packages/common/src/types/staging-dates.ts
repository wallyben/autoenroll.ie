/**
 * Staging Date Types
 * 
 * Irish automatic enrolment legislation requires employers to auto-enrol employees
 * on specific "staging dates" aligned with their payroll schedule.
 * 
 * Legal Reference:
 * - Automatic Enrolment Retirement Savings System Act 2024, Section 12
 * - Revenue Pensions Manual Chapter 20.3
 */

/**
 * Staging date frequency options
 * Employers can choose how frequently they process auto-enrolment
 */
export enum StagingFrequency {
  /** Process auto-enrolment monthly (e.g., 1st of each month) */
  MONTHLY = 'MONTHLY',
  
  /** Process auto-enrolment quarterly (e.g., 1 Jan, Apr, Jul, Oct) */
  QUARTERLY = 'QUARTERLY',
  
  /** Process auto-enrolment bi-annually (e.g., 1 Jan, Jul) */
  BI_ANNUALLY = 'BI_ANNUALLY',
  
  /** Process auto-enrolment annually (e.g., 1 Jan) */
  ANNUALLY = 'ANNUALLY',
}

/**
 * Staging date configuration for an employer
 */
export interface StagingDateConfig {
  /** Unique identifier */
  id?: string;
  
  /** Employer/user ID */
  userId: string;
  
  /** How frequently staging dates occur */
  frequency: StagingFrequency;
  
  /** Specific dates (1-31) for staging. For MONTHLY: [1] or [15]. For QUARTERLY: [1, 1, 1, 1] meaning Jan 1, Apr 1, Jul 1, Oct 1 */
  dates: number[];
  
  /** When this configuration becomes effective */
  effectiveFrom: Date;
  
  /** Optional end date for temporary configurations */
  effectiveTo?: Date;
  
  /** Created timestamp */
  createdAt?: Date;
  
  /** Last updated timestamp */
  updatedAt?: Date;
}

/**
 * Default staging date configuration (quarterly on 1st of Jan, Apr, Jul, Oct)
 */
export const DEFAULT_STAGING_CONFIG: Omit<StagingDateConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  frequency: StagingFrequency.QUARTERLY,
  dates: [1, 1, 1, 1], // 1st of each quarter
  effectiveFrom: new Date('2025-01-01'),
};

/**
 * Result of calculating next staging date
 */
export interface NextStagingDate {
  /** The next staging date */
  date: Date;
  
  /** How many days until this staging date */
  daysUntil: number;
  
  /** The staging date after next (for planning) */
  following: Date;
}

/**
 * Auto-enrolment date calculation result
 */
export interface AutoEnrolmentDate {
  /** Employee identifier */
  employeeId: string;
  
  /** Date when 6-month waiting period ends */
  waitingPeriodEnd: Date;
  
  /** Next staging date after waiting period */
  autoEnrolmentDate: Date;
  
  /** Days until auto-enrolment */
  daysUntilEnrolment: number;
  
  /** Whether employee is ready to enrol (waiting period complete) */
  readyToEnrol: boolean;
}
