import pool from '../config/db';
import { Task } from '../types';

export const TaskModel = {
    async create(task: Partial<Task>): Promise<Task> {
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

    async findById(id: number): Promise<Task | null> {
        const query = 'SELECT * FROM tasks WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    },

    async findByUserId(userId: string): Promise<Task[]> {
        const query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY deadline ASC';
        const { rows } = await pool.query(query, [userId]);
        return rows;
    },

    async findByMeetingId(meetingId: number): Promise<Task[]> {
        const query = 'SELECT * FROM tasks WHERE meeting_id = $1 ORDER BY deadline ASC';
        const { rows } = await pool.query(query, [meetingId]);
        return rows;
    },

    async update(id: number, task: Partial<Task>): Promise<Task | null> {
        const query = `
      UPDATE tasks
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          deadline = COALESCE($3, deadline),
          status = COALESCE($4, status)
      WHERE id = $5
      RETURNING *
    `;
        const values = [
            task.title,
            task.description,
            task.deadline,
            task.status,
            id
        ];
        const { rows } = await pool.query(query, values);
        return rows[0] || null;
    }
};