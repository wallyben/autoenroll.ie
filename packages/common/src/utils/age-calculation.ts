/**
 * PRECISION AGE CALCULATION ENGINE
 * 
 * Legal Requirement: Auto-Enrolment Retirement Savings System Act 2024
 * Age eligibility: 23-60 years (at enrolment date)
 * 
 * CRITICAL: Age must be calculated to the EXACT DAY, not year approximation
 * Uses UTC to eliminate timezone ambiguity
 */

/**
 * Normalize date to UTC midnight (eliminates timezone ambiguity)
 * 
 * CRITICAL: All date comparisons must use UTC midnight to ensure
 * consistent results regardless of server/client timezone
 * 
 * @param date - Input date (any time/timezone)
 * @returns Date at UTC midnight
 */
export function normalizeToUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));
}

/**
 * Calculate exact age in years, accounting for leap years and exact day
 * 
 * @param birthDate - Date of birth (UTC midnight)
 * @param referenceDate - Date to calculate age at (defaults to today UTC)
 * @returns Exact age in years (floor value)
 * 
 * @example
 * // Born 1990-06-15, checking on 2025-06-14 = 34 years old
 * // Born 1990-06-15, checking on 2025-06-15 = 35 years old
 */
export function calculateExactAge(birthDate: Date, referenceDate: Date = new Date()): number {
  // Normalize to UTC midnight to eliminate timezone issues
  const birth = normalizeToUTCMidnight(birthDate);
  const reference = normalizeToUTCMidnight(referenceDate);
  
  // Get years elapsed
  let age = reference.getUTCFullYear() - birth.getUTCFullYear();
  
  // Check if birthday has occurred this year
  const birthMonth = birth.getUTCMonth();
  const birthDay = birth.getUTCDate();
  const referenceMonth = reference.getUTCMonth();
  const referenceDay = reference.getUTCDate();
  
  // If birthday hasn't occurred yet this year, subtract 1
  if (referenceMonth < birthMonth || (referenceMonth === birthMonth && referenceDay < birthDay)) {
    age--;
  }
  
  return age;
}

/**
 * Calculate age on a specific future date
 * 
 * @param birthDate - Date of birth
 * @param futureDate - Future date to calculate age at
 * @returns Age that person will be on that date
 */
export function calculateAgeAt(birthDate: Date, futureDate: Date): number {
  return calculateExactAge(birthDate, futureDate);
}

/**
 * Calculate date when person will reach a specific age
 * 
 * @param birthDate - Date of birth
 * @param targetAge - Age to reach
 * @returns Date when person turns targetAge (UTC midnight)
 */
export function calculateDateAtAge(birthDate: Date, targetAge: number): Date {
  const birth = normalizeToUTCMidnight(birthDate);
  
  // Birthday is same month/day, but targetAge years later
  const targetDate = new Date(Date.UTC(
    birth.getUTCFullYear() + targetAge,
    birth.getUTCMonth(),
    birth.getUTCDate()
  ));
  
  return targetDate;
}

/**
 * Check if person is within AE age range (23-60)
 * 
 * @param birthDate - Date of birth
 * @param referenceDate - Date to check at (defaults to today)
 * @returns true if aged 23-60 inclusive
 */
export function isWithinAEAgeRange(birthDate: Date, referenceDate: Date = new Date()): boolean {
  const age = calculateExactAge(birthDate, referenceDate);
  return age >= 23 && age <= 60;
}

/**
 * Calculate when person becomes AE-eligible by age (turns 23)
 * 
 * @param birthDate - Date of birth
 * @returns Date when person turns 23
 */
export function calculateAEAgeEligibilityDate(birthDate: Date): Date {
  return calculateDateAtAge(birthDate, 23);
}

/**
 * Calculate when person becomes AE-ineligible by age (turns 61)
 * 
 * @param birthDate - Date of birth
 * @returns Date when person turns 61 (day after 60th birthday)
 */
export function calculateAEAgeIneligibilityDate(birthDate: Date): Date {
  return calculateDateAtAge(birthDate, 61);
}

/**
 * Validate that date of birth is reasonable
 * 
 * @param birthDate - Date to validate
 * @returns Validation result with any errors
 */
