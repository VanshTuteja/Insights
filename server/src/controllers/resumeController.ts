import { Response } from 'express';
import { AuthRequest } from '../types';
import logger from '../utils/logger';
import { improveResumeWithGroq, type ResumeImprovePayload } from '../services/groqService';

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

export async function improveResume(req: AuthRequest, res: Response) {
  try {
    const payload = req.body as ResumeImprovePayload;
    if (!payload?.roleLabel || !payload?.resume) {
      return res.status(400).json({
        success: false,
        message: 'roleLabel and resume are required',
      });
    }

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

    return res.json({
      success: true,
      data: mergedResume,
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
