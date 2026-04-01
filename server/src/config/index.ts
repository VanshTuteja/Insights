import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server', '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../server/.env'),
];

const resolvedEnvPath = candidateEnvPaths.find((candidate) => fs.existsSync(candidate));
dotenv.config(resolvedEnvPath ? { path: resolvedEnvPath } : undefined);

const maskSecret = (value: string) => {
  if (!value) return '(empty)';
  if (value.length <= 12) return `${value.slice(0, 4)}...`;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
};

const sanitizeEnvString = (value: string | undefined) => {
  const trimmed = String(value || '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const rawMongoUri = sanitizeEnvString(process.env.MONGODB_URI);
const mongoEnvDebug = {
  envFileLoaded: resolvedEnvPath || '(default dotenv resolution)',
  mongodbUriPresent: Boolean(rawMongoUri),
  mongodbUriPrefix: rawMongoUri ? rawMongoUri.split('://')[0] : '(missing)',
  mongodbUriMasked: maskSecret(rawMongoUri),
};

console.info('[config] Environment load status:', mongoEnvDebug);

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const config = {
  port: parseNumber(process.env.PORT, 5000),
  nodeEnv: sanitizeEnvString(process.env.NODE_ENV) || 'development',

  mongodb: {
    uri: rawMongoUri,
  },

  jwt: {
    secret: sanitizeEnvString(process.env.JWT_SECRET),
    expiresIn: sanitizeEnvString(process.env.JWT_EXPIRES_IN) || '7d',
  },

  cors: {
    origin: sanitizeEnvString(process.env.FRONTEND_URL),
  },

  rateLimit: {
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000),
    maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 2000),
  },

  translation: {
    googleCredentials: sanitizeEnvString(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  },

  email: {
    host: sanitizeEnvString(process.env.SMTP_HOST) || 'smtp.gmail.com',
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: false,
    auth: {
      user: sanitizeEnvString(process.env.SMTP_USER),
      pass: sanitizeEnvString(process.env.SMTP_PASS),
    },
  },

  cloudinary: {
    cloudName: sanitizeEnvString(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: sanitizeEnvString(process.env.CLOUDINARY_API_KEY),
    apiSecret: sanitizeEnvString(process.env.CLOUDINARY_API_SECRET),
  },

  adzuna: {
    appId: sanitizeEnvString(process.env.ADZUNA_APP_ID),
    appKey: sanitizeEnvString(process.env.ADZUNA_APP_KEY),
    country: sanitizeEnvString(process.env.ADZUNA_COUNTRY) || 'in',
  },

  groq: {
    apiKey: sanitizeEnvString(process.env.GROQ_API_KEY),
    model: sanitizeEnvString(process.env.GROQ_MODEL) || 'llama-3.1-8b-instant',
  },

  googleTts: {
    apiKey: sanitizeEnvString(process.env.GOOGLE_TTS_API_KEY),
    language: sanitizeEnvString(process.env.GOOGLE_TTS_LANGUAGE) || 'hi-IN',
    voice: sanitizeEnvString(process.env.GOOGLE_TTS_VOICE) || 'hi-IN-Wavenet-A',
  },

  whisper: {
    serviceUrl: sanitizeEnvString(process.env.WHISPER_SERVICE_URL) || 'http://localhost:8000',
  },

  admin: {
    email: sanitizeEnvString(process.env.ADMIN_EMAIL),
    password: sanitizeEnvString(process.env.ADMIN_PASSWORD),
  },
};

export default config;
