import { query } from '../utils/database';

export interface Upload {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  status: string;
  validationResult?: any;
  processingError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createUpload(
  userId: string,
  filename: string,
  originalFilename: string,
  fileSize: number,
  mimeType: string
): Promise<Upload> {
  const result = await query(
    `INSERT INTO uploads (user_id, filename, original_filename, file_size, mime_type, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW(), NOW())
     RETURNING id, user_id as "userId", filename, original_filename as "originalFilename", 
               file_size as "fileSize", mime_type as "mimeType", status, 
               validation_result as "validationResult", processing_error as "processingError",
               created_at as "createdAt", updated_at as "updatedAt"`,
    [userId, filename, originalFilename, fileSize, mimeType]
  );
  return result.rows[0];
}

export async function findUploadById(id: string): Promise<Upload | null> {
  const result = await query(
    `SELECT id, user_id as "userId", filename, original_filename as "originalFilename",
            file_size as "fileSize", mime_type as "mimeType", status,
            validation_result as "validationResult", processing_error as "processingError",
            created_at as "createdAt", updated_at as "updatedAt"
     FROM uploads WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findUploadsByUserId(userId: string): Promise<Upload[]> {
  const result = await query(
    `SELECT id, user_id as "userId", filename, original_filename as "originalFilename",
            file_size as "fileSize", mime_type as "mimeType", status,
            validation_result as "validationResult", processing_error as "processingError",
            created_at as "createdAt", updated_at as "updatedAt"
     FROM uploads WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function updateUploadStatus(
  id: string,
  status: string,
  validationResult?: any,
  processingError?: string
): Promise<Upload> {
  const result = await query(
    `UPDATE uploads 
     SET status = $2, validation_result = $3, processing_error = $4, updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id as "userId", filename, original_filename as "originalFilename",
               file_size as "fileSize", mime_type as "mimeType", status,
               validation_result as "validationResult", processing_error as "processingError",
               created_at as "createdAt", updated_at as "updatedAt"`,
    [id, status, validationResult ? JSON.stringify(validationResult) : null, processingError]
  );
  return result.rows[0];
}

export async function deleteUpload(id: string): Promise<void> {
  await query('DELETE FROM uploads WHERE id = $1', [id]);
}
