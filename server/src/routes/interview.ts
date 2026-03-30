import express from 'express';
import {
  startInterview,
  submitAnswer,
  getNextQuestion,
  completeInterview,
  getResult,
  getHistory,
} from '../controllers/interviewController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.post('/start', startInterview);
router.post('/answer', submitAnswer);
router.get('/next', getNextQuestion);
router.post('/complete', completeInterview);
router.get('/result/:sessionId', getResult);
router.get('/history', getHistory);

// Backward-compatible aliases for the interview-prep module.
router.post('/upload-response', submitAnswer);
router.get('/question', getNextQuestion);
router.post('/evaluate', submitAnswer);

export default router;
