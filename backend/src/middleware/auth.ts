import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';

export const requireAuthMiddleware = requireAuth();

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
};

// Apply clerkMiddleware to the app
export const applyClerkMiddleware = (app: any) => {
    app.use(clerkMiddleware);
};