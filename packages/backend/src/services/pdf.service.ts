import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Employee, formatCurrency, formatDate } from '@autoenroll/common';
import { logger } from '../utils/logger';

export interface ReportData {
  companyName: string;
  employees: Employee[];
  contributions: {
    contributions: any[];
    summary: any;
    year: number;
  };
  eligibility: any;
  riskAssessment: any;
  validationSummary: any;
  // P0 Feature: Staging dates and re-enrolment data
  stagingConfig?: {
    frequency: string;
    dates: number[];
    effectiveFrom: Date;
  };
  reEnrolmentSummary?: {
    dueForReEnrolment: number;
    optedOutEmployees: number;
    nextReEnrolmentDates: Array<{ employeeId: string; date: Date }>;
  };
}

export async function generateComplianceReport(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Auto-Enrolment Compliance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Company: ${data.companyName}`, { align: 'left' });
      doc.text(`Generated: ${formatDate(new Date(), 'long')}`, { align: 'left' });
      doc.moveDown(2);

      doc.fontSize(16).text('Executive Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      doc.text(`Total Employees: ${data.employees.length}`);
      doc.text(`Eligible for Auto-Enrolment: ${data.eligibility.summary.eligibleCount}`);
      doc.text(`Eligibility Rate: ${data.eligibility.summary.eligibilityRate.toFixed(1)}%`);
      doc.text(`Overall Risk Level: ${data.riskAssessment.riskLevel}`);
      
      // P0 Feature: Re-enrolment tracking summary
      if (data.reEnrolmentSummary) {
        doc.moveDown();
        doc.text(`Opted-Out Employees: ${data.reEnrolmentSummary.optedOutEmployees}`);
        doc.text(`Due for Re-Enrolment: ${data.reEnrolmentSummary.dueForReEnrolment}`);
      }
      
      doc.moveDown(2);

      doc.fontSize(16).text('Data Quality', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      doc.text(`Rows Processed: ${data.validationSummary.rowsProcessed}`);
      doc.text(`Valid Rows: ${data.validationSummary.rowsValid}`);
      doc.text(`Invalid Rows: ${data.validationSummary.rowsInvalid}`);
      doc.text(`Errors: ${data.validationSummary.errorCount}`);
      doc.text(`Warnings: ${data.validationSummary.warningCount}`);
      doc.moveDown(2);

      doc.addPage();
      doc.fontSize(16).text('Contribution Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      
      // Type guard for contributions
      if (Array.isArray(data.contributions)) {
        doc.text('Contribution data processing...');
      } else {
        doc.text(`Total Employee Contributions: ${formatCurrency(data.contributions.summary.totalEmployeeContributions)}`);
        doc.text(`Total Employer Contributions: ${formatCurrency(data.contributions.summary.totalEmployerContributions)}`);
        doc.text(`Total Annual Contributions: ${formatCurrency(data.contributions.summary.totalContributions)}`);
        doc.text(`Average Employee Contribution: ${formatCurrency(data.contributions.summary.averageEmployeeContribution)}`);
        doc.text(`Average Employer Contribution: ${formatCurrency(data.contributions.summary.averageEmployerContribution)}`);
      }
      doc.moveDown(2);

      doc.fontSize(16).text('Risk Factors', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      
      data.riskAssessment.factors.forEach((factor: any) => {
        doc.text(`${factor.category} (${factor.severity}):`, { continued: false });
        doc.text(`  ${factor.description}`, { indent: 20 });
        doc.text(`  Score: ${factor.score}/100`, { indent: 20 });
        doc.moveDown();
      });

      if (data.riskAssessment.recommendations.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Recommendations', { underline: true });
        doc.moveDown();
        doc.fontSize(10);
        
        data.riskAssessment.recommendations.forEach((rec: string, index: number) => {
          doc.text(`${index + 1}. ${rec}`);
          doc.moveDown(0.5);
        });
      }

      // P0 Feature: Staging dates calendar
      if (data.stagingConfig) {
        doc.addPage();
        doc.fontSize(16).text('Auto-Enrolment Staging Dates', { underline: true });
        doc.moveDown();
        doc.fontSize(10);
        
        doc.text(`Frequency: ${data.stagingConfig.frequency.toUpperCase()}`);
        doc.text(`Effective From: ${formatDate(data.stagingConfig.effectiveFrom)}`);
        doc.moveDown();
        
        doc.text('Staging Dates for Current Year:');
        doc.moveDown(0.5);
        
        const currentYear = new Date().getFullYear();
        const stagingDates = data.stagingConfig.dates
          .map(dayOfYear => {
            const date = new Date(currentYear, 0, dayOfYear);
            return formatDate(date);
          })
          .slice(0, 12); // Limit to 12 dates for display
        
        stagingDates.forEach((date, index) => {
          doc.text(`  ${index + 1}. ${date}`, { indent: 20 });
        });
        
        doc.moveDown();
        doc.fontSize(8).text(
          'Note: Employees become eligible on staging dates after completing their waiting period.'
        );
      }

      // P0 Feature: Re-enrolment timeline
      if (data.reEnrolmentSummary && data.reEnrolmentSummary.nextReEnrolmentDates.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Re-Enrolment Timeline', { underline: true });
        doc.moveDown();
        doc.fontSize(10);
        
        doc.text(
          `The following ${data.reEnrolmentSummary.nextReEnrolmentDates.length} employees are scheduled for re-enrolment:`,
        );
        doc.moveDown();
        
        // Group by year
        const byYear = data.reEnrolmentSummary.nextReEnrolmentDates.reduce((acc, item) => {
          const year = new Date(item.date).getFullYear();
          if (!acc[year]) acc[year] = [];
          acc[year].push(item);
          return acc;
        }, {} as Record<number, typeof data.reEnrolmentSummary.nextReEnrolmentDates>);
        
        Object.keys(byYear).sort().forEach(year => {
          doc.fontSize(12).text(`${year}:`, { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10);
          
          byYear[parseInt(year)].forEach(item => {
            doc.text(`  • Employee ${item.employeeId}: ${formatDate(item.date)}`, { indent: 20 });
          });
          
          doc.moveDown();
        });
        
        doc.fontSize(8).text(
          'Note: Re-enrolment occurs 3 years after opt-out date, aligned with next staging date.'
        );
      }

      doc.moveDown(2);
      doc.fontSize(8).text('This report was generated by AutoEnroll.ie', { align: 'center' });
      doc.text('For support, contact support@autoenroll.ie', { align: 'center' });

      doc.end();

      logger.info('PDF report generated successfully');
    } catch (error) {
      logger.error('PDF generation error', { error });
      reject(error);
    }
  });
}

export async function generateEmployeeReport(
  employee: Employee,
  contributions: any,
  eligibility: any,
  enrolmentHistory?: Array<{
    eventType: string;
    eventDate: Date;
    optOutWindowEnd?: Date;
    nextReEnrolmentDate?: Date;
  }>
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('Employee Auto-Enrolment Report', { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(14).text('Employee Information', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      doc.text(`Employee ID: ${employee.employeeId}`);
      doc.text(`Name: ${employee.firstName} ${employee.lastName}`);
      doc.text(`Employment Start Date: ${formatDate(employee.employmentStartDate)}`);
      doc.text(`Annual Salary: ${formatCurrency(employee.annualSalary)}`);
      doc.moveDown(2);

      doc.fontSize(14).text('Eligibility Status', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      doc.text(`Eligible: ${eligibility.isEligible ? 'Yes' : 'No'}`);
      if (eligibility.eligibilityDate) {
        doc.text(`Eligibility Date: ${formatDate(eligibility.eligibilityDate)}`);
      }
      if (eligibility.autoEnrolmentDate) {
        doc.text(`Auto-Enrolment Date: ${formatDate(eligibility.autoEnrolmentDate)}`);
      }
      
      // P0 Feature: Opt-out window information
      if (eligibility.isEligible && eligibility.autoEnrolmentDate) {
        const optOutDeadline = new Date(eligibility.autoEnrolmentDate);
        optOutDeadline.setMonth(optOutDeadline.getMonth() + 6);
        doc.text(`Opt-Out Window Closes: ${formatDate(optOutDeadline)}`);
        doc.fontSize(8).text(
          '  (Employees can opt-out within 6 months of auto-enrolment)',
          { indent: 20 }
        );
        doc.fontSize(10);
      }
      
      doc.moveDown();
      doc.text('Reasons:');
      eligibility.reasons.forEach((reason: string) => {
        doc.text(`  • ${reason}`, { indent: 20 });
      });
      doc.moveDown(2);

      if (eligibility.isEligible) {
        doc.fontSize(14).text('Pension Contributions', { underline: true });
        doc.moveDown();
        doc.fontSize(10);
        doc.text(`Pensionable Earnings: ${formatCurrency(contributions.pensionableEarnings)}`);
        doc.text(`Employee Contribution (${contributions.employeeRate}%): ${formatCurrency(contributions.employeeContribution)}`);
        doc.text(`Employer Contribution (${contributions.employerRate}%): ${formatCurrency(contributions.employerContribution)}`);
        doc.text(`Total Annual Contribution: ${formatCurrency(contributions.totalContribution)}`);
      }

      // P0 Feature: Enrolment history timeline
      if (enrolmentHistory && enrolmentHistory.length > 0) {
        doc.addPage();
        doc.fontSize(14).text('Enrolment History', { underline: true });
        doc.moveDown();
        doc.fontSize(10);
        
        enrolmentHistory.forEach((event, index) => {
          doc.text(`${index + 1}. ${event.eventType.replace(/_/g, ' ')}`);
          doc.text(`   Date: ${formatDate(event.eventDate)}`, { indent: 20 });
          
          if (event.optOutWindowEnd) {
            doc.text(`   Opt-Out Window Closed: ${formatDate(event.optOutWindowEnd)}`, { indent: 20 });
          }
          
          if (event.nextReEnrolmentDate) {
            doc.text(`   Next Re-Enrolment: ${formatDate(event.nextReEnrolmentDate)}`, { indent: 20 });
            doc.fontSize(8).text(
              '   (3-year cycle from opt-out date)',
              { indent: 20 }
            );
            doc.fontSize(10);
          }
          
          doc.moveDown();
        });
      }

      doc.end();

      logger.info('Employee PDF report generated', { employeeId: employee.employeeId });
    } catch (error) {
      logger.error('Employee PDF generation error', { error });
      reject(error);
    }
  });
}
