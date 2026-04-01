import { Response } from 'express';
import fs from 'fs/promises';
import User from '../models/Users';
import { AuthRequest } from '../types';
import logger from '../utils/logger';
import {
  analyzeResumeWithGroq,
  generateResumeWithGroq,
  improveResumeTextWithGroq,
  improveResumeWithGroq,
  type ResumeGenerationPayload,
  type ResumeImprovePayload,
  type ResumeStructuredSections,
} from '../services/groqService';

const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text?: string }>;

type StructuredResume = NonNullable<ResumeImprovePayload['resume']>;

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function mergeBulletText(existing?: string, incoming?: string[]) {
  const current = String(existing || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  return unique([...current, ...(incoming || [])]).slice(0, 4).join('\n');
}

function compactText(value: string, limit = 6000) {
  return value.replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function computeContentBasedAtsScore(
  resumeText: string,
  analysis: {
    strengths?: string[];
    weaknesses?: string[];
    missing_keywords?: string[];
    suggestions?: string[];
  },
) {
  const normalized = resumeText.toLowerCase();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const sectionPatterns = [
    /\b(summary|profile|objective)\b/,
    /\b(experience|work experience|employment)\b/,
    /\b(skills|technical skills|core skills)\b/,
    /\b(education|academic)\b/,
    /\b(projects|project)\b/,
  ];
  const sectionHits = sectionPatterns.filter((pattern) => pattern.test(normalized)).length;
  const quantifiedBullets = (resumeText.match(/\b\d+[%x+]?\b/g) || []).length;
  const actionVerbHits = (
    normalized.match(/\b(led|built|developed|designed|implemented|improved|managed|created|delivered|optimized|launched|analyzed|automated)\b/g) || []
  ).length;
  const keywordCoverage = Math.max(0, 15 - (analysis.missing_keywords?.length || 0) * 3);
  const strengthsBonus = Math.min(18, (analysis.strengths?.length || 0) * 3);
  const weaknessPenalty = Math.min(18, (analysis.weaknesses?.length || 0) * 4);
  const suggestionsPenalty = Math.min(10, (analysis.suggestions?.length || 0) * 1.5);

  const structureScore = sectionHits * 8;
  const lengthScore = wordCount >= 250 ? 12 : wordCount >= 150 ? 8 : wordCount >= 80 ? 4 : 0;
  const impactScore = Math.min(16, quantifiedBullets * 2) + Math.min(12, actionVerbHits);

  const rawScore =
    28 +
    structureScore +
    lengthScore +
    impactScore +
    keywordCoverage +
    strengthsBonus -
    weaknessPenalty -
    suggestionsPenalty;

  return Math.max(18, Math.min(96, Math.round(rawScore)));
}

function mergeAtsScore(
  resumeText: string,
  analysis: {
    ats_score: number;
    strengths?: string[];
    weaknesses?: string[];
    missing_keywords?: string[];
    suggestions?: string[];
  },
) {
  const contentScore = computeContentBasedAtsScore(resumeText, analysis);
  const blendedScore = Math.round(contentScore * 0.7 + analysis.ats_score * 0.3);
  return {
    ...analysis,
    ats_score: Math.max(18, Math.min(96, blendedScore)),
  };
}

function sectionsToContent(sections: ResumeStructuredSections) {
  return [
    sections.summary ? `Summary\n${sections.summary}` : '',
    sections.experience.length ? `Experience\n${sections.experience.join('\n')}` : '',
    sections.projects.length ? `Projects\n${sections.projects.join('\n')}` : '',
    sections.skills.length ? `Skills\n${sections.skills.join(', ')}` : '',
    sections.education.length ? `Education\n${sections.education.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function persistResumeEntry(
  userId: string,
  entry: {
    title?: string;
    template?: string;
    source: 'upload' | 'builder' | 'improvement';
    content: string;
    sections?: ResumeStructuredSections;
    analysis?: {
      atsScore?: number;
      strengths?: string[];
      weaknesses?: string[];
      missingKeywords?: string[];
      suggestions?: string[];
    };
  }
) {
  await User.findByIdAndUpdate(userId, {
    $push: {
      resumes: {
        $each: [
          {
            title: entry.title || 'AI Resume',
            template: entry.template || 'modern',
            source: entry.source,
            content: entry.content,
            sections: entry.sections
              ? {
                  summary: entry.sections.summary || '',
                  experience: entry.sections.experience || [],
                  projects: entry.sections.projects || [],
                  skills: entry.sections.skills || [],
                  education: entry.sections.education || [],
                }
              : undefined,
            analysis: entry.analysis
              ? {
                  atsScore: entry.analysis.atsScore || 0,
                  strengths: entry.analysis.strengths || [],
                  weaknesses: entry.analysis.weaknesses || [],
                  missingKeywords: entry.analysis.missingKeywords || [],
                  suggestions: entry.analysis.suggestions || [],
                }
              : undefined,
          },
        ],
        $slice: -10,
      },
    },
  });
}

function parseStructuredResumeSections(resume: StructuredResume): ResumeStructuredSections {
  return {
    summary: String(resume.summary || '').trim(),
    experience: (resume.experience || [])
      .map((item) =>
        [item.title, item.company, item.location, item.startDate, item.current ? 'Present' : item.endDate, item.bullets]
          .filter(Boolean)
          .join(' | ')
      )
      .filter(Boolean),
    projects: (resume.projects || [])
      .map((item) => [item.name, item.techStack, item.bullets].filter(Boolean).join(' | '))
      .filter(Boolean),
    skills: unique([...(resume.skills || []), ...(resume.tools || []), String(resume.technicalSkills || '')]),
    education: (resume.education || [])
      .map((item) => [item.school, item.degree, item.year].filter(Boolean).join(' | '))
      .filter(Boolean),
  };
}

export async function analyzeResume(req: AuthRequest, res: Response) {
  let tempFilePath: string | undefined;
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Resume PDF is required',
      });
    }

    tempFilePath = file.path;
    const fileBuffer = await fs.readFile(file.path);
    const parsed = await pdfParse(fileBuffer);
    const resumeText = compactText(parsed?.text || '', 12000);

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from the uploaded PDF',
      });
    }

    const aiAnalysis = await analyzeResumeWithGroq(resumeText);
    if (!aiAnalysis) {
      return res.status(503).json({
        success: false,
        message: 'Resume analysis service is unavailable',
      });
    }

    const analysis = mergeAtsScore(resumeText, aiAnalysis);

    if (req.user?.userId) {
      await persistResumeEntry(req.user.userId, {
        title: file.originalname?.replace(/\.pdf$/i, '') || 'Uploaded Resume',
        source: 'upload',
        content: resumeText,
        analysis: {
          atsScore: analysis.ats_score,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          missingKeywords: analysis.missing_keywords,
          suggestions: analysis.suggestions,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        resumeText,
        analysis,
      },
      message: 'Resume analyzed successfully',
    });
  } catch (error: any) {
    logger.error('analyzeResume', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze resume',
    });
  } finally {
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(() => undefined);
    }
  }
}

export async function generateResume(req: AuthRequest, res: Response) {
  try {
    const payload = req.body as ResumeGenerationPayload & { template?: string };
    if (!payload?.personalInfo) {
      return res.status(400).json({
        success: false,
        message: 'personalInfo is required',
      });
    }

    const generated = await generateResumeWithGroq(payload);
    if (!generated) {
      return res.status(503).json({
        success: false,
        message: 'Resume generation service is unavailable',
      });
    }

    if (req.user?.userId) {
      await persistResumeEntry(req.user.userId, {
        title: payload.personalInfo.name ? `${payload.personalInfo.name} Resume` : 'Generated Resume',
        template: payload.template || 'modern',
        source: 'builder',
        content: sectionsToContent(generated.sections),
        sections: generated.sections,
      });
    }

    return res.json({
      success: true,
      data: generated,
      message: 'Resume generated successfully',
    });
  } catch (error: any) {
    logger.error('generateResume', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate resume',
    });
  }
}

export async function improveResume(req: AuthRequest, res: Response) {
  try {
    const payload = req.body as ResumeImprovePayload & { template?: string };

    if (payload?.resume) {
      const improved = await improveResumeWithGroq(payload);
      if (!improved) {
        return res.status(503).json({
          success: false,
          message: 'Resume improvement service is unavailable',
        });
      }

      const mergedResume = {
        ...payload.resume,
        personal: {
          ...payload.resume.personal,
          headline: improved.headline || payload.resume.personal?.headline || '',
        },
        summary: improved.summary || payload.resume.summary || '',
        skills: unique([...(payload.resume.skills || []), ...improved.skills]).slice(0, 18),
        technicalSkills: improved.technicalSkills || payload.resume.technicalSkills || '',
        tools: unique([...(payload.resume.tools || []), ...improved.tools]).slice(0, 12),
        achievements: unique([...(payload.resume.achievements || []), ...improved.achievements]).slice(0, 5),
        keywordBlock: improved.keywordBlock || payload.resume.keywordBlock || '',
        experience: (payload.resume.experience || []).map((item, index) => ({
          ...item,
          bullets: mergeBulletText(item.bullets, improved.experience[index]?.bullets),
        })),
        projects: (payload.resume.projects || []).map((item, index) => ({
          ...item,
          bullets: mergeBulletText(item.bullets, improved.projects[index]?.bullets).split('\n').slice(0, 3).join('\n'),
        })),
      };

      if (req.user?.userId) {
        const sections = parseStructuredResumeSections(mergedResume);
        await persistResumeEntry(req.user.userId, {
          title: mergedResume.personal?.name ? `${mergedResume.personal.name} Improved Resume` : 'Improved Resume',
          template: payload.template || 'modern',
          source: 'improvement',
          content: sectionsToContent(sections),
          sections,
        });
      }

      return res.json({
        success: true,
        data: mergedResume,
        message: 'Resume improved successfully',
      });
    }

    if (!payload?.text?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'resume text is required',
      });
    }

    const improved = await improveResumeTextWithGroq(payload.text.trim());
    if (!improved) {
      return res.status(503).json({
        success: false,
        message: 'Resume improvement service is unavailable',
      });
    }

    if (req.user?.userId) {
      await persistResumeEntry(req.user.userId, {
        title: 'Improved Resume',
        template: payload.template || 'modern',
        source: 'improvement',
        content: improved.improvedText,
        sections: improved.sections,
      });
    }

    return res.json({
      success: true,
      data: improved,
      message: 'Resume improved successfully',
    });
  } catch (error: any) {
    logger.error('improveResume', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to improve resume',
    });
  }
}
