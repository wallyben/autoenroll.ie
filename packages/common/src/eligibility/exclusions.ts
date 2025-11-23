/**
 * Director and Shareholding Exclusions - Legal Compliance
 * 
 * Implements exclusion rules for company directors and major shareholders
 * per Automatic Enrolment Retirement Savings System Act 2024.
 * 
 * CRITICAL EXCLUSIONS:
 * - Directors with >50% shareholding are EXCLUDED
 * - Self-employed individuals are EXCLUDED
 * - Sole traders are EXCLUDED
 * - Partners in partnerships are EXCLUDED
 * - Controlling directors (de facto control) are EXCLUDED
 * 
 * RATIONALE:
 * Auto-enrolment targets employees in traditional employment relationships.
 * Directors with significant control are not employees in the traditional sense
 * and often have alternative pension arrangements (e.g., PRSA, Executive Pension).
 * 
 * Legal References:
 * - Automatic Enrolment Act 2024, Section 3(2) - Definition of "Employee"
 * - Companies Act 2014, Section 224 - Director definition
 * - Taxes Consolidation Act 1997, Schedule 13 - Share ownership attribution
 * - Employment Law (Ireland) - Employee vs. contractor distinction
 * - Revenue PRSI Guidelines - Self-employment classification
 */

/**
 * Director classification
 */
export enum DirectorType {
  /** Not a director */
  NONE = 'none',
  
  /** Executive director (employed by company) */
  EXECUTIVE = 'executive',
  
  /** Non-executive director (not employed, governance role) */
  NON_EXECUTIVE = 'non_executive',
  
  /** Shadow director (exercises control without formal appointment) */
  SHADOW = 'shadow',
}

/**
 * Employment classification
 */
export enum EmploymentClassification {
  /** Traditional employee */
  EMPLOYEE = 'employee',
  
  /** Self-employed / sole trader */
  SELF_EMPLOYED = 'self_employed',
  
  /** Partnership member */
  PARTNER = 'partner',
  
  /** Independent contractor */
  CONTRACTOR = 'contractor',
  
  /** Director with significant shareholding */
  CONTROLLING_DIRECTOR = 'controlling_director',
}

/**
 * Shareholding control threshold (greater than 50% = controlling interest)
 */
const CONTROLLING_SHAREHOLDING_THRESHOLD = 0.50

/**
 * Input for director exclusion check
 */
export interface DirectorExclusionInput {
  /** Type of director */
  directorType: DirectorType
  
  /** Percentage of shares held (0.0 - 1.0) */
  shareholdingPercentage: number
  
  /** Employment classification */
  employmentClassification: EmploymentClassification
  
  /** Whether individual has de facto control (voting rights, board control) */
  hasDeFactoControl?: boolean
  
  /** Whether individual is related to other shareholders (family member) */
  isRelatedToOtherShareholders?: boolean
  
  /** Combined family shareholding percentage (if applicable) */
  combinedFamilyShareholding?: number
}

/**
 * Exclusion determination result
 */
export interface ExclusionResult {
  /** Whether individual is EXCLUDED from auto-enrolment */
  isExcluded: boolean
  
  /** Primary reason for exclusion (if excluded) */
  exclusionReason: string | null
  
  /** All reasons for exclusion */
  exclusionReasons: string[]
  
  /** Whether eligible for auto-enrolment */
  isEligible: boolean
  
  /** Employment classification determined */
  classification: EmploymentClassification
  
  /** Shareholding details */
  shareholdingDetails: {
    personalPercentage: number
    familyPercentage: number
    exceedsThreshold: boolean
    threshold: number
  }
}

/**
 * Check if individual is excluded due to director/shareholding status
 * 
 * EXCLUSION LOGIC:
 * 1. Self-employed = EXCLUDED (PRSI Class S)
 * 2. Partner in partnership = EXCLUDED
 * 3. Director with >50% shares = EXCLUDED
 * 4. Family shareholding >50% + director = EXCLUDED
 * 5. De facto control + director = EXCLUDED
 * 
 * @param input - Director exclusion input
 * @returns Exclusion determination
 */
