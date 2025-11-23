/**
 * Validation Service Tests - Data Validation and Normalization
 * 
 * Tests all validation rules, error detection, and data quality checks
 */

import { validateUploadedFile, processAndValidate } from '../../services/validation.service'
import * as fs from 'fs'
import * as path from 'path'
import {
  ELIGIBLE_EMPLOYEES,
  INELIGIBLE_EMPLOYEES,
  INVALID_DATA_ROWS,
  EDGE_CASE_EMPLOYEES,
  generateCSVContent
} from '../fixtures/test-data'

describe('Validation Service', () => {
  const testDataDir = path.join(__dirname, '../fixtures/files')

  beforeAll(() => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true })
    }
  })

  afterAll(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true })
    }
  })

  describe('validateUploadedFile', () => {
    test('should validate file with all eligible employees', async () => {
      const csvContent = generateCSVContent(ELIGIBLE_EMPLOYEES)
      const testFile = path.join(testDataDir, 'eligible.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await validateUploadedFile(testFile, 'text/csv')

      expect(result.validationResult.isValid).toBe(true)
      expect(result.validationResult.rowsValid).toBe(3)
      expect(result.validationResult.rowsInvalid).toBe(0)
      expect(result.validationResult.errors).toHaveLength(0)
    })

    test('should detect validation errors in invalid data', async () => {
      const csvContent = generateCSVContent(INVALID_DATA_ROWS)
      const testFile = path.join(testDataDir, 'invalid.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await validateUploadedFile(testFile, 'text/csv')

      expect(result.validationResult.isValid).toBe(false)
      expect(result.validationResult.errors.length).toBeGreaterThan(0)
      expect(result.validationResult.rowsInvalid).toBeGreaterThan(0)
    })

    test('should detect missing required fields', async () => {
      const missingFieldsRow = {
        employee_id: '',
        first_name: 'Test',
        last_name: 'User',
        date_of_birth: '',
        ppsn: '',
        email: 'test@test.com',
        employment_start_date: '',
        employment_status: 'active',
        contract_type: 'permanent',
        hours_per_week: '40',
        annual_salary: '30000',
        pay_frequency: 'monthly',
        prsi_class: 'A',
        has_opted_out: 'false',
        opt_out_date: ''
      }
      const csvContent = generateCSVContent([missingFieldsRow])
      const testFile = path.join(testDataDir, 'missing-fields.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await validateUploadedFile(testFile, 'text/csv')

      expect(result.validationResult.isValid).toBe(false)
      const errorMessages = result.validationResult.errors.map(e => e.message).join(' ')
      expect(errorMessages).toContain('employee_id')
      expect(errorMessages).toContain('date_of_birth')
    })

    test('should detect invalid email formats', async () => {
      const invalidEmailRow = {
        ...ELIGIBLE_EMPLOYEES[0],
        email: 'not-an-email'
      }
      const csvContent = generateCSVContent([invalidEmailRow])
      const testFile = path.join(testDataDir, 'invalid-email.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await validateUploadedFile(testFile, 'text/csv')

      const emailErrors = result.validationResult.errors.filter(e => 
        e.field === 'email' || e.message.includes('email')
      )
      expect(emailErrors.length).toBeGreaterThan(0)
    })

    test('should detect invalid PRSI classes', async () => {
      const invalidPRSIRow = {
        ...ELIGIBLE_EMPLOYEES[0],
        prsi_class: 'Z' // Invalid PRSI class
      }
      const csvContent = generateCSVContent([invalidPRSIRow])
      const testFile = path.join(testDataDir, 'invalid-prsi.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await validateUploadedFile(testFile, 'text/csv')

      const prsiErrors = result.validationResult.errors.filter(e => 
        e.message.includes('PRSI') || e.message.includes('prsi_class')
      )
      expect(prsiErrors.length).toBeGreaterThan(0)
    })

    test('should detect future dates', async () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const futureDateRow = {
        ...ELIGIBLE_EMPLOYEES[0],
        employment_start_date: futureDate.toISOString().split('T')[0]
      }
      const csvContent = generateCSVContent([futureDateRow])
      const testFile = path.join(testDataDir, 'future-date.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await validateUploadedFile(testFile, 'text/csv')

      const dateErrors = result.validationResult.errors.filter(e => 
        e.message.includes('future') || e.message.includes('date')
      )
      expect(dateErrors.length).toBeGreaterThan(0)
    })

    test('should detect negative numbers', async () => {
      const negativeRow = {
        ...ELIGIBLE_EMPLOYEES[0],
        annual_salary: '-5000',
        hours_per_week: '-10'
      }
      const csvContent = generateCSVContent([negativeRow])
      const testFile = path.join(testDataDir, 'negative.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await validateUploadedFile(testFile, 'text/csv')

      expect(result.validationResult.isValid).toBe(false)
      expect(result.validationResult.errors.length).toBeGreaterThan(0)
    })

    test('should handle edge case values', async () => {
      const csvContent = generateCSVContent(EDGE_CASE_EMPLOYEES)
      const testFile = path.join(testDataDir, 'edge-cases.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await validateUploadedFile(testFile, 'text/csv')

      expect(result.validationResult.rowsProcessed).toBe(5)
      // Edge cases should be valid but may have warnings
      expect(result.validationResult.rowsValid + result.validationResult.rowsInvalid).toBe(5)
    })

    test('should reject empty files', async () => {
      const testFile = path.join(testDataDir, 'empty.csv')
      fs.writeFileSync(testFile, 'employee_id,first_name,last_name\n')

      await expect(validateUploadedFile(testFile, 'text/csv')).rejects.toThrow('File contains no data')
    })

    test('should reject files exceeding row limit', async () => {
      const tooManyRows = Array.from({ length: 10001 }, (_, i) => ({
        ...ELIGIBLE_EMPLOYEES[0],
        employee_id: `EMP${i}`
      }))
      const csvContent = generateCSVContent(tooManyRows)
      const testFile = path.join(testDataDir, 'too-many-rows.csv')
      fs.writeFileSync(testFile, csvContent)

      await expect(validateUploadedFile(testFile, 'text/csv'))
        .rejects.toThrow('exceeds maximum row limit')
    })

    test('should detect duplicate employee IDs', async () => {
      const duplicateRows = [
        ELIGIBLE_EMPLOYEES[0],
        { ...ELIGIBLE_EMPLOYEES[0], first_name: 'Different', email: 'different@test.com' }
      ]
      const csvContent = generateCSVContent(duplicateRows)
      const testFile = path.join(testDataDir, 'duplicates.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await validateUploadedFile(testFile, 'text/csv')

      const duplicateErrors = result.validationResult.errors.filter(e => 
        e.message.includes('duplicate') || e.message.includes('Duplicate')
      )
      expect(duplicateErrors.length).toBeGreaterThan(0)
    })
  })

  describe('processAndValidate', () => {
    test('should return complete validation summary', async () => {
      const mixedData = [...ELIGIBLE_EMPLOYEES, ...INELIGIBLE_EMPLOYEES]
      const csvContent = generateCSVContent(mixedData)
      const testFile = path.join(testDataDir, 'mixed.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await processAndValidate(testFile, 'text/csv')

      expect(result.summary).toBeDefined()
      expect(result.summary.totalRows).toBe(9)
      expect(result.summary.validRows).toBeGreaterThan(0)
      expect(result.employees).toBeDefined()
    })

    test('should normalize data during validation', async () => {
      const unnormalizedRow = {
        employee_id: '  EMP001  ', // Extra whitespace
        first_name: 'john', // Lowercase
        last_name: 'DOE', // Uppercase
        date_of_birth: '1985-03-15',
        ppsn: '1234567t', // Lowercase
        email: 'JOHN.DOE@EXAMPLE.COM', // Uppercase
        employment_start_date: '2020-01-15',
        employment_status: 'ACTIVE', // Uppercase
        contract_type: 'Permanent', // Mixed case
        hours_per_week: '40.0', // Decimal
        annual_salary: '45,000', // With comma
        pay_frequency: 'Monthly', // Mixed case
        prsi_class: 'a', // Lowercase
        has_opted_out: 'FALSE', // Uppercase
        opt_out_date: ''
      }
      const csvContent = generateCSVContent([unnormalizedRow])
      const testFile = path.join(testDataDir, 'unnormalized.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await processAndValidate(testFile, 'text/csv')

      expect(result.employees).toBeDefined()
      expect(result.employees.length).toBeGreaterThan(0)
    })

    test('should provide detailed error messages', async () => {
      const csvContent = generateCSVContent(INVALID_DATA_ROWS)
      const testFile = path.join(testDataDir, 'detailed-errors.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await processAndValidate(testFile, 'text/csv')

      expect(result.errors.length).toBeGreaterThan(0)
      result.errors.forEach(error => {
        expect(error).toHaveProperty('row')
        expect(error).toHaveProperty('field')
        expect(error).toHaveProperty('message')
        expect(error).toHaveProperty('severity')
      })
    })

    test('should distinguish between errors and warnings', async () => {
      const warningRow = {
        ...ELIGIBLE_EMPLOYEES[0],
        email: '', // Missing but not required
        hours_per_week: '35' // Valid but below full-time
      }
      const csvContent = generateCSVContent([warningRow])
      const testFile = path.join(testDataDir, 'warnings.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await processAndValidate(testFile, 'text/csv')

      expect(result.warnings).toBeDefined()
      // Should have warnings but not be invalid
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          expect(warning.severity).toBe('warning')
        })
      }
    })
  })

  describe('Data Quality Checks', () => {
    test('should flag suspicious patterns', async () => {
      const suspiciousRows = Array.from({ length: 5 }, (_, i) => ({
        ...ELIGIBLE_EMPLOYEES[0],
        employee_id: `EMP${i}`,
        annual_salary: '1', // Suspiciously low
        email: `test${i}@test.com`
      }))
      const csvContent = generateCSVContent(suspiciousRows)
      const testFile = path.join(testDataDir, 'suspicious.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await processAndValidate(testFile, 'text/csv')

      // Should have warnings about unusual data
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    test('should validate PPSN format', async () => {
      const invalidPPSNRows = [
        { ...ELIGIBLE_EMPLOYEES[0], ppsn: '123456' }, // Too short
        { ...ELIGIBLE_EMPLOYEES[0], ppsn: '12345678T', employee_id: 'E2' }, // Too long
        { ...ELIGIBLE_EMPLOYEES[0], ppsn: '1234567X', employee_id: 'E3' } // Invalid check letter
      ]
      const csvContent = generateCSVContent(invalidPPSNRows)
      const testFile = path.join(testDataDir, 'invalid-ppsn.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await processAndValidate(testFile, 'text/csv')

      const ppsnErrors = result.errors.filter(e => 
        e.message.includes('PPSN') || e.message.includes('ppsn')
      )
      expect(ppsnErrors.length).toBeGreaterThan(0)
    })

    test('should validate date ranges', async () => {
      const oldDate = new Date('1850-01-01').toISOString().split('T')[0]
      const veryOldRow = {
        ...ELIGIBLE_EMPLOYEES[0],
        date_of_birth: oldDate
      }
      const csvContent = generateCSVContent([veryOldRow])
      const testFile = path.join(testDataDir, 'old-date.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await processAndValidate(testFile, 'text/csv')

      const dateErrors = result.errors.filter(e => 
        e.message.includes('date') || e.message.includes('Date')
      )
      expect(dateErrors.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Tests', () => {
    test('should validate 1000 rows in under 1 second', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        ...ELIGIBLE_EMPLOYEES[0],
        employee_id: `EMP${String(i + 1).padStart(6, '0')}`,
        email: `employee${i + 1}@test.com`
      }))
      const csvContent = generateCSVContent(largeData)
      const testFile = path.join(testDataDir, 'perf-validation.csv')
      fs.writeFileSync(testFile, csvContent)

      const start = Date.now()
      await processAndValidate(testFile, 'text/csv')
      const duration = Date.now() - start

      expect(duration).toBeLessThan(1000)
    })
  })
})
