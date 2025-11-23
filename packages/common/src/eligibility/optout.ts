/**
 * Opt-Out Window Management - 100% Legal Compliance
 * 
 * Implements opt-out window rules per Automatic Enrolment Retirement Savings System Act 2024.
 * Employees have TWO opportunities to opt out without re-enrolment consequences:
 * 
 * 1. INITIAL OPT-OUT WINDOW: 2-4 weeks after automatic enrolment
 * 2. SUBSEQUENT OPT-OUT WINDOW: 6-8 weeks after automatic re-enrolment
 * 
 * CRITICAL RULES:
 * - Initial enrolment: 2-week minimum waiting period before opt-out allowed
 * - Initial window closes 4 weeks after enrolment
 * - Re-enrolment: 6-week minimum waiting period before opt-out allowed  
 * - Re-enrolment window closes 8 weeks after re-enrolment
 * - Re-enrolment occurs every 2 years if previously opted out
 * - Opt-out requires explicit written notification to employer
 * - Contributions must be refunded if opt-out within valid window
 * - No contributions deducted during opt-out period
 * 
 * Legal References:
 * - Automatic Enrolment Act 2024, Section 12 (Opt-out rights)
 * - Automatic Enrolment Act 2024, Section 13 (Re-enrolment)
 * - SI 2024/XXX Regulation 8 (Opt-out procedures)
 */

/**
 * Enrolment type affects opt-out window length
 */
export enum EnrolmentType {
  /** First-time automatic enrolment */
  INITIAL = 'initial',
  
  /** Re-enrolment after previous opt-out */
  RE_ENROLMENT = 're_enrolment',
}

/**
 * Opt-out window boundaries in weeks
 */
interface OptOutWindow {
  /** Minimum weeks before opt-out allowed (waiting period) */
  minimumWeeks: number
  
  /** Maximum weeks when opt-out closes */
  maximumWeeks: number
  
  /** Total weeks window is open */
  windowDurationWeeks: number
}

/**
 * Opt-out windows by enrolment type
 * 
 * LEGAL WINDOWS:
 * - Initial: Weeks 2-4 (window opens at week 2, closes at week 4)
 * - Re-enrolment: Weeks 6-8 (window opens at week 6, closes at week 8)
 */
const OPT_OUT_WINDOWS: Record<EnrolmentType, OptOutWindow> = {
  [EnrolmentType.INITIAL]: {
    minimumWeeks: 2,
    maximumWeeks: 4,
    windowDurationWeeks: 2, // 2-week window
  },
  [EnrolmentType.RE_ENROLMENT]: {
    minimumWeeks: 6,
    maximumWeeks: 8,
    windowDurationWeeks: 2, // 2-week window
  },
}

/**
 * Re-enrolment interval (years)
 */
const RE_ENROLMENT_INTERVAL_YEARS = 2

/**
 * Days per week (for precise calculations)
 */
const DAYS_PER_WEEK = 7

/**
 * Input for opt-out eligibility check
 */
export interface OptOutEligibilityInput {
  /** Date of enrolment (initial or re-enrolment) */
  enrolmentDate: Date
  
  /** Type of enrolment */
  enrolmentType: EnrolmentType
  
  /** Date when checking eligibility (defaults to today) */
  assessmentDate?: Date
}

/**
 * Opt-out window status
 */
export interface OptOutWindowStatus {
  /** Whether opt-out is currently allowed */
  isWithinWindow: boolean
  
  /** Window opening date */
  windowOpenDate: Date
  
  /** Window closing date */
  windowCloseDate: Date
  
  /** Days remaining in window (0 if closed/not open) */
  daysRemaining: number
  
  /** Whether waiting period has passed */
  waitingPeriodComplete: boolean
  
  /** Whether window has expired */
  windowExpired: boolean
  
  /** Enrolment type */
  enrolmentType: EnrolmentType
}

/**
 * Re-enrolment calculation result
 */
export interface ReEnrolmentSchedule {
  /** Date of next re-enrolment */
  nextReEnrolmentDate: Date
  
  /** Date when opt-out window opens */
  optOutWindowOpenDate: Date
  
  /** Date when opt-out window closes */
  optOutWindowCloseDate: Date
  
  /** Years since last opt-out */
  yearsSinceOptOut: number
  
  /** Whether re-enrolment is due */
  isDue: boolean
}

/**
 * Check if assessment date is within opt-out window
 * 
 * @param input - Opt-out eligibility input
 * @returns Window status
 */
