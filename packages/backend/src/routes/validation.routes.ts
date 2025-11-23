import { Router } from 'express';
import * as ValidationController from '../controllers/validation.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationLimiter, expensiveOperationLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/:uploadId/results', validationLimiter, ValidationController.getValidationResults);
router.get('/:uploadId/preview', validationLimiter, ValidationController.getInstantPreview);
router.get('/:uploadId/eligibility', validationLimiter, ValidationController.calculateEligibility);
router.get('/:uploadId/contributions', validationLimiter, ValidationController.calculateContributions);
router.get('/:uploadId/risk', validationLimiter, ValidationController.getRiskAssessment);
router.get('/:uploadId/report', expensiveOperationLimiter, ValidationController.generateReport);

export default router;
