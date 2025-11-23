import dayjs from 'dayjs';
import {
  AE_ELIGIBLE_MAX_AGE,
  AE_ELIGIBLE_MIN_AGE,
  AE_LOWER_THRESHOLD_ANNUAL,
  AE_UPPER_THRESHOLD_ANNUAL,
  CONTRIBUTION_ESCALATION,
  EligibilityOutcome,
  PayrollRecord,
  RuleResult,
  ValidationSummary,
  MIN_EMPLOYMENT_AGE,
  MAX_EMPLOYMENT_AGE,
  PAY_PERIOD_STALENESS_MONTHS
} from '@autoenroll/common';
import { payPeriodsPerYear, parseDate } from './parser';

const ALLOWED_PRSI_CLASSES = ['A', 'B', 'C', 'D', 'E', 'H', 'J', 'K', 'M', 'S', 'P'];

export function validateRecord(record: PayrollRecord): RuleResult[] {
  const issues: RuleResult[] = [];
  if (!record.employeeId) {
    issues.push({ code: 'missing_employee_id', message: 'Employee ID is required', severity: 'critical' });
  }
  if (!record.ppsNumber) {
    issues.push({ code: 'missing_pps', message: 'PPS number is required', severity: 'critical' });
  }
  if (!record.dateOfBirth && record.age === undefined) {
    issues.push({
      code: 'missing_age',
      message: 'Either date of birth or age must be supplied to determine eligibility',
      severity: 'critical'
    });
  }
  if (record.grossPay <= 0) {
    issues.push({
      code: 'non_positive_pay',
      message: 'Gross pay must be positive for an active employee',
      severity: 'high'
    });
  }
  if (record.age < MIN_EMPLOYMENT_AGE || record.age > MAX_EMPLOYMENT_AGE) {
    issues.push({
      code: 'implausible_age',
      message: 'Age appears outside normal employment bounds',
      severity: 'high'
    });
  }
  const prsiClass = record.prsiClass?.trim().toUpperCase();
  if (!prsiClass || !ALLOWED_PRSI_CLASSES.includes(prsiClass.replace(/[^A-Z]/g, '').slice(0, 1))) {
    issues.push({
      code: 'invalid_prsi',
      message: 'PRSI class is missing or not recognised for auto-enrolment',
      severity: 'critical'
    });
  }
  const payPeriodDate = parseDate(record.payPeriodEnd);
  if (!payPeriodDate) {
    issues.push({ code: 'invalid_period', message: 'Pay period end date is invalid', severity: 'critical' });
  } else if (payPeriodDate.isAfter(dayjs().add(7, 'day'))) {
    issues.push({
      code: 'future_period',
      message: 'Pay period end date appears to be in the future',
      severity: 'warning'
    });
  } else if (payPeriodDate.isBefore(dayjs().subtract(PAY_PERIOD_STALENESS_MONTHS, 'month'))) {
    issues.push({
      code: 'stale_period',
      message: 'Pay period end date is older than current payroll cycles',
      severity: 'high'
    });
  }
  if (!['weekly', 'biweekly', 'monthly'].includes(record.payFrequency)) {
    issues.push({ code: 'invalid_frequency', message: 'Pay frequency is not supported', severity: 'critical' });
  }
  if (record.optedOut && !record.priorOptOutDate) {
    issues.push({
      code: 'missing_opt_out_date',
      message: 'Opt-out flag provided without prior opt-out date context',
      severity: 'warning'
    });
  }
  return issues;
}

export function eligibilityForRecord(record: PayrollRecord): EligibilityOutcome {
  const eligibleAge = record.age >= AE_ELIGIBLE_MIN_AGE && record.age <= AE_ELIGIBLE_MAX_AGE;
  const annualisedPay = record.grossPay * payPeriodsPerYear(record.payFrequency);
  const eligiblePay = annualisedPay >= AE_LOWER_THRESHOLD_ANNUAL && annualisedPay <= AE_UPPER_THRESHOLD_ANNUAL;
  const recentlyOptedOut = record.optedOut && record.priorOptOutDate
    ? dayjs().diff(parseDate(record.priorOptOutDate), 'year') < 2
    : false;
  const eligible = eligibleAge && eligiblePay && !record.existingScheme && !recentlyOptedOut;
  return {
    eligible,
    reason: eligible ? undefined : 'Outside age or pay thresholds or already opted out',
    optOutWindowOpen: !record.optedOut && eligible
  };
}

export function calculateContributions(record: PayrollRecord, year = 4) {
  const escalation = CONTRIBUTION_ESCALATION.find((step) => step.year === year) || CONTRIBUTION_ESCALATION.at(-1)!;
  const annualisedPay = record.grossPay * payPeriodsPerYear(record.payFrequency);
  const qualifyingEarnings = Math.max(
    0,
    Math.min(annualisedPay, AE_UPPER_THRESHOLD_ANNUAL) - AE_LOWER_THRESHOLD_ANNUAL
  );
  const pensionablePay = qualifyingEarnings / payPeriodsPerYear(record.payFrequency);
  const employee = pensionablePay * escalation.employee;
  const employer = pensionablePay * escalation.employer;
  const state = pensionablePay * escalation.state;
  return { pensionablePay, employee, employer, state, total: employee + employer + state };
}

export function scoreIssues(issues: RuleResult[]) {
  const weights: Record<RuleResult['severity'], number> = {
    critical: 5,
    high: 3,
    warning: 1,
    info: 0
  };
  return issues.reduce((acc, issue) => acc + weights[issue.severity], 0);
}

function bandRisk(score: number): ValidationSummary['riskBand'] {
  if (score >= 12) return 'critical';
  if (score >= 8) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

function tallySeverities(issues: RuleResult[]): Record<RuleResult['severity'], number> {
  return issues.reduce(
    (acc, issue) => ({ ...acc, [issue.severity]: acc[issue.severity] + 1 }),
    { critical: 0, high: 0, warning: 0, info: 0 }
  );
}

export function summarizeRecord(record: PayrollRecord): ValidationSummary {
  const issues = validateRecord(record);
  const eligibility = eligibilityForRecord(record);
  const contribution = calculateContributions(record);
  const riskScore = scoreIssues(issues) + (eligibility.eligible ? 0 : 2);
  return {
    issues,
    eligibility,
    contribution,
    eligible: eligibility.eligible,
    riskScore,
    riskBand: bandRisk(riskScore),
    severityTally: tallySeverities(issues)
  };
}
