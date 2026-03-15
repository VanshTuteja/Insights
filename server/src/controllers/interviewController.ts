import { Response } from 'express';
import mongoose from 'mongoose';
import Question from '../models/Question';
import InterviewSession from '../models/InterviewSession';
import { AuthRequest } from '../types';
import { evaluateWithGroq } from '../services/groqService';
import { getFallbackEvaluation } from '../services/fallbackEvaluation';
import { transcribeAudio } from '../services/whisperService';
import { InterviewCategory, DifficultyLevel } from '../models/Question';
import { generateFallbackQuestions } from '../services/fallbackQuestions';
import logger from '../utils/logger';

const QUESTIONS_PER_SESSION = 5;
const WEIGHTS = { relevance: 0.25, communication: 0.2, technicalDepth: 0.2, confidence: 0.15, structure: 0.1, clarity: 0.1 };

function getNoResponseEvaluation() {
  return {
    score: 15,
    strengths: ['Recording was received successfully'],
    improvements: [
      'No spoken answer was detected, so content could not be evaluated',
      'Speak a little louder and keep the microphone closer',
      'Answer the question directly before adding details',
    ],
    feedback:
      'We could not detect enough spoken content in this response to generate a meaningful interview review. Please retry with clearer audio.',
  };
}

function weightedScore(scores: Record<string, number>): number {
  return Math.round(
    (scores.relevance || 0) * WEIGHTS.relevance +
    (scores.communication || 0) * WEIGHTS.communication +
    (scores.technicalDepth || 0) * WEIGHTS.technicalDepth +
    (scores.confidence || 0) * WEIGHTS.confidence +
    (scores.structure || 0) * WEIGHTS.structure +
    (scores.clarity || 0) * WEIGHTS.clarity
  );
}

export async function startInterview(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { category, difficulty = 'intermediate' } = req.body as { category: InterviewCategory; difficulty?: DifficultyLevel };
    if (!category) return res.status(400).json({ error: 'Category is required' });

    const categories: InterviewCategory[] =
      category === 'Combined'
        ? ['Technical', 'Behavioral', 'Leadership', 'Problem Solving', 'System Design', 'HR']
        : [category];

    let questions = await Question.aggregate([
      { $match: { category: { $in: categories }, difficulty: difficulty || 'intermediate' } },
      { $sample: { size: QUESTIONS_PER_SESSION } },
    ]);
    if (questions.length === 0) {
      const fallback = generateFallbackQuestions(category, difficulty || 'intermediate', QUESTIONS_PER_SESSION);
      questions = fallback.map((q) => ({
        _id: q._id,
        text: q.text,
        category: q.category,
        difficulty: q.difficulty,
      })) as any;
    }

    const session = await InterviewSession.create({
      userId: new mongoose.Types.ObjectId(userId),
      category,
      difficulty: difficulty || 'intermediate',
      questions: questions.map((q: any) => ({ questionId: q._id, text: q.text })),
      responses: [],
      status: 'in_progress',
    });
    return res.json({
      success: true,
      data: {
        sessionId: session._id,
        category: session.category,
        difficulty: session.difficulty,
        totalQuestions: session.questions.length,
        question: session.questions[0],
        questionIndex: 0,
      },
    });
  } catch (err: any) {
    logger.error('startInterview', err);
    return res.status(500).json({ error: err.message || 'Failed to start interview' });
  }
}

export async function getQuestion(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { sessionId, questionIndex } = req.query;
    if (!sessionId || questionIndex === undefined) return res.status(400).json({ error: 'sessionId and questionIndex required' });
    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const idx = parseInt(questionIndex as string, 10);
    if (idx < 0 || idx >= session.questions.length) return res.status(404).json({ error: 'Question not found' });
    return res.json({
      success: true,
      data: { question: session.questions[idx], questionIndex: idx, totalQuestions: session.questions.length },
    });
  } catch (err: any) {
    logger.error('getQuestion', err);
    return res.status(500).json({ error: err.message || 'Failed to get question' });
  }
}

