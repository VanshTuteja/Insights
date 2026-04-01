import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import logger from './utils/logger';
import cookieParser from "cookie-parser";
import { dbConnection } from './database/database';
import config from './config/index';
import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import interviewRoutes from './routes/interview';
import applicationRoutes from './routes/application';
import interviewsRoutes from './routes/interviews';
import uploadRoutes from './routes/upload';
import notificationRoutes from './routes/notification';
import resumeRoutes from './routes/resume';
import adminRoutes from './routes/admin';
import { startInterviewReminderService } from './services/interviewReminderService';

const app = express();

const DIRNAME = path.resolve();
const allowedOrigins = new Set(config.cors.origins);

// Render and similar platforms terminate TLS and forward the real client IP.
// Trust the first proxy so rate limiting and req.ip work correctly.
app.set('trust proxy', 1);

// default middleware for any mern project
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    logger.warn('Blocked by CORS policy', { origin, allowedOrigins: [...allowedOrigins] });
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await dbConnection.healthCheck();

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: dbHealth,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Server error: ${error.message}`);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Profile photos can be up to 25MB and resumes up to 10MB.',
      error: 'File too large. Profile photos can be up to 25MB and resumes up to 10MB.'
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.',
      error: 'Unexpected file field.'
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: 'Validation error',
      details: error.message
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: 'Invalid ID format'
    });
  }

  return res.status(500).json({
    success: false,
    message: config.nodeEnv === 'development' ? error.message : 'Internal server error',
    error: config.nodeEnv === 'development' ? error.message : 'Internal server error'
  });
});


app.use(
  '/uploads',
  cors({
    origin: true,
    credentials: false,
    methods: ['GET', 'HEAD', 'OPTIONS'],
  }),
  express.static(path.join(DIRNAME, 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  })
);
app.use(express.static(path.join(DIRNAME, "/client/dist")));

// 404 handler
app.use("*", (_, res) => {
  res.sendFile(path.resolve(DIRNAME, "client", "dist", "index.html"));
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await dbConnection.connect();

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`CORS origin: ${config.cors.origin}`);
      logger.info('MongoDB URI configured');
    });
    startInterviewReminderService();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
