/**
 * Staging Date Calculator Tests
 * 
 * Tests for P0 Feature: Staging Date Alignment
 */

import {
  calculateNextStagingDate,
  calculateAutoEnrolmentDate,
  getStagingDatesForYear,
  validateStagingConfig,
} from '../staging-dates';

import {
  StagingFrequency,
  StagingDateConfig,
} from '../../types/staging-dates';

describe('Staging Date Calculator', () => {
  const mockQuarterlyConfig: StagingDateConfig = {
    userId: 'test-user',
    frequency: StagingFrequency.QUARTERLY,
    dates: [1],
    effectiveFrom: new Date('2025-01-01'),
  };

  const mockMonthlyConfig: StagingDateConfig = {
    userId: 'test-user',
    frequency: StagingFrequency.MONTHLY,
    dates: [15],
    effectiveFrom: new Date('2025-01-01'),
  };

  describe('calculateNextStagingDate', () => {
    it('should calculate next quarterly staging date (Q1)', () => {
      const result = calculateNextStagingDate(mockQuarterlyConfig, new Date('2025-01-15'));
      
      // Next staging date after Jan 15 should be Apr 1
      expect(result.date).toEqual(new Date('2025-04-01'));
      expect(result.daysUntil).toBeGreaterThan(0);
      expect(result.following).toEqual(new Date('2025-07-01'));
    });

    it('should calculate next quarterly staging date (Q4)', () => {
      const result = calculateNextStagingDate(mockQuarterlyConfig, new Date('2025-11-23'));
      
      // Next staging date after Nov 23 should be Jan 1, 2026
      expect(result.date).toEqual(new Date('2026-01-01'));
      expect(result.following).toEqual(new Date('2026-04-01'));
    });

    it('should calculate next monthly staging date', () => {
      const result = calculateNextStagingDate(mockMonthlyConfig, new Date('2025-11-20'));
      
      // Next staging date after Nov 20 should be Dec 15
      expect(result.date).toEqual(new Date('2025-12-15'));
      expect(result.following).toEqual(new Date('2026-01-15'));
    });

    it('should use default quarterly config when null', () => {
      const result = calculateNextStagingDate(null, new Date('2025-02-15'));
      
      // Default is quarterly on 1st (Jan, Apr, Jul, Oct)
      expect(result.date).toEqual(new Date('2025-04-01'));
    });

    it('should handle staging date on same day', () => {
      const result = calculateNextStagingDate(mockQuarterlyConfig, new Date('2025-01-01'));
      
      // If on staging date, should return next one
      expect(result.date).toEqual(new Date('2025-04-01'));
    });
  });

  describe('calculateAutoEnrolmentDate', () => {
    it('should calculate correct auto-enrolment date (6 months + next staging)', () => {
      // Employee starts May 1, 2025
      const employmentStart = new Date('2025-05-01');
      
      const result = calculateAutoEnrolmentDate(employmentStart, mockQuarterlyConfig);
      
      // Waiting period ends Nov 1, next staging date is Jan 1, 2026
      expect(result.waitingPeriodEnd).toEqual(new Date('2025-11-01'));
      expect(result.autoEnrolmentDate).toEqual(new Date('2026-01-01'));
    });

    it('should align to staging date after waiting period', () => {
      // Employee starts Jan 15, 2025
      const employmentStart = new Date('2025-01-15');
      
      const result = calculateAutoEnrolmentDate(employmentStart, mockQuarterlyConfig);
      
      // Waiting period ends Jul 15, next staging is Oct 1
      expect(result.waitingPeriodEnd).toEqual(new Date('2025-07-15'));
      expect(result.autoEnrolmentDate).toEqual(new Date('2025-10-01'));
    });

    it('should calculate readyToEnrol correctly (waiting period complete)', () => {
      // Employee started 7 months ago
      const employmentStart = new Date('2025-04-01');
      const today = new Date('2025-11-23');
      
      const result = calculateAutoEnrolmentDate(employmentStart, mockQuarterlyConfig, today);
      
      // Waiting period ended Oct 1, so ready to enrol
      expect(result.readyToEnrol).toBe(true);
    });

    it('should calculate readyToEnrol correctly (waiting period not complete)', () => {
      // Employee started 3 months ago
      const employmentStart = new Date('2025-08-23');
      const today = new Date('2025-11-23');
      
      const result = calculateAutoEnrolmentDate(employmentStart, mockQuarterlyConfig, today);
      
      // Waiting period ends Feb 23, not yet ready
      expect(result.readyToEnrol).toBe(false);
    });

    it('should calculate daysUntilEnrolment correctly', () => {
      // Employee starts Jan 1, 2025
      const employmentStart = new Date('2025-01-01');
      const today = new Date('2025-11-23');
      
      const result = calculateAutoEnrolmentDate(employmentStart, mockQuarterlyConfig, today);
      
      // Waiting period ends Jul 1, next staging Oct 1, days until = ~310 days (already passed)
      expect(result.daysUntilEnrolment).toBeLessThan(0); // Negative means overdue
    });
  });

  describe('getStagingDatesForYear', () => {
    it('should return 4 quarterly dates for a year', () => {
      const dates = getStagingDatesForYear(2025, mockQuarterlyConfig);
      
      expect(dates).toHaveLength(4);
      expect(dates[0]).toEqual(new Date('2025-01-01'));
      expect(dates[1]).toEqual(new Date('2025-04-01'));
      expect(dates[2]).toEqual(new Date('2025-07-01'));
      expect(dates[3]).toEqual(new Date('2025-10-01'));
    });

    it('should return 12 monthly dates for a year', () => {
      const dates = getStagingDatesForYear(2025, mockMonthlyConfig);
      
      expect(dates).toHaveLength(12);
      expect(dates[0]).toEqual(new Date('2025-01-15'));
      expect(dates[11]).toEqual(new Date('2025-12-15'));
    });
  });

  describe('validateStagingConfig', () => {
    it('should pass validation for valid quarterly config', () => {
      const errors = validateStagingConfig({
        frequency: StagingFrequency.QUARTERLY,
        dates: [1],
        effectiveFrom: new Date('2025-01-01'),
        userId: 'test',
      });
      
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when frequency missing', () => {
      const errors = validateStagingConfig({
        dates: [1],
        effectiveFrom: new Date('2025-01-01'),
        userId: 'test',
      } as any);
      
      expect(errors).toContain('Frequency is required');
    });

    it('should fail validation when dates empty', () => {
      const errors = validateStagingConfig({
        frequency: StagingFrequency.QUARTERLY,
        dates: [],
        effectiveFrom: new Date('2025-01-01'),
        userId: 'test',
      });
      
      expect(errors).toContain('At least one date is required');
    });

    it('should fail validation for invalid day of month', () => {
      const errors = validateStagingConfig({
        frequency: StagingFrequency.MONTHLY,
        dates: [0, 32],
        effectiveFrom: new Date('2025-01-01'),
        userId: 'test',
      });
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('Invalid day of month'))).toBe(true);
    });

    it('should fail validation when effectiveTo before effectiveFrom', () => {
      const errors = validateStagingConfig({
        frequency: StagingFrequency.QUARTERLY,
        dates: [1],
        effectiveFrom: new Date('2025-12-01'),
        effectiveTo: new Date('2025-01-01'),
        userId: 'test',
      });
      
      expect(errors).toContain('Effective to date must be after effective from date');
    });
  });
});
