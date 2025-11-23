export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  rowsProcessed: number;
  rowsValid: number;
  rowsInvalid: number;
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
  severity: 'error';
  code: string;
}

export interface ValidationWarning {
  row: number;
  field: string;
  value: any;
  message: string;
  severity: 'warning';
  code: string;
}

export interface ParsedData {
  employees: any[];
  headers: string[];
  rawData: any[];
  fileInfo: FileInfo;
}

export interface FileInfo {
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
}

export interface NormalizedEmployee {
  raw: any;
  normalized: Partial<import('./employee').Employee>;
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
}

export enum ValidationRuleType {
  REQUIRED = 'REQUIRED',
  TYPE = 'TYPE',
  FORMAT = 'FORMAT',
  RANGE = 'RANGE',
  DATE = 'DATE',
  BUSINESS = 'BUSINESS'
}

export interface ValidationRule {
  field: string;
  type: ValidationRuleType;
  required?: boolean;
  message: string;
  validator: (value: any, row: any) => boolean;
}
