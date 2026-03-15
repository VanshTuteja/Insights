import Groq from 'groq-sdk';
import config from '../config';
import logger from '../utils/logger';
import { IConfidenceMetrics } from '../models/InterviewSession';

export interface EvaluationResult {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

const SYSTEM_PROMPT = `You are an expert interview coach. Evaluate the candidate's answer and return ONLY valid JSON with no markdown or extra text.
Use this exact structure:
{"score": <number 0-100>, "strengths": ["string","string"], "improvements": ["string","string"], "feedback": "string"}

Score based on: relevance (25%), clarity (10%), technical depth (20%), communication (20%), structure (10%), confidence (15%).
Return only the JSON object.`;

export async function evaluateWithGroq(
  question: string,
  transcript: string,
  confidenceMetrics?: Partial<IConfidenceMetrics>
): Promise<EvaluationResult | null> {
  if (!config.groq.apiKey) {
    logger.warn('GROQ_API_KEY not set, skipping AI evaluation');
    return null;
  }
  try {
    const client = new Groq({ apiKey: config.groq.apiKey });
    const visualSignals = confidenceMetrics
      ? `\n\nVideo confidence signals: ${JSON.stringify(confidenceMetrics)}`
      : '';
    const userContent = `Question: ${question}\n\nAnswer: ${transcript || '(No answer provided)'}${visualSignals}`;
    const completion = await client.chat.completions.create({
      model: config.groq.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });
    const text = completion.choices[0]?.message?.content?.trim() || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonStr) as EvaluationResult;
    if (typeof parsed.score !== 'number') parsed.score = Math.min(100, Math.max(0, Number(parsed.score) || 70));
    if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
    if (!Array.isArray(parsed.improvements)) parsed.improvements = [];
    if (typeof parsed.feedback !== 'string') parsed.feedback = '';
    return parsed;
  } catch (err) {
    logger.error('Groq evaluation failed', err);
    return null;
  }
}
