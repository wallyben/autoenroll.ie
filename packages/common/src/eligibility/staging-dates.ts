/**
 * Staging Date Calculator
 * 
 * Calculates next staging dates based on employer configuration and determines
 * when employees should be auto-enrolled (6-month waiting period + next staging date).
 * 
 * CRITICAL: Auto-enrolment dates MUST align with staging dates per Irish law.
 * Enrolling on wrong dates can result in compliance violations.
 * 
 * Legal Reference:
 * - Automatic Enrolment Retirement Savings System Act 2024, Section 12
 * - Revenue Pensions Manual Chapter 20.3
 */

import {
  StagingDateConfig,
  StagingFrequency,
  DEFAULT_STAGING_CONFIG,
  NextStagingDate,
  AutoEnrolmentDate,
} from '../types/staging-dates';

/**
 * Calculate next monthly staging date
 * @param from - Start date
 * @param dayOfMonth - Day of month (1-31)
 */
function calculateNextMonthlyDate(from: Date, dayOfMonth: number): Date {
  const next = new Date(from);
  next.setDate(dayOfMonth);

  // If we're past this month's staging date, move to next month
  if (next <= from) {
    next.setMonth(next.getMonth() + 1);
  }

  // Handle months with fewer days (e.g., Feb 30 -> Feb 28)
  const maxDayInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  if (dayOfMonth > maxDayInMonth) {
    next.setDate(maxDayInMonth);
  }

  return next;
}

/**
 * Calculate next quarterly staging date (Jan, Apr, Jul, Oct)
 * @param from - Start date
 * @param dayOfMonth - Day of month (1-31)
 */
function calculateNextQuarterlyDate(from: Date, dayOfMonth: number): Date {
  const quarterMonths = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct
  const currentMonth = from.getMonth();
  const currentDay = from.getDate();

  // Find next quarter month
  let nextQuarterMonth = quarterMonths.find(
    (month) => month > currentMonth || (month === currentMonth && dayOfMonth > currentDay)
  );

  // If no quarter found this year, start next year
  if (nextQuarterMonth === undefined) {
    nextQuarterMonth = quarterMonths[0];
    return new Date(from.getFullYear() + 1, nextQuarterMonth, dayOfMonth);
  }

  return new Date(from.getFullYear(), nextQuarterMonth, dayOfMonth);
}

/**
 * Calculate next bi-annual staging date (Jan, Jul)
 * @param from - Start date
 * @param dayOfMonth - Day of month (1-31)
 */
function calculateNextBiAnnualDate(from: Date, dayOfMonth: number): Date {
  const biAnnualMonths = [0, 6]; // Jan, Jul
  const currentMonth = from.getMonth();
  const currentDay = from.getDate();

  // Find next bi-annual month
  let nextBiAnnualMonth = biAnnualMonths.find(
    (month) => month > currentMonth || (month === currentMonth && dayOfMonth > currentDay)
  );

  // If no month found this year, start next year
  if (nextBiAnnualMonth === undefined) {
    nextBiAnnualMonth = biAnnualMonths[0];
    return new Date(from.getFullYear() + 1, nextBiAnnualMonth, dayOfMonth);
  }

  return new Date(from.getFullYear(), nextBiAnnualMonth, dayOfMonth);
}

/**
 * Calculate next annual staging date (typically Jan 1)
 * @param from - Start date
 * @param dayOfMonth - Day of month (1-31)
 */
function calculateNextAnnualDate(from: Date, dayOfMonth: number): Date {
  const annualMonth = 0; // January
  const currentMonth = from.getMonth();
  const currentDay = from.getDate();

  // If we're past this year's staging date, move to next year
  if (currentMonth > annualMonth || (currentMonth === annualMonth && currentDay >= dayOfMonth)) {
    return new Date(from.getFullYear() + 1, annualMonth, dayOfMonth);
  }

  return new Date(from.getFullYear(), annualMonth, dayOfMonth);
}

/**
 * Calculate the next staging date from a given reference date
 * 
 * @param config - Staging date configuration
 * @param referenceDate - Calculate next staging date after this date (default: today)
 * @returns Next staging date and the one following
 */
