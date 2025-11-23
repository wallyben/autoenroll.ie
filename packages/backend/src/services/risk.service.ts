import { Employee, ValidationResult, assessComplianceRisk } from '@autoenroll/common';
import { logger } from '../utils/logger';

export async function calculateRiskScore(employees: Employee[], validationResult: ValidationResult) {
  const assessment = assessComplianceRisk(employees, validationResult);

  logger.info('Risk assessment completed', {
    overallScore: assessment.overallScore,
    riskLevel: assessment.riskLevel,
    factorCount: assessment.factors.length,
  });

  return assessment;
}

export async function generateRiskReport(employees: Employee[], validationResult: ValidationResult) {
  const assessment = await calculateRiskScore(employees, validationResult);

  const report = {
    generatedAt: new Date().toISOString(),
    assessment,
    employeeCount: employees.length,
    validationSummary: {
      rowsProcessed: validationResult.rowsProcessed,
      rowsValid: validationResult.rowsValid,
      rowsInvalid: validationResult.rowsInvalid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length,
    },
    actionRequired: assessment.riskLevel === 'HIGH',
    urgency: assessment.riskLevel,
  };

  return report;
}
