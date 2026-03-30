import { Response } from 'express';
import Job from '../models/Job';
import User from '../models/Users';
import Application from '../models/Application';
import Interview from '../models/Interview';
import { AuthRequest } from '../types';
import type { ApplicationStatus } from '../models/Application';
import { createNotificationForUsers } from './notificationController';

/** POST /applications/apply – Job seeker applies; creates Application doc (source of truth). */
export const applyForJob = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, coverLetter, resume } = req.body as {
      jobId?: string;
      coverLetter?: string;
      resume?: string;
    };

    const userId = req.user?.userId;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'jobId is required',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const existing = await Application.findOne({ jobId, candidateId: userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    const application = await Application.create({
      jobId,
      candidateId: userId,
      status: 'Applied',
      resume: resume || '',
      coverLetter: coverLetter || '',
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        appliedJobs: {
          jobId,
          appliedAt: new Date(),
          status: 'pending',
        },
      },
    });

    if (job.employerId) {
      await createNotificationForUsers(
        [job.employerId],
        'application-update',
        'New application received',
        `A candidate has applied for ${job.title} at ${job.company || 'your company'}.`,
        job._id,
      );
    }

    return res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/** GET /applications/candidate – Job seeker's applications with job + interview date. */
export const getCandidateApplications = async (req: AuthRequest, res: Response) => {
  try {
    const candidateId = req.user?.userId;

    const applications = await Application.find({ candidateId })
      .populate('jobId', 'title company location salary type createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const jobIds = applications.map((a: any) => a.jobId?._id ?? a.jobId).filter(Boolean);
    const interviews = await Interview.find({
      candidateId,
      jobId: { $in: jobIds },
      status: { $in: ['scheduled', 'rescheduled'] },
    })
      .select('jobId scheduledAt meetingLink type notes')
      .lean();

    const interviewByJobId = new Map(
      interviews.map((i) => [(i as any).jobId.toString(), i])
    );

    const list = applications.map((app: any) => {
      const jobId = app.jobId?._id?.toString() ?? app.jobId?.toString();
      const interview = jobId ? interviewByJobId.get(jobId) : null;
      return {
        _id: app._id,
        jobId: app.jobId,
        status: app.status,
        resume: app.resume,
        coverLetter: app.coverLetter,
        appliedDate: app.createdAt,
        interviewDate: interview ? (interview as any).scheduledAt : null,
        meetingLink: interview ? (interview as any).meetingLink : null,
        interviewType: interview ? (interview as any).type : null,
      };
    });

    return res.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/** GET /applications/job/:jobId – Employer lists applicants for a job (from Application model). */
export const getJobApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params as { jobId?: string };
    const userId = req.user?.userId;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'jobId is required',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }
    if (job.employerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job',
      });
    }

    const applications = await Application.find({ jobId })
      .populate('candidateId', 'name email avatar phone bio skills experience education location jobTitle resumeUrl')
      .sort({ createdAt: -1 });

    const candidateIds = applications.map((a) => (a as any).candidateId?._id ?? a.candidateId);
    const interviews = await Interview.find({
      jobId,
      candidateId: { $in: candidateIds },
    })
      .select('candidateId scheduledAt meetingLink type status')
      .lean();

    const interviewsByCandidate = new Map(
      interviews.map((i: any) => [i.candidateId.toString(), i])
    );

    const list = applications.map((app: any) => {
      const cid = app.candidateId?._id?.toString() ?? app.candidateId?.toString();
      const interview = cid ? interviewsByCandidate.get(cid) : null;
      return {
        _id: app._id,
        candidate: app.candidateId,
        status: app.status,
        resume: app.resume,
        coverLetter: app.coverLetter,
        appliedAt: app.createdAt,
        interviewDate: interview ? (interview as any).scheduledAt : null,
        meetingLink: interview ? (interview as any).meetingLink : null,
      };
    });

    return res.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/** GET /applications/employer – All applications for employer's jobs. */
export const getEmployerApplications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const employerJobs = await Job.find({ employerId: userId }).select('_id title company');
    const jobIds = employerJobs.map((j) => j._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company')
      .populate('candidateId', 'name email avatar phone bio skills experience education location')
      .sort({ createdAt: -1 });

    const jobMap = new Map(employerJobs.map((j) => [j._id.toString(), j]));
    const list = applications.map((app: any) => ({
      _id: app._id,
      jobId: app.jobId,
      jobTitle: (app.jobId as any)?.title,
      company: (app.jobId as any)?.company ?? jobMap.get((app.jobId as any)?._id?.toString())?.company,
      candidate: app.candidateId,
      status: app.status,
      resume: app.resume,
      appliedAt: app.createdAt,
    }));

    return res.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const ALLOWED_STATUSES: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Rejected',
  'Hired',
];

/** PATCH /applications/:id/status – Employer updates application status. */
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status?: string };
    const userId = req.user?.userId;

    if (!status || !ALLOWED_STATUSES.includes(status as ApplicationStatus)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const job = application.jobId as any;
    if (!job || job.employerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application',
      });
    }

    application.status = status as ApplicationStatus;
    await application.save();

    if (application.candidateId) {
      await createNotificationForUsers(
        [application.candidateId as any],
        'application-update',
        `Application status updated: ${status}`,
        `Your application for ${job.title} at ${job.company || 'the company'} is now ${status}.`,
        job._id,
      );
    }

    return res.json({
      success: true,
      data: application,
      message: 'Application status updated',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
