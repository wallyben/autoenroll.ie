import { query } from '../utils/database';
import {
  EnrolmentHistory,
  EnrolmentEventType,
  EnrolmentStatus,
  buildEnrolmentStatus,
} from '@autoenroll/common';

/**
 * Create an enrolment history record
 */
export async function createEnrolmentHistory(
  employeeId: string,
  userId: string,
  eventType: EnrolmentEventType,
  eventDate: Date,
  data?: {
    contributionPhase?: number;
    contributionRate?: number;
    optOutWindowEnd?: Date;
    nextReEnrolmentDate?: Date;
    refundAmount?: number;
    notes?: string;
  }
): Promise<EnrolmentHistory> {
  const result = await query(
    `INSERT INTO enrolment_history 
     (employee_id, user_id, event_type, event_date, contribution_phase, contribution_rate, 
      opt_out_window_end, next_re_enrolment_date, refund_amount, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     RETURNING id, employee_id as "employeeId", user_id as "userId", event_type as "eventType",
               event_date as "eventDate", contribution_phase as "contributionPhase", 
               contribution_rate as "contributionRate", opt_out_window_end as "optOutWindowEnd",
               next_re_enrolment_date as "nextReEnrolmentDate", refund_amount as "refundAmount",
               notes, created_at as "createdAt"`,
    [
      employeeId,
      userId,
      eventType,
      eventDate,
      data?.contributionPhase || null,
      data?.contributionRate || null,
      data?.optOutWindowEnd || null,
      data?.nextReEnrolmentDate || null,
      data?.refundAmount || null,
      data?.notes || null,
    ]
  );

  return result.rows[0];
}

/**
 * Get enrolment history for an employee
 */
export async function getEnrolmentHistory(
  employeeId: string,
  userId: string
): Promise<EnrolmentHistory[]> {
  const result = await query(
    `SELECT id, employee_id as "employeeId", user_id as "userId", event_type as "eventType",
            event_date as "eventDate", contribution_phase as "contributionPhase", 
            contribution_rate as "contributionRate", opt_out_window_end as "optOutWindowEnd",
            next_re_enrolment_date as "nextReEnrolmentDate", refund_amount as "refundAmount",
            notes, created_at as "createdAt"
     FROM enrolment_history
     WHERE employee_id = $1 AND user_id = $2
     ORDER BY event_date DESC`,
    [employeeId, userId]
  );

  return result.rows;
}

/**
 * Get enrolment status for an employee
 */
export async function getEnrolmentStatus(
  employeeId: string,
  userId: string
): Promise<EnrolmentStatus> {
  const history = await getEnrolmentHistory(employeeId, userId);
  return buildEnrolmentStatus(employeeId, history);
}

/**
 * Get all enrolment histories for a user
 */
export async function getUserEnrolmentHistories(userId: string): Promise<EnrolmentHistory[]> {
  const result = await query(
    `SELECT id, employee_id as "employeeId", user_id as "userId", event_type as "eventType",
            event_date as "eventDate", contribution_phase as "contributionPhase", 
            contribution_rate as "contributionRate", opt_out_window_end as "optOutWindowEnd",
            next_re_enrolment_date as "nextReEnrolmentDate", refund_amount as "refundAmount",
            notes, created_at as "createdAt"
     FROM enrolment_history
     WHERE user_id = $1
     ORDER BY event_date DESC`,
    [userId]
  );

  return result.rows;
}

/**
 * Get employees opted out and due for re-enrolment
 */
export async function getEmployeesDueForReEnrolment(
  userId: string,
  beforeDate: Date = new Date()
): Promise<EnrolmentHistory[]> {
  const result = await query(
    `SELECT id, employee_id as "employeeId", user_id as "userId", event_type as "eventType",
            event_date as "eventDate", contribution_phase as "contributionPhase", 
            contribution_rate as "contributionRate", opt_out_window_end as "optOutWindowEnd",
            next_re_enrolment_date as "nextReEnrolmentDate", refund_amount as "refundAmount",
            notes, created_at as "createdAt"
     FROM enrolment_history
     WHERE user_id = $1 
       AND event_type = $2
       AND next_re_enrolment_date <= $3
     ORDER BY next_re_enrolment_date ASC`,
    [userId, EnrolmentEventType.OPTED_OUT, beforeDate]
  );

  return result.rows;
}

/**
 * Delete enrolment history for an employee
 */
export async function deleteEnrolmentHistory(employeeId: string, userId: string): Promise<void> {
  await query('DELETE FROM enrolment_history WHERE employee_id = $1 AND user_id = $2', [
    employeeId,
    userId,
  ]);
}
