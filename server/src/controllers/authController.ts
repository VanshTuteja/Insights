import { Request, Response } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';
import User from '../models/Users';
import emailService from '../utils/emailService';
import { AuthRequest, LoginRequest, UpdateProfileRequest, ApiResponse } from '../types';
import { generateToken } from '../middleware/auth';
import { withProfileCompletion } from '../utils/profileCompletion';
import config from '../config';

type OtpPurpose = 'verify-email' | 'reset-password';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp: string): string => crypto.createHash('sha256').update(otp).digest('hex');
const now = () => new Date();

async function sendOtpOrFail(email: string, otp: string, purpose: OtpPurpose) {
  const emailType = purpose === 'reset-password' ? 'password-reset' : 'signup';
  if (!emailService.isConfigured()) {
    throw new Error('Email service is not configured. Please set SMTP credentials.');
  }
  await emailService.sendOTPEmail(email, otp, emailType);
}

async function ensureDefaultAdmin(email: string, password: string) {
  if (email.toLowerCase() !== config.admin.email.toLowerCase() || password !== config.admin.password) {
    return null;
  }

  let adminUser: any = await User.findOne({ email }).select('+passwordHash +isVerified');
  if (!adminUser) {
    adminUser = new User({
      name: 'Vansh Tuteja',
      email,
      passwordHash: password,
      role: 'admin',
      isVerified: true,
    });
    await adminUser.save();
    return adminUser;
  }

  let shouldSave = false;
  if (adminUser.role !== 'admin') {
    adminUser.role = 'admin';
    shouldSave = true;
  }
  if (adminUser.name !== 'Vansh Tuteja') {
    adminUser.name = 'Vansh Tuteja';
    shouldSave = true;
  }
  if (!adminUser.isVerified) {
    adminUser.isVerified = true;
    shouldSave = true;
  }
  const passwordMatches = await adminUser.comparePassword(password);
  if (!passwordMatches) {
    adminUser.passwordHash = password;
    shouldSave = true;
  }

  if (shouldSave) {
    await adminUser.save();
    adminUser = await User.findOne({ email }).select('+passwordHash +isVerified');
  }

  return adminUser;
}

