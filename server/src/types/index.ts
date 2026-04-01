import mongoose, { Document } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'jobseeker' | 'employer' | 'admin';
  avatar?: string;
  resumeUrl?: string;
  resumes: Array<{
    title?: string;
    template?: string;
    source: 'upload' | 'builder' | 'improvement';
    content: string;
    sections?: {
      summary?: string;
      experience?: string[];
      projects?: string[];
      skills?: string[];
      education?: string[];
    };
    analysis?: {
      atsScore?: number;
      strengths?: string[];
      weaknesses?: string[];
      missingKeywords?: string[];
      suggestions?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
  }>;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  jobTitle?: string;
  company?: string;
  companySize?: string;
  industry?: string;
  experience?: string;
  education?: string;
  skills: string[];
  preferences: {
    preferredRoles: string[];
    jobTypes: ('full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid')[];
    salaryRange: number[];
    locations: string[];
    industries: string[];
    notifications: {
      email: boolean;
      push: boolean;
      jobAlerts: boolean;
      messages: boolean;
    };
    privacy: {
      profileVisible: boolean;
      showSalary: boolean;
      showContact: boolean;
    };
  };
  isVerified: boolean;
  lastLoginAt?: Date;

  otpHash?: string;
  otpExpiry?: Date;
  otpPurpose?: 'verify-email' | 'reset-password';
  otpResendAvailableAt?: Date;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  savedJobs: string[];
  appliedJobs: Array<{
    jobId: string;
    appliedAt: Date;
    status: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  }>;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  tags: string[];
  requirements: string;
  benefits: string;
  employerId: mongoose.Types.ObjectId;
  applications: Array<{
    userId: string;
    appliedAt: Date;
    status: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
    coverLetter?: string;
    resume?: string;
  }>;
  views: number;
  isActive: boolean;
  matchScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterview extends Document {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  interviewerId: mongoose.Types.ObjectId;
  employerId?: mongoose.Types.ObjectId; // same as interviewer for recruiter
  scheduledAt: Date;
  duration: number;
  type: 'phone' | 'video' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  location?: string;
  meetingLink?: string;
  candidateReminderSent: boolean;
  employerReminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Rejected'
  | 'Hired';

export interface AuthRequest<
  P = {},
  Res = any,
  Req = any
> extends Request<P, Res, Req> {
  user?: {
    userId: string;
    email: string;
    role: 'jobseeker' | 'employer' | 'admin';
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: IUser['role'];
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  role?: IUser['role'];
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  jobTitle?: string;
  company?: string;
  companySize?: string;
  industry?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  preferences?: IUser['preferences'];
}
