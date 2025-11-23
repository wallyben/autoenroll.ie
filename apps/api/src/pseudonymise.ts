import crypto from 'crypto';
import dayjs from 'dayjs';
import { payrollRecordSchema, PayrollRecord, PayrollRecordInput } from '@autoenroll/common';

function hashValue(value: string) {
  const salt = process.env.HASH_SALT || 'autoenroll';
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export function toPayrollRecord(input: PayrollRecordInput): PayrollRecord {
  const parsed = payrollRecordSchema.parse(input);
  const derivedAge = (() => {
    if (parsed.age !== undefined) return parsed.age;
    if (!parsed.dateOfBirth) throw new Error('Either age or date of birth must be provided');
    const dob = dayjs(parsed.dateOfBirth);
    if (!dob.isValid()) throw new Error('Date of birth is invalid');
    const age = dayjs().diff(dob, 'year');
    if (age < 0 || age > 100) throw new Error('Derived age is implausible');
    return age;
  })();

  const hashedId = hashValue(parsed.employeeId || parsed.ppsNumber);
  return { ...parsed, age: derivedAge, hashedId };
}
