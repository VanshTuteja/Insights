import { Response } from 'express';
import User from '../models/Users';
import Job from '../models/Job';
import Application from '../models/Application';
import Interview from '../models/Interview';
import Notification from '../models/Notification';
import { AuthRequest } from '../types';
import logger from '../utils/logger';
import { withProfileCompletion } from '../utils/profileCompletion';

const ACTIVE_WINDOW_HOURS = 24;
const RECENT_LIMIT = 8;

export async function getAdminOverview(req: AuthRequest, res: Response) {
  try {
    const activeSince = new Date(Date.now() - ACTIVE_WINDOW_HOURS * 60 * 60 * 1000);

    const [
      totalJobSeekers,
      totalEmployers,
      totalAdmins,
      recentActiveJobSeekers,
      recentActiveEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      totalInterviews,
      scheduledInterviews,
      recentUsers,
      recentJobs,
      recentApplications,
      recentInterviews,
    ] = await Promise.all([
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'jobseeker', lastLoginAt: { $gte: activeSince } }),
      User.countDocuments({ role: 'employer', lastLoginAt: { $gte: activeSince } }),
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Interview.countDocuments(),
      Interview.countDocuments({ status: 'scheduled' }),
      User.find({})
        .select('name email role company jobTitle location isVerified lastLoginAt createdAt')
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .lean(),
      Job.find({})
        .select('title company location type isActive createdAt')
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .lean(),
      Application.find({})
        .populate('candidateId', 'name email')
        .populate('jobId', 'title company')
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .lean(),
      Interview.find({})
        .populate('candidateId', 'name email')
        .populate('jobId', 'title company')
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .lean(),
    ]);

    return res.json({
      success: true,
      data: {
        stats: {
          totalJobSeekers,
          totalEmployers,
          totalAdmins,
          activeJobSeekers: totalJobSeekers,
          activeEmployers: totalEmployers,
          recentActiveJobSeekers,
          recentActiveEmployers,
          totalJobs,
          activeJobs,
          totalApplications,
          totalInterviews,
          scheduledInterviews,
        },
        recentUsers,
        recentJobs,
        recentApplications,
        recentInterviews,
      },
    });
  } catch (error: any) {
    logger.error('getAdminOverview', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin overview',
    });
  }
}

export async function deleteUserAsAdmin(req: AuthRequest<{ userId: string }>, res: Response) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be deleted from this action' });
    }

    const userJobs = await Job.find({ employerId: userId }).select('_id');
    const userJobIds = userJobs.map((job) => job._id);

    await Promise.all([
      User.findByIdAndDelete(userId),
      Application.deleteMany({ candidateId: userId }),
      Interview.deleteMany({ candidateId: userId }),
      Interview.deleteMany({ interviewerId: userId }),
      Interview.deleteMany({ employerId: userId }),
      Notification.deleteMany({ userId }),
      Job.deleteMany({ employerId: userId }),
      Application.deleteMany({ jobId: { $in: userJobIds } }),
      Interview.deleteMany({ jobId: { $in: userJobIds } }),
      Notification.deleteMany({ jobId: { $in: userJobIds } }),
      User.updateMany(
        {},
        {
          $pull: {
            savedJobs: { $in: userJobIds },
            appliedJobs: { jobId: { $in: userJobIds } },
          },
        },
      ),
    ]);

    return res.json({ success: true, message: 'User profile deleted successfully' });
  } catch (error: any) {
    logger.error('deleteUserAsAdmin', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete user' });
  }
}

export async function deleteJobAsAdmin(req: AuthRequest<{ jobId: string }>, res: Response) {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await Promise.all([
      Job.deleteOne({ _id: jobId }),
      Application.deleteMany({ jobId }),
      Interview.deleteMany({ jobId }),
      Notification.deleteMany({ jobId }),
      User.updateMany({ savedJobs: jobId }, { $pull: { savedJobs: jobId } }),
      User.updateMany({ 'appliedJobs.jobId': jobId }, { $pull: { appliedJobs: { jobId } } }),
    ]);

    return res.json({ success: true, message: 'Job post deleted successfully' });
  } catch (error: any) {
    logger.error('deleteJobAsAdmin', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete job' });
  }
}

export async function getUserProfileAsAdmin(req: AuthRequest<{ userId: string }>, res: Response) {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: withProfileCompletion(user),
    });
  } catch (error: any) {
    logger.error('getUserProfileAsAdmin', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch user profile' });
  }
}
