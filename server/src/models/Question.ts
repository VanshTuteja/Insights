import mongoose, { Schema, Document } from 'mongoose';

export type InterviewCategory =
  | 'Technical'
  | 'Behavioral'
  | 'Leadership'
  | 'Problem Solving'
  | 'System Design'
  | 'HR'
  | 'Combined';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface IQuestion extends Document {
  category: InterviewCategory;
  text: string;
  difficulty: DifficultyLevel;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    category: {
      type: String,
      required: true,
      enum: ['Technical', 'Behavioral', 'Leadership', 'Problem Solving', 'System Design', 'HR', 'Combined'],
    },
    text: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
  },
  { timestamps: true }
);

questionSchema.index({ category: 1, difficulty: 1 });

export default mongoose.model<IQuestion>('Question', questionSchema);
