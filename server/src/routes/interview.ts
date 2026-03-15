import express from 'express';
import multer from 'multer';
import {
  startInterview,
  getQuestion,
  uploadResponse,
  evaluateOnly,
  getResult,
  getHistory,
} from '../controllers/interviewController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = /audio\/|video\//.test(file.mimetype);
    cb(null, !!allowed);
  },
});

router.use(authenticateToken);

router.post('/start', startInterview);
router.get('/question', getQuestion);
router.post('/upload-response', upload.single('audio'), uploadResponse);
router.post('/evaluate', evaluateOnly);
router.get('/result/:sessionId', getResult);
router.get('/history', getHistory);

export default router;
