export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ResponseMetadata {
  page?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  timestamp: string;
}

export interface UploadRequest {
  file: File | Buffer;
  filename: string;
  userId: string;
}

export interface UploadResponse {
  uploadId: string;
  filename: string;
  status: UploadStatus;
  validationResult?: import('./validation').ValidationResult;
}

export enum UploadStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  VALIDATED = 'VALIDATED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
