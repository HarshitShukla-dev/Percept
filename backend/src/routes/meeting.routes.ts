import { Router } from 'express';
import { MeetingController } from '../controllers/meeting.controller';
import { requireAuthMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAuthMiddleware);

router.post('/', MeetingController.create);
router.get('/', MeetingController.getMeetings);
router.post('/:meetingId/process', upload.single('audio'), MeetingController.processAudio);

export default router;