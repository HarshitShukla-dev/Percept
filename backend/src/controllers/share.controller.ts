import { Request, Response } from 'express';
import { MeetingModel } from '../models/meeting.model';
import { TaskModel } from '../models/task.model';
import { sendEmail } from '../utils/mailer';

export const ShareController = {
    async shareSummaryViaEmail(req: Request, res: Response) {
        try {
            const { meetingId } = req.params;
            const { recipientEmail } = req.body;

            if (!recipientEmail) {
                res.status(400).json({ success: false, error: 'Recipient email is required' });
                return 
            }

            const meeting = await MeetingModel.findById(parseInt(meetingId));
            if (!meeting) {
                res.status(404).json({ success: false, error: 'Meeting not found' });
                return 
            }

            if (!meeting.summary) {
                res.status(400).json({ success: false, error: 'Meeting summary is not available' });
                return 
            }

            const tasks = await TaskModel.findByMeetingId(parseInt(meetingId));

            const emailSubject = `Meeting Summary: ${meeting.title}`;
            const emailBodyHtml = `
                <h1>Meeting Summary</h1>
                <h2>${meeting.title}</h2>
                <p><strong>Summary:</strong></p>
                <p>${meeting.summary || 'No summary available'}</p>
                <h3>Tasks</h3>
                <ul>
                    ${tasks && tasks.length > 0 ? tasks.map(task => `<li><strong>${task.title}</strong>: ${task.description || 'No description'}</li>`).join('') : '<li>No tasks were extracted from this meeting.</li>'}
                </ul>
            `;

            await sendEmail({
                to: recipientEmail,
                subject: emailSubject,
                html: emailBodyHtml
            });

            res.json({ success: true, message: 'Meeting summary shared via email' });

        } catch (error) {
            console.error('Error sharing meeting summary via email:', error);
            res.status(500).json({ success: false, error: 'Failed to share meeting summary via email', details: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
};