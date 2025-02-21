import { Request, Response } from 'express';
import { MeetingModel } from '../models/meeting.model';
import { TaskModel } from '../models/task.model';
import { processTranscript, transcribeAudio } from '../utils/ai';

export const MeetingController = {
    async create(req: Request, res: Response) {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized' });
                return
            }

            const meeting = await MeetingModel.create({
                ...req.body,
                user_id: userId
            });
            res.status(201).json({ success: true, data: meeting });
            return
        } catch (error) {
            console.error('Error creating meeting:', error);
            res.status(500).json({ success: false, error: 'Failed to create meeting' });
            return
        }
    },

    async processAudio(req: Request, res: Response) {
        try {
            const { meetingId } = req.params;
            const meeting = await MeetingModel.findById(parseInt(meetingId));

            if (!meeting) {
                res.status(404).json({ success: false, error: 'Meeting not found' });
                return;
            }

            if (!req.file) {
                res.status(400).json({ success: false, error: 'No audio file provided' });
                return;
            }

            const audioBuffer = req.file.buffer;

            const transcript = await transcribeAudio(audioBuffer);

            if (!transcript) {
                res.status(500).json({ success: false, error: 'Failed to transcribe audio' });
                return;
            }

            const { summary, tasks, meetingDetails, keyPoints } = await processTranscript(transcript);

            const updatedMeeting = await MeetingModel.update(parseInt(meetingId), {
                transcript,
                summary,
                meeting_date: !meetingDetails.date || meetingDetails.date === 'not specified' ? null : new Date(meetingDetails.date),
                meeting_time: meetingDetails.time === 'not specified' ? null : meetingDetails.time,
                key_points: keyPoints
            });

            const createdTasks = await Promise.all(
                tasks.map((task: any) => TaskModel.create({
                    title: task.title,
                    description: task.description,
                    user_id: meeting.user_id,
                    meeting_id: meeting.id,
                    deadline: task.deadline ? new Date(task.deadline) : null,
                    status: task.status || 'PENDING'
                }))
            );

            res.json({
                success: true,
                data: {
                    meeting: updatedMeeting,
                    tasks: createdTasks,
                    meetingDetails,
                    keyPoints
                }
            });
            return;
        } catch (error) {
            console.error('Error processing audio:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process audio',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
            return;
        }
    },

    async getMeetings(req: Request, res: Response) {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized' });
                return
            }

            const meetings = await MeetingModel.findByUserId(userId);
            res.json({ success: true, data: meetings });
            return
        } catch (error) {
            console.error('Error getting meetings:', error);
            res.status(500).json({ success: false, error: 'Failed to get meetings' });
            return
        }
    },

    async getMeetingById(req: Request, res: Response) {
        try {
            const { meetingId } = req.params;
            const meeting = await MeetingModel.findById(parseInt(meetingId));
            if (!meeting) {
                res.status(404).json({ success: false, error: 'Meeting not found' });
                return
            }
            res.json({ success: true, data: meeting });
        } catch (error) {
            console.error("Error getting meeting by ID:", error);
            res.status(500).json({ success: false, error: 'Failed to get meeting' });
        }
    },

    async updateMeeting(req: Request, res: Response) {
        try {
            const { meetingId } = req.params;
            const updatedMeeting = await MeetingModel.update(parseInt(meetingId), req.body);
            if (!updatedMeeting) {
                res.status(404).json({ success: false, error: 'Meeting not found' });
                return
            }
            res.json({ success: true, data: updatedMeeting });
        } catch (error) {
            console.error("Error updating meeting:", error);
            res.status(500).json({ success: false, error: 'Failed to update meeting' });
        }
    },

    async deleteMeeting(req: Request, res: Response) {
        try {
            const { meetingId } = req.params;
            await TaskModel.deleteByMeetingId(parseInt(meetingId));
            const deletedMeeting = await MeetingModel.delete(parseInt(meetingId));
            if (!deletedMeeting) {
                res.status(404).json({ success: false, error: 'Meeting not found' });
                return
            }
            res.json({ success: true, data: deletedMeeting });
        } catch (error) {
            console.error("Error deleting meeting:", error);
            res.status(500).json({ success: false, error: 'Failed to delete meeting' });
        }
    }

};