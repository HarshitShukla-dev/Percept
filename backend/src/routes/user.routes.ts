import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuthMiddleware } from '../middleware/auth';

const router = Router();

router.use(requireAuthMiddleware);

router.post('/', UserController.createOrUpdate);

export default router;