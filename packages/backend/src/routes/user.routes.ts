import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.post('/password/change', UserController.changePassword);
router.delete('/account', UserController.deleteAccount);

export default router;
