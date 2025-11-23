import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import * as enrolmentModel from '../models/enrolment-history.model';
import * as stagingModel from '../models/staging-dates.model';
import {
  validateOptOut as validateOptOutLogic,
  calculateReEnrolmentDate as calcReEnrolment,
  createEnrolmentRecord,
  EnrolmentEventType,
} from '@autoenroll/common';

/**
 * Get enrolment history for an employee
 */
export async function getEmployeeHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { employeeId } = req.params;

    const history = await enrolmentModel.getEnrolmentHistory(employeeId, userId);

    res.json({
      success: true,
      data: {
        employeeId,
        history,
        count: history.length,
      },
    });
  } catch (error) {
    logger.error('Error getting employee history:', error);
    res.status(500).json({ error: 'Failed to get employee history' });
  }
}

/**
 * Get enrolment status for an employee
 */
export async function getEmployeeStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { employeeId } = req.params;

    const status = await enrolmentModel.getEnrolmentStatus(employeeId, userId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Error getting employee status:', error);
    res.status(500).json({ error: 'Failed to get employee status' });
  }
}

/**
 * Record an enrolment event
 */
export async function recordEnrolmentEvent(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      employeeId,
      eventType,
      eventDate,
      contributionPhase,
      contributionRate,
      optOutWindowEnd,
      nextReEnrolmentDate,
      refundAmount,
      notes,
    } = req.body;

    // Validate required fields
    if (!employeeId || !eventType) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: ['employeeId and eventType are required'],
      });
    }

    // Validate event type
    const validEventTypes = Object.values(EnrolmentEventType);
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        error: 'Invalid event type',
        validTypes: validEventTypes,
      });
    }

    const record = await enrolmentModel.createEnrolmentHistory(
      employeeId,
      userId,
      eventType as EnrolmentEventType,
      eventDate ? new Date(eventDate) : new Date(),
      {
        contributionPhase,
        contributionRate,
        optOutWindowEnd: optOutWindowEnd ? new Date(optOutWindowEnd) : undefined,
        nextReEnrolmentDate: nextReEnrolmentDate ? new Date(nextReEnrolmentDate) : undefined,
        refundAmount,
        notes,
      }
    );

    logger.info(`Recorded ${eventType} event for employee ${employeeId}`);

    res.json({
      success: true,
      data: record,
      message: 'Event recorded successfully',
    });
  } catch (error) {
    logger.error('Error recording enrolment event:', error);
    res.status(500).json({ error: 'Failed to record enrolment event' });
  }
}

/**
 * Validate opt-out request
 */
export async function validateOptOut(req: AuthRequest, res: Response) {
  try {
    const { employeeId, enrolmentDate, contributions } = req.body;

    // Validate required fields
    if (!employeeId || !enrolmentDate) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: ['employeeId and enrolmentDate are required'],
      });
    }

    const validation = validateOptOutLogic(
      new Date(enrolmentDate),
      new Date(),
      contributions || { employee: 0, employer: 0 }
    );

    res.json({
      success: true,
      data: {
        employeeId,
        ...validation,
      },
    });
  } catch (error) {
    logger.error('Error validating opt-out:', error);
    res.status(500).json({ error: 'Failed to validate opt-out' });
  }
}

/**
 * Get employees due for re-enrolment
 */
export async function getEmployeesDueForReEnrolment(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { beforeDate } = req.query;

    const date = beforeDate ? new Date(beforeDate as string) : new Date();
    const employees = await enrolmentModel.getEmployeesDueForReEnrolment(userId, date);

    res.json({
      success: true,
      data: {
        employees,
        count: employees.length,
        checkDate: date,
      },
    });
  } catch (error) {
    logger.error('Error getting employees due for re-enrolment:', error);
    res.status(500).json({ error: 'Failed to get employees due for re-enrolment' });
  }
}

/**
 * Calculate re-enrolment date for an employee
 */
export async function calculateReEnrolmentDate(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { employeeId, lastOptOutDate } = req.body;

    // Validate required fields
    if (!employeeId || !lastOptOutDate) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: ['employeeId and lastOptOutDate are required'],
      });
    }

    // Get user's staging config
    const stagingConfig = await stagingModel.getStagingConfig(userId);

    const calculation = calcReEnrolment(
      employeeId,
      new Date(lastOptOutDate),
      stagingConfig,
      new Date()
    );

    res.json({
      success: true,
      data: calculation,
      usingDefaultStagingConfig: !stagingConfig,
    });
  } catch (error) {
    logger.error('Error calculating re-enrolment date:', error);
    res.status(500).json({ error: 'Failed to calculate re-enrolment date' });
  }
}
