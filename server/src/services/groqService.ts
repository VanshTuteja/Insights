import config from '../config';
import logger from '../utils/logger';

interface IConfidenceMetrics {
  eyeContact: number;
  smiling: number;
  headMovement: number;
  attentionLevel: number;
  confidenceScore: number;
  speechPace?: number;
  engagementLevel?: number;
}

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const FALLBACK_QUESTION_BANK: Record<string, string[]> = {
  frontend: [
    'How do you decide when to split a React component into smaller components?',
    'Tell me about a time you improved performance in a frontend application.',
    'How do you manage form state and validation in a React project?',
    'What steps do you take to make a user interface accessible?',
    'How do you debug a frontend bug that only appears in production?',
    'Explain how you handle API loading, error, and empty states in the UI.',
    'Tell me about a UI feature you built that improved user experience.',
  ],
  backend: [
    'How do you design an API endpoint so it stays easy to maintain as the product grows?',
    'Tell me about a backend performance issue you diagnosed and fixed.',
    'How do you handle validation and error responses in an Express API?',
    'What approach do you use to secure authenticated backend routes?',
    'How do you debug a production issue when logs point to multiple possible causes?',
    'Tell me about a time you simplified backend logic without changing behavior.',
    'How do you make sure database queries stay efficient as data volume increases?',
  ],
  fullstack: [
    'Tell me about a project where you built both the frontend and backend.',
    'How do you decide what logic should live on the client versus the server?',
    'Describe a bug that involved both frontend and backend systems and how you fixed it.',
    'How do you keep API contracts reliable when frontend and backend are developed together?',
    'Tell me about a feature you delivered end to end and what tradeoffs you made.',
    'How do you manage state across a full-stack application with multiple async requests?',
    'What is your approach to testing a feature from UI interaction to database update?',
  ],
  generic: [
    'Tell me about a challenging project and how you handled the biggest obstacle.',
    'Describe a time when you had to learn something quickly to deliver a feature.',
    'How do you explain a technical decision to a non-technical stakeholder?',
    'Tell me about a bug you are proud of solving and why it was difficult.',
    'How do you prioritize quality and speed when deadlines are tight?',
    'Describe a time you improved an existing system instead of building from scratch.',
    'What is one technical decision you would make differently today and why?',
  ],
};

