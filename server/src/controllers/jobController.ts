import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job';
import User from '../models/Users';
import Application from '../models/Application';
import Interview from '../models/Interview';
import Notification from '../models/Notification';
import { createNotificationForUsers } from './notificationController';
import { AuthRequest, ApiResponse } from '../types';
import logger from '../utils/logger';
import { fetchAdzunaJobs } from '../services/adzunaService';
import { calculateJobMatchScore, MATCH_THRESHOLD } from '../utils/jobMatching';
import emailService from '../utils/emailService';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parsePositiveInt(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export const getJobs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      type,
      salary,
      tags,
    } = req.query;

    const query: any = { isActive: true };
    const requestedPage = parsePositiveInt(page, DEFAULT_PAGE);
    const requestedLimit = Math.min(parsePositiveInt(limit, DEFAULT_LIMIT), MAX_LIMIT);
    const offset = (requestedPage - 1) * requestedLimit;

    // Search functionality (text index)
    if (search) {
      query.$text = { $search: search as string };
    }

    // Location filter
    if (location) {
      query.location = { $regex: location as string, $options: 'i' };
    }

    // Job type filter
    if (type) {
      query.type = type;
    }

    // Salary filter: regex on salary string (e.g. "100k", "120k - 150k")
    if (salary) {
      query.salary = { $regex: (salary as string).replace(/\s/g, '\\s*'), $options: 'i' };
    }

    // Tags / skills filter
    if (tags) {
      const tagArray = (tags as string).split(',').map((t) => t.trim()).filter(Boolean);
      query.tags = { $in: tagArray };
    }

    const localTotal = await Job.countDocuments(query);
    const localSkip = Math.min(offset, localTotal);
    const localLimit = Math.max(0, Math.min(requestedLimit, localTotal - localSkip));

    const localJobs = localLimit > 0
      ? await Job.find(query)
          .populate('employerId', 'name company')
          .sort({ createdAt: -1 })
          .skip(localSkip)
          .limit(localLimit)
          .lean()
      : [];

    const externalOffset = Math.max(0, offset - localTotal);
    const externalLimitNeeded = Math.max(0, requestedLimit - localJobs.length);
    const externalPage = externalLimitNeeded > 0
      ? Math.floor(externalOffset / requestedLimit) + 1
      : 1;
    const externalOffsetInWindow = externalLimitNeeded > 0 ? externalOffset % requestedLimit : 0;

    let externalJobs: any[] = [];
    let externalTotal = 0;

    if (externalLimitNeeded > 0) {
      try {
      const [firstExternal, secondExternal] = await Promise.all([
        fetchAdzunaJobs({
          search: search as string | undefined,
          location: location as string | undefined,
          type: type as string | undefined,
          salary: salary as string | undefined,
          page: externalPage,
          limit: requestedLimit,
        }),
        fetchAdzunaJobs({
          search: search as string | undefined,
          location: location as string | undefined,
          type: type as string | undefined,
          salary: salary as string | undefined,
          page: externalPage + 1,
          limit: requestedLimit,
        }),
      ]);

      externalTotal = firstExternal.total;
      externalJobs = [...firstExternal.jobs, ...secondExternal.jobs];
      externalJobs = externalJobs.slice(externalOffsetInWindow, externalOffsetInWindow + externalLimitNeeded);
    } catch (externalError: any) {
      logger.warn('External job fetch failed', { error: externalError.message });
    }
    }

    let personalizedUser = null;
    if ((req as AuthRequest).user?.userId && (req as AuthRequest).user?.role === 'jobseeker') {
      personalizedUser = await User.findById((req as AuthRequest).user?.userId)
        .select('skills jobTitle preferences')
        .lean();
    }

    const combinedJobs = [...localJobs, ...externalJobs].map((job: any) => {
      if (!personalizedUser || job?.isExternal) return job;
      return {
        ...job,
        matchScore: calculateJobMatchScore(personalizedUser as any, job),
      };
    });
    const total = localTotal + externalTotal;

    res.json({
      success: true,
      data: {
        jobs: combinedJobs,
        pagination: {
          page: requestedPage,
          limit: requestedLimit,
          total,
          pages: Math.ceil(total / requestedLimit)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getEmployerJobs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const requestedPage = parsePositiveInt(req.query.page, DEFAULT_PAGE);
    const requestedLimit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const skip = (requestedPage - 1) * requestedLimit;

    const jobs = await Job.find({ employerId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(requestedLimit)
      .lean();
    const total = await Job.countDocuments({ employerId: userId });

    return res.json({
      success: true,
      data: jobs,
      pagination: {
        page: requestedPage,
        limit: requestedLimit,
        total,
        pages: Math.ceil(total / requestedLimit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('employerId', 'name company avatar')
      .populate('applications.userId', 'name email avatar');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    return res.json({
      success: true,
      data: job
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobData = {
      ...req.body,
      employerId: req.user?.userId
    };

    const job = new Job(jobData);
    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('employerId', 'name company');

    // Create notifications for candidate matches
    {
      const candidates = await User.find({
        role: 'jobseeker',
        _id: { $ne: req.user?.userId },
        'preferences.notifications.jobAlerts': { $ne: false },
      }).select('_id name email skills jobTitle preferences');

      const matchedCandidates = candidates.filter((candidate) => {
        const matchScore = calculateJobMatchScore(candidate as any, job.toObject());
        return matchScore >= MATCH_THRESHOLD;
      });

      if (matchedCandidates.length > 0) {
        const candidateIds = matchedCandidates.map((candidate) => candidate._id as mongoose.Types.ObjectId);
        await createNotificationForUsers(
          candidateIds,
          'job-match',
          `New job match: ${job.title}`,
          `${job.company} is hiring for ${job.title}. This role matches your profile preferences by ${MATCH_THRESHOLD}% or more.`,
          job._id
        );
        if (emailService.isConfigured()) {
          await Promise.allSettled(
            matchedCandidates.map((candidate: any) =>
              emailService.sendJobMatchAlert(candidate.email, candidate.name || 'there', {
                title: job.title,
                company: job.company || 'Company',
                location: job.location,
                type: job.type,
                salary: job.salary,
              }),
            ),
          );
        }
        logger.info(`Job "${job.title}" created. Matched ${matchedCandidates.length} candidates.`);
      }
    }

    res.status(201).json({
      success: true,
      data: populatedJob,
      message: 'Job created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.userId;

    const job = await Job.findOne({ _id: id, employerId: userId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('employerId', 'name company');

    return res.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };;
    const userId = req.user?.userId;

    const job = await Job.findOne({ _id: id, employerId: userId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

    await Promise.all([
      Job.deleteOne({ _id: id, employerId: userId }),
      Application.deleteMany({ jobId: id }),
      Interview.deleteMany({ jobId: id }),
      Notification.deleteMany({ jobId: id }),
      User.updateMany(
        { savedJobs: id },
        { $pull: { savedJobs: id } }
      ),
      User.updateMany(
        { 'appliedJobs.jobId': id },
        { $pull: { appliedJobs: { jobId: id } } }
      ),
    ]);

    return res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const applyToJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.userId;
    const { coverLetter, resume } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const existingApp = await Application.findOne({ jobId: id, candidateId: userId });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    await Application.create({
      jobId: id,
      candidateId: userId,
      status: 'Applied',
      resume: resume || '',
      coverLetter: coverLetter || '',
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        appliedJobs: {
          jobId: id,
          appliedAt: new Date(),
          status: 'pending'
        }
      }
    });

    if (job.employerId) {
      await createNotificationForUsers(
        [job.employerId],
        'application-update',
        'New application received',
        `A candidate has applied for ${job.title} at ${job.company || 'your company'}.`,
        job._id
      );
    }

    return res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const saveJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };;
    const userId = req.user?.userId;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isAlreadySaved = user.savedJobs.some((jobId) => jobId.toString() === id);

    if (isAlreadySaved) {
      // Remove from saved jobs
      user.savedJobs = user.savedJobs.filter(jobId => jobId.toString() !== id);
      await user.save();

      return res.json({
        success: true,
        message: 'Job removed from saved jobs'
      });
    } else {
      // Add to saved jobs
      user.savedJobs.push(id);
      await user.save();

      return res.json({
        success: true,
        message: 'Job saved successfully'
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getSavedJobs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).populate({
      path: 'savedJobs',
      populate: {
        path: 'employerId',
        select: 'name company'
      }
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: user.savedJobs
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
