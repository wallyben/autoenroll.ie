/**
 * CSV Injection Prevention & Enhanced Validation
 * 
 * Protects against:
 * - CSV formula injection attacks (=, +, -, @, etc.)
 * - Unicode control characters
 * - Null bytes
 * - SQL injection patterns
 * - XSS patterns
 * - Excessive length attacks
 * - Invalid character encodings
 */

import { ValidationError } from '../types/validation';

/**
 * Dangerous CSV formula prefixes that Excel/Sheets will execute
 */
const CSV_INJECTION_PATTERNS = [
  /^=/,      // Formula
  /^\+/,     // Formula
  /^-/,      // Formula
  /^@/,      // Formula
  /^\t/,     // Tab (can cause issues)
  /^\r/,     // Carriage return
  /^\n/,     // Newline
];

/**
 * Unicode control characters (U+0000 to U+001F, U+007F to U+009F)
 */
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F-\x9F]/g;

/**
 * SQL injection patterns
 */
const SQL_INJECTION_PATTERNS = [
  /('|(--)|;|\*|\/\*|\*\/|xp_|sp_|union|select|insert|update|delete|drop|create|alter|exec|execute)/i
];

/**
 * XSS patterns
 */
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onload=, etc.
];

/**
 * Maximum lengths to prevent DoS
 */
const MAX_LENGTHS = {
  employeeId: 50,
  firstName: 100,
  lastName: 100,
  email: 254, // RFC 5321
  ppsn: 10,
  address: 500,
  notes: 1000,
  general: 255,
};

/**
 * Sanitize CSV field value to prevent injection attacks
 */
export function sanitizeCSVField(value: any, fieldName?: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  let sanitized = String(value).trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters
  sanitized = sanitized.replace(CONTROL_CHAR_PATTERN, '');

  // Check for CSV injection patterns
  for (const pattern of CSV_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      // Prefix with single quote to neutralize formula
      sanitized = `'${sanitized}`;
      break;
    }
  }

  // Enforce maximum length
  const maxLength = fieldName && MAX_LENGTHS[fieldName as keyof typeof MAX_LENGTHS] || MAX_LENGTHS.general;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Detect potential CSV injection attempts
 */
export function detectCSVInjection(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  const str = String(value);

  // Check for formula prefixes
  for (const pattern of CSV_INJECTION_PATTERNS) {
    if (pattern.test(str)) {
      return true;
    }
  }

  return false;
}

/**
 * Detect SQL injection patterns
 */
export function detectSQLInjection(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  const str = String(value).toLowerCase();

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(str)) {
      return true;
    }
  }

  return false;
}

/**
 * Detect XSS patterns
 */
export function detectXSS(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  const str = String(value);

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(str)) {
      return true;
    }
  }

  return false;
}

/**
 * Comprehensive security validation for all fields
 */
export function validateFieldSecurity(
  value: any,
  fieldName: string,
  rowNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (value === null || value === undefined || String(value).trim() === '') {
    return errors; // Empty fields are handled by required field validation
  }

  const strValue = String(value);

  // CSV Injection check
  if (detectCSVInjection(strValue)) {
    errors.push({
      row: rowNumber,
      field: fieldName,
      value: strValue.substring(0, 50), // Don't expose full malicious content
      message: `Potential CSV injection detected. Field starts with formula character (=, +, -, @). This is a security risk.`,
      severity: 'error',
      code: 'CSV_INJECTION',
    });
  }

  // SQL Injection check
  if (detectSQLInjection(strValue)) {
    errors.push({
      row: rowNumber,
      field: fieldName,
      value: '[REDACTED]',
      message: `Potential SQL injection pattern detected. Field contains suspicious SQL keywords.`,
      severity: 'error',
      code: 'SQL_INJECTION',
    });
  }

  // XSS check
  if (detectXSS(strValue)) {
    errors.push({
      row: rowNumber,
      field: fieldName,
      value: '[REDACTED]',
      message: `Potential XSS attack detected. Field contains script tags or JavaScript code.`,
      severity: 'error',
      code: 'XSS_DETECTED',
    });
  }

  // Control character check
  if (CONTROL_CHAR_PATTERN.test(strValue)) {
    errors.push({
      row: rowNumber,
      field: fieldName,
      value: strValue.substring(0, 50),
      message: `Field contains invalid control characters. Please remove hidden/non-printable characters.`,
      severity: 'error',
      code: 'CONTROL_CHARS',
    });
  }

  // Length check
  const maxLength = MAX_LENGTHS[fieldName as keyof typeof MAX_LENGTHS] || MAX_LENGTHS.general;
  if (strValue.length > maxLength) {
    errors.push({
      row: rowNumber,
      field: fieldName,
      value: `${strValue.length} characters`,
      message: `Field exceeds maximum length of ${maxLength} characters (${strValue.length} provided).`,
      severity: 'error',
      code: 'MAX_LENGTH_EXCEEDED',
    });
  }

  return errors;
}

