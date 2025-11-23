/**
 * Contribution Calculator Tests - Backend Service Integration
 * 
 * Tests the backend contribution calculation service which wraps the common package logic
 */

import { calculateEmployeeContributions, projectFutureContributions } from '../../services/contribution.service'
import { ELIGIBLE_EMPLOYEES } from '../fixtures/test-data'

describe('Contribution Calculator Service', () => {
  describe('calculateEmployeeContributions', () => {
    test('should calculate contributions for all eligible employees', async () => {
      const employees = ELIGIBLE_EMPLOYEES.map(e => ({
        employeeId: e.employee_id,
        firstName: e.first_name,
        lastName: e.last_name,
        dateOfBirth: new Date(e.date_of_birth),
        ppsn: e.ppsn,
        email: e.email,
        employmentStartDate: new Date(e.employment_start_date),
        employmentStatus: e.employment_status,
        contractType: e.contract_type,
        hoursPerWeek: parseFloat(e.hours_per_week),
        annualSalary: parseFloat(e.annual_salary),
        payFrequency: e.pay_frequency,
        prsiClass: e.prsi_class,
        hasOptedOut: e.has_opted_out === 'true'
      }))

      const result = await calculateEmployeeContributions(employees as any)

      expect(result.contributions).toBeDefined()
      expect(result.contributions.length).toBe(3)
      expect(result.summary).toBeDefined()
      expect(result.summary.totalEmployees).toBe(3)
      expect(result.summary.totalContributions).toBeGreaterThan(0)
      
      // Each contribution should have required fields
      result.contributions.forEach((contrib: any) => {
        expect(contrib.employeeId).toBeDefined()
        expect(contrib.annualSalary).toBeGreaterThan(0)
        expect(contrib.employeeContribution).toBeGreaterThan(0)
        expect(contrib.employerContribution).toBeGreaterThan(0)
        expect(contrib.totalContribution).toBeGreaterThan(0)
      })
    })

    test('should calculate correct summary statistics', async () => {
      const employees = ELIGIBLE_EMPLOYEES.map(e => ({
        employeeId: e.employee_id,
        firstName: e.first_name,
        lastName: e.last_name,
        dateOfBirth: new Date(e.date_of_birth),
        ppsn: e.ppsn,
        email: e.email,
        employmentStartDate: new Date(e.employment_start_date),
        employmentStatus: e.employment_status,
        contractType: e.contract_type,
        hoursPerWeek: parseFloat(e.hours_per_week),
        annualSalary: parseFloat(e.annual_salary),
        payFrequency: e.pay_frequency,
        prsiClass: e.prsi_class,
        hasOptedOut: e.has_opted_out === 'true'
      }))

      const result = await calculateEmployeeContributions(employees as any)

      expect(result.summary.totalEmployees).toBe(3)
      expect(result.summary.totalEmployeeContributions).toBeGreaterThan(0)
      expect(result.summary.totalEmployerContributions).toBeGreaterThan(0)
      expect(result.summary.totalContributions).toBeGreaterThan(0)
      expect(result.summary.averageEmployeeContribution).toBeGreaterThan(0)
      expect(result.summary.averageEmployerContribution).toBeGreaterThan(0)
      
      // Verify employer matches employee contributions
      expect(result.summary.totalEmployeeContributions).toBe(result.summary.totalEmployerContributions)
      
      // Verify total is sum of employee + employer
      const expectedTotal = result.summary.totalEmployeeContributions + result.summary.totalEmployerContributions
      expect(result.summary.totalContributions).toBe(expectedTotal)
    })

    test('should include contribution rates in summary', async () => {
      const employees = [ELIGIBLE_EMPLOYEES[0]].map(e => ({
        employeeId: e.employee_id,
        firstName: e.first_name,
        lastName: e.last_name,
        dateOfBirth: new Date(e.date_of_birth),
        ppsn: e.ppsn,
        email: e.email,
        employmentStartDate: new Date(e.employment_start_date),
        employmentStatus: e.employment_status,
        contractType: e.contract_type,
        hoursPerWeek: parseFloat(e.hours_per_week),
        annualSalary: parseFloat(e.annual_salary),
        payFrequency: e.pay_frequency,
        prsiClass: e.prsi_class,
        hasOptedOut: e.has_opted_out === 'true'
      }))

      const result = await calculateEmployeeContributions(employees as any)

      expect(result.summary.rates).toBeDefined()
      expect(result.summary.rates.employeeRate).toBeDefined()
      expect(result.summary.rates.employerRate).toBeDefined()
    })

    test('should handle different salary levels correctly', async () => {
      const lowSalaryEmployee = {
        ...ELIGIBLE_EMPLOYEES[0],
        annual_salary: '20000'
      }
      
      const highSalaryEmployee = {
        ...ELIGIBLE_EMPLOYEES[0],
        employee_id: 'HIGH001',
        annual_salary: '75000'
      }

      const employees = [lowSalaryEmployee, highSalaryEmployee].map(e => ({
        employeeId: e.employee_id,
        firstName: e.first_name,
        lastName: e.last_name,
        dateOfBirth: new Date(e.date_of_birth),
        ppsn: e.ppsn,
        email: e.email,
        employmentStartDate: new Date(e.employment_start_date),
        employmentStatus: e.employment_status,
        contractType: e.contract_type,
        hoursPerWeek: parseFloat(e.hours_per_week),
        annualSalary: parseFloat(e.annual_salary),
        payFrequency: e.pay_frequency,
        prsiClass: e.prsi_class,
        hasOptedOut: e.has_opted_out === 'true'
      }))

      const result = await calculateEmployeeContributions(employees as any)

      expect(result.contributions.length).toBe(2)
      
      const lowContrib = result.contributions.find((c: any) => c.employeeId === lowSalaryEmployee.employee_id)
      const highContrib = result.contributions.find((c: any) => c.employeeId === 'HIGH001')

      expect(lowContrib).toBeDefined()
      expect(highContrib).toBeDefined()
      expect(highContrib!.totalContribution).toBeGreaterThan(lowContrib!.totalContribution)
    })
  })

  describe('projectFutureContributions', () => {
    test('should project contributions for next 5 years', async () => {
      const employee = {
        employeeId: ELIGIBLE_EMPLOYEES[0].employee_id,
        firstName: ELIGIBLE_EMPLOYEES[0].first_name,
        lastName: ELIGIBLE_EMPLOYEES[0].last_name,
        dateOfBirth: new Date(ELIGIBLE_EMPLOYEES[0].date_of_birth),
        ppsn: ELIGIBLE_EMPLOYEES[0].ppsn,
        email: ELIGIBLE_EMPLOYEES[0].email,
        employmentStartDate: new Date(ELIGIBLE_EMPLOYEES[0].employment_start_date),
        employmentStatus: ELIGIBLE_EMPLOYEES[0].employment_status,
        contractType: ELIGIBLE_EMPLOYEES[0].contract_type,
        hoursPerWeek: parseFloat(ELIGIBLE_EMPLOYEES[0].hours_per_week),
        annualSalary: parseFloat(ELIGIBLE_EMPLOYEES[0].annual_salary),
        payFrequency: ELIGIBLE_EMPLOYEES[0].pay_frequency,
        prsiClass: ELIGIBLE_EMPLOYEES[0].prsi_class,
        hasOptedOut: ELIGIBLE_EMPLOYEES[0].has_opted_out === 'true'
      }

      const result = await projectFutureContributions(employee as any, 5)

      expect(result.employeeId).toBe(employee.employeeId)
      expect(result.projections).toBeDefined()
      expect(result.projections.length).toBe(5)
      
      result.projections.forEach((proj: any, idx: number) => {
        expect(proj.year).toBe(new Date().getFullYear() + idx)
        expect(proj.rates).toBeDefined()
        expect(proj.employeeContribution).toBeGreaterThan(0)
        expect(proj.employerContribution).toBeGreaterThan(0)
        expect(proj.totalContribution).toBeGreaterThan(0)
      })
    })

    test('should handle custom projection periods', async () => {
      const employee = {
        employeeId: ELIGIBLE_EMPLOYEES[0].employee_id,
        firstName: ELIGIBLE_EMPLOYEES[0].first_name,
        lastName: ELIGIBLE_EMPLOYEES[0].last_name,
        dateOfBirth: new Date(ELIGIBLE_EMPLOYEES[0].date_of_birth),
        ppsn: ELIGIBLE_EMPLOYEES[0].ppsn,
        email: ELIGIBLE_EMPLOYEES[0].email,
        employmentStartDate: new Date(ELIGIBLE_EMPLOYEES[0].employment_start_date),
        employmentStatus: ELIGIBLE_EMPLOYEES[0].employment_status,
        contractType: ELIGIBLE_EMPLOYEES[0].contract_type,
        hoursPerWeek: parseFloat(ELIGIBLE_EMPLOYEES[0].hours_per_week),
        annualSalary: parseFloat(ELIGIBLE_EMPLOYEES[0].annual_salary),
        payFrequency: ELIGIBLE_EMPLOYEES[0].pay_frequency,
        prsiClass: ELIGIBLE_EMPLOYEES[0].prsi_class,
        hasOptedOut: ELIGIBLE_EMPLOYEES[0].has_opted_out === 'true'
      }

      const result3Years = await projectFutureContributions(employee as any, 3)
      const result10Years = await projectFutureContributions(employee as any, 10)

      expect(result3Years.projections.length).toBe(3)
      expect(result10Years.projections.length).toBe(10)
    })
  })

  describe('Performance Tests', () => {
    test('should calculate contributions for 100 employees in under 100ms', async () => {
      const employees = Array.from({ length: 100 }, (_, i) => ({
        employeeId: `PERF${i}`,
        firstName: 'Test',
        lastName: `Employee${i}`,
        dateOfBirth: new Date('1990-01-01'),
        ppsn: `${1234567 + i}A`,
        email: `test${i}@example.ie`,
        employmentStartDate: new Date('2020-01-01'),
        employmentStatus: 'Employed',
        contractType: 'Permanent',
        hoursPerWeek: 40,
        annualSalary: 30000 + (i * 100),
        payFrequency: 'monthly',
        prsiClass: 'A',
        hasOptedOut: false
      }))

      const start = Date.now()
      await calculateEmployeeContributions(employees as any)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100)
    })
  })
})
