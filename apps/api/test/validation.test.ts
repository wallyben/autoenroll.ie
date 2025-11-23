import { describe, expect, it } from 'vitest';
import { calculateContributions, eligibilityForRecord, summarizeRecord, validateRecord } from '../src/validation';
import { PayrollRecord } from '@autoenroll/common';

const baseRecord: PayrollRecord = {
  employeeId: '123',
  ppsNumber: 'PPS123',
  dateOfBirth: '1995-01-01',
  age: 29,
  payPeriodEnd: '2024-06-30',
  payFrequency: 'monthly',
  grossPay: 4000,
  prsiClass: 'A1',
  existingScheme: false,
  optedOut: false,
  hashedId: 'hash'
};

describe('validation', () => {
  it('detects missing identifiers', () => {
    const issues = validateRecord({ ...baseRecord, employeeId: '' });
    expect(issues.some((i) => i.code === 'missing_employee_id')).toBe(true);
  });

  it('flags future pay period end dates', () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const issues = validateRecord({ ...baseRecord, payPeriodEnd: futureDate });
    expect(issues.some((i) => i.code === 'future_period')).toBe(true);
  });

  it('rejects unrecognised PRSI class', () => {
    const issues = validateRecord({ ...baseRecord, prsiClass: 'Z9' });
    expect(issues.some((i) => i.code === 'invalid_prsi')).toBe(true);
  });

  it('scores and bands risk based on validation and eligibility', () => {
    const summary = summarizeRecord({ ...baseRecord, grossPay: 10 });
    expect(summary.riskScore).toBeGreaterThan(0);
    expect(summary.riskBand).toBeDefined();
    expect(summary.severityTally.critical + summary.severityTally.high + summary.severityTally.warning + summary.severityTally.info).toBe(
      summary.issues.length
    );
  });

  it('calculates eligibility', () => {
    const eligibility = eligibilityForRecord(baseRecord);
    expect(eligibility.eligible).toBe(true);
  });

  it('calculates contributions within thresholds', () => {
    const contrib = calculateContributions(baseRecord);
    expect(contrib.total).toBeGreaterThan(0);
  });
});