export async function uploadResponse(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { sessionId, questionIndex } = req.body;
    const confidenceMetrics = req.body.confidenceMetrics ? JSON.parse(req.body.confidenceMetrics) : undefined;
    const file = (req as any).file;
    if (!sessionId || questionIndex === undefined) return res.status(400).json({ error: 'sessionId and questionIndex required' });
    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const idx = parseInt(questionIndex, 10);
    if (idx < 0 || idx >= session.questions.length) return res.status(400).json({ error: 'Invalid question index' });
    const q = session.questions[idx];
    let transcript = '';
    let usedFallbackEvaluation = false;
    if (file?.buffer) {
      try {
        transcript = await transcribeAudio(file.buffer, file.mimetype);
      } catch (e) {
        logger.warn('Transcription failed, using empty transcript', e);
      }
    } else if (typeof req.body.transcript === 'string') {
      transcript = req.body.transcript;
    }
    const normalizedTranscript = transcript.trim();
    let evaluation = normalizedTranscript
      ? await evaluateWithGroq(q.text, normalizedTranscript, confidenceMetrics)
      : getNoResponseEvaluation();
    if (!evaluation) {
      evaluation = getFallbackEvaluation(session.category as InterviewCategory);
      usedFallbackEvaluation = true;
    }
    const responseRecord = {
      questionId: q.questionId,
      questionText: q.text,
      transcript: normalizedTranscript,
      evaluation: {
        score: evaluation.score,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        feedback: evaluation.feedback || '',
      },
      confidenceMetrics,
    };
    session.responses.push(responseRecord as any);
    const nextIndex = idx + 1;
    if (nextIndex >= session.questions.length) {
      session.status = 'completed';
      const avgScore = session.responses.reduce((s, r) => s + r.evaluation.score, 0) / session.responses.length;
      session.overallScore = Math.round(avgScore);
      const avgConf = session.responses
        .filter((r: any) => r.confidenceMetrics?.confidenceScore != null)
        .reduce((s: number, r: any) => s + (r.confidenceMetrics?.confidenceScore ?? 0), 0);
      const confCount = session.responses.filter((r: any) => r.confidenceMetrics?.confidenceScore != null).length;
      session.confidenceScore = confCount > 0 ? Math.round(avgConf / confCount) : session.overallScore;
      session.scores = {
        relevance: Math.round(avgScore),
        communication: Math.round(avgScore),
        technicalDepth: Math.round(avgScore),
        confidence: session.confidenceScore,
        structure: Math.round(avgScore),
        clarity: Math.round(avgScore),
      };
    }
    await session.save();
    if (nextIndex >= session.questions.length) {
      await InterviewSession.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'completed',
        _id: { $ne: session._id },
      });
    }
    return res.json({
      success: true,
      data: {
        transcript: normalizedTranscript,
        evaluation: responseRecord.evaluation,
        confidenceMetrics: responseRecord.confidenceMetrics,
        nextQuestionIndex: nextIndex >= session.questions.length ? null : nextIndex,
        isComplete: nextIndex >= session.questions.length,
        sessionId: session._id,
        usedFallbackEvaluation,
        transcriptDetected: normalizedTranscript.length > 0,
      },
    });
  } catch (err: any) {
    logger.error('uploadResponse', err);
    return res.status(500).json({ error: err.message || 'Failed to process response' });
  }
}

export async function evaluateOnly(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { sessionId, questionIndex, transcript } = req.body;
    if (!sessionId || questionIndex === undefined || transcript === undefined) {
      return res.status(400).json({ error: 'sessionId, questionIndex, and transcript required' });
    }
    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const idx = parseInt(questionIndex, 10);
    if (idx < 0 || idx >= session.questions.length) return res.status(400).json({ error: 'Invalid question index' });
    const q = session.questions[idx];
    const normalizedTranscript = String(transcript).trim();
    let evaluation = normalizedTranscript
      ? await evaluateWithGroq(q.text, normalizedTranscript)
      : getNoResponseEvaluation();
    if (!evaluation) evaluation = getFallbackEvaluation(session.category as InterviewCategory);
    return res.json({ success: true, data: { evaluation } });
  } catch (err: any) {
    logger.error('evaluateOnly', err);
    return res.status(500).json({ error: err.message || 'Failed to evaluate' });
  }
}

export async function getResult(req: AuthRequest<{ sessionId: string }>, res: Response) {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;
    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json({ success: true, data: session });
  } catch (err: any) {
    logger.error('getResult', err);
    return res.status(500).json({ error: err.message || 'Failed to get result' });
  }
}

export async function getHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const sessions = await InterviewSession.find({ userId: new mongoose.Types.ObjectId(userId), status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(1)
      .select('category difficulty overallScore confidenceScore status createdAt questions')
      .lean();
    return res.json({ success: true, data: sessions });
  } catch (err: any) {
    logger.error('getHistory', err);
    return res.status(500).json({ error: err.message || 'Failed to get history' });
  }
}
