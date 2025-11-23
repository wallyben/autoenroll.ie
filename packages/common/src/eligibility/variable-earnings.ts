/**
 * Variable Earnings Assessment
 * 
 * P1 Feature: Project annual earnings for employees with <12 months of data
 * 
 * Use cases:
 * - Mid-year hires (new employees)
 * - Variable pay workers (commission, overtime, hourly)
 * - Seasonal employees
 * - Contract workers with irregular hours
 * 
 * Methodology:
 * 1. Collect available monthly earnings data
 * 2. Clean data (remove outliers, handle gaps)
 * 3. Detect seasonality and trends
 * 4. Project annual earnings based on available months
 * 5. Assign confidence level based on data quantity and quality
 */

import {
  VariableEarningsInput,
  VariableEarningsResult,
  VariableEarningsConfig,
  MonthlyEarnings,
  EarningsConfidence,
  DEFAULT_VARIABLE_EARNINGS_CONFIG,
} from '../types/variable-earnings';

/**
 * Calculate variable earnings projection for an employee
 * 
 * @param input - Employee earnings input data
 * @param config - Optional configuration overrides
 * @returns Projected annual earnings with confidence metrics
 */
export function calculateVariableEarnings(
  input: VariableEarningsInput,
  config: VariableEarningsConfig = DEFAULT_VARIABLE_EARNINGS_CONFIG
): VariableEarningsResult {
  const { earningsHistory, annualSalaryIfProvided, employmentStartDate, assessmentDate = new Date() } = input;

  // If employer provided annual salary, use it with HIGH confidence
  if (annualSalaryIfProvided !== undefined && annualSalaryIfProvided > 0) {
    const avgMonthly = annualSalaryIfProvided / 12;
    return {
      projectedAnnual: annualSalaryIfProvided,
      confidence: EarningsConfidence.HIGH,
      monthsOfData: earningsHistory.length,
      dataPoints: earningsHistory,
      method: 'ACTUAL',
      variance: 0,
      minMonthly: avgMonthly,
      maxMonthly: avgMonthly,
      avgMonthly,
      trendDirection: 'STABLE',
      seasonalityDetected: false,
      warnings: ['Using employer-provided annual salary'],
    };
  }

  // Validate minimum data requirement
  if (earningsHistory.length < config.minimumMonthsForProjection) {
    const avgMonthly = earningsHistory.length > 0
      ? earningsHistory.reduce((sum, e) => sum + e.gross, 0) / earningsHistory.length
      : 0;
    
    return {
      projectedAnnual: 0,
      confidence: EarningsConfidence.INSUFFICIENT,
      monthsOfData: earningsHistory.length,
      dataPoints: earningsHistory,
      method: 'EXTRAPOLATED',
      variance: 0,
      minMonthly: 0,
      maxMonthly: 0,
      avgMonthly,
      trendDirection: 'STABLE',
      seasonalityDetected: false,
      warnings: [`Insufficient data: need at least ${config.minimumMonthsForProjection} months, have ${earningsHistory.length}`],
    };
  }

  // Sort earnings by month
  const sortedEarnings = [...earningsHistory].sort((a, b) => a.month.localeCompare(b.month));

  // Remove outliers (values beyond threshold std deviations from mean)
  const cleanedEarnings = removeOutliers(sortedEarnings, config.outlierStdDevThreshold);
  const warnings: string[] = [];
  
  if (cleanedEarnings.length < sortedEarnings.length) {
    warnings.push(`Removed ${sortedEarnings.length - cleanedEarnings.length} outlier data points`);
  }

  // Calculate statistics
  const grossValues = cleanedEarnings.map(e => e.gross);
  const avgMonthly = grossValues.reduce((sum, val) => sum + val, 0) / grossValues.length;
  const minMonthly = Math.min(...grossValues);
  const maxMonthly = Math.max(...grossValues);
  const stdDev = calculateStdDev(grossValues, avgMonthly);
  const variance = avgMonthly > 0 ? stdDev / avgMonthly : 0; // Coefficient of variation

  // Detect seasonality
  const seasonalityDetected = variance > config.seasonalityThreshold;
  if (seasonalityDetected) {
    warnings.push(`High variance detected (${(variance * 100).toFixed(1)}%) - possible seasonal pattern`);
  }

  // Detect trend
  const trendDirection = detectTrend(cleanedEarnings);

  // Determine confidence level
  const monthsOfData = cleanedEarnings.length;
  let confidence: EarningsConfidence;
  
  if (monthsOfData >= config.highConfidenceMonths) {
    confidence = EarningsConfidence.HIGH;
  } else if (monthsOfData >= config.mediumConfidenceMonths) {
    confidence = EarningsConfidence.MEDIUM;
    warnings.push(`Only ${monthsOfData} months of data available - projection may not reflect annual patterns`);
  } else {
    confidence = EarningsConfidence.LOW;
    warnings.push(`Limited data (${monthsOfData} months) - projection has low confidence`);
  }

  // Project annual earnings
  const { projectedAnnual, method } = projectAnnualEarnings(
    cleanedEarnings,
    avgMonthly,
    trendDirection,
    seasonalityDetected
  );

  return {
    projectedAnnual,
    confidence,
    monthsOfData,
    dataPoints: cleanedEarnings,
    method,
    variance,
    minMonthly,
    maxMonthly,
    avgMonthly,
    trendDirection,
    seasonalityDetected,
    warnings,
  };
}

