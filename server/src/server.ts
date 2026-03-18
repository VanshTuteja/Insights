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

const app = express();

const DIRNAME = path.resolve();

// default middleware for any mern project
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

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
      error: 'File too large. Maximum size is 100MB.'
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field.'
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: error.message
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  return res.status(500).json({
    error: config.nodeEnv === 'development' ? error.message : 'Internal server error'
  });
});


app.use('/uploads', express.static(path.join(DIRNAME, 'uploads')));
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
      logger.info(`MongoDB URI: ${config.mongodb.uri}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;