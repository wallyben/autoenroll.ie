import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { PayrollRecordInput } from '@autoenroll/common';

function normaliseHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

function rowToRecord(row: Record<string, any>): PayrollRecordInput {
  return {
    employeeId: String(row.employee_id || row.employee || row.id || ''),
    ppsNumber: String(row.pps || row.pps_number || row.ppsnum || ''),
    dateOfBirth: row.date_of_birth || row.dob || undefined,
    age: row.age ? Number(row.age) : undefined,
    payPeriodEnd: row.pay_period_end || row.period_end || row.payment_date,
    payFrequency: (row.pay_frequency || row.frequency || 'monthly').toString().toLowerCase(),
    grossPay: Number(row.gross_pay || row.pay || 0),
    prsiClass: String(row.prsi_class || row.prsi || ''),
    existingScheme: row.existing_scheme === true || row.existing_scheme === 'true',
    optedOut: row.opted_out === true || row.opted_out === 'true',
    priorOptOutDate: row.prior_opt_out_date || undefined,
    currency: row.currency || 'EUR'
  } as PayrollRecordInput;
}

export function parseCsv(buffer: Buffer): PayrollRecordInput[] {
  const text = buffer.toString('utf-8');
  const records = parse(text, { columns: (h) => h.map(normaliseHeader), skip_empty_lines: true });
  return records.map((row: Record<string, any>) => rowToRecord(row));
}

export function parseXlsx(buffer: Buffer): PayrollRecordInput[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName], { header: 1 });
  const [headers, ...dataRows] = rows;
  const normalisedHeaders = (headers as string[]).map(normaliseHeader);
  return dataRows.map((row) => {
    const obj: Record<string, any> = {};
    normalisedHeaders.forEach((h, idx) => {
      obj[h] = row[idx];
    });
    return rowToRecord(obj);
  });
}

export function detectParser(filename: string) {
  if (filename.endsWith('.csv')) return parseCsv;
  if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) return parseXlsx;
  throw new Error('Unsupported file type');
}

export function payPeriodsPerYear(payFrequency: string) {
  switch (payFrequency) {
    case 'weekly':
      return 52;
    case 'biweekly':
      return 26;
    case 'monthly':
      return 12;
    default:
      return 12;
  }
}

export function parseDate(input?: string) {
  if (!input) return undefined;
  const date = dayjs(input);
  return date.isValid() ? date : undefined;
}
