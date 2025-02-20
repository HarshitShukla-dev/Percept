import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { syncUserMiddleware } from '../middleware/syncuser';
import { requireAuthMiddleware } from '../middleware/auth';

const router = Router();
router.use(syncUserMiddleware);
router.use(requireAuthMiddleware);

router.post('/', TaskController.create);
router.get('/', TaskController.getTasks);
router.get('/:id', TaskController.getTaskById);
router.patch('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

export default router;