import express from 'express';
import { authenticateToken, requireCompletedProfile, requireRole } from '../middleware/auth';
import {
  applyForJob,
  getCandidateApplications,
  getJobApplications,
  getEmployerApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';

const router = express.Router();

router.use(authenticateToken);

// Job seeker: apply and list my applications
router.post('/apply', requireRole('jobseeker'), requireCompletedProfile, applyForJob);
router.get('/candidate', requireRole('jobseeker'), requireCompletedProfile, getCandidateApplications);

// Employer: list by job, list all, update status
router.get('/job/:jobId', requireRole('employer'), requireCompletedProfile, getJobApplications);
router.get('/employer', requireRole('employer'), requireCompletedProfile, getEmployerApplications);
router.patch('/:id/status', requireRole('employer'), requireCompletedProfile, updateApplicationStatus);

export default router;

