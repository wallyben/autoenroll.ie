/**
 * Variable Earnings Assessment Tests
 * 
 * P1 Feature: Test earnings projection for employees with <12 months data
 */

import {
  calculateVariableEarnings,
  getConfidenceLevel,
  calculateBatchVariableEarnings,
} from '../variable-earnings';
import {
  EarningsConfidence,
  MonthlyEarnings,
  VariableEarningsInput,
} from '../../types/variable-earnings';

describe('Variable Earnings Assessment', () => {
  // Test data: 12 months of stable earnings
  const stableEarnings: MonthlyEarnings[] = Array.from({ length: 12 }, (_, i) => ({
    month: `2024-${String(i + 1).padStart(2, '0')}`,
    gross: 3000,
  }));

  // Test data: 6 months of increasing earnings
  const increasingEarnings: MonthlyEarnings[] = Array.from({ length: 6 }, (_, i) => ({
    month: `2024-${String(i + 7).padStart(2, '0')}`,
    gross: 2500 + (i * 200), // 2500, 2700, 2900, 3100, 3300, 3500
  }));

  // Test data: 3 months of variable earnings
  const variableEarnings: MonthlyEarnings[] = [
    { month: '2024-10', gross: 2000 },
    { month: '2024-11', gross: 4000 },
    { month: '2024-12', gross: 3000 },
  ];

  // Test data: Seasonal pattern (12 months)
  const seasonalEarnings: MonthlyEarnings[] = [
    { month: '2024-01', gross: 2500 },
    { month: '2024-02', gross: 2500 },
    { month: '2024-03', gross: 2500 },
    { month: '2024-04', gross: 3000 },
    { month: '2024-05', gross: 3500 },
    { month: '2024-06', gross: 4000 }, // Peak season
    { month: '2024-07', gross: 4000 },
    { month: '2024-08', gross: 4000 },
    { month: '2024-09', gross: 3500 },
    { month: '2024-10', gross: 3000 },
    { month: '2024-11', gross: 2500 },
    { month: '2024-12', gross: 2500 }, // Low season
  ];

  describe('calculateVariableEarnings', () => {
    it('should use employer-provided annual salary with HIGH confidence', () => {
      const input: VariableEarningsInput = {
        employeeId: 'EMP001',
        earningsHistory: stableEarnings,
        employmentStartDate: new Date('2024-01-01'),
        annualSalaryIfProvided: 40000,
      };

      const result = calculateVariableEarnings(input);

      expect(result.projectedAnnual).toBe(40000);
      expect(result.confidence).toBe(EarningsConfidence.HIGH);
      expect(result.method).toBe('ACTUAL');
      expect(result.warnings).toContain('Using employer-provided annual salary');
    });

    it('should return INSUFFICIENT confidence for <3 months of data', () => {
      const input: VariableEarningsInput = {
        employeeId: 'EMP002',
        earningsHistory: [
          { month: '2024-11', gross: 3000 },
          { month: '2024-12', gross: 3200 },
        ],
        employmentStartDate: new Date('2024-11-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.confidence).toBe(EarningsConfidence.INSUFFICIENT);
      expect(result.projectedAnnual).toBe(0);
      expect(result.warnings[0]).toContain('Insufficient data');
    });

    it('should project with HIGH confidence for 12+ months', () => {
      const input: VariableEarningsInput = {
        employeeId: 'EMP003',
        earningsHistory: stableEarnings,
        employmentStartDate: new Date('2024-01-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.confidence).toBe(EarningsConfidence.HIGH);
      expect(result.projectedAnnual).toBe(36000); // 3000 * 12
      expect(result.method).toBe('ACTUAL');
      expect(result.monthsOfData).toBe(12);
    });

    it('should project with MEDIUM confidence for 6-11 months', () => {
      const input: VariableEarningsInput = {
        employeeId: 'EMP004',
        earningsHistory: increasingEarnings,
        employmentStartDate: new Date('2024-07-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.confidence).toBe(EarningsConfidence.MEDIUM);
      expect(result.method).toBe('EXTRAPOLATED');
      expect(result.monthsOfData).toBe(6);
      expect(result.warnings.some(w => w.includes('6 months'))).toBe(true);
    });

    it('should project with LOW confidence for 3-5 months', () => {
      const input: VariableEarningsInput = {
        employeeId: 'EMP005',
        earningsHistory: variableEarnings,
        employmentStartDate: new Date('2024-10-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.confidence).toBe(EarningsConfidence.LOW);
      expect(result.monthsOfData).toBe(3);
      expect(result.warnings.some(w => w.includes('Limited data'))).toBe(true);
    });

    it('should detect INCREASING trend', () => {
      const input: VariableEarningsInput = {
        employeeId: 'EMP006',
        earningsHistory: increasingEarnings,
        employmentStartDate: new Date('2024-07-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.trendDirection).toBe('INCREASING');
      // With increasing trend, projection should be adjusted upward
      expect(result.projectedAnnual).toBeGreaterThan(result.avgMonthly * 12);
    });

    it('should detect DECREASING trend', () => {
      const decreasingEarnings: MonthlyEarnings[] = Array.from({ length: 6 }, (_, i) => ({
        month: `2024-${String(i + 7).padStart(2, '0')}`,
        gross: 3500 - (i * 200), // 3500, 3300, 3100, 2900, 2700, 2500
      }));

      const input: VariableEarningsInput = {
        employeeId: 'EMP007',
        earningsHistory: decreasingEarnings,
        employmentStartDate: new Date('2024-07-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.trendDirection).toBe('DECREASING');
      // With decreasing trend, projection should be adjusted downward
      expect(result.projectedAnnual).toBeLessThan(result.avgMonthly * 12);
    });

    it('should detect STABLE trend', () => {
      const input: VariableEarningsInput = {
        employeeId: 'EMP008',
        earningsHistory: stableEarnings,
        employmentStartDate: new Date('2024-01-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.trendDirection).toBe('STABLE');
    });

    it('should detect seasonality with high variance', () => {
      const input: VariableEarningsInput = {
        employeeId: 'EMP009',
        earningsHistory: seasonalEarnings,
        employmentStartDate: new Date('2024-01-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.seasonalityDetected).toBe(true);
      expect(result.variance).toBeGreaterThan(0.2); // >20% variance
      expect(result.warnings.some(w => w.includes('variance'))).toBe(true);
    });

    it('should calculate correct statistics', () => {
      const input: VariableEarningsInput = {
        employeeId: 'EMP010',
        earningsHistory: variableEarnings, // [2000, 4000, 3000]
        employmentStartDate: new Date('2024-10-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.avgMonthly).toBe(3000);
      expect(result.minMonthly).toBe(2000);
      expect(result.maxMonthly).toBe(4000);
    });

    it('should remove outliers', () => {
      const earningsWithOutlier: MonthlyEarnings[] = [
        { month: '2024-01', gross: 3000 },
        { month: '2024-02', gross: 3100 },
        { month: '2024-03', gross: 2900 },
        { month: '2024-04', gross: 15000 }, // Outlier (one-time bonus)
        { month: '2024-05', gross: 3000 },
        { month: '2024-06', gross: 3100 },
      ];

      const input: VariableEarningsInput = {
        employeeId: 'EMP011',
        earningsHistory: earningsWithOutlier,
        employmentStartDate: new Date('2024-01-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.warnings.some(w => w.includes('outlier'))).toBe(true);
      // Outlier should be removed, so dataPoints < original
      expect(result.dataPoints.length).toBeLessThan(earningsWithOutlier.length);
      // Average should be close to 3000, not skewed by 15000
      expect(result.avgMonthly).toBeCloseTo(3000, -2);
    });

    it('should use AVERAGE_BASED method for seasonal data <12 months', () => {
      const partialSeasonalEarnings = seasonalEarnings.slice(0, 8); // 8 months

      const input: VariableEarningsInput = {
        employeeId: 'EMP012',
        earningsHistory: partialSeasonalEarnings,
        employmentStartDate: new Date('2024-01-01'),
      };

      const result = calculateVariableEarnings(input);

      expect(result.seasonalityDetected).toBe(true);
      expect(result.method).toBe('AVERAGE_BASED');
      // Should use average * 12 to avoid overweighting high/low season
      expect(result.projectedAnnual).toBe(Math.round(result.avgMonthly * 12));
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return INSUFFICIENT for <3 months', () => {
      expect(getConfidenceLevel(2)).toBe(EarningsConfidence.INSUFFICIENT);
    });

    it('should return LOW for 3-5 months', () => {
      expect(getConfidenceLevel(3)).toBe(EarningsConfidence.LOW);
      expect(getConfidenceLevel(5)).toBe(EarningsConfidence.LOW);
    });

    it('should return MEDIUM for 6-11 months', () => {
      expect(getConfidenceLevel(6)).toBe(EarningsConfidence.MEDIUM);
      expect(getConfidenceLevel(11)).toBe(EarningsConfidence.MEDIUM);
    });

    it('should return HIGH for 12+ months', () => {
      expect(getConfidenceLevel(12)).toBe(EarningsConfidence.HIGH);
      expect(getConfidenceLevel(24)).toBe(EarningsConfidence.HIGH);
    });
  });

  describe('calculateBatchVariableEarnings', () => {
    it('should process multiple employees in batch', () => {
      const inputs: VariableEarningsInput[] = [
        {
          employeeId: 'EMP001',
          earningsHistory: stableEarnings,
          employmentStartDate: new Date('2024-01-01'),
        },
        {
          employeeId: 'EMP002',
          earningsHistory: increasingEarnings,
          employmentStartDate: new Date('2024-07-01'),
        },
        {
          employeeId: 'EMP003',
          earningsHistory: variableEarnings,
          employmentStartDate: new Date('2024-10-01'),
        },
      ];

      const results = calculateBatchVariableEarnings(inputs);

      expect(results.size).toBe(3);
      expect(results.get('EMP001')?.confidence).toBe(EarningsConfidence.HIGH);
      expect(results.get('EMP002')?.confidence).toBe(EarningsConfidence.MEDIUM);
      expect(results.get('EMP003')?.confidence).toBe(EarningsConfidence.LOW);
    });

    it('should return empty map for empty input', () => {
      const results = calculateBatchVariableEarnings([]);
      expect(results.size).toBe(0);
    });
  });
});
