/**
 * Parser Service Tests - CSV/XLSX Parsing
 * 
 * Tests all file parsing logic, header normalization, and data mapping
 */

import * as fs from 'fs'
import * as path from 'path'
import { parseCSV, parseXLSX, parseFile, normalizeHeaders } from '../../services/parser.service'
import { 
  VALID_CSV_HEADERS, 
  VALID_EMPLOYEE_ROW, 
  ELIGIBLE_EMPLOYEES,
  generateCSVContent 
} from '../fixtures/test-data'

describe('Parser Service', () => {
  const testDataDir = path.join(__dirname, '../fixtures/files')
  
  beforeAll(() => {
    // Create test data directory
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true })
    }
  })

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true })
    }
  })

  describe('parseCSV', () => {
    test('should parse valid CSV file', async () => {
      const csvContent = generateCSVContent([VALID_EMPLOYEE_ROW])
      const testFile = path.join(testDataDir, 'valid.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await parseCSV(testFile)

      expect(result).toBeDefined()
      expect(result.data).toHaveLength(1)
      expect(result.headers).toEqual(VALID_CSV_HEADERS)
      expect(result.rowCount).toBe(1)
      expect(result.data[0]).toMatchObject(VALID_EMPLOYEE_ROW)
    })

    test('should parse CSV with multiple rows', async () => {
      const csvContent = generateCSVContent(ELIGIBLE_EMPLOYEES)
      const testFile = path.join(testDataDir, 'multiple.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await parseCSV(testFile)

      expect(result.data).toHaveLength(3)
      expect(result.rowCount).toBe(3)
      expect(result.data[0].first_name).toBe('Sarah')
      expect(result.data[1].first_name).toBe('Michael')
      expect(result.data[2].first_name).toBe('Emma')
    })

    test('should handle empty CSV file', async () => {
      const testFile = path.join(testDataDir, 'empty.csv')
      fs.writeFileSync(testFile, 'employee_id,first_name,last_name\n')

      const result = await parseCSV(testFile)

      expect(result.data).toHaveLength(0)
      expect(result.rowCount).toBe(0)
    })

    test('should handle CSV with special characters', async () => {
      const specialRow = {
        ...VALID_EMPLOYEE_ROW,
        first_name: 'Seán',
        last_name: 'O\'Sullivan',
        email: 'sean.osullivan@test.ie'
      }
      const csvContent = generateCSVContent([specialRow])
      const testFile = path.join(testDataDir, 'special.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await parseCSV(testFile)

      expect(result.data[0].first_name).toBe('Seán')
      expect(result.data[0].last_name).toBe('O\'Sullivan')
    })

    test('should handle CSV with missing values', async () => {
      const incompleteRow = {
        ...VALID_EMPLOYEE_ROW,
        email: '',
        opt_out_date: ''
      }
      const csvContent = generateCSVContent([incompleteRow])
      const testFile = path.join(testDataDir, 'incomplete.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await parseCSV(testFile)

      expect(result.data[0].email).toBe('')
      expect(result.data[0].opt_out_date).toBe('')
    })

    test('should reject malformed CSV', async () => {
      const testFile = path.join(testDataDir, 'malformed.csv')
      fs.writeFileSync(testFile, 'this is not a valid csv\n"unclosed quote')

      await expect(parseCSV(testFile)).rejects.toThrow()
    })

    test('should handle large CSV files (1000+ rows)', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        ...VALID_EMPLOYEE_ROW,
        employee_id: `EMP${String(i + 1).padStart(6, '0')}`,
        email: `employee${i + 1}@test.com`
      }))
      const csvContent = generateCSVContent(largeData)
      const testFile = path.join(testDataDir, 'large.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await parseCSV(testFile)

      expect(result.data).toHaveLength(1000)
      expect(result.rowCount).toBe(1000)
    })

    test('should handle CSV with BOM (Byte Order Mark)', async () => {
      const csvContent = '\uFEFF' + generateCSVContent([VALID_EMPLOYEE_ROW])
      const testFile = path.join(testDataDir, 'bom.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await parseCSV(testFile)

      expect(result.data).toHaveLength(1)
    })
  })

  describe('normalizeHeaders', () => {
    test('should normalize standard headers', () => {
      const headers = ['employee_id', 'first_name', 'last_name', 'date_of_birth']
      const mapping = normalizeHeaders(headers)

      expect(mapping.get('employee_id')).toBe('employeeId')
      expect(mapping.get('first_name')).toBe('firstName')
      expect(mapping.get('last_name')).toBe('lastName')
      expect(mapping.get('date_of_birth')).toBe('dateOfBirth')
    })

    test('should handle variant header names', () => {
      const headers = ['emp_id', 'fname', 'lname', 'dob', 'pps', 'email_address']
      const mapping = normalizeHeaders(headers)

      expect(mapping.get('emp_id')).toBe('employeeId')
      expect(mapping.get('fname')).toBe('firstName')
      expect(mapping.get('lname')).toBe('lastName')
      expect(mapping.get('dob')).toBe('dateOfBirth')
      expect(mapping.get('pps')).toBe('ppsn')
      expect(mapping.get('email_address')).toBe('email')
    })

    test('should handle case-insensitive headers', () => {
      const headers = ['EMPLOYEE_ID', 'First_Name', 'LAST_NAME']
      const mapping = normalizeHeaders(headers)

      expect(mapping.get('EMPLOYEE_ID')).toBe('employeeId')
      expect(mapping.get('First_Name')).toBe('firstName')
      expect(mapping.get('LAST_NAME')).toBe('lastName')
    })

    test('should handle headers with extra whitespace', () => {
      const headers = ['  employee_id  ', ' first_name ', 'last_name   ']
      const mapping = normalizeHeaders(headers)

      expect(mapping.get('  employee_id  ')).toBe('employeeId')
      expect(mapping.get(' first_name ')).toBe('firstName')
      expect(mapping.get('last_name   ')).toBe('lastName')
    })

    test('should handle mixed header formats', () => {
      const headers = [
        'employee id', // Space
        'employeeId', // Camel case
        'employee-id', // Hyphen
        'EMPLOYEE ID' // Caps with space
      ]
      const mapping = normalizeHeaders(headers)

      expect(mapping.get('employee id')).toBe('employeeId')
    })

    test('should leave unrecognized headers unmapped', () => {
      const headers = ['unknown_field', 'custom_column', 'employee_id']
      const mapping = normalizeHeaders(headers)

      expect(mapping.get('unknown_field')).toBeUndefined()
      expect(mapping.get('custom_column')).toBeUndefined()
      expect(mapping.get('employee_id')).toBe('employeeId')
    })

    test('should handle payroll provider specific headers', () => {
      // Sage Payroll format
      const sageHeaders = ['Staff ID', 'Forename', 'Surname', 'Birth Date', 'NI Number']
      const sageMapping = normalizeHeaders(sageHeaders)
      
      // Thesaurus Payroll format
      const thesaurusHeaders = ['Emp No', 'First', 'Last', 'DOB', 'PPS No']
      const thesaurusMapping = normalizeHeaders(thesaurusHeaders)

      expect(sageMapping.size).toBeGreaterThan(0)
      expect(thesaurusMapping.size).toBeGreaterThan(0)
    })
  })

  describe('parseFile', () => {
    test('should detect and parse CSV files', async () => {
      const csvContent = generateCSVContent([VALID_EMPLOYEE_ROW])
      const testFile = path.join(testDataDir, 'detect.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await parseFile(testFile, 'text/csv')

      expect(result.data).toHaveLength(1)
      expect(result.rowCount).toBe(1)
    })

    test('should detect file type from extension when mime type is generic', async () => {
      const csvContent = generateCSVContent([VALID_EMPLOYEE_ROW])
      const testFile = path.join(testDataDir, 'extension-test.csv')
      fs.writeFileSync(testFile, csvContent)

      const result = await parseFile(testFile, 'application/octet-stream')

      expect(result.data).toHaveLength(1)
    })

    test('should reject unsupported file types', async () => {
      const testFile = path.join(testDataDir, 'document.pdf')
      fs.writeFileSync(testFile, 'fake pdf content')

      await expect(parseFile(testFile, 'application/pdf')).rejects.toThrow('Unsupported file type')
    })
  })

  describe('Performance Tests', () => {
    test('should parse 5000 rows in under 2 seconds', async () => {
      const largeData = Array.from({ length: 5000 }, (_, i) => ({
        ...VALID_EMPLOYEE_ROW,
        employee_id: `EMP${String(i + 1).padStart(6, '0')}`
      }))
      const csvContent = generateCSVContent(largeData)
      const testFile = path.join(testDataDir, 'performance.csv')
      fs.writeFileSync(testFile, csvContent)

      const start = Date.now()
      const result = await parseCSV(testFile)
      const duration = Date.now() - start

      expect(result.rowCount).toBe(5000)
      expect(duration).toBeLessThan(2000)
    })

    test('should handle memory efficiently with large files', async () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        ...VALID_EMPLOYEE_ROW,
        employee_id: `EMP${String(i + 1).padStart(6, '0')}`
      }))
      const csvContent = generateCSVContent(largeData)
      const testFile = path.join(testDataDir, 'memory.csv')
      fs.writeFileSync(testFile, csvContent)

      await parseCSV(testFile)
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024 // MB

      // Should not use more than 50MB additional memory
      expect(memoryIncrease).toBeLessThan(50)
    })
  })

  describe('Error Handling', () => {
    test('should handle non-existent file', async () => {
      await expect(parseCSV('/path/to/nonexistent.csv')).rejects.toThrow()
    })

    test('should handle corrupted file', async () => {
      const testFile = path.join(testDataDir, 'corrupted.csv')
      fs.writeFileSync(testFile, Buffer.from([0xFF, 0xFE, 0xFD]))

      await expect(parseCSV(testFile)).rejects.toThrow()
    })

    test('should handle permission denied', async () => {
      const testFile = path.join(testDataDir, 'readonly.csv')
      fs.writeFileSync(testFile, 'test')
      fs.chmodSync(testFile, 0o000)

      await expect(parseCSV(testFile)).rejects.toThrow()
      
      // Cleanup
      fs.chmodSync(testFile, 0o644)
    })
  })
})
