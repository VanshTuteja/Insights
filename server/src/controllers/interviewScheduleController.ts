import { Response } from 'express';
import Interview from '../models/Interview';
import Job from '../models/Job';
import Application from '../models/Application';
import { AuthRequest } from '../types';

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
    } = req.body as {
      jobId?: string;
      candidateId?: string;
      date?: string;
      time?: string;
      type?: 'video' | 'phone' | 'onsite';
      meetingLink?: string;
      notes?: string;
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

    const isoString = new Date(`${date}T${time}`).toISOString();

    const mappedType =
      type === 'onsite' ? 'in-person' : (type as 'video' | 'phone');

    const interview = new Interview({
      jobId,
      candidateId,
      interviewerId: employerId,
      employerId,
      scheduledAt: isoString,
      duration: 60,
      type: mappedType,
      status: 'scheduled',
      notes,
      meetingLink,
    });

    await interview.save();

    await Application.findOneAndUpdate(
      { jobId, candidateId },
      { $set: { status: 'Interview Scheduled' } }
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
    const { status, date, time, meetingLink, notes } = req.body as {
      status?: 'scheduled' | 'cancelled' | 'rescheduled' | 'completed';
      date?: string;
      time?: string;
      meetingLink?: string;
      notes?: string;
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
      if (notes !== undefined) interview.notes = notes;
      if (meetingLink !== undefined) interview.meetingLink = meetingLink;
      if (date && time) {
        interview.scheduledAt = new Date(`${date}T${time}`) as any;
      }
    }
    await interview.save();

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