export function checkOptOutWindow(
  input: OptOutEligibilityInput
): OptOutWindowStatus {
  const { enrolmentDate, enrolmentType, assessmentDate = new Date() } = input
  
  const window = OPT_OUT_WINDOWS[enrolmentType]
  
  // Calculate window boundaries
  const windowOpenDate = addWeeks(enrolmentDate, window.minimumWeeks)
  const windowCloseDate = addWeeks(enrolmentDate, window.maximumWeeks)
  
  // Check if within window
  const isAfterOpen = assessmentDate >= windowOpenDate
  const isBeforeClose = assessmentDate <= windowCloseDate
  const isWithinWindow = isAfterOpen && isBeforeClose
  
  // Calculate days remaining
  let daysRemaining = 0
  if (isWithinWindow) {
    daysRemaining = Math.ceil(
      (windowCloseDate.getTime() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  }
  
  const waitingPeriodComplete = assessmentDate >= windowOpenDate
  const windowExpired = assessmentDate > windowCloseDate
  
  return {
    isWithinWindow,
    windowOpenDate,
    windowCloseDate,
    daysRemaining,
    waitingPeriodComplete,
    windowExpired,
    enrolmentType,
  }
}

/**
 * Add weeks to a date
 * 
 * @param date - Start date
 * @param weeks - Number of weeks to add
 * @returns New date
 */
function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + weeks * DAYS_PER_WEEK)
  return result
}

/**
 * Calculate next re-enrolment date for opted-out employee
 * 
 * Per Section 13 of Act: Re-enrolment occurs every 2 years after opt-out
 * 
 * @param optOutDate - Date when employee opted out
 * @param assessmentDate - Date to check from (defaults to today)
 * @returns Re-enrolment schedule
 */
export function calculateNextReEnrolment(
  optOutDate: Date,
  assessmentDate: Date = new Date()
): ReEnrolmentSchedule {
  // Next re-enrolment is 2 years after opt-out
  const nextReEnrolmentDate = new Date(optOutDate)
  nextReEnrolmentDate.setFullYear(nextReEnrolmentDate.getFullYear() + RE_ENROLMENT_INTERVAL_YEARS)
  
  // Calculate re-enrolment window boundaries
  const reEnrolmentWindow = OPT_OUT_WINDOWS[EnrolmentType.RE_ENROLMENT]
  const optOutWindowOpenDate = addWeeks(nextReEnrolmentDate, reEnrolmentWindow.minimumWeeks)
  const optOutWindowCloseDate = addWeeks(nextReEnrolmentDate, reEnrolmentWindow.maximumWeeks)
  
  // Calculate years since opt-out
  const yearsSinceOptOut = differenceInYears(assessmentDate, optOutDate)
  
  // Check if re-enrolment is due
  const isDue = assessmentDate >= nextReEnrolmentDate
  
  return {
    nextReEnrolmentDate,
    optOutWindowOpenDate,
    optOutWindowCloseDate,
    yearsSinceOptOut,
    isDue,
  }
}

/**
 * Calculate difference in complete years
 * 
 * @param laterDate - Later date
 * @param earlierDate - Earlier date
 * @returns Number of complete years
 */
function differenceInYears(laterDate: Date, earlierDate: Date): number {
  const yearsDiff = laterDate.getFullYear() - earlierDate.getFullYear()
  const monthDiff = laterDate.getMonth() - earlierDate.getMonth()
  const dayDiff = laterDate.getDate() - earlierDate.getDate()
  
  // Adjust if anniversary hasn't passed this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return yearsDiff - 1
  }
  
  return yearsDiff
}

/**
 * Get all re-enrolment dates for a given period
 * Useful for projection and planning
 * 
 * @param initialOptOutDate - First opt-out date
 * @param yearsToProject - Number of years to project forward
 * @returns Array of re-enrolment schedules
 */
export function getReEnrolmentProjection(
  initialOptOutDate: Date,
  yearsToProject: number
): ReEnrolmentSchedule[] {
  const projections: ReEnrolmentSchedule[] = []
  let currentOptOutDate = new Date(initialOptOutDate)
  
  const cyclesNeeded = Math.ceil(yearsToProject / RE_ENROLMENT_INTERVAL_YEARS)
  
  for (let i = 0; i < cyclesNeeded; i++) {
    const schedule = calculateNextReEnrolment(currentOptOutDate)
    projections.push(schedule)
    
    // Next cycle assumes they opt out again at end of window
    currentOptOutDate = new Date(schedule.optOutWindowCloseDate)
  }
  
  return projections
}

/**
 * Validate opt-out request
 * Checks if request is within valid window
 * 
 * @param enrolmentDate - Date of enrolment
 * @param enrolmentType - Type of enrolment
 * @param optOutRequestDate - Date of opt-out request
 * @returns Validation result with reason if invalid
 */
