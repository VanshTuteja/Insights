import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { improveResume } from '../controllers/resumeController';

const router = express.Router();

router.use(authenticateToken);
router.post('/improve', improveResume);

export default router;