export function checkDirectorExclusion(
  input: DirectorExclusionInput
): ExclusionResult {
  const exclusionReasons: string[] = []
  let isExcluded = false
  
  // Validate input
  if (input.shareholdingPercentage < 0 || input.shareholdingPercentage > 1) {
    throw new Error('Shareholding percentage must be between 0 and 1')
  }
  
  // Rule 1: Self-employed are always excluded
  if (input.employmentClassification === EmploymentClassification.SELF_EMPLOYED) {
    isExcluded = true
    exclusionReasons.push(
      'Self-employed individuals are excluded from automatic enrolment (PRSI Class S)'
    )
  }
  
  // Rule 2: Partners in partnerships are excluded
  if (input.employmentClassification === EmploymentClassification.PARTNER) {
    isExcluded = true
    exclusionReasons.push(
      'Partners in partnerships are excluded from automatic enrolment'
    )
  }
  
  // Rule 3: Controlling directors (>50% shareholding) are excluded
  if (
    input.directorType !== DirectorType.NONE &&
    input.shareholdingPercentage > CONTROLLING_SHAREHOLDING_THRESHOLD
  ) {
    isExcluded = true
    exclusionReasons.push(
      `Directors with >${CONTROLLING_SHAREHOLDING_THRESHOLD * 100}% shareholding are excluded ` +
      `(current shareholding: ${(input.shareholdingPercentage * 100).toFixed(1)}%)`
    )
  }
  
  // Rule 4: Family shareholding control (combined >50% + director)
  if (
    input.directorType !== DirectorType.NONE &&
    input.isRelatedToOtherShareholders &&
    input.combinedFamilyShareholding &&
    input.combinedFamilyShareholding > CONTROLLING_SHAREHOLDING_THRESHOLD
  ) {
    isExcluded = true
    exclusionReasons.push(
      `Directors with combined family shareholding >${CONTROLLING_SHAREHOLDING_THRESHOLD * 100}% ` +
      `are excluded (combined family shareholding: ${(input.combinedFamilyShareholding * 100).toFixed(1)}%)`
    )
  }
  
  // Rule 5: De facto control (even without majority shareholding)
  if (
    input.directorType !== DirectorType.NONE &&
    input.hasDeFactoControl
  ) {
    isExcluded = true
    exclusionReasons.push(
      'Directors with de facto control of the company are excluded'
    )
  }
  
  // Rule 6: Shadow directors with significant influence
  if (input.directorType === DirectorType.SHADOW) {
    isExcluded = true
    exclusionReasons.push(
      'Shadow directors are excluded from automatic enrolment'
    )
  }
  
  // Determine final classification
  let classification = input.employmentClassification
  if (isExcluded && input.directorType !== DirectorType.NONE) {
    classification = EmploymentClassification.CONTROLLING_DIRECTOR
  }
  
  const familyShareholding = input.combinedFamilyShareholding || input.shareholdingPercentage
  const exceedsThreshold = 
    input.shareholdingPercentage > CONTROLLING_SHAREHOLDING_THRESHOLD ||
    familyShareholding > CONTROLLING_SHAREHOLDING_THRESHOLD
  
  return {
    isExcluded,
    exclusionReason: exclusionReasons[0] || null,
    exclusionReasons,
    isEligible: !isExcluded,
    classification,
    shareholdingDetails: {
      personalPercentage: input.shareholdingPercentage,
      familyPercentage: familyShareholding,
      exceedsThreshold,
      threshold: CONTROLLING_SHAREHOLDING_THRESHOLD,
    },
  }
}

/**
 * Calculate combined family shareholding
 * 
 * Per Irish tax law, shares held by close family members may be attributed
 * for determining control.
 * 
 * @param individualShares - Individual's shareholding percentage
 * @param spouseShares - Spouse's shareholding percentage
 * @param childrenShares - Children's combined shareholding percentage
 * @param parentsShares - Parents' combined shareholding percentage
 * @returns Combined family shareholding
 */
export function calculateFamilyShareholding(
  individualShares: number,
  spouseShares: number = 0,
  childrenShares: number = 0,
  parentsShares: number = 0
): number {
  const combined = individualShares + spouseShares + childrenShares + parentsShares
  
  // Cap at 100%
  return Math.min(combined, 1.0)
}

/**
 * Determine if individual has de facto control
 * 
 * De facto control can exist even without majority shareholding through:
 * - Voting rights agreements
 * - Board representation
 * - Veto rights on key decisions
 * - Management control
 * 
 * @param input - Control indicators
 * @returns Whether de facto control exists
 */
export function hasDeFactoControl(input: {
  shareholdingPercentage: number
  hasVotingRightsAgreement?: boolean
  controlsBoardMajority?: boolean
  hasVetoRights?: boolean
  isManagingDirector?: boolean
  isSoleDirector?: boolean
}): boolean {
  // Majority shareholding = automatic control
  if (input.shareholdingPercentage > CONTROLLING_SHAREHOLDING_THRESHOLD) {
    return true
  }
  
  // Sole director = control (even with minority shareholding)
  if (input.isSoleDirector) {
    return true
  }
  
  // Managing director with significant shares (>25%) = likely control
  if (input.isManagingDirector && input.shareholdingPercentage > 0.25) {
    return true
  }
  
  // Board control = control
  if (input.controlsBoardMajority) {
    return true
  }
  
  // Veto rights = control
  if (input.hasVetoRights) {
    return true
  }
  
  // Voting rights agreement giving control
  if (input.hasVotingRightsAgreement) {
    return true
  }
  
  return false
}

