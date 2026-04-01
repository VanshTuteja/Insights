export type ResumeTemplateId = 'modern' | 'minimal' | 'professional' | 'creative';

export type ResumeSectionItem = {
  id: string;
  title?: string;
  subtitle?: string;
  meta?: string;
  bullets: string[];
};

export type ResumeCustomSection = {
  id: string;
  title: string;
  items: string[];
};

export type ResumePreviewData = {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  skills: string[];
  technicalSkills: string[];
  tools: string[];
  experience: ResumeSectionItem[];
  projects: ResumeSectionItem[];
  education: ResumeSectionItem[];
  certifications: ResumeSectionItem[];
  achievements: string[];
  languages: string[];
  interests: string[];
  customSections: ResumeCustomSection[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  atsScore: number;
  sourceText: string;
};

export type AtsAnalysis = {
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  suggestions: string[];
};

export type ResumeSectionsResponse = {
  summary: string;
  experience: string[];
  projects: string[];
  skills: string[];
  education: string[];
};
