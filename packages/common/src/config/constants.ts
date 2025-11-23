export const AUTO_ENROLMENT_CONFIG = {
  minimumAge: 23,
  maximumAge: 60,
  minimumEarnings: 20000,
  minimumHoursPerWeek: 0,
  waitingPeriodMonths: 6,
  contributionRates: {
    2024: { employee: 1.5, employer: 1.5 },
    2025: { employee: 3.0, employer: 3.0 },
    2026: { employee: 4.5, employer: 4.5 },
    2027: { employee: 6.0, employer: 6.0 },
  },
  earningsThreshold: {
    lower: 20000,
    upper: 80000,
  },
};

export const VALIDATION_CONSTANTS = {
  maxFileSize: 10 * 1024 * 1024,
  allowedFileTypes: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  maxRowsPerUpload: 10000,
  dateFormats: [
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'MM/dd/yyyy',
    'dd-MM-yyyy',
  ],
};

export const PPSN_REGEX = /^\d{7}[A-Z]{1,2}$/;

export const ERROR_CODES = {
  VALIDATION: {
    REQUIRED_FIELD: 'VAL_001',
    INVALID_TYPE: 'VAL_002',
    INVALID_FORMAT: 'VAL_003',
    OUT_OF_RANGE: 'VAL_004',
    INVALID_DATE: 'VAL_005',
    BUSINESS_RULE: 'VAL_006',
  },
  UPLOAD: {
    FILE_TOO_LARGE: 'UPL_001',
    INVALID_FILE_TYPE: 'UPL_002',
    TOO_MANY_ROWS: 'UPL_003',
    PARSE_ERROR: 'UPL_004',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_001',
    TOKEN_EXPIRED: 'AUTH_002',
    UNAUTHORIZED: 'AUTH_003',
  },
  BILLING: {
    PAYMENT_FAILED: 'BILL_001',
    SUBSCRIPTION_INACTIVE: 'BILL_002',
  },
};

export const RISK_SCORES = {
  HIGH: 80,
  MEDIUM: 50,
  LOW: 20,
};

export const GDPR_CONFIG = {
  dataRetentionDays: 0,
  pseudonymisationEnabled: true,
  encryptionRequired: true,
};
