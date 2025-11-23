import { z } from 'zod';

export const payrollRecordSchema = z.object({
  employeeId: z.string().optional(),
  ppsNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  age: z.number().optional(),
  payPeriodEnd: z.string(),
  payFrequency: z.string(),
  grossPay: z.number(),
  prsiClass: z.string().optional(),
  existingScheme: z.boolean().default(false),
  optedOut: z.boolean().default(false),
  priorOptOutDate: z.string().optional(),
  currency: z.string().default('EUR')
});

export type PayrollRecordInput = z.infer<typeof payrollRecordSchema>;

export interface PayrollRecord extends PayrollRecordInput {
  age: number;
  hashedId: string;
}

export interface RuleResult {
  code: string;
  message: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
}

export interface EligibilityOutcome {
  eligible: boolean;
  reason?: string;
  optOutWindowOpen: boolean;
}

export interface ContributionBreakdown {
  pensionablePay: number;
  employee: number;
  employer: number;
  state: number;
  total: number;
}

export interface ValidationSummary {
  issues: RuleResult[];
  eligibility: EligibilityOutcome;
  contribution: ContributionBreakdown;
  eligible: boolean;
  riskScore: number;
  riskBand: 'low' | 'medium' | 'high' | 'critical';
  severityTally: Record<RuleResult['severity'], number>;
}

export * from './config';
