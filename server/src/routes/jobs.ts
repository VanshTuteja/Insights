import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  saveJob,
  getSavedJobs,
  getEmployerJobs
} from '../controllers/jobController';
import { authenticateToken, optionalAuthenticateToken, requireCompletedProfile, requireRole } from '../middleware/auth';
import { validateJobCreation } from '../middleware/validation';

const router = express.Router();

// Public: list all jobs and get single job by id
router.get('/', optionalAuthenticateToken, getJobs);

// Specific paths MUST come before /:id or Express will match "saved" and "employer" as id
router.get('/saved/list', authenticateToken, requireRole('jobseeker'), requireCompletedProfile, getSavedJobs);
router.get('/employer', authenticateToken, requireRole('employer'), requireCompletedProfile, getEmployerJobs);
router.get('/:id', getJobById);

// Protected routes (auth required)
router.use(authenticateToken);

// Job seeker: apply and save
router.post('/:id/apply', requireRole('jobseeker'), requireCompletedProfile, applyToJob);
router.post('/:id/save', requireRole('jobseeker'), requireCompletedProfile, saveJob);

// Employer-only: CRUD jobs
router.post('/', requireRole('employer'), requireCompletedProfile, validateJobCreation, createJob);
router.put('/:id', requireRole('employer'), requireCompletedProfile, validateJobCreation, updateJob);
router.delete('/:id', requireRole('employer'), requireCompletedProfile, deleteJob);

// Documented API aliases
router.post('/create', requireRole('employer'), requireCompletedProfile, validateJobCreation, createJob);
router.put('/update/:id', requireRole('employer'), requireCompletedProfile, validateJobCreation, updateJob);
router.delete('/delete/:id', requireRole('employer'), requireCompletedProfile, deleteJob);

export default router;
