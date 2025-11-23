import { validateEmployeeData, normalizeEmployeeData } from '@autoenroll/common';
import { parseBuffer, normalizeHeaders, mapDataToSchema } from './parser.service';
import { logger } from '../utils/logger';
import { ValidationError } from '../middleware/error.middleware';

/**
 * ZERO-RETENTION: Process files from memory Buffer only
 * NEVER reads from disk, NEVER writes to disk
 */

export async function processAndValidateBuffer(fileBuffer: Buffer, mimeType: string) {
  try {
    // Parse entirely from memory
    const parseResult = await parseBuffer(fileBuffer, mimeType);
    
    if (parseResult.rowCount === 0) {
      throw new ValidationError('File contains no data');
    }

    if (parseResult.rowCount > 10000) {
      throw new ValidationError('File exceeds maximum row limit (10,000 rows)');
    }

    const headerMapping = normalizeHeaders(parseResult.headers);
    const mappedData = mapDataToSchema(parseResult.data, headerMapping);

    const normalizedEmployees = normalizeEmployeeData(mappedData);
    const validationResult = validateEmployeeData(
      normalizedEmployees.map((ne: any) => ne.normalized)
    );

    logger.info('Buffer validation completed (in-memory)', {
      rowsProcessed: validationResult.rowsProcessed,
      rowsValid: validationResult.rowsValid,
      rowsInvalid: validationResult.rowsInvalid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length,
    });

    return {
      isValid: validationResult.isValid,
      summary: {
        totalRows: validationResult.rowsProcessed,
        validRows: validationResult.rowsValid,
        invalidRows: validationResult.rowsInvalid,
        errorCount: validationResult.errors.length,
        warningCount: validationResult.warnings.length,
      },
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      employees: normalizedEmployees,
    };
  } catch (error) {
    logger.error('Buffer validation error', { error: (error as Error).message }); // No PII
    throw error;
  }
}
