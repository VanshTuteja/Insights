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

export interface ResumeImprovePayload {
  roleLabel: string;
  jobDescription?: string;
  resume: {
    personal: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      headline?: string;
      linkedin?: string;
      portfolio?: string;
    };
    summary?: string;
    skills?: string[];
    technicalSkills?: string;
    tools?: string[];
    achievements?: string[];
    keywordBlock?: string;
    experience?: Array<{
      title?: string;
      company?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      bullets?: string;
    }>;
    projects?: Array<{
      name?: string;
      techStack?: string;
      bullets?: string;
    }>;
    education?: Array<{
      school?: string;
      degree?: string;
      year?: string;
    }>;
    certifications?: Array<{
      name?: string;
      issuer?: string;
      year?: string;
    }>;
  };
}

export interface ResumeImproveResult {
  headline: string;
  summary: string;
  skills: string[];
  technicalSkills: string;
  tools: string[];
  achievements: string[];
  keywordBlock: string;
  experience: Array<{ bullets: string[] }>;
  projects: Array<{ bullets: string[] }>;
}

const SYSTEM_PROMPT = `You are an expert interview coach. Evaluate the candidate's answer and return ONLY valid JSON with no markdown or extra text.
Use this exact structure:
{"score": <number 0-100>, "strengths": ["string","string"], "improvements": ["string","string"], "feedback": "string"}

Score based on: relevance (25%), clarity (10%), technical depth (20%), communication (20%), structure (10%), confidence (15%).
Return only the JSON object.`;

const RESUME_SYSTEM_PROMPT = `You are an expert resume writer and ATS optimization coach.
Rewrite the provided resume details into stronger, more professional, role-targeted content.
Preserve the candidate's truth and intent. Do not invent companies, dates, degrees, or certifications that are not already present.
You may strengthen wording, improve clarity, add ATS-friendly phrasing, and rewrite bullets so they sound professional and measurable.
Return ONLY valid JSON using this exact structure:
{
  "headline": "string",
  "summary": "string",
  "skills": ["string"],
  "technicalSkills": "string",
  "tools": ["string"],
  "achievements": ["string"],
  "keywordBlock": "comma, separated, keywords",
  "experience": [{"bullets": ["string"]}],
  "projects": [{"bullets": ["string"]}]
}`;

function ensureGroqClient(): Groq | null {
  if (!config.groq.apiKey) {
    logger.warn('GROQ_API_KEY not set, skipping AI request');
    return null;
  }
  return new Groq({ apiKey: config.groq.apiKey });
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : trimmed;
}

export async function evaluateWithGroq(
  question: string,
  transcript: string,
  confidenceMetrics?: Partial<IConfidenceMetrics>
): Promise<EvaluationResult | null> {
  const client = ensureGroqClient();
  if (!client) return null;
  try {
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
    const jsonStr = extractJsonObject(text);
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

export async function improveResumeWithGroq(payload: ResumeImprovePayload): Promise<ResumeImproveResult | null> {
  const client = ensureGroqClient();
  if (!client) return null;

  try {
    const completion = await client.chat.completions.create({
      model: config.groq.model,
      messages: [
        { role: 'system', content: RESUME_SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify(payload),
        },
      ],
      temperature: 0.4,
      max_tokens: 1800,
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(extractJsonObject(text)) as Partial<ResumeImproveResult>;

    return {
      headline: typeof parsed.headline === 'string' ? parsed.headline.trim() : '',
      summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
      skills: Array.isArray(parsed.skills) ? parsed.skills.map((item) => String(item).trim()).filter(Boolean) : [],
      technicalSkills: typeof parsed.technicalSkills === 'string' ? parsed.technicalSkills.trim() : '',
      tools: Array.isArray(parsed.tools) ? parsed.tools.map((item) => String(item).trim()).filter(Boolean) : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements.map((item) => String(item).trim()).filter(Boolean) : [],
      keywordBlock: typeof parsed.keywordBlock === 'string' ? parsed.keywordBlock.trim() : '',
      experience: Array.isArray(parsed.experience)
        ? parsed.experience.map((entry) => ({
            bullets: Array.isArray(entry?.bullets)
              ? entry.bullets.map((bullet) => String(bullet).trim()).filter(Boolean)
              : [],
          }))
        : [],
      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map((entry) => ({
            bullets: Array.isArray(entry?.bullets)
              ? entry.bullets.map((bullet) => String(bullet).trim()).filter(Boolean)
              : [],
          }))
        : [],
    };
  } catch (err) {
    logger.error('Groq resume improvement failed', err);
    return null;
  }
}
