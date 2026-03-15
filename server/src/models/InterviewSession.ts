import mongoose, { Schema, Document } from 'mongoose';
import { InterviewCategory, DifficultyLevel } from './Question';

export interface IEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

export interface IConfidenceMetrics {
  eyeContact: number;
  smiling: number;
  headMovement: number;
  attentionLevel: number;
  confidenceScore: number;
  speechPace?: number;
  engagementLevel?: number;
}

export interface IResponseRecord {
  questionId: mongoose.Types.ObjectId;
  questionText: string;
  transcript: string;
  evaluation: IEvaluation;
  confidenceMetrics?: IConfidenceMetrics;
  videoUrl?: string;
  audioUrl?: string;
}

export interface ISessionScores {
  relevance: number;
  communication: number;
  technicalDepth: number;
  confidence: number;
  structure: number;
  clarity: number;
}

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  category: InterviewCategory;
  difficulty: DifficultyLevel;
  questions: Array<{ questionId: mongoose.Types.ObjectId; text: string }>;
  responses: IResponseRecord[];
  scores: ISessionScores;
  overallScore: number;
  confidenceScore: number;
  status: 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const evaluationSchema = new Schema(
  {
    score: { type: Number, required: true },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const confidenceMetricsSchema = new Schema(
  {
    eyeContact: { type: Number, default: 0 },
    smiling: { type: Number, default: 0 },
    headMovement: { type: Number, default: 0 },
    attentionLevel: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    speechPace: { type: Number },
    engagementLevel: { type: Number },
  },
  { _id: false }
);

const responseRecordSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    questionText: { type: String, required: true },
    transcript: { type: String, default: '' },
    evaluation: { type: evaluationSchema, required: true },
    confidenceMetrics: { type: confidenceMetricsSchema },
    videoUrl: { type: String },
    audioUrl: { type: String },
  },
  { _id: true }
);

const sessionScoresSchema = new Schema(
  {
    relevance: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    technicalDepth: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    structure: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
  },
  { _id: false }
);

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      required: true,
      enum: ['Technical', 'Behavioral', 'Leadership', 'Problem Solving', 'System Design', 'HR', 'Combined'],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
        text: { type: String },
      },
    ],
    responses: [responseRecordSchema],
    scores: { type: sessionScoresSchema, default: () => ({}) },
    overallScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IInterviewSession>('InterviewSession', interviewSessionSchema);