export function validateDateOfBirth(birthDate: Date): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const normalized = normalizeToUTCMidnight(birthDate);
  const today = normalizeToUTCMidnight(new Date());
  
  // Check if date is in the future
  if (normalized.getTime() > today.getTime()) {
    errors.push('Date of birth cannot be in the future');
  }
  
  // Check if person is impossibly old (> 120 years)
  const age = calculateExactAge(normalized, today);
  if (age > 120) {
    errors.push('Date of birth indicates age over 120 years - likely data error');
  }
  
  // Check if person is under working age (< 14 years)
  if (age < 14) {
    errors.push('Employee must be at least 14 years old (minimum working age in Ireland)');
  }
  
  // Check for obviously invalid dates (e.g., year 1900 default)
  if (normalized.getUTCFullYear() < 1920) {
    errors.push('Date of birth before 1920 is likely a data entry error');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate age group for anonymized reporting
 * 
 * @param birthDate - Date of birth
 * @param referenceDate - Reference date (defaults to today)
 * @returns Age group string for GDPR-compliant reporting
 */
export function calculateAgeGroup(birthDate: Date, referenceDate: Date = new Date()): string {
  const age = calculateExactAge(birthDate, referenceDate);
  
  if (age < 18) return 'Under 18';
  if (age < 23) return '18-22';
  if (age < 30) return '23-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  if (age < 66) return '60-65';
  return 'Over 65';
}

/**
 * Calculate days until next birthday
 * 
 * @param birthDate - Date of birth
 * @param referenceDate - Reference date (defaults to today)
 * @returns Number of days until next birthday
 */
export function daysUntilNextBirthday(birthDate: Date, referenceDate: Date = new Date()): number {
  const birth = normalizeToUTCMidnight(birthDate);
  const reference = normalizeToUTCMidnight(referenceDate);
  
  // Get this year's birthday
  let nextBirthday = new Date(Date.UTC(
    reference.getUTCFullYear(),
    birth.getUTCMonth(),
    birth.getUTCDate()
  ));
  
  // If birthday has already passed this year, use next year
  if (nextBirthday.getTime() < reference.getTime()) {
    nextBirthday = new Date(Date.UTC(
      reference.getUTCFullYear() + 1,
      birth.getUTCMonth(),
      birth.getUTCDate()
    ));
  }
  
  // Calculate days difference
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((nextBirthday.getTime() - reference.getTime()) / msPerDay);
}

/**
 * Check if today is person's birthday
 * 
 * @param birthDate - Date of birth
 * @param referenceDate - Reference date (defaults to today)
 * @returns true if today is birthday
 */
export function isBirthdayToday(birthDate: Date, referenceDate: Date = new Date()): boolean {
  const birth = normalizeToUTCMidnight(birthDate);
  const reference = normalizeToUTCMidnight(referenceDate);
  
  return birth.getUTCMonth() === reference.getUTCMonth() &&
         birth.getUTCDate() === reference.getUTCDate();
}

/**
 * Age calculation metadata for audit trail
 */
export interface AgeCalculationMetadata {
  /** Date of birth used */
  birthDate: Date;
  
  /** Reference date used */
  referenceDate: Date;
  
  /** Calculated exact age */
  age: number;
  
  /** Whether within AE age range (23-60) */
  withinAERange: boolean;
  
  /** Date person turned/will turn 23 */
  aeEligibilityDate: Date;
  
  /** Date person turned/will turn 61 */
  aeIneligibilityDate: Date;
  
  /** Days until next birthday */
  daysUntilNextBirthday: number;
  
  /** Calculation timestamp (UTC) */
  calculatedAt: Date;
}

/**
 * Generate comprehensive age calculation metadata for audit trail
 * 
 * @param birthDate - Date of birth
 * @param referenceDate - Reference date (defaults to today)
 * @returns Complete age calculation metadata
 */
export function generateAgeMetadata(
  birthDate: Date,
  referenceDate: Date = new Date()
): AgeCalculationMetadata {
  const age = calculateExactAge(birthDate, referenceDate);
  
  return {
    birthDate: normalizeToUTCMidnight(birthDate),
    referenceDate: normalizeToUTCMidnight(referenceDate),
    age,
    withinAERange: age >= 23 && age <= 60,
    aeEligibilityDate: calculateDateAtAge(birthDate, 23),
    aeIneligibilityDate: calculateDateAtAge(birthDate, 61),
    daysUntilNextBirthday: daysUntilNextBirthday(birthDate, referenceDate),
    calculatedAt: new Date(),
  };
}
