import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const config = {
  port: parseNumber(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodb: {
    uri: process.env.MONGODB_URI || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    origin: process.env.FRONTEND_URL || '',
  },

  rateLimit: {
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000),
    maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 2000),
  },

  translation: {
    googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  },

  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  adzuna: {
    appId: process.env.ADZUNA_APP_ID || '',
    appKey: process.env.ADZUNA_APP_KEY || '',
    country: process.env.ADZUNA_COUNTRY || 'in',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  },

  googleTts: {
    language: process.env.GOOGLE_TTS_LANGUAGE || 'hi-IN',
    voice: process.env.GOOGLE_TTS_VOICE || 'hi-IN-Wavenet-A',
  },

  whisper: {
    serviceUrl: process.env.WHISPER_SERVICE_URL || 'http://localhost:8000',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  },
};

export default config;