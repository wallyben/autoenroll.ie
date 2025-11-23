export interface PayrollRecord {
  employeeId: string;
  periodStartDate: Date;
  periodEndDate: Date;
  grossPay: number;
  taxablePay: number;
  hoursWorked?: number;
  overtimeHours?: number;
  pensionableEarnings: number;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalGrossPay: number;
  totalPensionableEarnings: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  averageSalary: number;
  payPeriodStart: Date;
  payPeriodEnd: Date;
}

export interface ContributionCalculation {
  employeeId: string;
  pensionableEarnings: number;
  employeeRate: number;
  employerRate: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  calculationDate: Date;
}

export interface ContributionRates {
  year: number;
  employeeRate: number;
  employerRate: number;
  effectiveDate: Date;
}
