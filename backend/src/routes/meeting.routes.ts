import { Router } from 'express';
import { MeetingController } from '../controllers/meeting.controller';
import { ShareController } from '../controllers/share.controller';
import { syncUserMiddleware } from '../middleware/syncuser';
import { requireAuthMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.use(syncUserMiddleware);
router.use(requireAuthMiddleware);

router.post('/', MeetingController.create);
router.get('/', MeetingController.getMeetings);
router.get('/:meetingId', MeetingController.getMeetingById);
router.put('/:meetingId', MeetingController.updateMeeting);
router.delete('/:meetingId', MeetingController.deleteMeeting);
router.post('/:meetingId/process', upload.single('audio'), MeetingController.processAudio);

router.post('/:meetingId/share-email', ShareController.shareSummaryViaEmail);

export default router;