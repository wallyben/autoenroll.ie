import { 
  Employee, 
  calculateEligibility, 
  isQualifyingEmployee, 
  getAutoEnrolmentDate, 
  EligibilityInput,
  calculateAutoEnrolmentDate,
  StagingDateConfig,
} from '@autoenroll/common';
import { logger } from '../utils/logger';
import * as stagingModel from '../models/staging-dates.model';

// Adapter to convert Employee to EligibilityInput
function toEligibilityInput(employee: Employee): EligibilityInput {
  // Map PayFrequency enum to EligibilityInput format
  const payFreq = employee.payFrequency.toLowerCase();
  const validPayFrequency = (['weekly', 'fortnightly', 'monthly', 'annual'].includes(payFreq) 
    ? payFreq 
    : 'monthly') as 'weekly' | 'fortnightly' | 'monthly' | 'annual';
    
  return {
    id: employee.employeeId,
    dateOfBirth: employee.dateOfBirth,
    employmentStartDate: employee.employmentStartDate,
    employmentType: employee.contractType,
    employmentStatus: employee.employmentStatus as 'ACTIVE' | 'SUSPENDED' | 'TERMINATED',
    earnings: employee.annualSalary,
    payFrequency: validPayFrequency,
    hoursPerWeek: employee.hoursPerWeek,
    hasOptedOut: employee.hasOptedOut,
    optOutDate: employee.optOutDate,
  };
}

export async function determineEligibility(employees: Employee[], userId?: string) {
  // Get user's staging config if userId provided
  const stagingConfig = userId ? await stagingModel.getStagingConfig(userId) : null;

  const results = employees.map(employee => {
    const eligibility = calculateEligibility(toEligibilityInput(employee));
    const qualifyingStatus = isQualifyingEmployee(toEligibilityInput(employee));
    
    // Calculate auto-enrolment date using staging date engine
    const autoEnrolmentCalc = calculateAutoEnrolmentDate(
      employee.employmentStartDate,
      stagingConfig,
      new Date()
    );

    return {
      employeeId: employee.employeeId,
      isEligible: eligibility.isEligible,
      reasons: eligibility.reasons,
      eligibilityDate: eligibility.eligibilityDate,
      nextReviewDate: eligibility.nextReviewDate,
      autoEnrolmentDate: autoEnrolmentCalc.autoEnrolmentDate,
      waitingPeriodEnd: autoEnrolmentCalc.waitingPeriodEnd,
      daysUntilEnrolment: autoEnrolmentCalc.daysUntilEnrolment,
      readyToEnrol: autoEnrolmentCalc.readyToEnrol,
      isQualifying: qualifyingStatus,
    };
  });

  const summary = {
    totalEmployees: employees.length,
    eligibleCount: results.filter(r => r.isEligible).length,
    ineligibleCount: results.filter(r => !r.isEligible).length,
    readyToEnrol: results.filter(r => r.readyToEnrol).length,
    eligibilityRate: (results.filter(r => r.isEligible).length / employees.length) * 100,
    usingStagingConfig: !!stagingConfig,
  };

  logger.info('Eligibility determination completed', summary);

  return {
    results,
    summary,
  };
}

export async function calculateEligibilityForEmployee(employee: Employee, userId?: string) {
  // Get user's staging config if userId provided
  const stagingConfig = userId ? await stagingModel.getStagingConfig(userId) : null;

  const eligibilityInput = toEligibilityInput(employee);
  const eligibility = calculateEligibility(eligibilityInput);
  
  // Calculate auto-enrolment date using staging date engine
  const autoEnrolmentCalc = calculateAutoEnrolmentDate(
    employee.employmentStartDate,
    stagingConfig,
    new Date()
  );

  return {
    employeeId: employee.employeeId,
    isEligible: eligibility.isEligible,
    reasons: eligibility.reasons,
    eligibilityDate: eligibility.eligibilityDate,
    nextReviewDate: eligibility.nextReviewDate,
    autoEnrolmentDate: autoEnrolmentCalc.autoEnrolmentDate,
    waitingPeriodEnd: autoEnrolmentCalc.waitingPeriodEnd,
    daysUntilEnrolment: autoEnrolmentCalc.daysUntilEnrolment,
    readyToEnrol: autoEnrolmentCalc.readyToEnrol,
    usingStagingConfig: !!stagingConfig,
  };
}
