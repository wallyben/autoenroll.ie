import { z } from 'zod';
import { EmploymentStatus, ContractType, PayFrequency } from '../types/employee';

export const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.date(),
  ppsn: z.string().regex(/^\d{7}[A-Z]{1,2}$/, 'Invalid PPSN format').optional(),
  email: z.string().email('Invalid email format').optional(),
  employmentStartDate: z.date(),
  employmentStatus: z.nativeEnum(EmploymentStatus),
  contractType: z.nativeEnum(ContractType),
  hoursPerWeek: z.number().min(0, 'Hours per week must be positive'),
  annualSalary: z.number().min(0, 'Annual salary must be positive'),
  payFrequency: z.nativeEnum(PayFrequency),
  hasOptedOut: z.boolean().default(false),
  optOutDate: z.date().optional(),
});

export const payrollRecordSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  periodStartDate: z.date(),
  periodEndDate: z.date(),
  grossPay: z.number().min(0, 'Gross pay must be positive'),
  taxablePay: z.number().min(0, 'Taxable pay must be positive'),
  hoursWorked: z.number().min(0).optional(),
  overtimeHours: z.number().min(0).optional(),
  pensionableEarnings: z.number().min(0, 'Pensionable earnings must be positive'),
});

export const uploadRequestSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  userId: z.string().min(1, 'User ID is required'),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
