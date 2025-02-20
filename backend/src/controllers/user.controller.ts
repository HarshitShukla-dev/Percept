import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import pool from '../config/db';

export const UserController = {
    async createOrUpdate(req: Request, res: Response) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const id = req.auth?.id;
            const email = req.auth?.email;

            if (!id || !email) {
                res.status(401).json({ success: false, error: 'Unauthorized' });
                return 
            }

            let user = await UserModel.findById(id);

            if (!user) {
                user = await UserModel.create(id, email);
            }

            await client.query('COMMIT');
            res.json({ success: true, data: user });
            return 
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating/updating user:', error);
            res.status(500).json({ success: false, error: 'Failed to create/update user' });
            return 
        } finally {
            client.release();
        }
    }
};