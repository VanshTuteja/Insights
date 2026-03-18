import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job';
import User from '../models/Users';
import Application from '../models/Application';
import { createNotificationForUsers } from './notificationController';
import { AuthRequest, ApiResponse } from '../types';

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
    if (job.tags && job.tags.length > 0) {
      const candidates = await User.find({
        role: 'jobseeker',
        skills: { $in: job.tags },
        _id: { $ne: req.user?.userId } // Don't notify the employer
      });

      if (candidates.length > 0) {
        const candidateIds = candidates.map(c => new mongoose.Types.ObjectId(c._id));
        await createNotificationForUsers(
          candidateIds,
          'job-match',
          `New job match: ${job.title}`,
          `${job.company} is hiring for ${job.title} position. Your skills match this role!`,
          job._id
        );
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