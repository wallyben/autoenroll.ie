import PDFDocument from 'pdfkit';
import { ValidationSummary } from '@autoenroll/common';

export function generatePdf(summary: ValidationSummary, organisation: string) {
  const doc = new PDFDocument();
  doc.info.Title = 'AutoEnroll.ie Validation Report';
  doc.fontSize(18).text('AutoEnroll.ie Validation Report');
  doc.moveDown();
  doc.fontSize(12).text(`Organisation: ${organisation}`);
  doc.text(`Eligible: ${summary.eligible ? 'Yes' : 'No'}`);
  doc.text(`Risk Score: ${summary.riskScore}`);
  doc.moveDown();
  doc.fontSize(14).text('Contribution Breakdown');
  doc.fontSize(12).text(`Employee: €${summary.contribution.employee.toFixed(2)}`);
  doc.text(`Employer: €${summary.contribution.employer.toFixed(2)}`);
  doc.text(`State: €${summary.contribution.state.toFixed(2)}`);
  doc.text(`Total: €${summary.contribution.total.toFixed(2)}`);
  doc.moveDown();
  doc.fontSize(14).text('Issues');
  summary.issues.forEach((issue) => {
    doc.fontSize(12).text(`[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}`);
  });
  doc.end();
  return doc;
}
