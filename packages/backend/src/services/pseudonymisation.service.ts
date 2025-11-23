import { pseudonymiseEmployee, anonymiseForReporting } from '@autoenroll/common';
import { logger } from '../utils/logger';

export async function pseudonymiseEmployeeData(employee: any) {
  const pseudonymised = pseudonymiseEmployee(employee);
  logger.debug('Employee data pseudonymised');
  return pseudonymised;
}

export async function pseudonymiseBatch(employees: any[]) {
  const pseudonymised = employees.map(emp => pseudonymiseEmployee(emp));
  logger.info('Batch pseudonymisation completed', { count: employees.length });
  return pseudonymised;
}

export async function prepareForReporting(employees: any[]) {
  const anonymised = anonymiseForReporting(employees);
  logger.info('Data anonymised for reporting', { count: employees.length });
  return anonymised;
}

export async function deletePersonalData(userId: string) {
  logger.info('Personal data deletion requested', { userId });
  return {
    deleted: true,
    timestamp: new Date().toISOString(),
  };
}
