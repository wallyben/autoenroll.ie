/**
 * Enrolment History Types
 * 
 * Tracks employee lifecycle through auto-enrolment, opt-outs, and re-enrolments.
 * Required for 3-year re-enrolment cycle compliance.
 * 
 * Legal Reference:
 * - Automatic Enrolment Retirement Savings System Act 2024, Section 15
 * - Revenue Pensions Manual Chapter 20.5 (Opt-Out Rules)
 */

/**
 * Enrolment event types
 */
export enum EnrolmentEventType {
  /** Initial automatic enrolment */
  AUTO_ENROLLED = 'AUTO_ENROLLED',
  
  /** Employee opted out during 6-month window */
  OPTED_OUT = 'OPTED_OUT',
  
  /** Automatic re-enrolment after 3 years */
  RE_ENROLLED = 'RE_ENROLLED',
  
  /** Manual enrolment (employee request) */
  MANUALLY_ENROLLED = 'MANUALLY_ENROLLED',
  
  /** Employment terminated */
  EMPLOYMENT_ENDED = 'EMPLOYMENT_ENDED',
  
  /** Became ineligible (age/earnings) */
  BECAME_INELIGIBLE = 'BECAME_INELIGIBLE',
}

/**
 * Enrolment history record
 */
export interface EnrolmentHistory {
  /** Unique identifier */
  id?: string;
  
  /** Employee identifier */
  employeeId: string;
  
  /** Employer/user ID */
  userId: string;
  
  /** Type of event */
  eventType: EnrolmentEventType;
  
  /** When the event occurred */
  eventDate: Date;
  
  /** Contribution phase at time of event (1-4) */
  contributionPhase?: number;
  
  /** Contribution rate at time of event (%) */
  contributionRate?: number;
  
  /** For opt-outs: date when 6-month window closes */
  optOutWindowEnd?: Date;
  
  /** For opt-outs: next re-enrolment date (3 years later) */
  nextReEnrolmentDate?: Date;
  
  /** For opt-outs: refund amount (employee + employer contributions) */
  refundAmount?: number;
  
  /** Additional notes */
  notes?: string;
  
  /** Created timestamp */
  createdAt?: Date;
}

/**
 * Employee enrolment status
 */
export interface EnrolmentStatus {
  /** Employee identifier */
  employeeId: string;
  
  /** Current status */
  status: 'ENROLLED' | 'OPTED_OUT' | 'PENDING_ENROLMENT' | 'INELIGIBLE' | 'NOT_STARTED';
  
  /** Date of current status */
  statusDate: Date;
  
  /** Date of last enrolment (initial or re-enrolment) */
  lastEnrolmentDate?: Date;
  
  /** Date of last opt-out */
  lastOptOutDate?: Date;
  
  /** If opted out: when the 6-month window closes */
  optOutWindowEnd?: Date;
  
  /** If opted out: when they should be re-enrolled */
  nextReEnrolmentDate?: Date;
  
  /** Number of times employee has been enrolled */
  enrolmentCount: number;
  
  /** Number of times employee has opted out */
  optOutCount: number;
  
  /** Complete history of events */
  history: EnrolmentHistory[];
}

/**
 * Opt-out validation result
 */
export interface OptOutValidation {
  /** Whether opt-out is valid */
  isValid: boolean;
  
  /** Reason for validation result */
  reason: string;
  
  /** Days remaining in opt-out window (if valid) */
  daysRemaining?: number;
  
  /** Date when opt-out window closes */
  windowEndDate?: Date;
  
  /** Refund amount if opted out now */
  refundAmount?: number;
  
  /** Next re-enrolment date (3 years from last enrolment) */
  nextReEnrolmentDate?: Date;
}

/**
 * Re-enrolment calculation result
 */
export interface ReEnrolmentCalculation {
  /** Employee identifier */
  employeeId: string;
  
  /** Whether employee is due for re-enrolment */
  isDue: boolean;
  
  /** Date when re-enrolment is scheduled */
  reEnrolmentDate: Date;
  
  /** Days until re-enrolment */
  daysUntil: number;
  
  /** Date of last opt-out */
  lastOptOutDate?: Date;
  
  /** Number of previous opt-out cycles */
  optOutCycles: number;
}
