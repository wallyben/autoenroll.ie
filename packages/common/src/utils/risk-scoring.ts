import { Employee } from '../types/employee';
import { ValidationResult } from '../types/validation';
import { RISK_SCORES } from '../config/constants';

export interface RiskAssessment {
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  category: string;
  score: number;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function assessComplianceRisk(
  employees: Employee[],
  validationResult: ValidationResult
): RiskAssessment {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  const dataQualityScore = calculateDataQualityRisk(validationResult);
  factors.push(dataQualityScore);
  totalScore += dataQualityScore.score;

  const missingDataScore = calculateMissingDataRisk(employees);
  factors.push(missingDataScore);
  totalScore += missingDataScore.score;

  const eligibilityScore = calculateEligibilityRisk(employees);
  factors.push(eligibilityScore);
  totalScore += eligibilityScore.score;

  const complianceScore = calculateComplianceRisk(employees);
  factors.push(complianceScore);
  totalScore += complianceScore.score;

  const averageScore = totalScore / factors.length;
  const riskLevel = getRiskLevel(averageScore);
  const recommendations = generateRecommendations(factors, riskLevel);

  return {
    overallScore: Math.round(averageScore),
    riskLevel,
    factors,
    recommendations,
  };
}

function calculateDataQualityRisk(validationResult: ValidationResult): RiskFactor {
  const errorRate = validationResult.rowsProcessed > 0
    ? (validationResult.rowsInvalid / validationResult.rowsProcessed) * 100
    : 0;

  let score = 0;
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  if (errorRate > 20) {
    score = RISK_SCORES.HIGH;
    severity = 'HIGH';
  } else if (errorRate > 5) {
    score = RISK_SCORES.MEDIUM;
    severity = 'MEDIUM';
  } else {
    score = RISK_SCORES.LOW;
    severity = 'LOW';
  }

  return {
    category: 'Data Quality',
    score,
    description: `${errorRate.toFixed(1)}% of records have validation errors`,
    severity,
  };
}

function calculateMissingDataRisk(employees: Employee[]): RiskFactor {
  const criticalFieldsMissing = employees.filter(emp => 
    !emp.ppsn || !emp.email || !emp.dateOfBirth
  ).length;

  const missingRate = (criticalFieldsMissing / employees.length) * 100;

  let score = 0;
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  if (missingRate > 30) {
    score = RISK_SCORES.HIGH;
    severity = 'HIGH';
  } else if (missingRate > 10) {
    score = RISK_SCORES.MEDIUM;
    severity = 'MEDIUM';
  } else {
    score = RISK_SCORES.LOW;
    severity = 'LOW';
  }

  return {
    category: 'Missing Critical Data',
    score,
    description: `${missingRate.toFixed(1)}% of employees missing PPSN, email, or DOB`,
    severity,
  };
}

function calculateEligibilityRisk(employees: Employee[]): RiskFactor {
  const eligibleCount = employees.filter(emp => emp.isQualifyingEmployee).length;
  const eligibleRate = (eligibleCount / employees.length) * 100;

  let score = 0;
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  if (eligibleRate < 30) {
    score = RISK_SCORES.MEDIUM;
    severity = 'MEDIUM';
  } else {
    score = RISK_SCORES.LOW;
    severity = 'LOW';
  }

  return {
    category: 'Eligibility Coverage',
    score,
    description: `${eligibleRate.toFixed(1)}% of employees are eligible for auto-enrolment`,
    severity,
  };
}

function calculateComplianceRisk(employees: Employee[]): RiskFactor {
  const nonCompliantCount = employees.filter(emp => 
    emp.isQualifyingEmployee && !emp.aeEligibilityDate
  ).length;

  const nonCompliantRate = (nonCompliantCount / employees.length) * 100;

  let score = 0;
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  if (nonCompliantRate > 10) {
    score = RISK_SCORES.HIGH;
    severity = 'HIGH';
  } else if (nonCompliantRate > 5) {
    score = RISK_SCORES.MEDIUM;
    severity = 'MEDIUM';
  } else {
    score = RISK_SCORES.LOW;
    severity = 'LOW';
  }

  return {
    category: 'Compliance Status',
    score,
    description: `${nonCompliantRate.toFixed(1)}% of eligible employees lack eligibility dates`,
    severity,
  };
}

function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score >= RISK_SCORES.HIGH) return 'HIGH';
  if (score >= RISK_SCORES.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

function generateRecommendations(factors: RiskFactor[], riskLevel: string): string[] {
  const recommendations: string[] = [];

  factors.forEach(factor => {
    if (factor.severity === 'HIGH') {
      switch (factor.category) {
        case 'Data Quality':
          recommendations.push('Address validation errors in employee data before proceeding');
          break;
        case 'Missing Critical Data':
          recommendations.push('Collect missing PPSN, email, and date of birth information');
          break;
        case 'Eligibility Coverage':
          recommendations.push('Review employment contracts to ensure correct eligibility assessment');
          break;
        case 'Compliance Status':
          recommendations.push('Set eligibility dates for all qualifying employees immediately');
          break;
      }
    }
  });

  if (riskLevel === 'HIGH') {
    recommendations.push('Seek professional compliance advice before proceeding with enrolment');
  }

  return recommendations;
}
