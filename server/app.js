import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import collegeRoutes from './routes/collegeRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import examRoutes from './routes/examRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (e.g. postman, curl) or any localhost/127.0.0.1 origin
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(null, true); // Dev fallback
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded static assets
const uploadPath = path.resolve(process.cwd(), process.env.UPLOAD_PATH || 'uploads');
app.use('/uploads', express.static(uploadPath));

// System Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `Endpoint '${req.originalUrl}' not found.` });
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;

