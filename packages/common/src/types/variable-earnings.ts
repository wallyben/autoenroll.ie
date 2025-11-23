/**
 * Variable Earnings Assessment Types
 * 
 * P1 Feature: Project earnings for employees with <12 months history
 * Use case: Accurate eligibility assessment for mid-year hires or variable-pay employees
 */

/**
 * Confidence level for earnings projection based on data availability
 */
export enum EarningsConfidence {
  HIGH = 'HIGH',       // 12+ months of data
  MEDIUM = 'MEDIUM',   // 6-11 months of data
  LOW = 'LOW',         // <6 months of data
  INSUFFICIENT = 'INSUFFICIENT' // <3 months (cannot project)
}

/**
 * Monthly earnings record for projection calculation
 */
export interface MonthlyEarnings {
  month: string; // YYYY-MM format
  gross: number;
  hours?: number; // For hourly workers
  overtime?: number;
  bonus?: number;
  commission?: number;
}

/**
 * Result of variable earnings assessment
 */
export interface VariableEarningsResult {
  projectedAnnual: number;
  confidence: EarningsConfidence;
  monthsOfData: number;
  dataPoints: MonthlyEarnings[];
  method: 'ACTUAL' | 'EXTRAPOLATED' | 'AVERAGE_BASED';
  variance: number; // Coefficient of variation (std dev / mean)
  minMonthly: number;
  maxMonthly: number;
  avgMonthly: number;
  trendDirection: 'INCREASING' | 'DECREASING' | 'STABLE';
  seasonalityDetected: boolean;
  warnings: string[];
}

/**
 * Input for variable earnings calculation
 */
export interface VariableEarningsInput {
  employeeId: string;
  employeeName?: string;
  earningsHistory: MonthlyEarnings[];
  employmentStartDate: Date;
  assessmentDate?: Date; // Default to today
  annualSalaryIfProvided?: number; // Override projection if employer provides annual salary
}

/**
 * Configuration for variable earnings calculation
 */
export interface VariableEarningsConfig {
  minimumMonthsForProjection: number; // Default 3
  highConfidenceMonths: number; // Default 12
  mediumConfidenceMonths: number; // Default 6
  seasonalityThreshold: number; // Default 0.3 (30% variance)
  outlierStdDevThreshold: number; // Default 2.5 (exclude outliers)
}

/**
 * Default configuration for variable earnings
 */
export const DEFAULT_VARIABLE_EARNINGS_CONFIG: VariableEarningsConfig = {
  minimumMonthsForProjection: 3,
  highConfidenceMonths: 12,
  mediumConfidenceMonths: 6,
  seasonalityThreshold: 0.3,
  outlierStdDevThreshold: 2.5,
};
