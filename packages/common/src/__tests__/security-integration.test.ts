/**
 * Security Integration Test
 * Tests CSV injection, SQL injection, XSS prevention in validation pipeline
 */

import { validateEmployeeData, normalizeEmployeeData } from '../validation/validators';

describe('Security Integration Tests', () => {
  describe('CSV Injection Prevention', () => {
    it('should block CSV formula injection (=SUM)', () => {
      const maliciousData = [{
        employeeId: '=SUM(A1:A10)',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(maliciousData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => 
        e.message.toLowerCase().includes('injection') || 
        e.message.toLowerCase().includes('formula')
      )).toBe(true);
    });

    it('should block CSV formula injection (+cmd)', () => {
      const maliciousData = [{
        employeeId: 'EMP001',
        firstName: '+2+3',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(maliciousData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should block CSV formula injection (@reference)', () => {
      const maliciousData = [{
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: '@A1',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(maliciousData);
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should block SQL injection (UNION SELECT)', () => {
      const maliciousData = [{
        employeeId: "EMP001' UNION SELECT * FROM users--",
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(maliciousData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.message.toLowerCase().includes('injection') || 
        e.message.toLowerCase().includes('sql')
      )).toBe(true);
    });

    it('should block SQL injection (DROP TABLE)', () => {
      const maliciousData = [{
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: "Doe'; DROP TABLE employees;--",
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(maliciousData);
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('XSS Prevention', () => {
    it('should block XSS script tags', () => {
      const maliciousData = [{
        employeeId: 'EMP001',
        firstName: '<script>alert("XSS")</script>',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(maliciousData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.message.toLowerCase().includes('script') || 
        e.message.toLowerCase().includes('xss')
      )).toBe(true);
    });

    it('should block javascript: protocol', () => {
      const maliciousData = [{
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'javascript:alert(1)',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(maliciousData);
      
      expect(result.isValid).toBe(false);
    });

    it('should block onload event handlers', () => {
      const maliciousData = [{
        employeeId: 'EMP001',
        firstName: '<img src=x onload=alert(1)>',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(maliciousData);
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize clean data without errors', () => {
      const cleanData = [{
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: "O'Brien",  // Valid apostrophe
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const normalized = normalizeEmployeeData(cleanData);
      
      expect(normalized).toHaveLength(1);
      expect(normalized[0].normalized.firstName).toBe('John');
      expect(normalized[0].normalized.lastName).toBe("O'Brien");
    });

    it('should strip control characters', () => {
      const dataWithControlChars = [{
        employeeId: 'EMP001',
        firstName: 'John\x00\x01\x02',  // Null bytes and control chars
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const normalized = normalizeEmployeeData(dataWithControlChars);
      
      // Should strip control characters
      expect(normalized[0].normalized.firstName).not.toContain('\x00');
      expect(normalized[0].normalized.firstName).toMatch(/^[a-zA-Z]+$/);
    });

    it('should enforce field length limits', () => {
      const dataWithLongFields = [{
        employeeId: 'A'.repeat(100),  // 100 chars (limit is 50)
        firstName: 'John',
        lastName: 'Doe',
        email: 'a'.repeat(300) + '@example.com',  // >254 chars
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(dataWithLongFields);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.message.toLowerCase().includes('length') || 
        e.message.toLowerCase().includes('long')
      )).toBe(true);
    });
  });

  describe('PPSN Validation', () => {
    it('should accept valid Irish PPSN format', () => {
      const validData = [{
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        ppsn: '1234567T',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(validData);
      
      // PPSN format should be valid
      const ppsnErrors = result.errors.filter(e => e.field === 'ppsn');
      expect(ppsnErrors.length).toBe(0);
    });

    it('should reject invalid PPSN format', () => {
      const invalidData = [{
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        ppsn: 'INVALID123',  // Wrong format
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'ppsn')).toBe(true);
    });
  });

  describe('Combined Attack Vectors', () => {
    it('should block multiple injection types in single record', () => {
      const multiAttackData = [{
        employeeId: '=SUM(A1:A10)',  // CSV injection
        firstName: '<script>alert(1)</script>',  // XSS
        lastName: "'; DROP TABLE users;--",  // SQL injection
        email: 'javascript:alert(1)',  // XSS protocol
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }];

      const result = validateEmployeeData(multiAttackData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);  // At least 3 fields should fail
    });

    it('should process clean data efficiently', () => {
      const largeCleanDataset = Array.from({ length: 1000 }, (_, i) => ({
        employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        employmentStartDate: '2020-01-01',
        hoursPerWeek: 40,
        annualSalary: 35000,
        hasOptedOut: false,
      }));

      const startTime = Date.now();
      const result = validateEmployeeData(largeCleanDataset);
      const duration = Date.now() - startTime;

      expect(result.rowsProcessed).toBe(1000);
      expect(duration).toBeLessThan(5000);  // Should process 1000 rows in < 5 seconds
    });
  });
});
