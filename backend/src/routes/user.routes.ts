import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { syncUserMiddleware } from '../middleware/syncuser';
import { requireAuthMiddleware } from '../middleware/auth';

const router = Router();

router.use(syncUserMiddleware);
router.use(requireAuthMiddleware);

router.post('/', UserController.createOrUpdate);

export default router;