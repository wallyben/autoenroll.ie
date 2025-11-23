import { ValidationRule, ValidationRuleType, ValidationError } from '../types/validation';
import { ERROR_CODES, PPSN_REGEX, VALIDATION_CONSTANTS } from '../config/constants';
import { isValid, parse, isBefore, isAfter } from 'date-fns';
import { validateFieldSecurity } from './security';

export const validationRules: ValidationRule[] = [
  {
    field: 'employeeId',
    type: ValidationRuleType.REQUIRED,
    required: true,
    message: 'Employee ID is required',
    validator: (value) => value !== null && value !== undefined && value !== '',
  },
  {
    field: 'firstName',
    type: ValidationRuleType.REQUIRED,
    required: true,
    message: 'First name is required',
    validator: (value) => typeof value === 'string' && value.trim().length > 0,
  },
  {
    field: 'lastName',
    type: ValidationRuleType.REQUIRED,
    required: true,
    message: 'Last name is required',
    validator: (value) => typeof value === 'string' && value.trim().length > 0,
  },
  {
    field: 'dateOfBirth',
    type: ValidationRuleType.DATE,
    required: true,
    message: 'Valid date of birth is required',
    validator: (value) => {
      if (!value) return false;
      const date = typeof value === 'string' ? parseDate(value) : value;
      return date instanceof Date && isValid(date) && isBefore(date, new Date());
    },
  },
  {
    field: 'ppsn',
    type: ValidationRuleType.FORMAT,
    required: false,
    message: 'Invalid PPSN format (expected 7 digits followed by 1-2 letters)',
    validator: (value) => !value || PPSN_REGEX.test(String(value).trim().toUpperCase()),
  },
  {
    field: 'email',
    type: ValidationRuleType.FORMAT,
    required: false,
    message: 'Invalid email format',
    validator: (value) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(String(value));
    },
  },
  {
    field: 'employmentStartDate',
    type: ValidationRuleType.DATE,
    required: true,
    message: 'Valid employment start date is required',
    validator: (value) => {
      if (!value) return false;
      const date = typeof value === 'string' ? parseDate(value) : value;
      return date instanceof Date && isValid(date) && isBefore(date, new Date());
    },
  },
  {
    field: 'hoursPerWeek',
    type: ValidationRuleType.RANGE,
    required: true,
    message: 'Hours per week must be between 0 and 168',
    validator: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 168;
    },
  },
  {
    field: 'annualSalary',
    type: ValidationRuleType.RANGE,
    required: true,
    message: 'Annual salary must be a positive number',
    validator: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 10000000;
    },
  },
  {
    field: 'employmentStartDate',
    type: ValidationRuleType.BUSINESS,
    required: true,
    message: 'Employment start date cannot be in the future',
    validator: (value, row) => {
      if (!value) return false;
      const date = typeof value === 'string' ? parseDate(value) : value;
      if (!row.dateOfBirth) return true;
      const dob = typeof row.dateOfBirth === 'string' ? parseDate(row.dateOfBirth) : row.dateOfBirth;
      return date instanceof Date && dob instanceof Date && isAfter(date, dob);
    },
  },
];

export function parseDate(value: string): Date | null {
  for (const format of VALIDATION_CONSTANTS.dateFormats) {
    try {
      const parsed = parse(value, format, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      continue;
    }
  }
  
  const date = new Date(value);
  return isValid(date) ? date : null;
}

export function validateRow(row: any, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // SECURITY: Check all fields for injection attempts
  for (const [field, value] of Object.entries(row)) {
    if (value !== null && value !== undefined && value !== '') {
      const securityErrors = validateFieldSecurity(value, field, rowNumber);
      errors.push(...securityErrors);
    }
  }

  for (const rule of validationRules) {
    const value = row[rule.field];
    
    if (rule.required && (value === null || value === undefined || value === '')) {
      errors.push({
        row: rowNumber,
        field: rule.field,
        value,
        message: rule.message,
        severity: 'error',
        code: ERROR_CODES.VALIDATION.REQUIRED_FIELD,
      });
      continue;
    }

    if (value !== null && value !== undefined && value !== '' && !rule.validator(value, row)) {
      errors.push({
        row: rowNumber,
        field: rule.field,
        value,
        message: rule.message,
        severity: 'error',
        code: getErrorCode(rule.type),
      });
    }
  }

  return errors;
}

function getErrorCode(type: ValidationRuleType): string {
  switch (type) {
    case ValidationRuleType.REQUIRED:
      return ERROR_CODES.VALIDATION.REQUIRED_FIELD;
    case ValidationRuleType.TYPE:
      return ERROR_CODES.VALIDATION.INVALID_TYPE;
    case ValidationRuleType.FORMAT:
      return ERROR_CODES.VALIDATION.INVALID_FORMAT;
    case ValidationRuleType.RANGE:
      return ERROR_CODES.VALIDATION.OUT_OF_RANGE;
    case ValidationRuleType.DATE:
      return ERROR_CODES.VALIDATION.INVALID_DATE;
    case ValidationRuleType.BUSINESS:
      return ERROR_CODES.VALIDATION.BUSINESS_RULE;
    default:
      return ERROR_CODES.VALIDATION.INVALID_TYPE;
  }
}
