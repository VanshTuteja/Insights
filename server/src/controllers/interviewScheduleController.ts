import { Response } from 'express';
import Interview from '../models/Interview';
import Job from '../models/Job';
import Application from '../models/Application';
import User from '../models/Users';
import { AuthRequest } from '../types';
import { createNotificationForUsers } from './notificationController';

export const scheduleInterview = async (req: AuthRequest, res: Response) => {
  try {
    const {
      jobId,
      candidateId,
      date,
      time,
      type,
      meetingLink,
      notes,
      duration,
    } = req.body as {
      jobId?: string;
      candidateId?: string;
      date?: string;
      time?: string;
      type?: 'video' | 'phone' | 'onsite' | 'in-person';
      meetingLink?: string;
      notes?: string;
      duration?: number;
    };

    const employerId = req.user?.userId;

    if (!jobId || !candidateId || !date || !time || !type) {
      return res.status(400).json({
        success: false,
        message: 'jobId, candidateId, date, time and type are required',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.employerId.toString() !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule interviews for this job',
      });
    }

    const candidate = await User.findById(candidateId).select('_id name email');
    if (!candidate || candidate.role !== 'jobseeker') {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    const application = await Application.findOne({ jobId, candidateId });
    if (!application) {
      return res.status(400).json({
        success: false,
        message: 'This candidate has not applied to the selected job',
      });
    }

    const scheduledAt = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduledAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid interview date and time',
      });
    }

    const mappedType = type === 'onsite' || type === 'in-person' ? 'in-person' : (type as 'video' | 'phone');
    const trimmedMeetingValue = typeof meetingLink === 'string' ? meetingLink.trim() : '';
    const normalizedDuration =
      typeof duration === 'number' && Number.isFinite(duration)
        ? Math.min(480, Math.max(15, duration))
        : 60;

    if ((mappedType === 'video' || mappedType === 'phone') && !trimmedMeetingValue) {
      return res.status(400).json({
        success: false,
        message: mappedType === 'video' ? 'Meeting link is required for video interviews' : 'Phone or meeting details are required for phone interviews',
      });
    }

    const interview = new Interview({
      jobId,
      candidateId,
      interviewerId: employerId,
      employerId,
      scheduledAt,
      duration: normalizedDuration,
      type: mappedType,
      status: 'scheduled',
      notes: notes?.trim(),
      meetingLink: mappedType === 'in-person' ? undefined : trimmedMeetingValue || undefined,
      location: mappedType === 'in-person' ? trimmedMeetingValue || job.location : undefined,
    });

    await interview.save();

    await Application.findOneAndUpdate(
      { _id: application._id },
      { $set: { status: 'Interview Scheduled' } }
    );

    await createNotificationForUsers(
      [interview.candidateId as any],
      'interview-scheduled',
      'Interview scheduled',
      `Your interview for ${job.title} at ${job.company || 'the company'} has been scheduled on ${scheduledAt.toLocaleString()}.`,
      job._id
    );

    const populated = await Interview.findById(interview._id)
      .populate('jobId', 'title company location')
      .populate('candidateId', 'name email')
      .populate('interviewerId', 'name email');

    return res.status(201).json({
      success: true,
      data: populated,
      message: 'Interview scheduled successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getCandidateInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const candidateId = req.user?.userId;

    const interviews = await Interview.find({ candidateId })
      .sort({ scheduledAt: -1 })
      .populate('jobId', 'title company location')
      .populate('interviewerId', 'name email');

    return res.json({
      success: true,
      data: interviews,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getEmployerInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const employerId = req.user?.userId;

    const interviews = await Interview.find({ interviewerId: employerId })
      .sort({ scheduledAt: -1 })
      .populate('jobId', 'title company location')
      .populate('candidateId', 'name email');

    return res.json({
      success: true,
      data: interviews,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/** PATCH /interviews/:id – Employer: full update. Candidate: can only set status to 'cancelled'. */
export const updateInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status, date, time, meetingLink, notes, type, duration } = req.body as {
      status?: 'scheduled' | 'cancelled' | 'rescheduled' | 'completed';
      date?: string;
      time?: string;
      meetingLink?: string;
      notes?: string;
      type?: 'video' | 'phone' | 'onsite' | 'in-person';
      duration?: number;
    };
    const userId = req.user?.userId;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }
    const isEmployer =
      interview.interviewerId.toString() === userId ||
      interview.employerId?.toString() === userId;
    const isCandidate = interview.candidateId.toString() === userId;
    if (!isEmployer && !isCandidate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this interview',
      });
    }

    if (isCandidate) {
      if (status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Candidates can only cancel the interview',
        });
      }
      interview.status = 'cancelled';
    } else {
      if (status) interview.status = status;
      if (typeof duration === 'number' && Number.isFinite(duration)) {
        interview.duration = Math.min(480, Math.max(15, duration));
      }
      if (notes !== undefined) interview.notes = notes.trim();
      if (type) {
        interview.type = type === 'onsite' || type === 'in-person' ? 'in-person' : type;
      }
      if (meetingLink !== undefined) {
        const trimmedMeetingValue = meetingLink.trim();
        if (interview.type === 'in-person') {
          interview.location = trimmedMeetingValue || interview.location;
          interview.meetingLink = undefined;
        } else {
          interview.meetingLink = trimmedMeetingValue || undefined;
        }
      }
      if (date && time) {
        const scheduledAt = new Date(`${date}T${time}`);
        if (Number.isNaN(scheduledAt.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Please select a valid interview date and time',
          });
        }
        interview.scheduledAt = scheduledAt as any;
      }
    }
    await interview.save();

    const relatedJob = await Job.findById(interview.jobId).select('title company');
    const updateTitle = interview.status === 'cancelled' ? 'Interview cancelled' : 'Interview updated';
    const updateDescription =
      interview.status === 'cancelled'
        ? `Your interview for ${relatedJob?.title || 'this job'} has been cancelled.`
        : `Your interview for ${relatedJob?.title || 'this job'} is now ${interview.status} and scheduled for ${new Date(interview.scheduledAt).toLocaleString()}.`;

    await createNotificationForUsers(
      [interview.candidateId as any],
      'interview-scheduled',
      updateTitle,
      updateDescription,
      interview.jobId as any
    );

    const populated = await Interview.findById(interview._id)
      .populate('jobId', 'title company location')
      .populate('candidateId', 'name email')
      .populate('interviewerId', 'name email');

    return res.json({
      success: true,
      data: populated,
      message: 'Interview updated',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

