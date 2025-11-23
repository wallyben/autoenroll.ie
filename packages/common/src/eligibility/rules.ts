import { Employee } from '../types/employee';
import { ContributionCalculation, ContributionRates } from '../types/payroll';
import { AUTO_ENROLMENT_CONFIG } from '../config/constants';

export function calculateContributions(
  employee: Employee,
  pensionableEarnings: number,
  calculationDate: Date = new Date()
): ContributionCalculation {
  const year = calculationDate.getFullYear();
  const rates = getContributionRates(year);

  const cappedEarnings = Math.min(
    Math.max(pensionableEarnings, AUTO_ENROLMENT_CONFIG.earningsThreshold.lower),
    AUTO_ENROLMENT_CONFIG.earningsThreshold.upper
  );

  const employeeContribution = (cappedEarnings * rates.employeeRate) / 100;
  const employerContribution = (cappedEarnings * rates.employerRate) / 100;
  const totalContribution = employeeContribution + employerContribution;

  return {
    employeeId: employee.employeeId,
    pensionableEarnings: cappedEarnings,
    employeeRate: rates.employeeRate,
    employerRate: rates.employerRate,
    employeeContribution: Math.round(employeeContribution * 100) / 100,
    employerContribution: Math.round(employerContribution * 100) / 100,
    totalContribution: Math.round(totalContribution * 100) / 100,
    calculationDate,
  };
}

export function getContributionRates(year: number): ContributionRates {
  const config = AUTO_ENROLMENT_CONFIG.contributionRates;
  const ratesForYear = config[year as keyof typeof config] || config[2027];

  return {
    year,
    employeeRate: ratesForYear.employee,
    employerRate: ratesForYear.employer,
    effectiveDate: new Date(year, 0, 1),
  };
}

export function calculateAnnualContributions(
  employee: Employee,
  year: number = new Date().getFullYear()
): ContributionCalculation {
  return calculateContributions(employee, employee.annualSalary, new Date(year, 0, 1));
}

export function projectedContributions(
  employee: Employee,
  yearsToProject: number = 5
): ContributionCalculation[] {
  const projections: ContributionCalculation[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < yearsToProject; i++) {
    const year = currentYear + i;
    const projection = calculateAnnualContributions(employee, year);
    projections.push(projection);
  }

  return projections;
}
