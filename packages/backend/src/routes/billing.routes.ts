import { Router } from 'express';
import * as BillingController from '../controllers/billing.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { paymentLimiter, standardLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.post('/webhook', BillingController.webhookHandler);

router.use(authMiddleware);

router.post('/checkout', paymentLimiter, BillingController.createOneTimeCheckout);
router.post('/subscription', paymentLimiter, BillingController.createSubscription);
router.get('/subscription', standardLimiter, BillingController.getSubscription);
router.delete('/subscription', standardLimiter, BillingController.cancelSubscription);

export default router;
