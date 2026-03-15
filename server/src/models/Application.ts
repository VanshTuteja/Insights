import mongoose, { Schema } from 'mongoose';

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Rejected'
  | 'Hired';

export interface IApplication extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  resume?: string;
  coverLetter?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate ID is required'],
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Under Review',
        'Shortlisted',
        'Interview Scheduled',
        'Rejected',
        'Hired',
      ],
      default: 'Applied',
    },
    resume: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
  },
  { timestamps: true }
);

applicationSchema.index({ candidateId: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', applicationSchema);
