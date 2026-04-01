import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { analyzeResume, generateResume, improveResume } from '../controllers/resumeController';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
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
