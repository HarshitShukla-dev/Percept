import pool from '../config/db';
import { Task } from '../types';

export const TaskModel = {
    create: async (task: Partial<Task>): Promise<Task> => {
        const query = `
            INSERT INTO tasks (user_id, meeting_id, title, description, deadline, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            task.user_id,
            task.meeting_id,
            task.title,
            task.description,
            task.deadline,
            task.status || 'PENDING'
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    findById: async (id: number): Promise<Task | null> => {
        const query = `SELECT * FROM tasks WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    },

    findByUserId: async (userId: string): Promise<Task[]> => {
        const query = `SELECT * FROM tasks WHERE user_id = $1 ORDER BY deadline ASC`;
        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    findByMeetingId: async (meetingId: number): Promise<Task[]> => {
        const query = `SELECT * FROM tasks WHERE meeting_id = $1 ORDER BY deadline ASC`;
        const result = await pool.query(query, [meetingId]);
        return result.rows;
    },

    update: async (id: number, task: Partial<Task>): Promise<Task | null> => {
        const updateClauses = [];
        const values = [id];
        let paramCount = 2;

        for (const key in task) {
            if (task.hasOwnProperty(key)) {
                updateClauses.push(`${key} = $${paramCount}`);
                values.push((task as any)[key]);
                paramCount++;
            }
        }

        if (updateClauses.length === 0) {
            return TaskModel.findById(id);
        }

        const query = `
            UPDATE tasks
            SET ${updateClauses.join(', ')}, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    },

    delete: async (id: number): Promise<Task | null> => {
        const query = `
            DELETE FROM tasks
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    },

    deleteByMeetingId: async (meetingId: number): Promise<void> => {
        const query = `DELETE FROM tasks WHERE meeting_id = $1`;
        await pool.query(query, [meetingId]);
    },
};