export function validateOptOutRequest(
  enrolmentDate: Date,
  enrolmentType: EnrolmentType,
  optOutRequestDate: Date
): {
  isValid: boolean
  reason?: string
  windowStatus: OptOutWindowStatus
} {
  const windowStatus = checkOptOutWindow({
    enrolmentDate,
    enrolmentType,
    assessmentDate: optOutRequestDate,
  })
  
  if (!windowStatus.waitingPeriodComplete) {
    const window = OPT_OUT_WINDOWS[enrolmentType]
    return {
      isValid: false,
      reason: `Opt-out not allowed during ${window.minimumWeeks}-week waiting period. Window opens on ${windowStatus.windowOpenDate.toLocaleDateString()}.`,
      windowStatus,
    }
  }
  
  if (windowStatus.windowExpired) {
    return {
      isValid: false,
      reason: `Opt-out window expired on ${windowStatus.windowCloseDate.toLocaleDateString()}. You are now enrolled and contributions will continue.`,
      windowStatus,
    }
  }
  
  if (!windowStatus.isWithinWindow) {
    return {
      isValid: false,
      reason: `Opt-out request must be submitted between ${windowStatus.windowOpenDate.toLocaleDateString()} and ${windowStatus.windowCloseDate.toLocaleDateString()}.`,
      windowStatus,
    }
  }
  
  return {
    isValid: true,
    windowStatus,
  }
}

/**
 * Calculate cessation date for contributions after opt-out
 * Per regulations: Contributions cease at end of pay period in which opt-out received
 * 
 * @param optOutDate - Date opt-out request received
 * @param nextPayDate - Next scheduled pay date after opt-out
 * @returns Cessation date
 */
export function calculateCessationDate(
  optOutDate: Date,
  nextPayDate: Date
): Date {
  // Contributions cease at end of pay period containing opt-out
  // If opt-out is after pay date, cessation is at next pay date
  if (optOutDate <= nextPayDate) {
    return nextPayDate
  }
  
  // Otherwise contributions cease immediately at next pay date
  return nextPayDate
}

/**
 * Calculate refund amount for contributions during opt-out window
 * Per regulations: All contributions during opt-out window must be refunded
 * 
 * @param contributions - Array of contribution amounts with dates
 * @param enrolmentDate - Date of enrolment
 * @param optOutDate - Date of opt-out
 * @returns Total refund amount
 */
export function calculateOptOutRefund(
  contributions: Array<{ date: Date; employeeAmount: number; employerAmount: number }>,
  enrolmentDate: Date,
  optOutDate: Date
): {
  totalRefund: number
  employeeRefund: number
  employerRefund: number
  contributionCount: number
} {
  let employeeRefund = 0
  let employerRefund = 0
  let contributionCount = 0
  
  for (const contrib of contributions) {
    // Only refund contributions made between enrolment and opt-out
    if (contrib.date >= enrolmentDate && contrib.date <= optOutDate) {
      employeeRefund += contrib.employeeAmount
      employerRefund += contrib.employerAmount
      contributionCount++
    }
  }
  
  return {
    totalRefund: employeeRefund + employerRefund,
    employeeRefund,
    employerRefund,
    contributionCount,
  }
}

/**
 * Get human-readable opt-out window description
 * 
 * @param enrolmentType - Type of enrolment
 * @returns Description string
 */
export function getOptOutWindowDescription(enrolmentType: EnrolmentType): string {
  const window = OPT_OUT_WINDOWS[enrolmentType]
  
  if (enrolmentType === EnrolmentType.INITIAL) {
    return `Initial opt-out window: Weeks ${window.minimumWeeks}-${window.maximumWeeks} after automatic enrolment (${window.windowDurationWeeks}-week window)`
  }
  
  return `Re-enrolment opt-out window: Weeks ${window.minimumWeeks}-${window.maximumWeeks} after re-enrolment (${window.windowDurationWeeks}-week window)`
}

/**
 * Check if employee should be re-enrolled
 * 
 * @param lastOptOutDate - Date of last opt-out
 * @param currentDate - Current date (defaults to today)
 * @returns Whether re-enrolment is due
 */
export function isReEnrolmentDue(
  lastOptOutDate: Date,
  currentDate: Date = new Date()
): boolean {
  const schedule = calculateNextReEnrolment(lastOptOutDate, currentDate)
  return schedule.isDue
}

/**
 * Get opt-out window boundaries
 * 
 * @param enrolmentType - Type of enrolment
 * @returns Window configuration
 */
export function getOptOutWindowBoundaries(enrolmentType: EnrolmentType): OptOutWindow {
  return OPT_OUT_WINDOWS[enrolmentType]
}
