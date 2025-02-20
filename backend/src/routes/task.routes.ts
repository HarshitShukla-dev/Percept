import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { requireAuthMiddleware } from '../middleware/auth';

const router = Router();

router.use(requireAuthMiddleware);

router.post('/', TaskController.create);
router.get('/', TaskController.getTasks);
router.patch('/:id', TaskController.updateTask);

export default router;