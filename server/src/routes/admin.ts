import express from 'express';
import { deleteJobAsAdmin, deleteUserAsAdmin, getAdminOverview, getUserProfileAsAdmin } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken, requireRole('admin'));
router.get('/overview', getAdminOverview);
router.get('/users/:userId', getUserProfileAsAdmin);
router.delete('/users/:userId', deleteUserAsAdmin);
router.delete('/jobs/:jobId', deleteJobAsAdmin);

export default router;
