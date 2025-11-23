/**
 * Opt-Out and Re-Enrolment Tests
 * 
 * Tests for P0 Features: Opt-Out Window Validation & Re-Enrolment Tracking
 */

import {
  validateOptOut,
  calculateReEnrolmentDate,
  isWithinOptOutWindow,
  calculateOptOutRefund,
  buildEnrolmentStatus,
  createEnrolmentRecord,
} from '../opt-out';

import {
  EnrolmentEventType,
  EnrolmentHistory,
} from '../../types/enrolment-history';

import {
  StagingFrequency,
  StagingDateConfig,
} from '../../types/staging-dates';

describe('Opt-Out Validation', () => {
  describe('validateOptOut', () => {
    it('should validate opt-out within 6-month window', () => {
      const enrolmentDate = new Date('2025-06-01');
      const optOutDate = new Date('2025-08-15'); // 2.5 months later
      
      const result = validateOptOut(enrolmentDate, optOutDate, {
        employee: 500,
        employer: 500,
      });
      
      expect(result.isValid).toBe(true);
      expect(result.refundAmount).toBe(1000); // 500 + 500
      expect(result.daysRemaining).toBeGreaterThan(0);
    });

    it('should reject opt-out after 6-month window', () => {
      const enrolmentDate = new Date('2025-01-01');
      const optOutDate = new Date('2025-08-01'); // 7 months later
      
      const result = validateOptOut(enrolmentDate, optOutDate);
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Opt-out window closed');
    });

    it('should calculate correct refund amount', () => {
      const enrolmentDate = new Date('2025-06-01');
      const optOutDate = new Date('2025-07-01');
      
      const result = validateOptOut(enrolmentDate, optOutDate, {
        employee: 1234.56,
        employer: 1234.56,
      });
      
      expect(result.isValid).toBe(true);
      expect(result.refundAmount).toBe(2469.12);
    });

    it('should calculate opt-out window end date correctly', () => {
      const enrolmentDate = new Date('2025-06-01');
      const optOutDate = new Date('2025-07-01');
      
      const result = validateOptOut(enrolmentDate, optOutDate);
      
      const expectedWindowEnd = new Date('2025-12-01');
      expect(result.windowEndDate).toEqual(expectedWindowEnd);
    });

    it('should calculate next re-enrolment date (3 years later)', () => {
      const enrolmentDate = new Date('2025-06-01');
      const optOutDate = new Date('2025-07-01');
      
      const result = validateOptOut(enrolmentDate, optOutDate);
      
      const expectedReEnrolment = new Date('2028-06-01'); // 3 years from enrolment
      expect(result.nextReEnrolmentDate).toEqual(expectedReEnrolment);
    });

    it('should allow opt-out on last day of window', () => {
      const enrolmentDate = new Date('2025-06-01');
      const optOutDate = new Date('2025-12-01'); // Exactly 6 months
      
      const result = validateOptOut(enrolmentDate, optOutDate);
      
      expect(result.isValid).toBe(true);
      expect(result.daysRemaining).toBe(0);
    });
  });

  describe('calculateReEnrolmentDate', () => {
    const mockQuarterlyConfig: StagingDateConfig = {
      userId: 'test-user',
      frequency: StagingFrequency.QUARTERLY,
      dates: [1],
      effectiveFrom: new Date('2025-01-01'),
    };

    it('should calculate re-enrolment 3 years after opt-out + next staging', () => {
      const optOutDate = new Date('2025-06-15');
      const today = new Date('2025-11-23');
      
      const result = calculateReEnrolmentDate(
        'emp-123',
        optOutDate,
        mockQuarterlyConfig,
        today
      );
      
      // 3 years later = Jun 15, 2028, next staging = Jul 1, 2028
      expect(result.reEnrolmentDate).toEqual(new Date('2028-07-01'));
      expect(result.isDue).toBe(false);
    });

    it('should mark as due if re-enrolment date has passed', () => {
      const optOutDate = new Date('2022-01-15'); // 3+ years ago
      const today = new Date('2025-11-23');
      
      const result = calculateReEnrolmentDate(
        'emp-123',
        optOutDate,
        mockQuarterlyConfig,
        today
      );
      
      expect(result.isDue).toBe(true);
      expect(result.daysUntil).toBeLessThan(0);
    });

    it('should align re-enrolment to staging dates', () => {
      const optOutDate = new Date('2025-03-20');
      const today = new Date('2025-11-23');
      
      const result = calculateReEnrolmentDate(
        'emp-123',
        optOutDate,
        mockQuarterlyConfig,
        today
      );
      
      // 3 years = Mar 20, 2028, next quarterly staging = Apr 1, 2028
      expect(result.reEnrolmentDate).toEqual(new Date('2028-04-01'));
    });
  });

  describe('isWithinOptOutWindow', () => {
    it('should return true within 6 months', () => {
      const enrolmentDate = new Date('2025-06-01');
      const checkDate = new Date('2025-09-01'); // 3 months
      
      expect(isWithinOptOutWindow(enrolmentDate, checkDate)).toBe(true);
    });

    it('should return false after 6 months', () => {
      const enrolmentDate = new Date('2025-01-01');
      const checkDate = new Date('2025-08-01'); // 7 months
      
      expect(isWithinOptOutWindow(enrolmentDate, checkDate)).toBe(false);
    });

    it('should return true on last day of window', () => {
      const enrolmentDate = new Date('2025-06-01');
      const checkDate = new Date('2025-12-01'); // Exactly 6 months
      
      expect(isWithinOptOutWindow(enrolmentDate, checkDate)).toBe(true);
    });
  });

  describe('calculateOptOutRefund', () => {
    it('should calculate total refund (employee + employer)', () => {
      const refund = calculateOptOutRefund(500, 500);
      expect(refund).toBe(1000);
    });

    it('should round to 2 decimal places', () => {
      const refund = calculateOptOutRefund(123.456, 678.901);
      expect(refund).toBe(802.36);
    });

    it('should handle zero contributions', () => {
      const refund = calculateOptOutRefund(0, 0);
      expect(refund).toBe(0);
    });
  });

  describe('buildEnrolmentStatus', () => {
    it('should build status from empty history', () => {
      const status = buildEnrolmentStatus('emp-123', []);
      
      expect(status.status).toBe('NOT_STARTED');
      expect(status.enrolmentCount).toBe(0);
      expect(status.optOutCount).toBe(0);
    });

    it('should build status from enrolment history', () => {
      const history: EnrolmentHistory[] = [
        {
          employeeId: 'emp-123',
          userId: 'user-1',
          eventType: EnrolmentEventType.AUTO_ENROLLED,
          eventDate: new Date('2025-06-01'),
          createdAt: new Date('2025-06-01'),
        },
      ];
      
      const status = buildEnrolmentStatus('emp-123', history);
      
      expect(status.status).toBe('ENROLLED');
      expect(status.enrolmentCount).toBe(1);
      expect(status.optOutCount).toBe(0);
      expect(status.lastEnrolmentDate).toEqual(new Date('2025-06-01'));
    });

    it('should build status from opt-out history', () => {
      const history: EnrolmentHistory[] = [
        {
          employeeId: 'emp-123',
          userId: 'user-1',
          eventType: EnrolmentEventType.OPTED_OUT,
          eventDate: new Date('2025-07-01'),
          optOutWindowEnd: new Date('2025-12-01'),
          nextReEnrolmentDate: new Date('2028-06-01'),
          createdAt: new Date('2025-07-01'),
        },
        {
          employeeId: 'emp-123',
          userId: 'user-1',
          eventType: EnrolmentEventType.AUTO_ENROLLED,
          eventDate: new Date('2025-06-01'),
          createdAt: new Date('2025-06-01'),
        },
      ];
      
      const status = buildEnrolmentStatus('emp-123', history);
      
      expect(status.status).toBe('OPTED_OUT');
      expect(status.enrolmentCount).toBe(1);
      expect(status.optOutCount).toBe(1);
      expect(status.lastOptOutDate).toEqual(new Date('2025-07-01'));
      expect(status.nextReEnrolmentDate).toEqual(new Date('2028-06-01'));
    });

    it('should count multiple enrolment cycles', () => {
      const history: EnrolmentHistory[] = [
        {
          employeeId: 'emp-123',
          userId: 'user-1',
          eventType: EnrolmentEventType.RE_ENROLLED,
          eventDate: new Date('2028-07-01'),
          createdAt: new Date('2028-07-01'),
        },
        {
          employeeId: 'emp-123',
          userId: 'user-1',
          eventType: EnrolmentEventType.OPTED_OUT,
          eventDate: new Date('2025-07-01'),
          createdAt: new Date('2025-07-01'),
        },
        {
          employeeId: 'emp-123',
          userId: 'user-1',
          eventType: EnrolmentEventType.AUTO_ENROLLED,
          eventDate: new Date('2025-06-01'),
          createdAt: new Date('2025-06-01'),
        },
      ];
      
      const status = buildEnrolmentStatus('emp-123', history);
      
      expect(status.enrolmentCount).toBe(2); // AUTO + RE
      expect(status.optOutCount).toBe(1);
    });
  });

  describe('createEnrolmentRecord', () => {
    it('should create basic enrolment record', () => {
      const record = createEnrolmentRecord(
        'emp-123',
        'user-1',
        EnrolmentEventType.AUTO_ENROLLED,
        new Date('2025-06-01')
      );
      
      expect(record.employeeId).toBe('emp-123');
      expect(record.userId).toBe('user-1');
      expect(record.eventType).toBe(EnrolmentEventType.AUTO_ENROLLED);
      expect(record.eventDate).toEqual(new Date('2025-06-01'));
    });

    it('should create opt-out record with refund', () => {
      const record = createEnrolmentRecord(
        'emp-123',
        'user-1',
        EnrolmentEventType.OPTED_OUT,
        new Date('2025-07-01'),
        {
          refundAmount: 1000,
          optOutWindowEnd: new Date('2025-12-01'),
          nextReEnrolmentDate: new Date('2028-06-01'),
        }
      );
      
      expect(record.refundAmount).toBe(1000);
      expect(record.optOutWindowEnd).toEqual(new Date('2025-12-01'));
      expect(record.nextReEnrolmentDate).toEqual(new Date('2028-06-01'));
    });
  });
});
