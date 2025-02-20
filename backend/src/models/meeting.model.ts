import pool from '../config/db';
import { Meeting } from '../types';

export const MeetingModel = {
    async create(meeting: Partial<Meeting>): Promise<Meeting> {
        const query = `
      INSERT INTO meetings (user_id, title, transcript, summary, meeting_date, participants)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const values = [
            meeting.user_id,
            meeting.title,
            meeting.transcript,
            meeting.summary,
            meeting.meeting_date,
            meeting.participants
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async findById(id: number): Promise<Meeting | null> {
        const query = 'SELECT * FROM meetings WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    },

    async findByUserId(userId: string): Promise<Meeting[]> {
        const query = 'SELECT * FROM meetings WHERE user_id = $1 ORDER BY meeting_date DESC';
        const { rows } = await pool.query(query, [userId]);
        return rows;
    },

    async update(id: number, meeting: Partial<Meeting>): Promise<Meeting | null> {
        const query = `
      UPDATE meetings
      SET title = COALESCE($1, title),
          transcript = COALESCE($2, transcript),
          summary = COALESCE($3, summary),
          meeting_date = COALESCE($4, meeting_date),
          participants = COALESCE($5, participants)
      WHERE id = $6
      RETURNING *
    `;
        const values = [
            meeting.title,
            meeting.transcript,
            meeting.summary,
            meeting.meeting_date,
            meeting.participants,
            id
        ];
        const { rows } = await pool.query(query, values);
        return rows[0] || null;
    }
};