export interface EvaluationResult {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

export interface InterviewAnswerEvaluation {
  confidence: number;
  clarity: number;
  technical: number;
  communication: number;
  feedback: string;
  improvements: string[];
}

export interface FinalInterviewReport {
  overallScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
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

const CHAT_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const INTERVIEW_EVALUATION_PROMPT = `You are an expert interview coach. Evaluate the candidate's answer and return ONLY valid JSON with no markdown or extra text.
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

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : trimmed;
}

function clampScore(value: unknown) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function resolveQuestionBucket(role: string) {
  const normalized = role.toLowerCase();
  if (normalized.includes('front')) return FALLBACK_QUESTION_BANK.frontend;
  if (normalized.includes('back')) return FALLBACK_QUESTION_BANK.backend;
  if (normalized.includes('full') || normalized.includes('mern') || normalized.includes('stack')) return FALLBACK_QUESTION_BANK.fullstack;
  return FALLBACK_QUESTION_BANK.generic;
}

function pickFallbackQuestion(role: string, excludedQuestions: string[] = []) {
  const normalizedExcluded = new Set(excludedQuestions.map((item) => item.trim().toLowerCase()));
  const pool = resolveQuestionBucket(role);
  const available = pool.filter((item) => !normalizedExcluded.has(item.trim().toLowerCase()));
  if (available.length > 0) return available[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

function sanitizeInterviewQuestion(content: string) {
  return content
    .replace(/\*\*/g, '')
    .replace(/^here(?:'s| is).+?:/i, '')
    .replace(/^question\s*:?\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*(evaluation criteria|follow-up prompts?)\s*:.*$/i, '')
    .trim();
}

async function requestGroq(messages: ChatMessage[], maxTokens: number) {
  if (!config.groq.apiKey) {
    logger.warn('GROQ_API_KEY not set, skipping Groq request');
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.groq.apiKey}`,
      },
      body: JSON.stringify({
        model: config.groq.model || 'llama-3.1-8b-instant',
        messages,
        temperature: 0.2,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseData = await response.text();
      if (response.status === 401) {
        logger.warn('Groq request unauthorized, using fallback question flow', {
          status: response.status,
          statusText: response.statusText,
          responseData,
        });
      } else {
        logger.error('Groq request failed', {
          status: response.status,
          statusText: response.statusText,
          responseData,
        });
      }
      return null;
    }

    const data = await response.json() as GroqChatResponse;
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    logger.error('Groq request error', { error });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateInterviewQuestion(role: string, excludedQuestions: string[] = []): Promise<string> {
  const exclusionText = excludedQuestions.length
    ? `Avoid repeating any of these previous questions: ${excludedQuestions.map((item) => `"${item}"`).join(', ')}.`
    : '';
  const content = await requestGroq(
    [
      {
        role: 'user',
        content: `Generate exactly one concise interview question for the role: ${role}.
The question must be answerable verbally in under 2 minutes.
Do not ask for drawing, whiteboarding, architecture diagrams, schema sketches, system design drawings, tables, or paper-based explanation.
Do not include intro text, labels, bullets, markdown, or evaluation criteria.
${exclusionText}
Return only the question text.`,
      },
    ],
    80
  );

  if (!content) {
    return pickFallbackQuestion(role, excludedQuestions);
  }

  const cleanedQuestion = sanitizeInterviewQuestion(content);
  if (!cleanedQuestion || excludedQuestions.some((item) => item.trim().toLowerCase() === cleanedQuestion.trim().toLowerCase())) {
    return pickFallbackQuestion(role, excludedQuestions);
  }
  return cleanedQuestion;
}

export async function evaluateInterviewAnswer(transcript: string): Promise<InterviewAnswerEvaluation> {
  const content = await requestGroq(
    [
      {
        role: 'system',
        content: `You are a strict professional interview evaluator.

Evaluate the candidate's answer based on:

* Confidence (0-100)
* Clarity
* Technical accuracy
* Communication skills
* Filler word usage`,
      },
      {
        role: 'user',
        content: `Answer:
"${transcript}"

Return ONLY JSON:
{
"confidence": number,
"clarity": number,
"technical": number,
"communication": number,
"feedback": "detailed paragraph",
"improvements": ["point1", "point2"]
}`,
      },
    ],
    250
  );

  if (!content) {
    return {
      confidence: 55,
      clarity: 56,
      technical: 54,
      communication: 57,
      feedback: 'Answer captured. Improve structure, add one specific technical example, and reduce filler words for a stronger interview response.',
      improvements: [
        'Start with a direct answer in the first sentence',
        'Add one concrete technical example with measurable outcome',
      ],
    };
  }

  try {
    const parsed = JSON.parse(extractJsonObject(content)) as Partial<InterviewAnswerEvaluation>;
    return {
      confidence: clampScore(parsed.confidence),
      clarity: clampScore(parsed.clarity),
      technical: clampScore(parsed.technical),
      communication: clampScore(parsed.communication),
      feedback: typeof parsed.feedback === 'string' ? parsed.feedback.trim() : '',
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.map((item) => String(item).trim()).filter(Boolean)
        : [],
    };
  } catch (error) {
    logger.error('Groq interview evaluation parse failed', { error, content });
    return {
      confidence: 55,
      clarity: 55,
      technical: 55,
      communication: 55,
      feedback: 'The answer was captured, but the evaluation response could not be parsed cleanly. Try answering in a clearer and more structured way.',
      improvements: [
        'Use a direct answer, example, and result structure',
        'Keep the explanation concise and technically specific',
      ],
    };
  }
}

export async function generateFinalInterviewReport(
  role: string,
  questions: Array<{
    question: string;
    answer: string;
    confidence: number;
    feedback: string;
    scores: { clarity: number; technical: number; communication: number };
  }>
): Promise<FinalInterviewReport> {
  const answeredQuestions = questions.filter((item) => item.answer.trim());
  if (!answeredQuestions.length) {
    return {
      overallScore: 0,
      confidenceScore: 0,
      strengths: [],
      weaknesses: ['No answers were submitted'],
      improvements: ['Complete at least one answer to generate a report'],
      summary: `No interview data was available for the ${role} interview.`,
    };
  }

  const confidenceScore = Math.round(
    answeredQuestions.reduce((sum, item) => sum + item.confidence, 0) / answeredQuestions.length
  );
  const clarityScore = Math.round(
    answeredQuestions.reduce((sum, item) => sum + item.scores.clarity, 0) / answeredQuestions.length
  );
  const technicalScore = Math.round(
    answeredQuestions.reduce((sum, item) => sum + item.scores.technical, 0) / answeredQuestions.length
  );
  const communicationScore = Math.round(
    answeredQuestions.reduce((sum, item) => sum + item.scores.communication, 0) / answeredQuestions.length
  );
  const overallScore = Math.round((confidenceScore + clarityScore + technicalScore + communicationScore) / 4);

  const content = await requestGroq(
    [
      {
        role: 'system',
        content: 'You are a professional interview coach. Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Create a final interview report for role ${role} using this data: ${JSON.stringify(answeredQuestions)}

Return ONLY JSON:
{
  "strengths": ["point"],
  "weaknesses": ["point"],
  "improvements": ["point"],
  "summary": "short paragraph"
}`,
      },
    ],
    300
  );

  if (!content) {
    return {
      overallScore,
      confidenceScore,
      strengths: ['You completed the mock interview flow successfully.'],
      weaknesses: ['Some answers can be made more concise and example-driven.'],
      improvements: [
        'Lead with the answer before the explanation',
        'Add clearer technical detail and outcomes',
      ],
      summary: `The ${role} mock interview finished with an overall score of ${overallScore}.`,
    };
  }

  try {
    const parsed = JSON.parse(extractJsonObject(content)) as Partial<FinalInterviewReport>;
    return {
      overallScore,
      confidenceScore,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map((item) => String(item).trim()).filter(Boolean) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map((item) => String(item).trim()).filter(Boolean) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map((item) => String(item).trim()).filter(Boolean) : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
    };
  } catch (error) {
    logger.error('Groq final report parse failed', { error, content });
    return {
      overallScore,
      confidenceScore,
      strengths: ['You completed the interview and generated enough data for scoring.'],
      weaknesses: ['The final report response could not be parsed exactly.'],
      improvements: ['Retry with sharper, shorter answers and more concrete examples.'],
      summary: `The ${role} mock interview finished with an overall score of ${overallScore}.`,
    };
  }
}

export async function evaluateWithGroq(
  question: string,
  transcript: string,
  confidenceMetrics?: Partial<IConfidenceMetrics>
): Promise<EvaluationResult | null> {
  const visualSignals = confidenceMetrics
    ? `\n\nVideo confidence signals: ${JSON.stringify(confidenceMetrics)}`
    : '';

  const content = await requestGroq(
    [
      { role: 'system', content: INTERVIEW_EVALUATION_PROMPT },
      {
        role: 'user',
        content: `Question: ${question}\n\nAnswer: ${transcript || '(No answer provided)'}${visualSignals}`,
      },
    ],
    300
  );

  if (!content) return null;

  try {
    const parsed = JSON.parse(extractJsonObject(content)) as EvaluationResult;
    if (typeof parsed.score !== 'number') parsed.score = Math.min(100, Math.max(0, Number(parsed.score) || 70));
    if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
    if (!Array.isArray(parsed.improvements)) parsed.improvements = [];
    if (typeof parsed.feedback !== 'string') parsed.feedback = '';
    return parsed;
  } catch (error) {
    logger.error('Groq evaluation parse failed', { error, content });
    return null;
  }
}

export async function improveResumeWithGroq(payload: ResumeImprovePayload): Promise<ResumeImproveResult | null> {
  const content = await requestGroq(
    [
      { role: 'system', content: RESUME_SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(payload) },
    ],
    1200
  );

  if (!content) return null;

  try {
    const parsed = JSON.parse(extractJsonObject(content)) as Partial<ResumeImproveResult>;

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
  } catch (error) {
    logger.error('Groq resume improvement parse failed', { error, content });
    return null;
  }
}
