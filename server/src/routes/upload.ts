import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream, mkdirSync } from 'fs';
import { Readable } from 'stream';
import { authenticateToken, requireRole } from '../middleware/auth';
import User from '../models/Users';
import { AuthRequest } from '../types';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../utils/cloudinary';

const router = express.Router();
const uploadsDir = path.join(process.cwd(), 'uploads');

const ensureUploadsDirSync = () => {
  mkdirSync(uploadsDir, { recursive: true });
};

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadsDirSync();
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const userId = (req as AuthRequest).user?.userId || 'anonymous';
      const ext = path.extname(file.originalname || '') || '.pdf';
      cb(null, `resume_${userId}_${Date.now()}${sanitizeName(ext)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const normalizedName = (file.originalname || '').toLowerCase();
    const normalizedType = (file.mimetype || '').toLowerCase();
    const isPdf =
      normalizedName.endsWith('.pdf') ||
      normalizedType === 'application/pdf' ||
      normalizedType === 'application/x-pdf' ||
      normalizedType === 'binary/octet-stream' ||
      normalizedType === 'application/octet-stream';
    if (isPdf) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF resumes are allowed'));
  },
});

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  },
});

const ensureUploadsDir = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
};

const sanitizeName = (value: string) => value.replace(/[^a-z0-9._-]/gi, '_').toLowerCase();

const saveAvatarInline = (file: Express.Multer.File) => {
  const mimeType = file.mimetype || 'image/png';
  const base64 = file.buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
};

const saveBufferLocally = async (
  file: Express.Multer.File,
  prefix: 'resume' | 'avatar',
  userId: string,
) => {
  await ensureUploadsDir();
  const ext = prefix === 'resume' ? '.pdf' : path.extname(file.originalname || '') || '.png';
  const fileName = `${prefix}_${userId}_${Date.now()}${sanitizeName(ext)}`;
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, file.buffer);
  return `/uploads/${fileName}`;
};

router.post(
  '/resume',
  authenticateToken,
  requireRole('jobseeker'),
  resumeUpload.single('resume'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const resumeUrl = `/uploads/${path.basename(req.file.path)}`;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { resumeUrl } },
        { new: true },
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(201).json({
        success: true,
        data: { resumeUrl },
        message: 'Resume uploaded successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },
);

router.post(
  '/avatar',
  authenticateToken,
  avatarUpload.single('avatar'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const avatar = isCloudinaryConfigured()
        ? (
            await uploadBufferToCloudinary(req.file.buffer, {
              folder: 'jobfinder/avatars',
              resource_type: 'image',
              public_id: `avatar_${userId}_${Date.now()}`,
              transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face' }],
            })
          ).secure_url
        : saveAvatarInline(req.file);

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { avatar } },
        { new: true },
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(201).json({
        success: true,
        data: { avatar },
        message: 'Avatar uploaded successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },
);

router.get(
  '/resume/download/:userId?',
  authenticateToken,
  async (req: AuthRequest<{ userId?: string }>, res) => {
    try {
      const currentUserId = req.user?.userId;
      const requestedUserId = req.params.userId || currentUserId;

      if (!currentUserId || !requestedUserId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const canAccess =
        requestedUserId === currentUserId ||
        req.user?.role === 'employer' ||
        req.user?.role === 'admin';

      if (!canAccess) {
        return res.status(403).json({ success: false, message: 'Not authorized to download this resume' });
      }

      const user = await User.findById(requestedUserId).select('name resumeUrl');
      if (!user?.resumeUrl) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }

      const fileName = `${(user.name || 'resume').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'resume'}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      if (user.resumeUrl.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), user.resumeUrl.replace(/^\/+/, ''));
        const stream = createReadStream(localPath);
        stream.on('error', () => {
          if (!res.headersSent) {
            res.status(404).json({ success: false, message: 'Resume file is unavailable' });
          }
        });
        stream.pipe(res);
        return;
      }

      const response = await fetch(user.resumeUrl);
      if (!response.ok) {
        return res.status(404).json({
          success: false,
          message: 'Stored resume file could not be reached. Please upload your resume again.',
        });
      }

      if (!response.body) {
        return res.status(404).json({
          success: false,
          message: 'Stored resume file returned no readable stream.',
        });
      }

      Readable.fromWeb(response.body as any).pipe(res);
      return;
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },
);

export default router;
