import { z } from 'zod';

export const payrollRecordSchema = z.object({
  employeeId: z.string().min(1),
  ppsNumber: z.string().min(1),
  dateOfBirth: z.string().optional(),
  age: z.number().int().positive().optional(),
  payPeriodEnd: z.string(),
  payFrequency: z.enum(['weekly', 'biweekly', 'monthly']),
  grossPay: z.number(),
  prsiClass: z.string().min(1),
  existingScheme: z.boolean().optional().default(false),
  optedOut: z.boolean().optional().default(false),
  priorOptOutDate: z.string().optional(),
  currency: z.string().default('EUR')
});

export type PayrollRecordInput = z.input<typeof payrollRecordSchema>;
export type PayrollRecord = z.output<typeof payrollRecordSchema> & { hashedId: string };

export type Severity = 'critical' | 'high' | 'warning' | 'info';

export interface RuleResult {
  code: string;
  message: string;
  severity: Severity;
  field?: keyof PayrollRecordInput;
  remediation?: string;
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
  riskScore: number;
  riskBand: 'low' | 'medium' | 'high' | 'critical';
  severityTally: Record<Severity, number>;
  eligible: boolean;
  eligibility: EligibilityOutcome;
  contribution: ContributionBreakdown;
}

export interface PricingTier {
  id: string;
  name: string;
  priceCents: number;
  uploadsPerMonth: number;
}
