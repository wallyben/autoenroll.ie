/**
 * Eligibility Service Tests - Auto-Enrolment Eligibility Determination
 * 
 * Tests all eligibility rules according to Irish auto-enrolment legislation
 */

import { determineEligibility, calculateEligibilityForEmployee } from '../../services/eligibility.service'
import {
  ELIGIBLE_EMPLOYEES,
  INELIGIBLE_EMPLOYEES,
  EDGE_CASE_EMPLOYEES
} from '../fixtures/test-data'

describe('Eligibility Service', () => {
  describe('determineEligibility', () => {
    test('should correctly identify all eligible employees', async () => {
      const employees = ELIGIBLE_EMPLOYEES.map(e => ({
        ...e,
        dateOfBirth: new Date(e.date_of_birth),
        employmentStartDate: new Date(e.employment_start_date),
        annualSalary: parseFloat(e.annual_salary),
        hoursPerWeek: parseFloat(e.hours_per_week),
        hasOptedOut: e.has_opted_out === 'true',
        optOutDate: e.opt_out_date ? new Date(e.opt_out_date) : undefined
      }))

      const result = await determineEligibility(employees as any)

      expect(result.summary.eligibleCount).toBe(3)
      expect(result.summary.ineligibleCount).toBe(0)
      expect(result.summary.eligibilityRate).toBe(100)
      
      result.results.forEach(r => {
        expect(r.isEligible).toBe(true)
        expect(r.autoEnrolmentDate).toBeDefined()
      })
    })

    test('should correctly identify ineligible employees with reasons', async () => {
      const employees = INELIGIBLE_EMPLOYEES.map(e => ({
        ...e,
        dateOfBirth: new Date(e.date_of_birth),
        employmentStartDate: new Date(e.employment_start_date),
        annualSalary: parseFloat(e.annual_salary),
        hoursPerWeek: parseFloat(e.hours_per_week),
        hasOptedOut: e.has_opted_out === 'true',
        optOutDate: e.opt_out_date ? new Date(e.opt_out_date) : undefined
      }))

      const result = await determineEligibility(employees as any)

      expect(result.summary.ineligibleCount).toBe(6)
      
      result.results.forEach(r => {
        expect(r.isEligible).toBe(false)
        expect(r.reasons).toBeDefined()
        expect(r.reasons.length).toBeGreaterThan(0)
      })

      // Verify specific ineligibility reasons
      const youngWorker = result.results.find(r => r.employeeId === 'EMP101')
      expect(youngWorker?.reasons).toContain(expect.stringContaining('age'))

      const elderlyWorker = result.results.find(r => r.employeeId === 'EMP102')
      expect(elderlyWorker?.reasons).toContain(expect.stringContaining('age'))

      const lowEarner = result.results.find(r => r.employeeId === 'EMP103')
      expect(lowEarner?.reasons).toContain(expect.stringContaining('earnings'))

      const publicServant = result.results.find(r => r.employeeId === 'EMP104')
      expect(publicServant?.reasons).toContain(expect.stringContaining('PRSI'))

      const optedOut = result.results.find(r => r.employeeId === 'EMP105')
      expect(optedOut?.reasons).toContain(expect.stringContaining('opted out'))

      const newStarter = result.results.find(r => r.employeeId === 'EMP106')
      expect(newStarter?.reasons).toContain(expect.stringContaining('months'))
    })

    test('should handle mixed eligible and ineligible employees', async () => {
      const mixedEmployees = [...ELIGIBLE_EMPLOYEES, ...INELIGIBLE_EMPLOYEES].map(e => ({
        ...e,
        dateOfBirth: new Date(e.date_of_birth),
        employmentStartDate: new Date(e.employment_start_date),
        annualSalary: parseFloat(e.annual_salary),
        hoursPerWeek: parseFloat(e.hours_per_week),
        hasOptedOut: e.has_opted_out === 'true',
        optOutDate: e.opt_out_date ? new Date(e.opt_out_date) : undefined
      }))

      const result = await determineEligibility(mixedEmployees as any)

      expect(result.summary.totalEmployees).toBe(9)
      expect(result.summary.eligibleCount).toBe(3)
      expect(result.summary.ineligibleCount).toBe(6)
      expect(result.summary.eligibilityRate).toBeCloseTo(33.33, 1)
    })
  })

  describe('Age Eligibility Rules', () => {
    test('should reject employees under 23 years old', async () => {
      const under23 = {
        employeeId: 'AGE001',
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 22)),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 30000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(under23 as any)

      expect(result.isEligible).toBe(false)
      expect(result.reasons).toContain(expect.stringContaining('23'))
    })

    test('should accept employees exactly 23 years old (boundary)', async () => {
      const exactly23 = {
        employeeId: 'AGE002',
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 23)),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 30000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(exactly23 as any)

      expect(result.isEligible).toBe(true)
    })

    test('should accept employees exactly 60 years old (boundary)', async () => {
      const exactly60 = {
        employeeId: 'AGE003',
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 60)),
        employmentStartDate: new Date('2010-01-01'),
        annualSalary: 45000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(exactly60 as any)

      expect(result.isEligible).toBe(true)
    })

    test('should reject employees over 60 years old', async () => {
      const over60 = {
        employeeId: 'AGE004',
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 61)),
        employmentStartDate: new Date('2010-01-01'),
        annualSalary: 45000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(over60 as any)

      expect(result.isEligible).toBe(false)
      expect(result.reasons).toContain(expect.stringContaining('60'))
    })
  })

  describe('Earnings Eligibility Rules', () => {
    test('should reject employees earning under €20,000', async () => {
      const lowEarner = {
        employeeId: 'EARN001',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 19999,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(lowEarner as any)

      expect(result.isEligible).toBe(false)
      expect(result.reasons).toContain(expect.stringContaining('20,000'))
    })

    test('should accept employees earning exactly €20,000 (boundary)', async () => {
      const exactThreshold = {
        employeeId: 'EARN002',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 20000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(exactThreshold as any)

      expect(result.isEligible).toBe(true)
    })

    test('should correctly annualize weekly earnings', async () => {
      const weeklyPaid = {
        employeeId: 'EARN003',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        weeklyEarnings: 450, // 450 * 52.178571 = 23,480
        payFrequency: 'weekly' as any,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(weeklyPaid as any)

      expect(result.isEligible).toBe(true)
    })

    test('should correctly annualize monthly earnings', async () => {
      const monthlyPaid = {
        employeeId: 'EARN004',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        monthlyEarnings: 1800, // 1800 * 12 = 21,600
        payFrequency: 'monthly' as any,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(monthlyPaid as any)

      expect(result.isEligible).toBe(true)
    })
  })

  describe('PRSI Class Eligibility Rules', () => {
    test('should accept PRSI Class A', async () => {
      const classA = {
        employeeId: 'PRSI001',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 35000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(classA as any)

      expect(result.isEligible).toBe(true)
    })

    test('should reject PRSI Class D (public servants)', async () => {
      const classD = {
        employeeId: 'PRSI002',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 55000,
        prsiClass: 'D' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(classD as any)

      expect(result.isEligible).toBe(false)
      expect(result.reasons).toContain(expect.stringContaining('PRSI'))
    })

    test('should reject PRSI Class K (over 66)', async () => {
      const classK = {
        employeeId: 'PRSI003',
        dateOfBirth: new Date('1955-01-01'),
        employmentStartDate: new Date('2000-01-01'),
        annualSalary: 40000,
        prsiClass: 'K' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(classK as any)

      expect(result.isEligible).toBe(false)
    })
  })

  describe('Employment Duration Rules', () => {
    test('should reject employees with less than 6 months service', async () => {
      const newStarter = {
        employeeId: 'DUR001',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
        annualSalary: 35000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(newStarter as any)

      expect(result.isEligible).toBe(false)
      expect(result.reasons).toContain(expect.stringContaining('6 months'))
    })

    test('should accept employees with exactly 6 months service (boundary)', async () => {
      const sixMonths = {
        employeeId: 'DUR002',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date(Date.now() - 183 * 24 * 60 * 60 * 1000), // ~6 months
        annualSalary: 35000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(sixMonths as any)

      expect(result.isEligible).toBe(true)
    })
  })

  describe('Opt-Out Rules', () => {
    test('should reject employees who have opted out', async () => {
      const optedOut = {
        employeeId: 'OPT001',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 40000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: true,
        optOutDate: new Date('2024-09-01')
      }

      const result = await calculateEligibilityForEmployee(optedOut as any)

      expect(result.isEligible).toBe(false)
      expect(result.reasons).toContain(expect.stringContaining('opted out'))
    })

    test('should accept employees who have not opted out', async () => {
      const notOptedOut = {
        employeeId: 'OPT002',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 40000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(notOptedOut as any)

      expect(result.isEligible).toBe(true)
    })
  })

  describe('Auto-Enrolment Date Calculation', () => {
    test('should calculate auto-enrolment date for eligible employees', async () => {
      const eligible = {
        employeeId: 'DATE001',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 35000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(eligible as any)

      expect(result.autoEnrolmentDate).toBeDefined()
      expect(result.autoEnrolmentDate).toBeInstanceOf(Date)
    })

    test('should not set auto-enrolment date for ineligible employees', async () => {
      const ineligible = {
        employeeId: 'DATE002',
        dateOfBirth: new Date('2005-01-01'), // Too young
        employmentStartDate: new Date('2023-01-01'),
        annualSalary: 30000,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(ineligible as any)

      expect(result.autoEnrolmentDate).toBeUndefined()
    })
  })

  describe('Edge Cases and Complex Scenarios', () => {
    test('should handle employees with multiple ineligibility reasons', async () => {
      const multipleReasons = {
        employeeId: 'EDGE001',
        dateOfBirth: new Date('2005-01-01'), // Too young
        employmentStartDate: new Date('2024-01-01'), // Too recent
        annualSalary: 15000, // Too low
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(multipleReasons as any)

      expect(result.isEligible).toBe(false)
      expect(result.reasons.length).toBeGreaterThanOrEqual(3)
    })

    test('should handle employees on the exact boundary of all criteria', async () => {
      const allBoundaries = {
        employeeId: 'EDGE002',
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 23)), // Exactly 23
        employmentStartDate: new Date(Date.now() - 183 * 24 * 60 * 60 * 1000), // Exactly 6 months
        annualSalary: 20000, // Exactly threshold
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(allBoundaries as any)

      expect(result.isEligible).toBe(true)
    })

    test('should handle part-time employees correctly', async () => {
      const partTime = {
        employeeId: 'EDGE003',
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 22000, // Pro-rated eligible
        prsiClass: 'A' as any,
        hoursPerWeek: 20, // Part-time
        hasOptedOut: false
      }

      const result = await calculateEligibilityForEmployee(partTime as any)

      // Should be eligible if earnings meet threshold on pro-rata basis
      expect(result.isEligible).toBe(true)
    })
  })

  describe('Performance Tests', () => {
    test('should process 1000 employees in under 100ms', async () => {
      const largeSet = Array.from({ length: 1000 }, (_, i) => ({
        employeeId: `PERF${i}`,
        dateOfBirth: new Date('1990-01-01'),
        employmentStartDate: new Date('2020-01-01'),
        annualSalary: 30000 + i,
        prsiClass: 'A' as any,
        hoursPerWeek: 40,
        hasOptedOut: false
      }))

      const start = Date.now()
      await determineEligibility(largeSet as any)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100)
    })
  })
})
