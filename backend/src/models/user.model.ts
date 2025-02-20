import pool from '../config/db';
import { User } from '../types';

export const UserModel = {
    async create(id: string, email: string): Promise<User> {
        const query = `
      INSERT INTO users (id, email)
      VALUES ($1, $2)
      RETURNING *
    `;
        const { rows } = await pool.query(query, [id, email]);
        return rows[0];
    },

    async findById(id: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    },

    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0] || null;
    }
};