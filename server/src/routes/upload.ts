import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { authenticateToken, requireRole } from '../middleware/auth';
import User from '../models/Users';
import { AuthRequest } from '../types';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../utils/cloudinary';

const router = express.Router();
const uploadsDir = path.join(process.cwd(), 'uploads');

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF and Word documents are allowed'));
  },
});

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
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

const saveBufferLocally = async (
  file: Express.Multer.File,
  prefix: 'resume' | 'avatar',
  userId: string,
) => {
  await ensureUploadsDir();
  const ext = path.extname(file.originalname || '') || (prefix === 'avatar' ? '.png' : '.bin');
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

      const resumeUrl = isCloudinaryConfigured()
        ? (
            await uploadBufferToCloudinary(req.file.buffer, {
              folder: 'jobfinder/resumes',
              resource_type: 'raw',
              public_id: `resume_${userId}_${Date.now()}`,
            })
          ).secure_url
        : await saveBufferLocally(req.file, 'resume', userId);

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
        : await saveBufferLocally(req.file, 'avatar', userId);

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

export default router;
