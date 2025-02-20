import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/auth';
import meetingRoutes from './routes/meeting.routes';
import taskRoutes from './routes/task.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/meetings', meetingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Temporary test route - Remove in production
app.post('/api/get-test-token', async (req, res) => {
    try {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjE5OTk5OTk5OTl9.YOUR_SIGNATURE';
        // This is a test token that will work with our modified auth middleware
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

// Error handling
app.use(errorHandler);

export default app;