/**
 * Project annual earnings based on available monthly data
 */
function projectAnnualEarnings(
  earnings: MonthlyEarnings[],
  avgMonthly: number,
  trendDirection: 'INCREASING' | 'DECREASING' | 'STABLE',
  seasonalityDetected: boolean
): { projectedAnnual: number; method: 'ACTUAL' | 'EXTRAPOLATED' | 'AVERAGE_BASED' } {
  const monthsOfData = earnings.length;

  // If we have 12+ months, use actual total
  if (monthsOfData >= 12) {
    const last12Months = earnings.slice(-12);
    const actual = last12Months.reduce((sum, e) => sum + e.gross, 0);
    return { projectedAnnual: Math.round(actual), method: 'ACTUAL' };
  }

  // If seasonality detected, be conservative with extrapolation
  if (seasonalityDetected && monthsOfData < 12) {
    // Use simple average * 12 to avoid overweighting high/low periods
    return { projectedAnnual: Math.round(avgMonthly * 12), method: 'AVERAGE_BASED' };
  }

  // Apply trend adjustment for extrapolation
  let trendMultiplier = 1.0;
  if (trendDirection === 'INCREASING') {
    // Conservative 5% increase projection
    trendMultiplier = 1.05;
  } else if (trendDirection === 'DECREASING') {
    // Conservative 5% decrease projection
    trendMultiplier = 0.95;
  }

  const projected = avgMonthly * 12 * trendMultiplier;
  return { projectedAnnual: Math.round(projected), method: 'EXTRAPOLATED' };
}

/**
 * Detect earnings trend direction
 */
function detectTrend(earnings: MonthlyEarnings[]): 'INCREASING' | 'DECREASING' | 'STABLE' {
  if (earnings.length < 3) {
    return 'STABLE';
  }

  // Compare first third vs last third
  const thirdSize = Math.floor(earnings.length / 3);
  const firstThird = earnings.slice(0, thirdSize);
  const lastThird = earnings.slice(-thirdSize);

  const firstAvg = firstThird.reduce((sum, e) => sum + e.gross, 0) / firstThird.length;
  const lastAvg = lastThird.reduce((sum, e) => sum + e.gross, 0) / lastThird.length;

  const changePercent = (lastAvg - firstAvg) / firstAvg;

  // Threshold: 10% change to consider it a trend
  if (changePercent > 0.1) {
    return 'INCREASING';
  } else if (changePercent < -0.1) {
    return 'DECREASING';
  } else {
    return 'STABLE';
  }
}

/**
 * Remove outliers using standard deviation threshold
 */
function removeOutliers(earnings: MonthlyEarnings[], stdDevThreshold: number): MonthlyEarnings[] {
  if (earnings.length < 4) {
    return earnings; // Too few data points to identify outliers
  }

  const grossValues = earnings.map(e => e.gross);
  const mean = grossValues.reduce((sum, val) => sum + val, 0) / grossValues.length;
  const stdDev = calculateStdDev(grossValues, mean);

  // Keep values within threshold standard deviations of mean
  return earnings.filter(e => {
    const zScore = Math.abs((e.gross - mean) / stdDev);
    return zScore <= stdDevThreshold;
  });
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Get confidence level enum based on months of data
 */
export function getConfidenceLevel(
  monthsOfData: number,
  config: VariableEarningsConfig = DEFAULT_VARIABLE_EARNINGS_CONFIG
): EarningsConfidence {
  if (monthsOfData < config.minimumMonthsForProjection) {
    return EarningsConfidence.INSUFFICIENT;
  } else if (monthsOfData >= config.highConfidenceMonths) {
    return EarningsConfidence.HIGH;
  } else if (monthsOfData >= config.mediumConfidenceMonths) {
    return EarningsConfidence.MEDIUM;
  } else {
    return EarningsConfidence.LOW;
  }
}

/**
 * Batch calculate variable earnings for multiple employees
 */
export function calculateBatchVariableEarnings(
  inputs: VariableEarningsInput[],
  config: VariableEarningsConfig = DEFAULT_VARIABLE_EARNINGS_CONFIG
): Map<string, VariableEarningsResult> {
  const results = new Map<string, VariableEarningsResult>();
  
  for (const input of inputs) {
    const result = calculateVariableEarnings(input, config);
    results.set(input.employeeId, result);
  }
  
  return results;
}
