import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  scheduleInterview,
  getCandidateInterviews,
  getEmployerInterviews,
  updateInterview,
} from '../controllers/interviewScheduleController';

const router = express.Router();

router.use(authenticateToken);

// Employer: schedule and update (cancel/reschedule). Candidate: can cancel via PATCH.
router.post('/schedule', requireRole('employer'), scheduleInterview);
router.patch('/:id', updateInterview);

// Job seeker: my interviews
router.get('/candidate', requireRole('jobseeker'), getCandidateInterviews);

// Employer: list scheduled interviews
router.get('/employer', requireRole('employer'), getEmployerInterviews);

export default router;

