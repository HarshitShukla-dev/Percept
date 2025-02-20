import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';

// export const requireAuthMiddleware = requireAuth();

// for testing purposes, we will use a mock auth middleware
export const requireAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return 
        }
        req.auth = {
            userId: 'test_user',
            id: 'test_user',
            email: 'test@example.com'
        };
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
}

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