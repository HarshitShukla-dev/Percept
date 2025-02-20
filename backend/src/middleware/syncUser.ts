import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import pool from '../config/db';

export const syncUserMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const id = req.auth?.userId;
        const email = req.auth?.sessionClaims?.email as string | undefined;

        if (!id || !email) {
            await client.query('ROLLBACK');
            client.release();
            res.status(401).json({ success: false, error: 'Unauthorized - User info missing' });
            return;
        }

        let user = await UserModel.findById(id);

        if (!user) {
            user = await UserModel.create(id, email);
            console.log(`User created in backend DB: ${email}`);
        }

        await client.query('COMMIT');
        client.release();
        next();
        return;
    } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        console.error('Error creating/updating user:', error);
        res.status(500).json({ success: false, error: 'Failed to sync user data' });
        return
    }
};


