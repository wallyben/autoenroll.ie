import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middleware/auth.middleware';
import * as UploadModel from '../models/upload.model';
import * as ValidationService from '../services/validation.service';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * ZERO-RETENTION ARCHITECTURE
 * 
 * CRITICAL: Files are NEVER written to disk
 * - Files are processed entirely in-memory using Buffer
 * - No temporary files created
 * - No file system persistence
 * - Immediate memory cleanup after processing
 * - GDPR-compliant by design
 */

// In-memory storage ONLY - zero disk writes
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
  }
};

export const upload = multer({
  storage, // memoryStorage - NEVER writes to disk
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 10MB max
  },
});

export async function uploadFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file uploaded',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // ZERO-RETENTION: File is in req.file.buffer (memory only)
    // NEVER written to disk
    const uploadRecord = await UploadModel.createUpload(
      req.user!.userId,
      `memory-${Date.now()}`, // No real filename since never stored
      req.file.originalname,
      req.file.size,
      req.file.mimetype
    );

    res.status(201).json({
      success: true,
      data: {
        uploadId: uploadRecord.id,
        filename: uploadRecord.originalFilename,
        status: uploadRecord.status,
      },
      metadata: { timestamp: new Date().toISOString() },
    });

    // Process in-memory buffer asynchronously
    // Buffer will be garbage collected after processing
    processUploadAsync(uploadRecord.id, req.file.buffer, req.file.mimetype);
  } catch (error: any) {
    logger.error('Upload error', { error: error.message }); // No file details in logs
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

async function processUploadAsync(uploadId: string, fileBuffer: Buffer, mimeType: string) {
  try {
    await UploadModel.updateUploadStatus(uploadId, 'PROCESSING');

    // Process entirely in-memory from Buffer
    const result = await ValidationService.processAndValidateBuffer(fileBuffer, mimeType);

    await UploadModel.updateUploadStatus(uploadId, 'COMPLETED', result);

    // Buffer is automatically garbage collected here
    logger.info('Upload processed successfully (in-memory only)', { 
      uploadId,
      rowsProcessed: result.summary?.totalRows || 0 
    });
  } catch (error: any) {
    logger.error('Upload processing error', { 
      uploadId,
      error: error.message // No PII in logs
    });
    await UploadModel.updateUploadStatus(uploadId, 'FAILED', undefined, error.message);
  }
}

export async function getUpload(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const upload = await UploadModel.findUploadById(id);

    if (!upload || upload.userId !== req.user!.userId) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Upload not found',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: upload,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get upload error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export async function listUploads(req: AuthRequest, res: Response): Promise<void> {
  try {
    const uploads = await UploadModel.findUploadsByUserId(req.user!.userId);

    res.status(200).json({
      success: true,
      data: uploads,
      metadata: {
        timestamp: new Date().toISOString(),
        totalRecords: uploads.length,
      },
    });
  } catch (error: any) {
    logger.error('List uploads error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export async function deleteUpload(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const upload = await UploadModel.findUploadById(id);

    if (!upload || upload.userId !== req.user!.userId) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Upload not found',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    await UploadModel.deleteUpload(id);

    res.status(200).json({
      success: true,
      data: { message: 'Upload deleted successfully' },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Delete upload error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
