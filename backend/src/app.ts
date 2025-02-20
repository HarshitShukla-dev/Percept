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

// Error handling
app.use(errorHandler);

export default app;