/**
 * Validate entire row for security issues
 */
export function validateRowSecurity(
  row: Record<string, any>,
  rowNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check all fields for security issues
  for (const [fieldName, value] of Object.entries(row)) {
    const fieldErrors = validateFieldSecurity(value, fieldName, rowNumber);
    errors.push(...fieldErrors);
  }

  return errors;
}

/**
 * Sanitize entire employee record
 */
export function sanitizeEmployeeRecord(employee: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(employee)) {
    sanitized[key] = sanitizeCSVField(value, key);
  }

  return sanitized;
}

/**
 * Validate PPSN format (Irish Personal Public Service Number)
 * Format: 7 digits followed by 1 or 2 letters (e.g., 1234567A or 1234567AB)
 */
export function validatePPSN(ppsn: string): boolean {
  if (!ppsn) return false;
  
  const cleaned = ppsn.trim().toUpperCase().replace(/\s/g, '');
  
  // PPSN format: 7 digits + 1-2 letters
  const ppsnPattern = /^[0-9]{7}[A-Z]{1,2}$/;
  
  return ppsnPattern.test(cleaned);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  // RFC 5322 simplified email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailPattern.test(email.trim());
}

/**
 * Validate date format and reasonableness
 */
export function validateDate(dateStr: any): { valid: boolean; message?: string } {
  if (!dateStr) {
    return { valid: false, message: 'Date is required' };
  }

  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }

  // Check if date is reasonable (not before 1900, not in future)
  const minDate = new Date('1900-01-01');
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1); // Allow 1 year in future for start dates

  if (date < minDate) {
    return { valid: false, message: 'Date is before 1900' };
  }

  if (date > maxDate) {
    return { valid: false, message: 'Date is in the future' };
  }

  return { valid: true };
}

/**
 * Validate numeric value
 */
export function validateNumeric(
  value: any,
  fieldName: string,
  options?: { min?: number; max?: number }
): { valid: boolean; message?: string } {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a number` };
  }

  if (num < 0) {
    return { valid: false, message: `${fieldName} cannot be negative` };
  }

  if (options?.min !== undefined && num < options.min) {
    return { valid: false, message: `${fieldName} must be at least ${options.min}` };
  }

  if (options?.max !== undefined && num > options.max) {
    return { valid: false, message: `${fieldName} cannot exceed ${options.max}` };
  }

  return { valid: true };
}

/**
 * Comprehensive validation wrapper
 */
export function validateAndSanitizeRow(
  row: Record<string, any>,
  rowNumber: number
): { sanitized: Record<string, any>; errors: ValidationError[] } {
  // First, check for security issues
  const securityErrors = validateRowSecurity(row, rowNumber);

  // If security issues found, reject the row immediately
  if (securityErrors.length > 0) {
    return {
      sanitized: {},
      errors: securityErrors,
    };
  }

  // Sanitize the row
  const sanitized = sanitizeEmployeeRecord(row);

  return {
    sanitized,
    errors: [],
  };
}
