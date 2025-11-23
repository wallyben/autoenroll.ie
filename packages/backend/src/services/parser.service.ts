import { Readable } from 'stream';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { ValidationError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

/**
 * ZERO-RETENTION PARSER
 * 
 * All parsing happens from Buffer (in-memory)
 * NEVER reads from disk, NEVER writes to disk
 * Supports CSV and XLSX formats
 */

export interface ParseResult {
  data: any[];
  headers: string[];
  rowCount: number;
}

export async function parseCSVFromBuffer(fileBuffer: Buffer): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const data: any[] = [];
    let headers: string[] = [];

    // Create readable stream from Buffer (in-memory)
    const stream = Readable.from(fileBuffer);

    stream
      .pipe(csv())
      .on('headers', (headerList: string[]) => {
        headers = headerList;
      })
      .on('data', (row: any) => {
        data.push(row);
      })
      .on('end', () => {
        logger.info('CSV parsed from buffer (in-memory)', { rowCount: data.length });
        resolve({ data, headers, rowCount: data.length });
      })
      .on('error', (error: Error) => {
        logger.error('CSV buffer parsing error', { error: error.message });
        reject(new ValidationError('Failed to parse CSV file'));
      });
  });
}

export async function parseXLSXFromBuffer(fileBuffer: Buffer): Promise<ParseResult> {
  try {
    // Parse XLSX from Buffer (in-memory)
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    
    if (!sheetName) {
      throw new ValidationError('No sheets found in Excel file');
    }

    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    logger.info('XLSX parsed from buffer (in-memory)', { rowCount: data.length });

    return { data, headers, rowCount: data.length };
  } catch (error) {
    logger.error('XLSX buffer parsing error', { error: (error as Error).message });
    throw new ValidationError('Failed to parse Excel file');
  }
}

export async function parseBuffer(fileBuffer: Buffer, mimeType: string): Promise<ParseResult> {
  if (mimeType === 'text/csv') {
    return parseCSVFromBuffer(fileBuffer);
  } else if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return parseXLSXFromBuffer(fileBuffer);
  } else {
    throw new ValidationError('Unsupported file type. Only CSV and Excel files are allowed.');
  }
}

export function normalizeHeaders(headers: string[]): Map<string, string> {
  const mapping = new Map<string, string>();

  const fieldMappings: Record<string, string[]> = {
    employeeId: ['employee_id', 'employeeid', 'emp_id', 'empid', 'id', 'employee id'],
    firstName: ['first_name', 'firstname', 'fname', 'first name'],
    lastName: ['last_name', 'lastname', 'lname', 'surname', 'last name'],
    dateOfBirth: ['date_of_birth', 'dateofbirth', 'dob', 'birth_date', 'birthdate', 'date of birth'],
    ppsn: ['ppsn', 'pps', 'ppsnumber', 'pps_number', 'pps number'],
    email: ['email', 'email_address', 'emailaddress', 'e-mail', 'email address'],
    employmentStartDate: ['employment_start_date', 'start_date', 'startdate', 'hire_date', 'employment start date', 'start date'],
    employmentStatus: ['employment_status', 'status', 'emp_status', 'employment status'],
    contractType: ['contract_type', 'contract', 'contracttype', 'contract type'],
    hoursPerWeek: ['hours_per_week', 'hours', 'weekly_hours', 'hoursperweek', 'hours per week'],
    annualSalary: ['annual_salary', 'salary', 'annualsalary', 'annual_pay', 'annual salary'],
    payFrequency: ['pay_frequency', 'frequency', 'payfrequency', 'pay_period', 'pay frequency'],
    hasOptedOut: ['has_opted_out', 'opted_out', 'optedout', 'opt_out', 'has opted out', 'opted out'],
    optOutDate: ['opt_out_date', 'optoutdate', 'opt out date'],
  };

  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim();
    
    for (const [targetField, variants] of Object.entries(fieldMappings)) {
      if (variants.includes(normalizedHeader) || normalizedHeader === targetField.toLowerCase()) {
        mapping.set(header, targetField);
        break;
      }
    }

    if (!mapping.has(header)) {
      mapping.set(header, header);
    }
  }

  return mapping;
}

export function mapDataToSchema(data: any[], headerMapping: Map<string, string>): any[] {
  return data.map((row) => {
    const mapped: any = {};
    
    for (const [originalHeader, targetField] of headerMapping.entries()) {
      if (row[originalHeader] !== undefined) {
        mapped[targetField] = row[originalHeader];
      }
    }
    
    return mapped;
  });
}