/**
 * Determine employment classification from PRSI class
 * 
 * Links PRSI classification to employment type
 * 
 * @param prsiClass - PRSI class
 * @returns Employment classification
 */
export function classifyFromPRSI(prsiClass: string): EmploymentClassification {
  switch (prsiClass) {
    case 'A': // Standard employees
    case 'H': // Defence forces non-officers
    case 'P': // Share fishermen (employed)
      return EmploymentClassification.EMPLOYEE
    
    case 'S': // Self-employed
    case 'M': // Very low income self-employed
      return EmploymentClassification.SELF_EMPLOYED
    
    case 'B': // Health board employees
    case 'C': // Commissioned officers
    case 'D': // Public sector pre-1995
    case 'E': // Public sector post-1995
      return EmploymentClassification.EMPLOYEE
    
    case 'J': // Low income employees
    case 'K': // Pensioners
      return EmploymentClassification.EMPLOYEE
    
    default:
      return EmploymentClassification.EMPLOYEE
  }
}

/**
 * Validate director appointment
 * 
 * Checks if director appointment is valid under Companies Act 2014
 * 
 * @param input - Director details
 * @returns Validation result
 */
export function validateDirectorAppointment(input: {
  appointmentDate: Date
  dateOfBirth: Date
  hasDisqualification?: boolean
  isRestricted?: boolean
}): {
  isValid: boolean
  reason?: string
} {
  const age = calculateAge(input.dateOfBirth, new Date())
  
  // Must be at least 18 years old
  if (age < 18) {
    return {
      isValid: false,
      reason: 'Director must be at least 18 years old',
    }
  }
  
  // Cannot be disqualified
  if (input.hasDisqualification) {
    return {
      isValid: false,
      reason: 'Individual is disqualified from acting as director',
    }
  }
  
  // Cannot be restricted (without court permission)
  if (input.isRestricted) {
    return {
      isValid: false,
      reason: 'Individual is a restricted person under Companies Act 2014',
    }
  }
  
  return { isValid: true }
}

/**
 * Calculate age from date of birth
 * 
 * @param dateOfBirth - Date of birth
 * @param assessmentDate - Date to calculate age at
 * @returns Age in years
 */
function calculateAge(dateOfBirth: Date, assessmentDate: Date): number {
  const yearsDiff = assessmentDate.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = assessmentDate.getMonth() - dateOfBirth.getMonth()
  const dayDiff = assessmentDate.getDate() - dateOfBirth.getDate()
  
  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return yearsDiff - 1
  }
  
  return yearsDiff
}

/**
 * Get human-readable exclusion summary
 * 
 * @param result - Exclusion result
 * @returns Summary string
 */
export function getExclusionSummary(result: ExclusionResult): string {
  if (result.isEligible) {
    return 'Individual is ELIGIBLE for automatic enrolment'
  }
  
  const reasons = result.exclusionReasons.join('; ')
  return `Individual is EXCLUDED from automatic enrolment. Reasons: ${reasons}`
}

/**
 * Check if contractor should be classified as employee
 * 
 * IR35-style test for employee vs. contractor distinction
 * 
 * @param input - Contractor indicators
 * @returns Whether should be treated as employee
 */
export function isContractorEmployeeStatus(input: {
  hasSubstitutionRights: boolean
  providesOwnEquipment: boolean
  takesFinancialRisk: boolean
  controlsWorkMethods: boolean
  worksForMultipleClients: boolean
  isIntegratedIntoBusiness: boolean
}): {
  isEmployee: boolean
  score: number
  factors: string[]
} {
  let employeeScore = 0
  const employeeFactors: string[] = []
  
  // Employee indicators
  if (!input.hasSubstitutionRights) {
    employeeScore++
    employeeFactors.push('No substitution rights (must perform work personally)')
  }
  
  if (!input.providesOwnEquipment) {
    employeeScore++
    employeeFactors.push('Does not provide own equipment')
  }
  
  if (!input.takesFinancialRisk) {
    employeeScore++
    employeeFactors.push('No financial risk (guaranteed payment)')
  }
  
  if (!input.controlsWorkMethods) {
    employeeScore++
    employeeFactors.push('Does not control how work is performed')
  }
  
  if (!input.worksForMultipleClients) {
    employeeScore++
    employeeFactors.push('Works exclusively for one client')
  }
  
  if (input.isIntegratedIntoBusiness) {
    employeeScore++
    employeeFactors.push('Integrated into business operations')
  }
  
  // If 4 or more employee indicators, likely an employee
  const isEmployee = employeeScore >= 4
  
  return {
    isEmployee,
    score: employeeScore,
    factors: employeeFactors,
  }
}
