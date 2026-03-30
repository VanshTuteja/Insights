import mongoose, { Document, Schema } from 'mongoose';

export type InterviewMode = 'idle' | 'asking' | 'listening' | 'processing' | 'feedback' | 'completed';

export interface IInterviewQuestion {
  question: string;
  answer: string;
  confidence: number;
  feedback: string;
  improvements: string[];
  scores: {
    clarity: number;
    technical: number;
    communication: number;
  };
  audioUrl?: string;
  askedAt?: Date;
  answeredAt?: Date;
}

export interface IInterviewReport {
  overallScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
}

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  questions: IInterviewQuestion[];
  currentQuestionIndex: number;
  status: 'in_progress' | 'completed';
  state: InterviewMode;
  overallScore: number;
  report?: IInterviewReport;
  createdAt: Date;
  updatedAt: Date;
}

const interviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: '' },
    confidence: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    improvements: [{ type: String }],
    scores: {
      clarity: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
    },
    audioUrl: { type: String },
    askedAt: { type: Date },
    answeredAt: { type: Date },
  },
  { _id: true }
);

const interviewReportSchema = new Schema<IInterviewReport>(
  {
    overallScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvements: [{ type: String }],
    summary: { type: String, default: '' },
  },
  { _id: false }
);

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true, trim: true },
    questions: [interviewQuestionSchema],
    currentQuestionIndex: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    state: {
      type: String,
      enum: ['idle', 'asking', 'listening', 'processing', 'feedback', 'completed'],
      default: 'idle',
    },
    overallScore: { type: Number, default: 0 },
    report: { type: interviewReportSchema },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IInterviewSession>('InterviewSession', interviewSessionSchema);
