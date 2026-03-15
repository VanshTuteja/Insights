import express from 'express';
import {
  login,
  verifyOTP,
  signup,
  resendOTP,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import {
  validateLogin,
  validateProfileUpdate
} from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', validateLogin, login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Backwards-compatible aliases (can remove later)
router.post('/send-otp', resendOTP);

// Protected routes
router.use(authenticateToken);
router.get('/me', getProfile);
router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);
router.delete('/account', deleteAccount);

export default router;