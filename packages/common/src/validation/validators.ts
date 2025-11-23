import { ValidationResult, ValidationError, ValidationWarning, NormalizedEmployee } from '../types/validation';
import { Employee } from '../types/employee';
import { validateRow, parseDate } from './rules';
import { validateAndSanitizeRow, sanitizeEmployeeRecord } from './security';

export function validateEmployeeData(employees: any[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let rowsValid = 0;
  let rowsInvalid = 0;

  employees.forEach((employee, index) => {
    const rowNumber = index + 2;
    
    // SECURITY: Validate and sanitize row first (CSV injection, SQL injection, XSS)
    const securityResult = validateAndSanitizeRow(employee, rowNumber);
    if (securityResult.errors.length > 0) {
      errors.push(...securityResult.errors);
      rowsInvalid++;
      return; // Skip further validation if security checks fail
    }
    
    // Business rule validation (use sanitized data)
    const rowErrors = validateRow(securityResult.sanitized, rowNumber);
    
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      rowsInvalid++;
    } else {
      rowsValid++;
    }

    const rowWarnings = generateWarnings(employee, rowNumber);
    warnings.push(...rowWarnings);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    rowsProcessed: employees.length,
    rowsValid,
    rowsInvalid,
  };
}

export function normalizeEmployeeData(rawEmployees: any[]): NormalizedEmployee[] {
  return rawEmployees.map((raw) => {
    // SECURITY: Sanitize raw data first
    const sanitized = sanitizeEmployeeRecord(raw);
    
    const normalized: Partial<Employee> = {
      employeeId: String(sanitized.employeeId || sanitized.employee_id || sanitized.id || '').trim(),
      firstName: String(sanitized.firstName || sanitized.first_name || sanitized.fname || '').trim(),
      lastName: String(sanitized.lastName || sanitized.last_name || sanitized.lname || '').trim(),
      dateOfBirth: parseDate(sanitized.dateOfBirth || sanitized.date_of_birth || sanitized.dob) || undefined,
      ppsn: sanitized.ppsn ? String(sanitized.ppsn).trim().toUpperCase() : undefined,
      email: sanitized.email ? String(sanitized.email).trim().toLowerCase() : undefined,
      employmentStartDate: parseDate(sanitized.employmentStartDate || sanitized.employment_start_date || sanitized.start_date) || undefined,
      employmentStatus: normalizeEmploymentStatus(sanitized.employmentStatus || sanitized.employment_status || sanitized.status),
      contractType: normalizeContractType(sanitized.contractType || sanitized.contract_type || sanitized.contract),
      hoursPerWeek: parseFloat(sanitized.hoursPerWeek || sanitized.hours_per_week || sanitized.hours || '0'),
      annualSalary: parseFloat(sanitized.annualSalary || sanitized.annual_salary || sanitized.salary || '0'),
      payFrequency: normalizePayFrequency(sanitized.payFrequency || sanitized.pay_frequency || sanitized.frequency),
      hasOptedOut: parseBoolean(sanitized.hasOptedOut || sanitized.has_opted_out || sanitized.opted_out),
      optOutDate: sanitized.optOutDate ? parseDate(sanitized.optOutDate || sanitized.opt_out_date) || undefined : undefined,
    };

    const validationErrors = validateRow(normalized, 0);
    const validationWarnings = generateWarnings(normalized, 0);

    return {
      raw,
      normalized,
      validationErrors,
      validationWarnings,
    };
  });
}

function normalizeEmploymentStatus(value: any): any {
  if (!value) return 'ACTIVE';
  const str = String(value).toUpperCase().trim();
  const mapping: Record<string, string> = {
    'ACTIVE': 'ACTIVE',
    'ON LEAVE': 'ON_LEAVE',
    'ON_LEAVE': 'ON_LEAVE',
    'LEAVE': 'ON_LEAVE',
    'SUSPENDED': 'SUSPENDED',
    'TERMINATED': 'TERMINATED',
    'LEFT': 'TERMINATED',
  };
  return mapping[str] || 'ACTIVE';
}

function normalizeContractType(value: any): any {
  if (!value) return 'PERMANENT';
  const str = String(value).toUpperCase().trim();
  const mapping: Record<string, string> = {
    'PERMANENT': 'PERMANENT',
    'FIXED TERM': 'FIXED_TERM',
    'FIXED_TERM': 'FIXED_TERM',
    'FIXED': 'FIXED_TERM',
    'TEMPORARY': 'TEMPORARY',
    'TEMP': 'TEMPORARY',
    'CASUAL': 'CASUAL',
  };
  return mapping[str] || 'PERMANENT';
}

function normalizePayFrequency(value: any): any {
  if (!value) return 'MONTHLY';
  const str = String(value).toUpperCase().trim();
  const mapping: Record<string, string> = {
    'WEEKLY': 'WEEKLY',
    'WEEK': 'WEEKLY',
    'FORTNIGHTLY': 'FORTNIGHTLY',
    'BIWEEKLY': 'FORTNIGHTLY',
    'FOUR WEEKLY': 'FOUR_WEEKLY',
    'FOUR_WEEKLY': 'FOUR_WEEKLY',
    'MONTHLY': 'MONTHLY',
    'MONTH': 'MONTHLY',
    'ANNUALLY': 'ANNUALLY',
    'ANNUAL': 'ANNUALLY',
    'YEARLY': 'ANNUALLY',
  };
  return mapping[str] || 'MONTHLY';
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  const str = String(value).toLowerCase().trim();
  return str === 'true' || str === 'yes' || str === '1' || str === 'y';
}

function generateWarnings(employee: any, rowNumber: number): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (!employee.email) {
    warnings.push({
      row: rowNumber,
      field: 'email',
      value: employee.email,
      message: 'Email address is missing - may impact communication',
      severity: 'warning',
      code: 'WARN_001',
    });
  }

  if (!employee.ppsn) {
    warnings.push({
      row: rowNumber,
      field: 'ppsn',
      value: employee.ppsn,
      message: 'PPSN is missing - required for pension enrollment',
      severity: 'warning',
      code: 'WARN_002',
    });
  }

  if (employee.annualSalary && employee.annualSalary < 20000) {
    warnings.push({
      row: rowNumber,
      field: 'annualSalary',
      value: employee.annualSalary,
      message: 'Salary below auto-enrolment threshold (€20,000)',
      severity: 'warning',
      code: 'WARN_003',
    });
  }

  return warnings;
}