export const login = async (req: Request<{}, ApiResponse, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    logger.debug('Login attempt', { email });

    await ensureDefaultAdmin(email, password);

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+passwordHash +isVerified');
    if (!user) {
      logger.auth('login', undefined, email, false, 'User not found');
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
        data: { code: 'USER_NOT_FOUND' }
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      logger.auth('login', user._id.toString(), email, false, 'Email not verified');
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first.',
        data: { code: 'EMAIL_NOT_VERIFIED' }
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.auth('login', user._id.toString(), email, false, 'Invalid password');
      return res.status(401).json({
        success: false,
        message: 'The password you entered is incorrect.',
        data: { code: 'INVALID_PASSWORD' }
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());
    user.lastLoginAt = now();
    await user.save();

    logger.auth('login', user._id.toString(), email, true);

    return res.json({
      success: true,
      data: {
        user: withProfileCompletion(user),
        token
      },
      message: 'Login successful'
    });
  } catch (error: any) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
    });

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const VALID_ROLES = ['jobseeker', 'employer'] as const;
export type SignupRole = (typeof VALID_ROLES)[number];

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    logger.debug('Signup attempt', { email });

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const roleValue = (role && VALID_ROLES.includes(role as SignupRole)) ? role as SignupRole : 'jobseeker';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
        data: { code: 'USER_ALREADY_EXISTS' }
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    // Save or update user in "pending verification" state
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    const otpResendAvailableAt = new Date(Date.now() + OTP_RESEND_COOLDOWN_MS);

    if (existingUser) {
      existingUser.name = name.trim();
      existingUser.passwordHash = password;
      existingUser.role = roleValue;
      existingUser.otpHash = otpHash;
      existingUser.otpExpiry = otpExpiry;
      existingUser.otpPurpose = 'verify-email';
      existingUser.otpResendAvailableAt = otpResendAvailableAt;
      await existingUser.save();
    } else {
      const user = new User({
        name: name.trim(),
        email,
        passwordHash: password,
        role: roleValue,
        isVerified: false,
        otpHash,
        otpExpiry,
        otpPurpose: 'verify-email',
        otpResendAvailableAt
      });
      await user.save();
    }

    await sendOtpOrFail(email, otp, 'verify-email');

    logger.info('OTP sent successfully', { email });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error: any) {
    logger.error('Signup error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to signup',
      error: error.message
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };

    logger.debug('OTP verification attempt', { email });

    if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string' || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP are required' });
    }

    const otpHash = hashOTP(otp);

    const user = await User.findOne({
      email,
      otpHash,
      otpPurpose: 'verify-email',
      otpExpiry: { $gt: Date.now() }
    }).select('+otpHash +otpExpiry +otpPurpose');

    if (!user) {
      logger.warn('OTP verification failed', { email, reason: 'Invalid OTP' });
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = undefined;
    user.otpResendAvailableAt = undefined;
    await user.save();

    logger.info('OTP verified successfully', { email, userId: user._id });

    const token = generateToken(user._id.toString());

    return res.json({
      success: true,
      data: { user: withProfileCompletion(user), token },
      message: 'OTP verified successfully'
    });
  } catch (error: any) {
    logger.error('Verify OTP error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
    });

    return res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email, purpose } = req.body as { email?: string; purpose?: OtpPurpose };

    logger.debug('Resend OTP attempt', { email, purpose });

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otpPurpose: OtpPurpose = purpose === 'reset-password' ? 'reset-password' : 'verify-email';

    // Do not reveal account existence for reset-password; for verify-email we allow a clearer message.
    const user = await User.findOne({ email }).select('+isVerified +otpResendAvailableAt');
    if (!user) {
      return res.json({ success: true, message: 'If an account with that email exists, we sent a code' });
    }

    if (otpPurpose === 'verify-email' && user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    if (user.otpResendAvailableAt && user.otpResendAvailableAt.getTime() > Date.now()) {
      const retryAfterSeconds = Math.ceil((user.otpResendAvailableAt.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another code',
        data: { retryAfterSeconds }
      });
    }

    const otp = generateOTP();
    user.otpHash = hashOTP(otp);
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    user.otpPurpose = otpPurpose;
    user.otpResendAvailableAt = new Date(Date.now() + OTP_RESEND_COOLDOWN_MS);
    await user.save();

    await sendOtpOrFail(email, otp, otpPurpose);

    return res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error: any) {
    logger.error('Resend OTP error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };

    logger.debug('Password reset request', { email });

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('+otpResendAvailableAt');
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset code'
      });
    }

    if (user.otpResendAvailableAt && user.otpResendAvailableAt.getTime() > Date.now()) {
      const retryAfterSeconds = Math.ceil((user.otpResendAvailableAt.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another code',
        data: { retryAfterSeconds }
      });
    }

    const otp = generateOTP();
    user.otpHash = hashOTP(otp);
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    user.otpPurpose = 'reset-password';
    user.otpResendAvailableAt = new Date(Date.now() + OTP_RESEND_COOLDOWN_MS);
    await user.save();

    await sendOtpOrFail(email, otp, 'reset-password');

    logger.info('Password reset OTP sent', { email, userId: user._id });

    return res.json({
      success: true,
      message: 'Password reset code sent to your email'
    });
  } catch (error: any) {
    logger.error('Forgot password error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to send password reset code',
      error: error.message
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body as { email?: string; otp?: string; newPassword?: string };

    logger.debug('Password reset attempt', { email });

    if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string' || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit code are required' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({
      email,
      otpHash: hashOTP(otp),
      otpPurpose: 'reset-password',
      otpExpiry: { $gt: Date.now() }
    }).select('+otpHash +otpExpiry +otpPurpose +passwordHash');

    if (!user) {
      logger.warn('Password reset failed', { email, reason: 'Invalid or expired OTP' });
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Update password and clear reset fields
    user.passwordHash = newPassword;
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = undefined;
    user.otpResendAvailableAt = undefined;
    await user.save();

    logger.info('Password reset successful', { email, userId: user._id });

    return res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    logger.error('Reset password error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
    });

    return res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      logger.warn('Profile fetch failed - user not found', { userId: req.user?.userId });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.debug('Profile fetched', { userId: user._id });

    return res.json({
      success: true,
      data: withProfileCompletion(user)
    });
  } catch (error: any) {
    logger.error('Get profile error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateProfile = async (req: AuthRequest<{}, ApiResponse, UpdateProfileRequest>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const updates = req.body;

    // Check if email is being updated and if it's already taken
    if (updates.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: userId }
      });
      if (existingUser) {
        logger.warn('Profile update failed - email already taken', {
          userId,
          email: updates.email
        });
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      logger.warn('Profile update failed - user not found', { userId });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('Profile updated', { userId, updatedFields: Object.keys(updates) });

    return res.json({
      success: true,
      data: withProfileCompletion(user),
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    logger.error('Update profile error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    await User.findByIdAndDelete(userId);

    logger.info('Account deleted', { userId });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete account error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
