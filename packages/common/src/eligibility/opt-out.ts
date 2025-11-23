/**
 * Opt-Out and Re-Enrolment Tracker
 * 
 * Validates opt-out requests and calculates re-enrolment dates per Irish legislation.
 * 
 * CRITICAL RULES:
 * - Opt-out window: 6 months from auto-enrolment date
 * - Refund: Full employee + employer contributions
 * - Re-enrolment: 3 years after opt-out (aligned to next staging date)
 * 
 * Legal Reference:
 * - Automatic Enrolment Retirement Savings System Act 2024, Section 15
 * - Revenue Pensions Manual Chapter 20.5 (Opt-Out Rules)
 */

import {
  OptOutValidation,
  ReEnrolmentCalculation,
  EnrolmentHistory,
  EnrolmentStatus,
  EnrolmentEventType,
} from '../types/enrolment-history';
import { StagingDateConfig } from '../types/staging-dates';
import { calculateNextStagingDate } from './staging-dates';

/**
 * Validate if an employee can opt-out on a given date
 * 
 * @param enrolmentDate - Date when employee was auto-enrolled
 * @param optOutRequestDate - Date when opt-out is requested (default: today)
 * @param contributions - Total contributions to refund (employee + employer)
 * @returns Validation result with refund details
 */
export function validateOptOut(
  enrolmentDate: Date,
  optOutRequestDate: Date = new Date(),
  contributions: { employee: number; employer: number } = { employee: 0, employer: 0 }
): OptOutValidation {
  // Calculate opt-out window end (6 months from enrolment)
  const windowEndDate = new Date(enrolmentDate);
  windowEndDate.setMonth(windowEndDate.getMonth() + 6);

  const requestDate = new Date(optOutRequestDate);
  requestDate.setHours(0, 0, 0, 0);
  windowEndDate.setHours(0, 0, 0, 0);

  const isValid = requestDate <= windowEndDate;

  if (!isValid) {
    const daysPassed = Math.ceil(
      (requestDate.getTime() - windowEndDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      isValid: false,
      reason: `Opt-out window closed ${daysPassed} days ago. Window ended on ${windowEndDate.toISOString().split('T')[0]}.`,
      windowEndDate,
    };
  }

  const daysRemaining = Math.ceil(
    (windowEndDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const refundAmount = Math.round((contributions.employee + contributions.employer) * 100) / 100;

  // Calculate next re-enrolment date (3 years from opt-out)
  const nextReEnrolmentDate = new Date(enrolmentDate);
  nextReEnrolmentDate.setFullYear(nextReEnrolmentDate.getFullYear() + 3);

  return {
    isValid: true,
    reason: `Opt-out is valid. ${daysRemaining} days remaining in opt-out window.`,
    daysRemaining,
    windowEndDate,
    refundAmount,
    nextReEnrolmentDate,
  };
}

/**
 * Calculate when an employee should be re-enrolled after opt-out
 * 
 * Logic:
 * 1. Add 3 years to last opt-out date
 * 2. Find next staging date after that
 * 3. That's the re-enrolment date
 * 
 * @param lastOptOutDate - Date of last opt-out
 * @param stagingConfig - Employer staging date configuration
 * @param calculationDate - Reference date (default: today)
 * @returns Re-enrolment calculation result
 */
export function calculateReEnrolmentDate(
  employeeId: string,
  lastOptOutDate: Date,
  stagingConfig: StagingDateConfig | null,
  calculationDate: Date = new Date()
): ReEnrolmentCalculation {
  // Add 3 years to opt-out date
  const threeYearsLater = new Date(lastOptOutDate);
  threeYearsLater.setFullYear(threeYearsLater.getFullYear() + 3);

  // Find next staging date after 3-year mark
  const nextStaging = calculateNextStagingDate(stagingConfig, threeYearsLater);

  const today = new Date(calculationDate);
  today.setHours(0, 0, 0, 0);

  const daysUntil = Math.ceil(
    (nextStaging.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isDue = nextStaging.date <= today;

  return {
    employeeId,
    isDue,
    reEnrolmentDate: nextStaging.date,
    daysUntil,
    lastOptOutDate,
    optOutCycles: 1, // Will be updated by caller with actual count
  };
}

/**
 * Calculate refund amount for an opt-out
 * 
 * @param employeeContributions - Total employee contributions
 * @param employerContributions - Total employer contributions
 * @returns Total refund amount
 */
export function calculateOptOutRefund(
  employeeContributions: number,
  employerContributions: number
): number {
  // Full refund: employee + employer contributions
  // State contributions are NOT refunded (retained by the state)
  const totalRefund = employeeContributions + employerContributions;
  return Math.round(totalRefund * 100) / 100; // Round to 2 decimal places
}

/**
 * Build employee enrolment status from history
 * 
 * @param employeeId - Employee identifier
 * @param history - Complete enrolment history
 * @returns Current enrolment status
 */
export function buildEnrolmentStatus(
  employeeId: string,
  history: EnrolmentHistory[]
): EnrolmentStatus {
  // Sort history by date (most recent first)
  const sortedHistory = [...history].sort(
    (a, b) => b.eventDate.getTime() - a.eventDate.getTime()
  );

  const lastEvent = sortedHistory[0];

  // Count enrolments and opt-outs
  const enrolmentCount = history.filter(
    (h) =>
      h.eventType === EnrolmentEventType.AUTO_ENROLLED ||
      h.eventType === EnrolmentEventType.RE_ENROLLED ||
      h.eventType === EnrolmentEventType.MANUALLY_ENROLLED
  ).length;

  const optOutCount = history.filter((h) => h.eventType === EnrolmentEventType.OPTED_OUT).length;

  // Find last enrolment and opt-out
  const lastEnrolment = sortedHistory.find(
    (h) =>
      h.eventType === EnrolmentEventType.AUTO_ENROLLED ||
      h.eventType === EnrolmentEventType.RE_ENROLLED ||
      h.eventType === EnrolmentEventType.MANUALLY_ENROLLED
  );

  const lastOptOut = sortedHistory.find((h) => h.eventType === EnrolmentEventType.OPTED_OUT);

  // Determine current status
  let status: 'ENROLLED' | 'OPTED_OUT' | 'PENDING_ENROLMENT' | 'INELIGIBLE' | 'NOT_STARTED';
  let statusDate: Date;

  if (!lastEvent) {
    status = 'NOT_STARTED';
    statusDate = new Date();
  } else {
    switch (lastEvent.eventType) {
      case EnrolmentEventType.AUTO_ENROLLED:
      case EnrolmentEventType.RE_ENROLLED:
      case EnrolmentEventType.MANUALLY_ENROLLED:
        status = 'ENROLLED';
        statusDate = lastEvent.eventDate;
        break;

      case EnrolmentEventType.OPTED_OUT:
        status = 'OPTED_OUT';
        statusDate = lastEvent.eventDate;
        break;

      case EnrolmentEventType.EMPLOYMENT_ENDED:
      case EnrolmentEventType.BECAME_INELIGIBLE:
        status = 'INELIGIBLE';
        statusDate = lastEvent.eventDate;
        break;

      default:
        status = 'NOT_STARTED';
        statusDate = new Date();
    }
  }

  return {
    employeeId,
    status,
    statusDate,
    lastEnrolmentDate: lastEnrolment?.eventDate,
    lastOptOutDate: lastOptOut?.eventDate,
    optOutWindowEnd: lastOptOut?.optOutWindowEnd,
    nextReEnrolmentDate: lastOptOut?.nextReEnrolmentDate,
    enrolmentCount,
    optOutCount,
    history: sortedHistory,
  };
}

/**
 * Check if employee is within opt-out window
 * 
 * @param enrolmentDate - Date when employee was auto-enrolled
 * @param checkDate - Date to check (default: today)
 * @returns True if within 6-month opt-out window
 */
export function isWithinOptOutWindow(
  enrolmentDate: Date,
  checkDate: Date = new Date()
): boolean {
  const windowEndDate = new Date(enrolmentDate);
  windowEndDate.setMonth(windowEndDate.getMonth() + 6);

  const check = new Date(checkDate);
  check.setHours(0, 0, 0, 0);
  windowEndDate.setHours(0, 0, 0, 0);

  return check <= windowEndDate;
}

/**
 * Get employees due for re-enrolment
 * 
 * @param enrolmentStatuses - Array of employee enrolment statuses
 * @param stagingConfig - Staging date configuration
 * @param checkDate - Date to check (default: today)
 * @returns Array of employees due for re-enrolment
 */
export function getEmployeesDueForReEnrolment(
  enrolmentStatuses: EnrolmentStatus[],
  stagingConfig: StagingDateConfig | null,
  checkDate: Date = new Date()
): ReEnrolmentCalculation[] {
  const today = new Date(checkDate);
  today.setHours(0, 0, 0, 0);

  return enrolmentStatuses
    .filter((status) => status.status === 'OPTED_OUT' && status.lastOptOutDate)
    .map((status) => {
      const reEnrolment = calculateReEnrolmentDate(
        status.employeeId,
        status.lastOptOutDate!,
        stagingConfig,
        checkDate
      );

      return {
        ...reEnrolment,
        optOutCycles: status.optOutCount,
      };
    })
    .filter((reEnrolment) => reEnrolment.isDue);
}

/**
 * Create enrolment history record
 * 
 * @param employeeId - Employee identifier
 * @param userId - Employer/user identifier
 * @param eventType - Type of enrolment event
 * @param eventDate - When event occurred
 * @param additionalData - Optional additional data
 * @returns Enrolment history record
 */
export function createEnrolmentRecord(
  employeeId: string,
  userId: string,
  eventType: EnrolmentEventType,
  eventDate: Date = new Date(),
  additionalData?: {
    contributionPhase?: number;
    contributionRate?: number;
    optOutWindowEnd?: Date;
    nextReEnrolmentDate?: Date;
    refundAmount?: number;
    notes?: string;
  }
): EnrolmentHistory {
  return {
    employeeId,
    userId,
    eventType,
    eventDate,
    ...additionalData,
    createdAt: new Date(),
  };
}
