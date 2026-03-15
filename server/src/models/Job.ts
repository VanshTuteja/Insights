import mongoose, { Schema } from 'mongoose';
import { IJob } from '../types';

const jobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    minlength: [50, 'Description must be at least 50 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  salary: {
    type: String,
    required: [true, 'Salary range is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Job type is required'],
    enum: {
      values: ['full-time', 'part-time', 'contract', 'remote', 'hybrid'],
      message: 'Job type must be one of: full-time, part-time, contract, remote, hybrid'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  requirements: {
    type: String,
    required: [true, 'Job requirements are required']
  },
  benefits: {
    type: String,
    required: [true, 'Job benefits are required']
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer ID is required']
  },
  applications: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'interviewed', 'hired', 'rejected'],
      default: 'pending'
    },
    coverLetter: String,
    resume: String
  }],
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', description: 'text', tags: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ createdAt: -1 });

export default mongoose.model<IJob>('Job', jobSchema);