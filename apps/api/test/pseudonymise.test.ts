import { describe, expect, it } from 'vitest';
import { toPayrollRecord } from '../src/pseudonymise';
import { PayrollRecordInput } from '@autoenroll/common';

describe('pseudonymise', () => {
  const base: PayrollRecordInput = {
    employeeId: '12345',
    ppsNumber: 'PPS12345',
    dateOfBirth: '1990-02-14',
    payPeriodEnd: '2024-06-30',
    payFrequency: 'monthly',
    grossPay: 3000,
    prsiClass: 'A1',
    existingScheme: false,
    optedOut: false,
    currency: 'EUR'
  };

  it('derives age from date of birth when not provided', () => {
    const record = toPayrollRecord({ ...base, age: undefined });
    expect(record.age).toBeGreaterThan(0);
    expect(record.hashedId).toBeTruthy();
  });

  it('throws for implausible date of birth', () => {
    expect(() => toPayrollRecord({ ...base, dateOfBirth: '3020-01-01' })).toThrow('Derived age is implausible');
  });

  it('throws when neither age nor date of birth supplied', () => {
    const { dateOfBirth, ...rest } = base;
    expect(() => toPayrollRecord({ ...rest, age: undefined })).toThrow(
      'Either age or date of birth must be provided'
    );
  });
});
