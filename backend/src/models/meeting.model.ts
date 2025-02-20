import pool from '../config/db';
import { Meeting } from '../types';

export const MeetingModel = {
    async create(meeting: Partial<Meeting>): Promise<Meeting> {
        const query = `
            INSERT INTO meetings (user_id, title, transcript, summary, meeting_date, meeting_time, participants, key_points)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            meeting.user_id,
            meeting.title,
            meeting.transcript,
            meeting.summary,
            meeting.meeting_date,
            meeting.meeting_time,
            JSON.stringify(meeting.participants),
            JSON.stringify(meeting.key_points)
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
        const updateClauses = [];
        const values: (string | number)[] = [id];
        let paramCount = 2;

        for (const key in meeting) {
            if (meeting.hasOwnProperty(key)) {
                if (key === 'participants' || key === 'key_points') {
                    updateClauses.push(`${key} = $${paramCount}`);
                    values.push(JSON.stringify((meeting as any)[key]));
                } else {
                    updateClauses.push(`${key} = $${paramCount}`);
                    values.push((meeting as any)[key]);
                }
                paramCount++;
            }
        }

        if (updateClauses.length === 0) {
            return MeetingModel.findById(id);
        }

        const query = `
            UPDATE meetings
            SET ${updateClauses.join(', ')}, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    },

    async delete(id: number): Promise<Meeting | null> {
        const result = await pool.query('DELETE FROM meetings WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};