export function calculateNextStagingDate(
  config: StagingDateConfig | null,
  referenceDate: Date = new Date()
): NextStagingDate {
  const effectiveConfig = config || {
    ...DEFAULT_STAGING_CONFIG,
    userId: 'default',
  };

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  let nextDate: Date;
  let followingDate: Date;

  switch (effectiveConfig.frequency) {
    case StagingFrequency.MONTHLY:
      nextDate = calculateNextMonthlyDate(today, effectiveConfig.dates[0] || 1);
      followingDate = calculateNextMonthlyDate(nextDate, effectiveConfig.dates[0] || 1);
      break;

    case StagingFrequency.QUARTERLY:
      nextDate = calculateNextQuarterlyDate(today, effectiveConfig.dates[0] || 1);
      followingDate = calculateNextQuarterlyDate(nextDate, effectiveConfig.dates[0] || 1);
      break;

    case StagingFrequency.BI_ANNUALLY:
      nextDate = calculateNextBiAnnualDate(today, effectiveConfig.dates[0] || 1);
      followingDate = calculateNextBiAnnualDate(nextDate, effectiveConfig.dates[0] || 1);
      break;

    case StagingFrequency.ANNUALLY:
      nextDate = calculateNextAnnualDate(today, effectiveConfig.dates[0] || 1);
      followingDate = calculateNextAnnualDate(nextDate, effectiveConfig.dates[0] || 1);
      break;

    default:
      // Default to quarterly
      nextDate = calculateNextQuarterlyDate(today, 1);
      followingDate = calculateNextQuarterlyDate(nextDate, 1);
  }

  const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    date: nextDate,
    daysUntil,
    following: followingDate,
  };
}

/**
 * Calculate auto-enrolment date for an employee
 * 
 * Logic:
 * 1. Calculate 6-month waiting period end date
 * 2. Find next staging date after waiting period
 * 3. That's the auto-enrolment date
 * 
 * @param employmentStartDate - When employment began
 * @param config - Staging date configuration
 * @param calculationDate - Reference date for calculation (default: today)
 */
export function calculateAutoEnrolmentDate(
  employmentStartDate: Date,
  config: StagingDateConfig | null,
  calculationDate: Date = new Date()
): AutoEnrolmentDate {
  // Calculate 6-month waiting period end
  const waitingPeriodEnd = new Date(employmentStartDate);
  waitingPeriodEnd.setMonth(waitingPeriodEnd.getMonth() + 6);

  // Find next staging date after waiting period
  const nextStaging = calculateNextStagingDate(config, waitingPeriodEnd);

  const today = new Date(calculationDate);
  today.setHours(0, 0, 0, 0);

  const daysUntilEnrolment = Math.ceil(
    (nextStaging.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const readyToEnrol = waitingPeriodEnd <= today;

  return {
    employeeId: '', // Will be populated by caller
    waitingPeriodEnd,
    autoEnrolmentDate: nextStaging.date,
    daysUntilEnrolment,
    readyToEnrol,
  };
}

/**
 * Calculate auto-enrolment dates for multiple employees
 * 
 * @param employees - Array of objects with employeeId and employmentStartDate
 * @param config - Staging date configuration
 */
export function calculateBulkAutoEnrolmentDates(
  employees: Array<{ employeeId: string; employmentStartDate: Date }>,
  config: StagingDateConfig | null
): AutoEnrolmentDate[] {
  return employees.map((employee) => {
    const result = calculateAutoEnrolmentDate(employee.employmentStartDate, config);
    return {
      ...result,
      employeeId: employee.employeeId,
    };
  });
}

/**
 * Get all staging dates for a year
 * 
 * @param year - Year to get staging dates for
 * @param config - Staging date configuration
 */
export function getStagingDatesForYear(
  year: number,
  config: StagingDateConfig | null
): Date[] {
  const effectiveConfig = config || {
    ...DEFAULT_STAGING_CONFIG,
    userId: 'default',
  };

  const dates: Date[] = [];
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  let currentDate = startOfYear;

  while (currentDate <= endOfYear) {
    const next = calculateNextStagingDate(effectiveConfig, currentDate);
    if (next.date.getFullYear() === year) {
      dates.push(next.date);
      currentDate = new Date(next.date);
      currentDate.setDate(currentDate.getDate() + 1); // Move to day after
    } else {
      break;
    }
  }

  return dates;
}

/**
 * Validate staging date configuration
 * 
 * @param config - Configuration to validate
 * @returns Validation errors (empty array if valid)
 */
export function validateStagingConfig(config: Partial<StagingDateConfig>): string[] {
  const errors: string[] = [];

  if (!config.frequency) {
    errors.push('Frequency is required');
  }

  if (!config.dates || config.dates.length === 0) {
    errors.push('At least one date is required');
  }

  if (config.dates) {
    for (const date of config.dates) {
      if (date < 1 || date > 31) {
        errors.push(`Invalid day of month: ${date}. Must be 1-31`);
      }
    }
  }

  if (config.effectiveFrom && config.effectiveTo) {
    if (config.effectiveTo <= config.effectiveFrom) {
      errors.push('Effective to date must be after effective from date');
    }
  }

  return errors;
}
