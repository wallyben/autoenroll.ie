import { Router } from 'express';
import * as UploadController from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadLimiter, standardLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', uploadLimiter, UploadController.upload.single('file'), UploadController.uploadFile);
router.get('/', standardLimiter, UploadController.listUploads);
router.get('/:id', standardLimiter, UploadController.getUpload);
router.delete('/:id', standardLimiter, UploadController.deleteUpload);

export default router;
