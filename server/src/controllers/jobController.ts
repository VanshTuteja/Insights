import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job';
import User from '../models/Users';
import Application from '../models/Application';
import { createNotificationForUsers } from './notificationController';
import { AuthRequest, ApiResponse } from '../types';
import logger from '../utils/logger';

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function parseSalaryUpperBound(value: string): number | null {
  const normalized = value.toLowerCase().replace(/,/g, '');
  const matches = normalized.match(/\d+(?:\.\d+)?\s*[kmb]?/g);
  if (!matches || matches.length === 0) return null;

  const parsed = matches
    .map((part) => {
      const trimmed = part.trim();
      const suffix = trimmed.slice(-1);
      const numeric = Number(trimmed.replace(/[kmb]$/i, ''));
      if (Number.isNaN(numeric)) return null;

      if (suffix === 'k') return numeric * 1_000;
      if (suffix === 'm') return numeric * 1_000_000;
      if (suffix === 'b') return numeric * 1_000_000_000;
      return numeric;
    })
    .filter((n): n is number => n !== null);

  if (parsed.length === 0) return null;
  return Math.max(...parsed);
}

function hasConfiguredPreference(values?: string[]): boolean {
  return Array.isArray(values) && values.map((v) => String(v).trim()).filter(Boolean).length > 0;
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

    const jobs = await Job.find(query)
      .populate('employerId', 'name company')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
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

    const jobs = await Job.find({ employerId: userId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: jobs,
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
      const normalizedTags = (job.tags || [])
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean);

      const candidates = await User.find({
        role: 'jobseeker',
        _id: { $ne: req.user?.userId },
        'preferences.notifications.jobAlerts': { $ne: false },
      }).select('_id skills preferences');
      console.log("Total Candidates:", candidates.length);

      const normalizedJobLocation = normalizeText(job.location || '');
      const normalizedJobType = normalizeText(job.type || '');
      const searchableJobText = normalizeText(
        `${job.title || ''} ${job.company || ''} ${job.description || ''} ${job.requirements || ''}`
      );
      const jobSalaryUpper = parseSalaryUpperBound(job.salary || '');

      const matchedCandidates = candidates.filter((candidate) => {
        const candidateSkills = (candidate.skills || [])
          .map((skill) => normalizeText(String(skill)))
          .filter(Boolean);

        const skillsMatch =
          normalizedTags.length === 0
            ? true
            : candidateSkills.length > 0 &&
            candidateSkills.some((skill) =>
              normalizedTags.some((tag) =>
                skill.includes(tag) || tag.includes(skill)
              )
            );

        const jobTypes = (candidate.preferences?.jobTypes || [])
          .map((value) => normalizeText(String(value)))
          .filter(Boolean);
        const locations = (candidate.preferences?.locations || [])
          .map((value) => normalizeText(String(value)))
          .filter(Boolean);
        const industries = (candidate.preferences?.industries || [])
          .map((value) => normalizeText(String(value)))
          .filter(Boolean);
        const salaryRange = candidate.preferences?.salaryRange || [];

        const typeConfigured = hasConfiguredPreference(jobTypes);
        const locationConfigured = hasConfiguredPreference(locations);
        const industryConfigured = hasConfiguredPreference(industries);
        const salaryConfigured = Array.isArray(salaryRange) && salaryRange.length === 2;

        const typeMatch = !typeConfigured || jobTypes.includes(normalizedJobType);
        const locationMatch =
          !locationConfigured ||
          locations.some((locationPref) =>
            normalizedJobLocation.includes(locationPref) || locationPref.includes(normalizedJobLocation)
          );
        const industryMatch =
          !industryConfigured ||
          industries.some((industryPref) => searchableJobText.includes(industryPref));
        const salaryMatch =
          !salaryConfigured ||
          jobSalaryUpper === null ||
          jobSalaryUpper >= Number(salaryRange[0] || 0);

        const configuredPreferenceCount = [typeConfigured, locationConfigured, industryConfigured, salaryConfigured]
          .filter(Boolean)
          .length;
        const matchedPreferenceCount = [
          typeConfigured && typeMatch,
          locationConfigured && locationMatch,
          industryConfigured && industryMatch,
          salaryConfigured && salaryMatch,
        ].filter(Boolean).length;
        const preferencesMatch =
          configuredPreferenceCount > 0
            ? matchedPreferenceCount > 0
            : true;

        return preferencesMatch && skillsMatch;
      });
      console.log("Matched Candidates:", matchedCandidates.length);

      if (matchedCandidates.length > 0) {
        const candidateIds = matchedCandidates.map((candidate) => candidate._id as mongoose.Types.ObjectId);
        await createNotificationForUsers(
          candidateIds,
          'job-match',
          `New job match: ${job.title}`,
          `${job.company} is hiring for ${job.title}. This role matches your profile preferences.`,
          job._id
        );
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

    const job = await Job.findOneAndDelete({ _id: id, employerId: userId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized'
      });
    }

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
    });

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