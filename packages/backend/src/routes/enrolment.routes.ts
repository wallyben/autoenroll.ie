import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as enrolmentController from '../controllers/enrolment.controller';

const router = Router();

/**
 * Get enrolment history for an employee
 * GET /api/enrolment/history/:employeeId
 */
router.get('/history/:employeeId', authMiddleware, enrolmentController.getEmployeeHistory);

/**
 * Get enrolment status for an employee
 * GET /api/enrolment/status/:employeeId
 */
router.get('/status/:employeeId', authMiddleware, enrolmentController.getEmployeeStatus);

/**
 * Record enrolment event
 * POST /api/enrolment/event
 * Body: { employeeId, eventType, eventDate, ...additionalData }
 */
router.post('/event', authMiddleware, enrolmentController.recordEnrolmentEvent);

/**
 * Validate opt-out request
 * POST /api/enrolment/validate-opt-out
 * Body: { employeeId, enrolmentDate, contributions }
 */
router.post('/validate-opt-out', authMiddleware, enrolmentController.validateOptOut);

/**
 * Get employees due for re-enrolment
 * GET /api/enrolment/due-for-re-enrolment
 * Query: ?beforeDate=2025-11-23
 */
router.get('/due-for-re-enrolment', authMiddleware, enrolmentController.getEmployeesDueForReEnrolment);

/**
 * Calculate re-enrolment date
 * POST /api/enrolment/calculate-re-enrolment
 * Body: { employeeId, lastOptOutDate }
 */
router.post('/calculate-re-enrolment', authMiddleware, enrolmentController.calculateReEnrolmentDate);

export default router;
