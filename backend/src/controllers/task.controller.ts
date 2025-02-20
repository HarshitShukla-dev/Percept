import { Request, Response } from 'express';
import { TaskModel } from '../models/task.model';

export const TaskController = {
    async create(req: Request, res: Response) {
        try {
            const userId = req.auth?.userId;

            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized' });
                return
            }

            const task = await TaskModel.create({
                ...req.body,
                user_id: userId
            });
            res.status(201).json({ success: true, data: task });
            return
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ success: false, error: 'Failed to create task' });
            return
        }
    },

    async getTasks(req: Request, res: Response) {
        try {
            const userId = req.auth?.userId;
            const { meetingId } = req.query;

            let tasks;
            if (meetingId) {
                tasks = await TaskModel.findByMeetingId(parseInt(meetingId as string));
            } else {
                tasks = await TaskModel.findByUserId(userId || '');
            }

            res.json({ success: true, data: tasks });
            return
        } catch (error) {
            console.error('Error getting tasks:', error);
            res.status(500).json({ success: false, error: 'Failed to get tasks' });
            return
        }
    },

    async updateTask(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const task = await TaskModel.update(parseInt(id), req.body);

            if (!task) {
                res.status(404).json({ success: false, error: 'Task not found' });
                return
            }

            res.json({ success: true, data: task });
            return
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({ success: false, error: 'Failed to update task' });
            return
        }
    },

    async deleteTask(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const task = await TaskModel.delete(parseInt(id));
            if (!task) {
                res.status(404).json({ success: false, error: 'Task not found' });
                return;
            }
            res.json({ success: true, data: task });
        } catch (error) {
            console.error("Error deleting task:", error);
            res.status(500).json({ success: false, error: 'Failed to delete task' });
        }
    },

    async getTaskById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const task = await TaskModel.findById(parseInt(id));
            if (!task) {
                res.status(404).json({ success: false, error: 'Task not found' });
                return;
            }
            res.json({ success: true, data: task });
        } catch (error) {
            console.error("Error getting task by ID:", error);
            res.status(500).json({ success: false, error: 'Failed to get task' });
        }
    }
};