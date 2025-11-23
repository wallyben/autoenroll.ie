export interface Employee {
  id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ppsn?: string;
  email?: string;
  employmentStartDate: Date;
  employmentStatus: EmploymentStatus;
  contractType: ContractType;
  hoursPerWeek: number;
  annualSalary: number;
  payFrequency: PayFrequency;
  hasOptedOut: boolean;
  optOutDate?: Date;
  isQualifyingEmployee: boolean;
  aeEligibilityDate?: Date;
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED'
}

export enum ContractType {
  PERMANENT = 'PERMANENT',
  FIXED_TERM = 'FIXED_TERM',
  TEMPORARY = 'TEMPORARY',
  CASUAL = 'CASUAL'
}

export enum PayFrequency {
  WEEKLY = 'WEEKLY',
  FORTNIGHTLY = 'FORTNIGHTLY',
  FOUR_WEEKLY = 'FOUR_WEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY'
}

export interface EmployeeWithContributions extends Employee {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
}
