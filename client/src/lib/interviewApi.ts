import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type InterviewCategory =
  | 'Technical'
  | 'Behavioral'
  | 'Leadership'
  | 'Problem Solving'
  | 'System Design'
  | 'HR'
  | 'Combined';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface QuestionItem {
  questionId: string;
  text: string;
}

export interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

export interface ConfidenceMetrics {
  eyeContact?: number;
  smiling?: number;
  headMovement?: number;
  attentionLevel?: number;
  confidenceScore?: number;
  speechPace?: number;
  engagementLevel?: number;
}

export interface StartInterviewResponse {
  sessionId: string;
  category: InterviewCategory;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  question: QuestionItem;
  questionIndex: number;
}

export interface UploadResponsePayload {
  sessionId: string;
  questionIndex: number;
  confidenceMetrics?: ConfidenceMetrics;
}

export interface UploadResponseResult {
  transcript: string;
  evaluation: Evaluation;
  confidenceMetrics?: ConfidenceMetrics;
  nextQuestionIndex: number | null;
  isComplete: boolean;
  sessionId: string;
  usedFallbackEvaluation?: boolean;
  transcriptDetected?: boolean;
}

export interface SessionScores {
  relevance: number;
  communication: number;
  technicalDepth: number;
  confidence: number;
  structure: number;
  clarity: number;
}

export interface ResponseRecord {
  questionId: string;
  questionText: string;
  transcript: string;
  evaluation: Evaluation;
  confidenceMetrics?: ConfidenceMetrics;
}

export interface InterviewSessionResult {
  _id: string;
  userId: string;
  category: InterviewCategory;
  difficulty: DifficultyLevel;
  questions: Array<{ questionId: string; text: string }>;
  responses: ResponseRecord[];
  scores: SessionScores;
  overallScore: number;
  confidenceScore: number;
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export const interviewApi = {
  start: async (category: InterviewCategory, difficulty: DifficultyLevel = 'intermediate'): Promise<StartInterviewResponse> => {
    const { data } = await axios.post<{ success: boolean; data: StartInterviewResponse }>(
      `${API_BASE}/interview/start`,
      { category, difficulty }
    );
    if (!data.success) throw new Error('Failed to start interview');
    return data.data;
  },

  getQuestion: async (sessionId: string, questionIndex: number) => {
    const { data } = await axios.get<{ success: boolean; data: { question: QuestionItem; questionIndex: number; totalQuestions: number } }>(
      `${API_BASE}/interview/question`,
      { params: { sessionId, questionIndex } }
    );
    if (!data.success) throw new Error('Failed to get question');
    return data.data;
  },

  uploadResponse: async (
    sessionId: string,
    questionIndex: number,
    audioBlob: Blob,
    confidenceMetrics?: ConfidenceMetrics
  ): Promise<UploadResponseResult> => {
    const form = new FormData();
    form.append('audio', audioBlob, 'recording.webm');
    form.append('sessionId', sessionId);
    form.append('questionIndex', String(questionIndex));
    if (confidenceMetrics) form.append('confidenceMetrics', JSON.stringify(confidenceMetrics));
    const { data } = await axios.post<{ success: boolean; data: UploadResponseResult }>(
      `${API_BASE}/interview/upload-response`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }
    );
    if (!data.success) throw new Error('Failed to upload response');
    return data.data;
  },

  getResult: async (sessionId: string): Promise<InterviewSessionResult> => {
    const { data } = await axios.get<{ success: boolean; data: InterviewSessionResult }>(
      `${API_BASE}/interview/result/${sessionId}`
    );
    if (!data.success) throw new Error('Failed to get result');
    return data.data;
  },

  getHistory: async (): Promise<InterviewSessionResult[]> => {
    const { data } = await axios.get<{ success: boolean; data: InterviewSessionResult[] }>(
      `${API_BASE}/interview/history`
    );
    if (!data.success) throw new Error('Failed to get history');
    return data.data;
  },
};
