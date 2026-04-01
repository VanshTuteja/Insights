import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { authenticateToken } from '../middleware/auth';
import { analyzeResume, generateResume, improveResume } from '../controllers/resumeController';
import { AuthRequest } from '../types';

const router = express.Router();
const tempResumeDir = path.join(process.cwd(), 'uploads', 'resume-analysis-temp');

const ensureTempResumeDir = () => {
  fs.mkdirSync(tempResumeDir, { recursive: true });
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureTempResumeDir();
      cb(null, tempResumeDir);
    },
    filename: (req, file, cb) => {
      const userId = (req as AuthRequest).user?.userId || 'anonymous';
      cb(null, `analysis_${userId}_${Date.now()}${path.extname(file.originalname || '') || '.pdf'}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF resumes are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.use(authenticateToken);
router.post('/analyze', upload.single('resume'), analyzeResume);
router.post('/generate', generateResume);
router.post('/improve', improveResume);

export default router;
