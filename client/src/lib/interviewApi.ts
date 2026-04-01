import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type InterviewState = 'idle' | 'asking' | 'listening' | 'processing' | 'feedback' | 'completed';

export interface InterviewQuestion {
  _id?: string;
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
  askedAt?: string;
  answeredAt?: string;
}

export interface AnswerEvaluation {
  confidence: number;
  clarity: number;
  technical: number;
  communication: number;
  feedback: string;
  improvements: string[];
}

export interface InterviewReport {
  overallScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
}

export interface InterviewHistoryItem {
  _id: string;
  role: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  status: 'in_progress' | 'completed';
  state: InterviewState;
  overallScore: number;
  report?: InterviewReport;
  createdAt: string;
  updatedAt: string;
}

export interface StartInterviewResponse {
  sessionId: string;
  role: string;
  state: InterviewState;
  totalQuestions: number;
  currentQuestionIndex: number;
  question: InterviewQuestion;
}

export interface AnswerResponse {
  sessionId: string;
  state: InterviewState;
  questionIndex: number;
  evaluation: AnswerEvaluation;
  hasMoreQuestions: boolean;
}

export interface NextQuestionResponse {
  sessionId: string;
  state: InterviewState;
  currentQuestionIndex: number;
  totalQuestions: number;
  question: InterviewQuestion;
}

export interface CompleteInterviewResponse {
  sessionId: string;
  role: string;
  overallScore: number;
  report: InterviewReport;
  questions: InterviewQuestion[];
  createdAt: string;
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

export interface SessionScores {
  confidence: number;
  clarity: number;
  technical: number;
  communication: number;
}

export const interviewApi = {
  start: async (role: string): Promise<StartInterviewResponse> => {
    const { data } = await axios.post<{ success: boolean; data: StartInterviewResponse }>(
      `${API_BASE}/interview/start`,
      { role }
    );
    if (!data.success) throw new Error('Failed to start interview');
    return data.data;
  },

  answer: async (sessionId: string, transcript: string): Promise<AnswerResponse> => {
    const { data } = await axios.post<{ success: boolean; data: AnswerResponse }>(
      `${API_BASE}/interview/answer`,
      { sessionId, transcript }
    );
    if (!data.success) throw new Error('Failed to evaluate answer');
    return data.data;
  },

  next: async (sessionId: string): Promise<NextQuestionResponse> => {
    const { data } = await axios.get<{ success: boolean; data: NextQuestionResponse }>(
      `${API_BASE}/interview/next`,
      { params: { sessionId } }
    );
    if (!data.success) throw new Error('Failed to load next question');
    return data.data;
  },

  complete: async (sessionId: string): Promise<CompleteInterviewResponse> => {
    const { data } = await axios.post<{ success: boolean; data: CompleteInterviewResponse }>(
      `${API_BASE}/interview/complete`,
      { sessionId }
    );
    if (!data.success) throw new Error('Failed to complete interview');
    return data.data;
  },

  getResult: async (sessionId: string): Promise<InterviewHistoryItem> => {
    const { data } = await axios.get<{ success: boolean; data: InterviewHistoryItem }>(
      `${API_BASE}/interview/result/${sessionId}`
    );
    if (!data.success) throw new Error('Failed to load interview result');
    return data.data;
  },

  getHistory: async (): Promise<InterviewHistoryItem[]> => {
    const { data } = await axios.get<{ success: boolean; data: InterviewHistoryItem[] }>(
      `${API_BASE}/interview/history`
    );
    if (!data.success) throw new Error('Failed to load interview history');
    return data.data;
  },
};
