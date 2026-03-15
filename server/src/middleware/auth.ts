import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/Users';
import { AuthRequest } from '../types';
import config from '../config/index';
import logger from '../utils/logger';
import { getProfileCompletion } from '../utils/profileCompletion';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];
    const token = tokenFromHeader || req.cookies.token; // support cookie token too

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    const user = await User.findById(decoded.userId).select('email role');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as 'jobseeker' | 'employer' | 'admin',
    };
    return next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/** Restrict access to specific roles. Use after authenticateToken. */
export const requireRole = (...allowedRoles: Array<'jobseeker' | 'employer' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of: ${allowedRoles.join(', ')}`,
      });
    }
    return next();
  };
};

/** @deprecated Use requireRole instead. */
export const authorize = (...roles: string[]) => {
  return requireRole(...(roles as Array<'jobseeker' | 'employer' | 'admin'>));
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: "7d" }); //config.jwt.expiresIn
};

export const requireCompletedProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { profileCompleted, missingProfileFields } = getProfileCompletion(user.toJSON());
    if (!profileCompleted) {
      return res.status(403).json({
        success: false,
        message: 'Complete your profile before continuing',
        data: {
          code: 'PROFILE_INCOMPLETE',
          missingProfileFields,
        },
      });
    }

    return next();
  } catch (error) {
    logger.error('Profile completion check failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate profile completion',
    });
  }
};
