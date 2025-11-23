import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as UploadModel from '../models/upload.model';
import * as StagingDateModel from '../models/staging-dates.model';
import * as EnrolmentHistoryModel from '../models/enrolment-history.model';
import * as EligibilityService from '../services/eligibility.service';
import * as ContributionService from '../services/contribution.service';
import * as RiskService from '../services/risk.service';
import * as PdfService from '../services/pdf.service';
import { logger } from '../utils/logger';

export async function getValidationResults(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { uploadId } = req.params;

    const upload = await UploadModel.findUploadById(uploadId);

    if (!upload || upload.userId !== req.user!.userId) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Upload not found', timestamp: new Date().toISOString() },
      });
      return;
    }

    if (!upload.validationResult) {
      res.status(400).json({
        success: false,
        error: { code: 'NOT_PROCESSED', message: 'Upload not yet processed', timestamp: new Date().toISOString() },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: upload.validationResult,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get validation results error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function calculateEligibility(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { uploadId } = req.params;

    const upload = await UploadModel.findUploadById(uploadId);

    if (!upload || upload.userId !== req.user!.userId) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Upload not found', timestamp: new Date().toISOString() },
      });
      return;
    }

    const employees = upload.validationResult?.employees || [];
    const eligibility = await EligibilityService.determineEligibility(employees, req.user!.userId);

    res.status(200).json({
      success: true,
      data: eligibility,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Calculate eligibility error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function calculateContributions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { uploadId } = req.params;
    const { year } = req.query;

    const upload = await UploadModel.findUploadById(uploadId);

    if (!upload || upload.userId !== req.user!.userId) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Upload not found', timestamp: new Date().toISOString() },
      });
      return;
    }

    const employees = upload.validationResult?.employees || [];
    const contributions = await ContributionService.calculateEmployeeContributions(
      employees,
      year ? parseInt(year as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: contributions,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Calculate contributions error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function getRiskAssessment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { uploadId } = req.params;

    const upload = await UploadModel.findUploadById(uploadId);

    if (!upload || upload.userId !== req.user!.userId) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Upload not found', timestamp: new Date().toISOString() },
      });
      return;
    }

    const employees = upload.validationResult?.employees || [];
    const validationResult = upload.validationResult;
    const assessment = await RiskService.calculateRiskScore(employees, validationResult);

    res.status(200).json({
      success: true,
      data: assessment,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get risk assessment error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function getInstantPreview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { uploadId } = req.params;

    const upload = await UploadModel.findUploadById(uploadId);

    if (!upload || upload.userId !== req.user!.userId) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Upload not found', timestamp: new Date().toISOString() },
      });
      return;
    }

    if (!upload.validationResult) {
      res.status(400).json({
        success: false,
        error: { code: 'NOT_PROCESSED', message: 'Upload not yet processed', timestamp: new Date().toISOString() },
      });
      return;
    }

    const employees = upload.validationResult?.employees || [];
    const summary = upload.validationResult?.summary;

    // Calculate eligibility for preview
    const eligibility = await EligibilityService.determineEligibility(employees, req.user!.userId);
    const eligibleCount = eligibility.results.filter(r => r.isEligible).length;

    // Generate anonymised samples (3 random employees)
    const sampleIndexes = new Set<number>();
    while (sampleIndexes.size < Math.min(3, employees.length)) {
      sampleIndexes.add(Math.floor(Math.random() * employees.length));
    }

    const sampleEmployees = Array.from(sampleIndexes).map((index) => {
      const employee = employees[index];
      const eligibilityResult = eligibility.results[index];
      
      // Calculate age
      const age = employee.dateOfBirth 
        ? Math.floor((Date.now() - new Date(employee.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      // Determine salary band (anonymised)
      const salary = employee.annualSalary;
      let salaryBand = 'Unknown';
      if (salary < 20000) salaryBand = 'Under €20k';
      else if (salary < 30000) salaryBand = '€20k-€30k';
      else if (salary < 40000) salaryBand = '€30k-€40k';
      else if (salary < 50000) salaryBand = '€40k-€50k';
      else if (salary < 60000) salaryBand = '€50k-€60k';
      else if (salary < 80000) salaryBand = '€60k-€80k';
      else salaryBand = 'Over €80k';

      return {
        index: index + 1,
        age,
        salaryBand,
        isEligible: eligibilityResult?.isEligible || false,
        reason: !eligibilityResult?.isEligible 
          ? eligibilityResult?.reasons[0] || 'Not eligible'
          : undefined,
      };
    });

    // Group errors and warnings by message
    const issueMap = new Map<string, { type: 'error' | 'warning', count: number }>();
    
    (upload.validationResult.errors || []).forEach((error: any) => {
      const key = error.message;
      const existing = issueMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        issueMap.set(key, { type: 'error', count: 1 });
      }
    });

    (upload.validationResult.warnings || []).forEach((warning: any) => {
      const key = warning.message;
      const existing = issueMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        issueMap.set(key, { type: 'warning', count: 1 });
      }
    });

    const topIssues = Array.from(issueMap.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          ...summary,
          eligibleCount,
        },
        sampleEmployees,
        topIssues,
      },
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Get instant preview error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}

export async function generateReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { uploadId } = req.params;

    const upload = await UploadModel.findUploadById(uploadId);

    if (!upload || upload.userId !== req.user!.userId) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Upload not found', timestamp: new Date().toISOString() },
      });
      return;
    }

    const employees = upload.validationResult?.employees || [];
    const eligibility = await EligibilityService.determineEligibility(employees, req.user!.userId);
    const contributions = await ContributionService.calculateEmployeeContributions(employees);
    const riskAssessment = await RiskService.calculateRiskScore(employees, upload.validationResult);

    // P0 Feature: Fetch staging config and re-enrolment data
    const stagingConfig = await StagingDateModel.getStagingConfig(req.user!.userId);
    
    // Get opted-out employees and calculate re-enrolment summary
    let reEnrolmentSummary;
    try {
      const dueForReEnrolment = await EnrolmentHistoryModel.getEmployeesDueForReEnrolment(
        req.user!.userId,
        new Date()
      );
      
      // Get all opted-out employees
      const optedOutCount = employees.filter((emp: any) => {
        // This is a simplified check - in production, query enrolment_history table
        return false; // Placeholder
      }).length;
      
      reEnrolmentSummary = {
        dueForReEnrolment: dueForReEnrolment.length,
        optedOutEmployees: optedOutCount,
        nextReEnrolmentDates: dueForReEnrolment.map(e => ({
          employeeId: e.employeeId,
          date: e.nextReEnrolmentDate!,
        })),
      };
    } catch (error) {
      logger.warn('Could not fetch re-enrolment data', { error });
      reEnrolmentSummary = undefined;
    }

    const pdfBuffer = await PdfService.generateComplianceReport({
      companyName: 'Company Name',
      employees,
      contributions,
      eligibility,
      riskAssessment,
      validationSummary: upload.validationResult?.summary || {},
      stagingConfig: stagingConfig || undefined,
      reEnrolmentSummary,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="compliance-report-${uploadId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    logger.error('Generate report error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message, timestamp: new Date().toISOString() },
    });
  }
}
