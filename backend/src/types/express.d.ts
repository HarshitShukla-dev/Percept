import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string; // userId is often directly on auth
                sessionId: string | null; // sessionId might also be directly on auth
                getToken: () => Promise<string | null>; // getToken function
                sessionClaims?: { // sessionClaims is where user attributes are
                    email?: string; // Email is in sessionClaims (and other attributes)
                    [key: string]: any; // Allow other claims (like 'firstName', 'lastName', etc.)
                };
            }
        }
    }
}