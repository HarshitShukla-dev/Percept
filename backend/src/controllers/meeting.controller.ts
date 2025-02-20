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

            // Assuming the MP3 file is in the request body
            const audioBuffer = req.file.buffer; // or req.body.audio if sent as raw data
            console.log(`Processing audio: ${audioBuffer.length} bytes`);

            // Transcription logic here
            const transcript = await transcribeAudio(audioBuffer); // Replace with actual transcription function

            if (!transcript) {
                res.status(500).json({ success: false, error: 'Failed to transcribe audio' });
                return;
            }

            const { summary, tasks } = await processTranscript(transcript);

            const updatedMeeting = await MeetingModel.update(parseInt(meetingId), {
                transcript,
                summary
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
                    tasks: createdTasks
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
    }
};