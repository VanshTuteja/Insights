import mongoose, { Schema } from 'mongoose';
import { IInterview } from '../types';

const interviewSchema = new Schema<IInterview>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate ID is required']
  },
  interviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Interviewer ID is required']
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Interview date and time is required']
  },
  duration: {
    type: Number,
    required: [true, 'Interview duration is required'],
    min: [15, 'Interview duration must be at least 15 minutes'],
    max: [480, 'Interview duration cannot exceed 8 hours']
  },
  type: {
    type: String,
    required: [true, 'Interview type is required'],
    enum: {
      values: ['phone', 'video', 'in-person'],
      message: 'Interview type must be one of: phone, video, in-person'
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  },
  location: {
    type: String,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  meetingLink: {
    type: String,
    maxlength: [500, 'Meeting link cannot exceed 500 characters']
  },
  candidateReminderSent: {
    type: Boolean,
    default: false
  },
  employerReminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
interviewSchema.index({ candidateId: 1, scheduledAt: -1 });
interviewSchema.index({ interviewerId: 1, scheduledAt: -1 });
interviewSchema.index({ jobId: 1 });

export default mongoose.model<IInterview>('Interview', interviewSchema);
