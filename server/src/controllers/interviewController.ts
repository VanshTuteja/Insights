import { Response } from 'express';
import mongoose from 'mongoose';
import InterviewSession from '../models/InterviewSession';
import { AuthRequest } from '../types';
import logger from '../utils/logger';
import { evaluateInterviewAnswer, generateFinalInterviewReport, generateInterviewQuestion } from '../services/groqService';
import { synthesizeInterviewQuestion } from '../services/ttsService';

const DEFAULT_QUESTION_COUNT = 5;

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

async function getExcludedQuestions(userId: string, role: string, currentQuestions: string[] = []) {
  const previousSessions = await InterviewSession.find({
    userId: new mongoose.Types.ObjectId(userId),
    role,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('questions.question')
    .lean();

  const previousQuestions = previousSessions.flatMap((session) => session.questions.map((item) => item.question));
  return [...previousQuestions, ...currentQuestions];
}

export async function startInterview(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const role = String(req.body.role || '').trim();
    if (!role) {
      return res.status(400).json({ success: false, error: 'Role is required' });
    }

    const excludedQuestions = await getExcludedQuestions(userId, role);
    const question = await generateInterviewQuestion(role, excludedQuestions);
    const audioUrl = await synthesizeInterviewQuestion(question);
    const firstQuestion = {
      question,
      answer: '',
      confidence: 0,
      feedback: '',
      improvements: [],
      scores: {
        clarity: 0,
        technical: 0,
        communication: 0,
      },
      audioUrl: audioUrl || undefined,
      askedAt: new Date(),
    };

    const session = await InterviewSession.create({
      userId: new mongoose.Types.ObjectId(userId),
      role,
      questions: [firstQuestion],
      currentQuestionIndex: 0,
      status: 'in_progress',
      state: 'asking',
      overallScore: 0,
    });

    return res.json({
      success: true,
      data: {
        sessionId: session._id,
        role: session.role,
        state: session.state,
        totalQuestions: DEFAULT_QUESTION_COUNT,
        currentQuestionIndex: session.currentQuestionIndex,
        question: session.questions[0],
      },
    });
  } catch (error: any) {
    logger.error('startInterview', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to start interview' });
  }
}

export async function submitAnswer(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { sessionId, transcript } = req.body as { sessionId?: string; transcript?: string };
    if (!sessionId || typeof transcript !== 'string') {
      return res.status(400).json({ success: false, error: 'sessionId and transcript are required' });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'in_progress',
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Interview session not found' });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      return res.status(400).json({ success: false, error: 'Current question not found' });
    }

    const cleanTranscript = transcript.trim();
    const evaluation = await evaluateInterviewAnswer(cleanTranscript);

    currentQuestion.answer = cleanTranscript;
    currentQuestion.confidence = evaluation.confidence;
    currentQuestion.feedback = evaluation.feedback;
    currentQuestion.improvements = evaluation.improvements;
    currentQuestion.scores = {
      clarity: evaluation.clarity,
      technical: evaluation.technical,
      communication: evaluation.communication,
    };
    currentQuestion.answeredAt = new Date();

    session.state = 'feedback';
    session.overallScore = average(
      session.questions
        .filter((item) => item.answer.trim())
        .map((item) => average([item.confidence, item.scores.clarity, item.scores.technical, item.scores.communication]))
    );

    await session.save();

    return res.json({
      success: true,
      data: {
        sessionId: session._id,
        state: session.state,
        questionIndex: session.currentQuestionIndex,
        evaluation: {
          confidence: currentQuestion.confidence,
          clarity: currentQuestion.scores.clarity,
          technical: currentQuestion.scores.technical,
          communication: currentQuestion.scores.communication,
          feedback: currentQuestion.feedback,
          improvements: currentQuestion.improvements,
        },
        hasMoreQuestions: session.questions.length < DEFAULT_QUESTION_COUNT,
      },
    });
  } catch (error: any) {
    logger.error('submitAnswer', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to evaluate answer' });
  }
}

export async function getNextQuestion(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const sessionId = String(req.query.sessionId || '').trim();
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'in_progress',
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Interview session not found' });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (currentQuestion && !currentQuestion.answer.trim()) {
      return res.status(400).json({ success: false, error: 'Answer the current question before moving on' });
    }

    if (session.questions.length >= DEFAULT_QUESTION_COUNT) {
      return res.status(400).json({ success: false, error: 'Interview question limit reached' });
    }

    const excludedQuestions = await getExcludedQuestions(
      userId,
      session.role,
      session.questions.map((item) => item.question)
    );
    const nextQuestionText = await generateInterviewQuestion(session.role, excludedQuestions);
    const nextQuestionAudio = await synthesizeInterviewQuestion(nextQuestionText);
    const nextQuestion = {
      question: nextQuestionText,
      answer: '',
      confidence: 0,
      feedback: '',
      improvements: [],
      scores: {
        clarity: 0,
        technical: 0,
        communication: 0,
      },
      audioUrl: nextQuestionAudio || undefined,
      askedAt: new Date(),
    };
    session.questions.push(nextQuestion as any);
    session.currentQuestionIndex = session.questions.length - 1;
    session.state = 'asking';
    await session.save();

    return res.json({
      success: true,
      data: {
        sessionId: session._id,
        state: session.state,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: DEFAULT_QUESTION_COUNT,
        question: session.questions[session.currentQuestionIndex],
      },
    });
  } catch (error: any) {
    logger.error('getNextQuestion', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to load next question' });
  }
}

export async function completeInterview(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { sessionId } = req.body as { sessionId?: string };
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Interview session not found' });
    }

    const report = await generateFinalInterviewReport(session.role, session.questions.map((item) => ({
      question: item.question,
      answer: item.answer,
      confidence: item.confidence,
      feedback: item.feedback,
      scores: item.scores,
    })));

    session.report = report;
    session.overallScore = report.overallScore;
    session.status = 'completed';
    session.state = 'completed';
    await session.save();

    return res.json({
      success: true,
      data: {
        sessionId: session._id,
        role: session.role,
        overallScore: session.overallScore,
        report: session.report,
        questions: session.questions,
        createdAt: session.createdAt,
      },
    });
  } catch (error: any) {
    logger.error('completeInterview', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to complete interview' });
  }
}

export async function getResult(req: AuthRequest<{ sessionId: string }>, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!session) {
      return res.status(404).json({ success: false, error: 'Interview session not found' });
    }

    return res.json({ success: true, data: session });
  } catch (error: any) {
    logger.error('getResult', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to get interview result' });
  }
}

export async function getHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const sessions = await InterviewSession.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.json({ success: true, data: sessions });
  } catch (error: any) {
    logger.error('getHistory', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to load interview history' });
  }
}
