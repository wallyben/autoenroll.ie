import { Employee, calculateContributions, getContributionRates } from '@autoenroll/common';
import { logger } from '../utils/logger';

export async function calculateEmployeeContributions(employees: Employee[], year?: number) {
  const calculationYear = year || new Date().getFullYear();
  const rates = getContributionRates(calculationYear);

  const contributions = employees.map(employee => {
    const calc = calculateContributions(employee, employee.annualSalary);
    return {
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      annualSalary: employee.annualSalary,
      pensionableEarnings: calc.pensionableEarnings,
      employeeRate: calc.employeeRate,
      employerRate: calc.employerRate,
      employeeContribution: calc.employeeContribution,
      employerContribution: calc.employerContribution,
      totalContribution: calc.totalContribution,
    };
  });

  const summary = {
    totalEmployees: contributions.length,
    totalEmployeeContributions: contributions.reduce((sum, c) => sum + c.employeeContribution, 0),
    totalEmployerContributions: contributions.reduce((sum, c) => sum + c.employerContribution, 0),
    totalContributions: contributions.reduce((sum, c) => sum + c.totalContribution, 0),
    averageEmployeeContribution: contributions.reduce((sum, c) => sum + c.employeeContribution, 0) / contributions.length,
    averageEmployerContribution: contributions.reduce((sum, c) => sum + c.employerContribution, 0) / contributions.length,
    rates,
  };

  logger.info('Contribution calculations completed', {
    year: calculationYear,
    employeeCount: contributions.length,
    totalContributions: summary.totalContributions,
  });

  return {
    contributions,
    summary,
    year: calculationYear,
  };
}

export async function projectFutureContributions(employee: Employee, yearsToProject: number = 5) {
  const currentYear = new Date().getFullYear();
  const projections = [];

  for (let i = 0; i < yearsToProject; i++) {
    const year = currentYear + i;
    const rates = getContributionRates(year);
    const calc = calculateContributions(employee, employee.annualSalary, new Date(year, 0, 1));

    projections.push({
      year,
      rates,
      employeeContribution: calc.employeeContribution,
      employerContribution: calc.employerContribution,
      totalContribution: calc.totalContribution,
    });
  }

  return {
    employeeId: employee.employeeId,
    projections,
  };
}
