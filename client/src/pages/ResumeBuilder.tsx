import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { Download, FileSearch, Plus, Sparkles, Target, TrendingUp, Wand2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import type { AtsAnalysis, ResumeCustomSection, ResumePreviewData, ResumeSectionItem, ResumeSectionsResponse, ResumeTemplateId } from '@/types/resumeAI';

type PersonalInfo = ResumePreviewData['personal'];

type BuildFormState = {
  personalInfo: PersonalInfo;
  targetRole: string;
  jobDescription: string;
  summary: string;
  coreSkills: string;
  technicalSkills: string;
  tools: string;
  achievements: string;
  languages: string;
  interests: string;
  experience: ResumeSectionItem[];
  projects: ResumeSectionItem[];
  education: ResumeSectionItem[];
  certifications: ResumeSectionItem[];
  customSections: ResumeCustomSection[];
};

type MarketRoleInsight = {
  id: string;
  label: string;
  growthRate: string;
  demandScore: number;
  remoteShare: number;
  easeScore: number;
  trend: string;
  keywords: string[];
  why: string;
};

const TEMPLATE_OPTIONS: Array<{ id: ResumeTemplateId; label: string }> = [
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'professional', label: 'Professional' },
  { id: 'creative', label: 'Creative' },
];

const MARKET_ROLE_INSIGHTS: MarketRoleInsight[] = [
  {
    id: 'full-stack-developer',
    label: 'Full Stack Developer',
    growthRate: '+17.4% YoY',
    demandScore: 91,
    remoteShare: 41,
    easeScore: 88,
    trend: 'Strong startup hiring and ownership-heavy roles',
    keywords: ['react', 'node', 'express', 'mongodb', 'full stack', 'mern', 'api', 'javascript', 'typescript'],
    why: 'Broad ownership, product delivery, and MERN experience usually convert well into shortlist-friendly roles.',
  },
  {
    id: 'frontend-developer',
    label: 'Frontend Developer',
    growthRate: '+15.2% YoY',
    demandScore: 87,
    remoteShare: 38,
    easeScore: 84,
    trend: 'High demand for React, TypeScript, and polished UI execution',
    keywords: ['react', 'frontend', 'ui', 'ux', 'typescript', 'javascript', 'tailwind', 'css', 'html'],
    why: 'Strong UI polish, responsive work, and React keywords make frontend hiring more accessible.',
  },
  {
    id: 'backend-developer',
    label: 'Backend Developer',
    growthRate: '+16.1% YoY',
    demandScore: 86,
    remoteShare: 33,
    easeScore: 80,
    trend: 'Reliable API and database profiles remain valuable',
    keywords: ['node', 'express', 'backend', 'api', 'mongodb', 'sql', 'database', 'jwt'],
    why: 'API, auth, and database signals usually align well with backend shortlist criteria.',
  },
  {
    id: 'devops-engineer',
    label: 'DevOps Engineer',
    growthRate: '+18.0% YoY',
    demandScore: 84,
    remoteShare: 35,
    easeScore: 66,
    trend: 'Cloud, CI/CD, and deployment skills are trending strongly',
    keywords: ['docker', 'aws', 'deployment', 'ci/cd', 'devops', 'linux', 'terraform'],
    why: 'Good trending direction if the profile already shows deployment, cloud, or automation proof.',
  },
  {
    id: 'data-analyst',
    label: 'Data Analyst',
    growthRate: '+13.1% YoY',
    demandScore: 76,
    remoteShare: 29,
    easeScore: 74,
    trend: 'Steady analytics demand across product and operations',
    keywords: ['sql', 'excel', 'power bi', 'tableau', 'analytics', 'dashboard', 'reporting'],
    why: 'Useful fallback when resumes show reporting, dashboards, SQL, or business insight skills.',
  },
];

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const sanitizeText = (value: string) =>
  value
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/`/g, '')
    .trim();

const splitList = (value: string) =>
  value
    .split(/,|\n|•|;/)
    .map((item) => sanitizeText(item))
    .filter(Boolean);

const joinLines = (items: string[]) => items.map((item) => sanitizeText(item)).filter(Boolean).join('\n');

const createEntry = (type: 'experience' | 'project' | 'education' | 'certification'): ResumeSectionItem => {
  if (type === 'experience') return { id: createId('exp'), title: '', subtitle: '', meta: '', bullets: [''] };
  if (type === 'project') return { id: createId('proj'), title: '', subtitle: '', meta: '', bullets: [''] };
  if (type === 'education') return { id: createId('edu'), title: '', subtitle: '', meta: '', bullets: [] };
  return { id: createId('cert'), title: '', subtitle: '', meta: '', bullets: [] };
};

const INITIAL_FORM: BuildFormState = {
  personalInfo: {
    name: 'Alex Johnson',
    email: 'alex@email.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    headline: 'Full Stack Developer | MERN | AI-Assisted Product Building',
    linkedin: 'linkedin.com/in/alexjohnson',
    portfolio: 'alexbuilds.dev',
  },
  targetRole: 'Full Stack Developer',
  jobDescription: '',
  summary:
    'Full stack developer building responsive products, scalable backend workflows, and AI-assisted user experiences with measurable product impact.',
  coreSkills: 'React, TypeScript, Node.js, Express.js, MongoDB, Tailwind CSS, REST APIs, Problem Solving',
  technicalSkills: 'MERN Stack, JWT Auth, Zustand, Vite, Groq API, PDF Parsing',
  tools: 'GitHub, Postman, VS Code, Figma, Render, Vercel',
  achievements: 'Improved dashboard responsiveness by 32%\nBuilt AI resume and interview workflows\nDelivered end-to-end resume module upgrades',
  languages: 'English, Hindi',
  interests: 'Open source, UI systems, AI products',
  experience: [
    {
      id: createId('exp'),
      title: 'Full Stack Developer Intern',
      subtitle: 'Product Studio',
      meta: 'Jan 2025 - Present | Bengaluru, India',
      bullets: [
        'Built MERN features for job search workflows and account flows.',
        'Improved dashboard performance by 32% through leaner data fetching.',
        'Integrated AI services for resume analysis and content enhancement.',
      ],
    },
  ],
  projects: [
    {
      id: createId('proj'),
      title: 'AI Job Finder Platform',
      subtitle: 'React, Node.js, MongoDB',
      meta: 'Final Year Project',
      bullets: [
        'Built AI resume analysis, generation, and preview workflows.',
        'Added personalized job recommendations and interview tooling.',
      ],
    },
  ],
  education: [{ id: createId('edu'), title: 'B.Tech in Computer Science', subtitle: 'ABC University', meta: '2026', bullets: [] }],
  certifications: [{ id: createId('cert'), title: 'Meta Front-End Developer Certificate', subtitle: 'Coursera', meta: '2025', bullets: [] }],
  customSections: [],
};

const EMPTY_PREVIEW: ResumePreviewData = {
  personal: INITIAL_FORM.personalInfo,
  summary: INITIAL_FORM.summary,
  skills: splitList(INITIAL_FORM.coreSkills),
  technicalSkills: splitList(INITIAL_FORM.technicalSkills),
  tools: splitList(INITIAL_FORM.tools),
  experience: INITIAL_FORM.experience,
  projects: INITIAL_FORM.projects,
  education: INITIAL_FORM.education,
  certifications: INITIAL_FORM.certifications,
  achievements: splitList(INITIAL_FORM.achievements),
  languages: splitList(INITIAL_FORM.languages),
  interests: splitList(INITIAL_FORM.interests),
  customSections: [],
  strengths: [],
  weaknesses: [],
  suggestions: [],
  atsScore: 0,
  sourceText: '',
};

const SECTION_PATTERNS: Array<{ key: string; pattern: RegExp }> = [
  { key: 'summary', pattern: /^(summary|professional summary|profile|objective)$/i },
  { key: 'experience', pattern: /^(experience|work experience|employment|professional experience)$/i },
  { key: 'projects', pattern: /^(projects|personal projects)$/i },
  { key: 'education', pattern: /^(education|academic background)$/i },
  { key: 'skills', pattern: /^(skills|technical skills|core skills)$/i },
  { key: 'certifications', pattern: /^(certifications|licenses)$/i },
  { key: 'achievements', pattern: /^(achievements|awards)$/i },
  { key: 'languages', pattern: /^(languages)$/i },
  { key: 'interests', pattern: /^(interests|hobbies)$/i },
];

function parseResumeSections(text: string) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const sections: Record<string, string[]> = {};
  let currentKey = 'intro';
  for (const line of lines) {
    const matched = SECTION_PATTERNS.find((item) => item.pattern.test(line.replace(/:$/, '')));
    if (matched) {
      currentKey = matched.key;
      sections[currentKey] = sections[currentKey] || [];
      continue;
    }
    sections[currentKey] = sections[currentKey] || [];
    sections[currentKey].push(line);
  }
  return sections;
}

function parseSectionItems(lines: string[], type: 'experience' | 'project' | 'education' | 'certification') {
  const entries = lines
    .filter(Boolean)
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
    .slice(0, 6)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim());
      if (type === 'education' || type === 'certification') {
        const [title = '', subtitle = '', meta = ''] = parts;
        return { id: createId(type === 'education' ? 'edu' : 'cert'), title: sanitizeText(title), subtitle: sanitizeText(subtitle), meta: sanitizeText(meta), bullets: [] };
      }
      const [title = '', subtitle = '', meta = '', ...rest] = parts;
      return { id: createId(type === 'experience' ? 'exp' : 'proj'), title: sanitizeText(title), subtitle: sanitizeText(subtitle), meta: sanitizeText(meta), bullets: rest.length ? splitList(rest.join(' | ')) : [sanitizeText(line)] };
    });
  return entries.length ? entries : [createEntry(type)];
}

function buildFormFromResumeText(text: string, current: BuildFormState): BuildFormState {
  const sections = parseResumeSections(text);
  const intro = sections.intro || [];
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || current.personalInfo.email;
  const phone = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\d[\s-]?){10,14}/)?.[0]?.trim() || current.personalInfo.phone;
  const linkedin = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s]+/i)?.[0] || current.personalInfo.linkedin;
  const portfolio = text.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin\.com)[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?/i)?.[0] || current.personalInfo.portfolio;
  return {
    ...current,
    personalInfo: { ...current.personalInfo, name: sanitizeText(intro[0] || current.personalInfo.name), headline: sanitizeText(intro[1] || current.personalInfo.headline), email, phone, linkedin, portfolio },
    summary: joinLines((sections.summary || []).slice(0, 5)) || current.summary,
    coreSkills: (sections.skills || []).join(', ') || current.coreSkills,
    achievements: joinLines(sections.achievements || []) || current.achievements,
    languages: (sections.languages || []).join(', ') || current.languages,
    interests: (sections.interests || []).join(', ') || current.interests,
    experience: parseSectionItems(sections.experience || [], 'experience'),
    projects: parseSectionItems(sections.projects || [], 'project'),
    education: parseSectionItems(sections.education || [], 'education'),
    certifications: parseSectionItems(sections.certifications || [], 'certification'),
  };
}

function buildPreviewFromForm(form: BuildFormState, extras?: Partial<Pick<ResumePreviewData, 'strengths' | 'weaknesses' | 'suggestions' | 'atsScore' | 'sourceText'>>) {
  return {
    personal: form.personalInfo,
    summary: form.summary,
    skills: splitList(form.coreSkills),
    technicalSkills: splitList(form.technicalSkills),
    tools: splitList(form.tools),
    experience: form.experience.filter((item) => item.title || item.subtitle || item.bullets.some(Boolean)),
    projects: form.projects.filter((item) => item.title || item.subtitle || item.bullets.some(Boolean)),
    education: form.education.filter((item) => item.title || item.subtitle || item.meta),
    certifications: form.certifications.filter((item) => item.title || item.subtitle || item.meta),
    achievements: splitList(form.achievements),
    languages: splitList(form.languages),
    interests: splitList(form.interests),
    customSections: form.customSections.map((item) => ({ ...item, items: item.items.filter(Boolean) })).filter((item) => item.title || item.items.length),
    strengths: extras?.strengths || [],
    weaknesses: extras?.weaknesses || [],
    suggestions: extras?.suggestions || [],
    atsScore: extras?.atsScore || 0,
    sourceText: extras?.sourceText || '',
  } satisfies ResumePreviewData;
}

function buildPreviewFromGeneratedSections(form: BuildFormState, sections: ResumeSectionsResponse, extras?: Partial<Pick<ResumePreviewData, 'strengths' | 'weaknesses' | 'suggestions' | 'atsScore' | 'sourceText'>>) {
  const base = buildPreviewFromForm(form, extras);
  const mapLines = (items: string[], prefix: 'exp' | 'proj' | 'edu') => items.map((item) => {
    const parts = item.split('|').map((part) => part.trim());
    return { id: createId(prefix), title: parts[0] || '', subtitle: parts[1] || '', meta: parts[2] || '', bullets: splitList(parts.slice(3).join(' | ') || item) };
  });
  return {
    ...base,
    summary: sections.summary || base.summary,
    skills: sections.skills.length ? sections.skills : base.skills,
    experience: sections.experience.length ? mapLines(sections.experience, 'exp') : base.experience,
    projects: sections.projects.length ? mapLines(sections.projects, 'proj') : base.projects,
    education: sections.education.length ? sections.education.map((item) => {
      const parts = item.split('|').map((part) => part.trim());
      return { id: createId('edu'), title: parts[0] || '', subtitle: parts[1] || '', meta: parts[2] || '', bullets: [] };
    }) : base.education,
  };
}

function sectionText(items: ResumeSectionItem[]) {
  return items.map((item) => [item.title, item.subtitle, item.meta, ...item.bullets.filter(Boolean)].filter(Boolean).join(' | ')).filter(Boolean).join('\n');
}

function buildImproveText(form: BuildFormState) {
  return [
    form.personalInfo.name,
    form.personalInfo.headline,
    form.summary,
    'Skills', form.coreSkills,
    'Technical Skills', form.technicalSkills,
    'Tools', form.tools,
    'Experience', sectionText(form.experience),
    'Projects', sectionText(form.projects),
    'Education', sectionText(form.education),
    'Certifications', sectionText(form.certifications),
    'Achievements', form.achievements,
    form.customSections.map((item) => `${item.title}\n${item.items.join('\n')}`).join('\n\n'),
  ].filter(Boolean).join('\n\n');
}

function updateSectionItem(items: ResumeSectionItem[], id: string, field: 'title' | 'subtitle' | 'meta', value: string) {
  return items.map((item) => (item.id === id ? { ...item, [field]: sanitizeText(value) } : item));
}

function updateSectionBullets(items: ResumeSectionItem[], id: string, value: string) {
  return items.map((item) => (item.id === id ? { ...item, bullets: value.split('\n').map((line) => sanitizeText(line)) } : item));
}

function getAtsBreakdown(analysis: AtsAnalysis | null) {
  if (!analysis) {
    return [];
  }

  const keywordStrength = Math.max(25, Math.min(96, 55 + analysis.strengths.length * 8 - analysis.missing_keywords.length * 4));
  const contentStrength = Math.max(20, Math.min(95, analysis.ats_score + analysis.strengths.length * 3 - analysis.weaknesses.length * 2));
  const riskLevel = Math.max(10, Math.min(90, analysis.weaknesses.length * 12 + analysis.missing_keywords.length * 6));

  return [
    { name: 'ATS Score', value: analysis.ats_score },
    { name: 'Keyword Match', value: keywordStrength },
    { name: 'Content Depth', value: contentStrength },
    { name: 'Risk Level', value: riskLevel },
  ];
}

function getFeedbackDistribution(analysis: AtsAnalysis | null) {
  if (!analysis) {
    return [];
  }

  return [
    { name: 'Strengths', value: analysis.strengths.length, color: '#16a34a' },
    { name: 'Weaknesses', value: analysis.weaknesses.length, color: '#dc2626' },
    { name: 'Suggestions', value: analysis.suggestions.length, color: '#2563eb' },
    { name: 'Missing Keywords', value: analysis.missing_keywords.length, color: '#d97706' },
  ].filter((item) => item.value > 0);
}

function wrapChartLabel(value: string) {
  return value.replace(/\s+/g, '');
}

function getRecommendedRoles(text: string, analysis: AtsAnalysis | null) {
  const normalized = `${text} ${(analysis?.missing_keywords || []).join(' ')} ${(analysis?.strengths || []).join(' ')}`.toLowerCase();
  return MARKET_ROLE_INSIGHTS.map((role) => {
    const matchedKeywords = role.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase())).length;
    const score = role.easeScore + matchedKeywords * 6 + role.remoteShare / 10;
    return { ...role, matchedKeywords, score: Math.round(score) };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

const ResumeBuilder = () => {
  const { theme } = useThemeStore();
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const previewRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef(new Map<string, unknown>());

  const [activeTab, setActiveTab] = useState('upload');
  const [template, setTemplate] = useState<ResumeTemplateId>('modern');
  const [buildForm, setBuildForm] = useState<BuildFormState>(INITIAL_FORM);
  const [previewData, setPreviewData] = useState<ResumePreviewData>(EMPTY_PREVIEW);
  const deferredPreview = useDeferredValue(previewData);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadedResumeText, setUploadedResumeText] = useState('');
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [exportMode, setExportMode] = useState(false);
  const [loading, setLoading] = useState({ analyze: false, generate: false, improve: false, download: false });
  const atsBreakdown = useMemo(() => getAtsBreakdown(analysis), [analysis]);
  const feedbackDistribution = useMemo(() => getFeedbackDistribution(analysis), [analysis]);
  const recommendedRoles = useMemo(() => getRecommendedRoles(uploadedResumeText, analysis), [uploadedResumeText, analysis]);
  const trendingRoles = useMemo(() => [...MARKET_ROLE_INSIGHTS].sort((a, b) => b.demandScore - a.demandScore).slice(0, 4), []);

  useEffect(() => {
    startTransition(() => {
      setPreviewData((current) =>
        buildPreviewFromForm(buildForm, {
          strengths: current.strengths,
          weaknesses: current.weaknesses,
          suggestions: current.suggestions,
          atsScore: current.atsScore,
          sourceText: current.sourceText,
        })
      );
    });
  }, [buildForm]);

  const layoutShell = cn(
    'min-h-screen bg-background text-foreground transition-colors duration-300',
    darkTheme
      ? 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]'
      : 'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]'
  );
  const cardClass = cn('border backdrop-blur-xl', darkTheme ? 'border-white/10 bg-slate-950/60' : 'border-white/60 bg-white/80');
  const softPanel = cn('rounded-[28px] border p-6', darkTheme ? 'border-white/10 bg-white/5' : 'border-slate-200/80 bg-slate-50/90');

  const handleDownload = async () => {
    if (!previewRef.current) return;
    try {
      setLoading((current) => ({ ...current, download: true }));
      setExportMode(true);
      await new Promise((resolve) => setTimeout(resolve, 80));
      await html2pdf().from(previewRef.current).set({
        filename: `${(deferredPreview.personal.name || 'resume').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`,
        margin: 0,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.resume-section', '.resume-block'] },
      }).save();
    } catch (error: any) {
      toast({ title: 'Download failed', description: error?.message || 'Could not export the resume as PDF.', variant: 'destructive' });
    } finally {
      setExportMode(false);
      setLoading((current) => ({ ...current, download: false }));
    }
  };

  const handleAnalyze = async () => {
    if (!uploadFile) {
      toast({ title: 'Upload a PDF first', description: 'Choose a resume PDF to analyze.', variant: 'destructive' });
      return;
    }
    try {
      setLoading((current) => ({ ...current, analyze: true }));
      const formData = new FormData();
      formData.append('resume', uploadFile);
      const response = await axios.post('/resume/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const payload = response.data?.data as { resumeText: string; analysis: AtsAnalysis };
      setUploadedResumeText(payload.resumeText);
      setAnalysis(payload.analysis);
      startTransition(() => {
        setPreviewData((current) => ({
          ...current,
          atsScore: payload.analysis.ats_score,
          strengths: payload.analysis.strengths,
          weaknesses: payload.analysis.weaknesses,
          suggestions: payload.analysis.suggestions,
          sourceText: payload.resumeText,
        }));
      });
      toast({ title: 'ATS analysis ready', description: 'Upload analyzed successfully.' });
    } catch (error: any) {
      toast({ title: 'Analysis failed', description: error.response?.data?.message || 'Could not analyze the uploaded resume.', variant: 'destructive' });
    } finally {
      setLoading((current) => ({ ...current, analyze: false }));
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading((current) => ({ ...current, generate: true }));
      const payload = {
        personalInfo: buildForm.personalInfo,
        education: buildForm.education.map((item) => ({ degree: item.title, school: item.subtitle, year: item.meta })),
        experience: buildForm.experience.map((item) => ({ title: item.title, company: item.subtitle, duration: item.meta, highlights: item.bullets.join('; ') })),
        skills: splitList(`${buildForm.coreSkills},${buildForm.technicalSkills},${buildForm.tools}`),
        projects: buildForm.projects.map((item) => ({ name: item.title, tech: item.subtitle, highlights: item.bullets.join('; ') })),
        certifications: buildForm.certifications.map((item) => ({ name: item.title, issuer: item.subtitle, year: item.meta })),
        achievements: splitList(buildForm.achievements),
        customSections: buildForm.customSections,
        targetRole: buildForm.targetRole,
        summary: buildForm.summary,
        jobDescription: buildForm.jobDescription,
        template,
      };
      const cacheKey = `generate:${JSON.stringify(payload)}`;
      const cached = cacheRef.current.get(cacheKey) as { sections: ResumeSectionsResponse } | undefined;
      const sections = cached?.sections || (await axios.post('/resume/generate', payload)).data?.data?.sections;
      cacheRef.current.set(cacheKey, { sections });
      startTransition(() => {
        setPreviewData((current) => buildPreviewFromGeneratedSections(buildForm, sections, {
          atsScore: current.atsScore,
          strengths: current.strengths,
          weaknesses: current.weaknesses,
          suggestions: current.suggestions,
          sourceText: current.sourceText,
        }));
      });
      toast({ title: 'Resume generated', description: 'The preview was updated with AI-generated resume content.' });
    } catch (error: any) {
      toast({ title: 'Generation failed', description: error.response?.data?.message || 'Could not generate the resume.', variant: 'destructive' });
    } finally {
      setLoading((current) => ({ ...current, generate: false }));
    }
  };

  const handleImprove = async () => {
    const textToImprove = uploadedResumeText.trim() || buildImproveText(buildForm);
    if (!textToImprove.trim()) {
      toast({ title: 'Nothing to improve', description: 'Add resume content or analyze an uploaded resume first.', variant: 'destructive' });
      return;
    }
    try {
      setLoading((current) => ({ ...current, improve: true }));
      const response = await axios.post('/resume/improve', { text: textToImprove, template });
      const data = response.data?.data as { improvedText: string; sections: ResumeSectionsResponse };
      const nextForm = buildFormFromResumeText(data.improvedText, buildForm);
      setBuildForm(nextForm);
      startTransition(() => {
        setPreviewData((current) => buildPreviewFromGeneratedSections(nextForm, data.sections, {
          atsScore: current.atsScore,
          strengths: current.strengths,
          weaknesses: current.weaknesses,
          suggestions: current.suggestions,
          sourceText: data.improvedText,
        }));
      });
      toast({ title: 'Resume improved', description: uploadedResumeText ? 'Your uploaded resume content was improved and loaded into the builder.' : 'Your builder content was improved with AI.' });
    } catch (error: any) {
      toast({ title: 'Improvement failed', description: error.response?.data?.message || 'Could not improve the resume.', variant: 'destructive' });
    } finally {
      setLoading((current) => ({ ...current, improve: false }));
    }
  };

  const handleResetBuilder = () => {
    setBuildForm(INITIAL_FORM);
    startTransition(() => {
      setPreviewData((current) =>
        buildPreviewFromForm(INITIAL_FORM, {
          strengths: current.strengths,
          weaknesses: current.weaknesses,
          suggestions: current.suggestions,
          atsScore: current.atsScore,
          sourceText: current.sourceText,
        })
      );
    });
    toast({ title: 'Builder reset', description: 'The build resume form has been reset to its default state.' });
  };

  const renderSectionEditor = (
    title: string,
    items: ResumeSectionItem[],
    stateKey: 'experience' | 'projects' | 'education' | 'certifications',
    type: 'experience' | 'project' | 'education' | 'certification'
  ) => (
    <Card className={softPanel}>
      <CardHeader className="p-0 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>Use detailed entries so the preview feels like a complete professional resume.</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setBuildForm((current) => ({ ...current, [stateKey]: [...current[stateKey], createEntry(type)] }))}>
            <Plus className="mr-2 h-4 w-4" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-0">
        {items.map((item) => (
          <div key={item.id} className={cn('rounded-3xl border p-5', darkTheme ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')}>
            <div className="grid gap-4 lg:grid-cols-3">
              <Input placeholder={type === 'education' ? 'Degree / Course' : 'Title'} value={item.title} onChange={(event) => setBuildForm((current) => ({ ...current, [stateKey]: updateSectionItem(current[stateKey], item.id, 'title', event.target.value) }))} />
              <Input placeholder={type === 'education' ? 'Institution' : type === 'certification' ? 'Issuer' : 'Company / Stack'} value={item.subtitle} onChange={(event) => setBuildForm((current) => ({ ...current, [stateKey]: updateSectionItem(current[stateKey], item.id, 'subtitle', event.target.value) }))} />
              <Input placeholder="Date / Meta / Location" value={item.meta} onChange={(event) => setBuildForm((current) => ({ ...current, [stateKey]: updateSectionItem(current[stateKey], item.id, 'meta', event.target.value) }))} />
            </div>
            {type !== 'education' && type !== 'certification' ? (
              <Textarea className="mt-4 min-h-[130px]" placeholder="One bullet per line" value={item.bullets.join('\n')} onChange={(event) => setBuildForm((current) => ({ ...current, [stateKey]: updateSectionBullets(current[stateKey], item.id, event.target.value) }))} />
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className={layoutShell}>
      <div className="mx-auto max-w-[1700px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-40 pb-4 pt-1">
          <AnimatedSection>
            <Card className={cn(cardClass, 'overflow-hidden')}>
              <CardContent className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-9">
                <div className="space-y-6">
                  <Badge className="w-fit border-0 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white" style={{ backgroundColor: themePreview.primary }}>
                    AI Resume Platform
                  </Badge>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">A larger, fuller resume workspace with analysis, builder controls, preview, and export</h1>
                    <p className="max-w-4xl text-base leading-8 text-muted-foreground">
                      The builder now stays more spacious, includes fuller professional-resume sections, keeps AI improve actions directly beside generation, and adds a stronger upload analysis report with charts and role guidance.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: 'ATS Score', value: `${deferredPreview.atsScore || 0}` },
                      { label: 'Templates', value: '4' },
                      { label: 'Builder Sections', value: '10+' },
                    ].map((item) => (
                      <div key={item.label} className={softPanel}>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                        <p className="mt-3 text-3xl font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={softPanel}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Current template</p>
                      <p className="mt-2 text-xl font-semibold">{TEMPLATE_OPTIONS.find((item) => item.id === template)?.label}</p>
                    </div>
                    <Select value={template} onValueChange={(value) => setTemplate(value as ResumeTemplateId)}>
                      <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_OPTIONS.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ATS readiness</span>
                      <span className="font-medium">{deferredPreview.atsScore || 0}%</span>
                    </div>
                    <Progress value={deferredPreview.atsScore || 0} className="h-2.5" />
                    <p className="text-sm leading-7 text-muted-foreground">The preview updates from your builder data, uploaded resume insights, and AI-generated improvements while keeping theme visibility strong.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        <div className={cn('mt-6 grid gap-6', activeTab === 'build' ? '2xl:grid-cols-[minmax(0,1.18fr)_minmax(520px,0.82fr)]' : 'grid-cols-1')}>
          <AnimatedSection delay={0.08}>
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle>Resume workspace</CardTitle>
                <CardDescription>Upload and analyze first, then move into the expanded builder with generation and improvement controls.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <div className={cn('sticky top-0 z-30 rounded-2xl border p-2 backdrop-blur', darkTheme ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white/95')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
                      <TabsTrigger value="build">Build Resume</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="upload" className="space-y-6">
                    <Card className={softPanel}>
                      <CardContent className="space-y-5 p-0">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">Upload resume PDF</h3>
                          <p className="text-sm leading-7 text-muted-foreground">Analyze ATS score, strengths, weaknesses, keyword gaps, visual report insights, and easier-fit role recommendations from the uploaded profile.</p>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                          <Input type="file" accept=".pdf,application/pdf" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} />
                          <Button onClick={handleAnalyze} disabled={loading.analyze}>
                            {loading.analyze ? <LoadingSpinner size="sm" /> : <FileSearch className="mr-2 h-4 w-4" />}
                            Analyze Resume
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {analysis ? (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <Card className={softPanel}>
                            <CardHeader className="p-0 pb-4"><CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-primary" />ATS Score</CardTitle></CardHeader>
                            <CardContent className="space-y-4 p-0">
                              <div className="text-5xl font-semibold">{analysis.ats_score}</div>
                              <Progress value={analysis.ats_score} className="h-2.5" />
                            </CardContent>
                          </Card>
                          <Card className={softPanel}>
                            <CardHeader className="p-0 pb-4"><CardTitle className="text-lg">Missing keywords</CardTitle></CardHeader>
                            <CardContent className="flex flex-wrap gap-2 p-0">
                              {analysis.missing_keywords.length ? analysis.missing_keywords.map((item) => <Badge key={item} variant="secondary">{item}</Badge>) : <p className="text-sm text-muted-foreground">No major missing keywords detected.</p>}
                            </CardContent>
                          </Card>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-3">
                          {[
                            { title: 'Strengths', items: analysis.strengths },
                            { title: 'Weaknesses', items: analysis.weaknesses },
                            { title: 'Suggestions', items: analysis.suggestions },
                          ].map((section) => (
                            <Card key={section.title} className={softPanel}>
                              <CardHeader className="p-0 pb-4"><CardTitle className="text-lg">{section.title}</CardTitle></CardHeader>
                              <CardContent className="space-y-3 p-0">
                                {section.items.map((item) => <div key={item} className={cn('rounded-2xl border px-4 py-3 text-sm leading-6', darkTheme ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')}>{item}</div>)}
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                          <Card className={softPanel}>
                            <CardHeader className="p-0 pb-4">
                              <CardTitle className="text-lg">ATS report chart</CardTitle>
                              <CardDescription>Quick visual breakdown of score strength, keyword alignment, content depth, and profile risk.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[280px] p-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={atsBreakdown}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkTheme ? '#334155' : '#cbd5e1'} />
                                  <XAxis
                                    dataKey="name"
                                    interval={0}
                                    height={58}
                                    tick={{ fill: darkTheme ? '#cbd5e1' : '#475569', fontSize: 11 }}
                                    tickFormatter={wrapChartLabel}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis tick={{ fill: darkTheme ? '#cbd5e1' : '#475569', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                  <Tooltip
                                    cursor={{ fill: darkTheme ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.08)' }}
                                    formatter={(value) => [`${value}`, 'Score']}
                                    labelFormatter={(label) => String(label).replace(/\s+/g, ' ')}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d8', color: '#000000' }}
                                    labelStyle={{ color: '#000000', fontWeight: 600 }}
                                    itemStyle={{ color: '#000000' }}
                                  />
                                  <Bar dataKey="value" radius={[10, 10, 0, 0]} fill={themePreview.primary} />
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          <Card className={softPanel}>
                            <CardHeader className="p-0 pb-4">
                              <CardTitle className="text-lg">Feedback distribution</CardTitle>
                              <CardDescription>See where the report is concentrated so users understand what needs attention first.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 p-0 lg:grid-cols-[minmax(0,1fr)_180px]">
                              <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie data={feedbackDistribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88} paddingAngle={4}>
                                      {feedbackDistribution.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${name}: ${value}`, '']} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="grid gap-2 self-center">
                                {feedbackDistribution.map((entry) => (
                                  <div key={entry.name} className={cn('rounded-xl border px-3 py-2.5', darkTheme ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')}>
                                    <div className="flex items-center gap-2">
                                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                      <p className="text-xs font-medium leading-5">{entry.name}</p>
                                    </div>
                                    <p className="mt-1 text-base font-semibold">{entry.value}</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                          <Card className={softPanel}>
                            <CardHeader className="p-0 pb-4">
                              <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Recommended roles from this profile
                              </CardTitle>
                              <CardDescription>Roles this profile is more likely to get shortlisted for based on resume keywords, skill signals, and general accessibility.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-0">
                              {recommendedRoles.map((role) => (
                                <div key={role.id} className={cn('rounded-3xl border p-4', darkTheme ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')}>
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="text-lg font-semibold">{role.label}</p>
                                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{role.why}</p>
                                    </div>
                                    <Badge variant="secondary">Fit score {role.score}</Badge>
                                  </div>
                                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <div>
                                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Growth</p>
                                      <p className="mt-2 font-medium">{role.growthRate}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Remote share</p>
                                      <p className="mt-2 font-medium">{role.remoteShare}%</p>
                                    </div>
                                    <div>
                                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Matched keywords</p>
                                      <p className="mt-2 font-medium">{role.matchedKeywords}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          <Card className={softPanel}>
                            <CardHeader className="p-0 pb-4">
                              <CardTitle className="text-lg">Trending now</CardTitle>
                              <CardDescription>Roles showing stronger demand signals in the app’s market insight data right now.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 p-0">
                              {trendingRoles.map((role, index) => (
                                <div key={role.id} className={cn('rounded-2xl border px-4 py-4', darkTheme ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="font-semibold">{index + 1}. {role.label}</p>
                                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{role.trend}</p>
                                    </div>
                                    <Badge variant="secondary">{role.growthRate}</Badge>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </div>
                      </motion.div>
                    ) : null}
                  </TabsContent>
                  <TabsContent value="build" className="space-y-6">
                    <Card className={softPanel}>
                      <CardHeader className="p-0 pb-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-xl">Professional resume builder</CardTitle>
                            <CardDescription>Personal info, summary, experience, projects, education, certifications, achievements, languages, interests, and custom sections.</CardDescription>
                          </div>
                          <Button variant="outline" onClick={handleResetBuilder}>
                            Reset Builder
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 p-0">
                        <div className="grid gap-5 md:grid-cols-2">
                          {[
                            ['Name', 'name'],
                            ['Email', 'email'],
                            ['Phone', 'phone'],
                            ['Location', 'location'],
                            ['LinkedIn', 'linkedin'],
                            ['Portfolio', 'portfolio'],
                          ].map(([label, key]) => (
                            <div key={key}>
                              <p className="mb-2 text-sm font-medium">{label}</p>
                              <Input value={buildForm.personalInfo[key as keyof PersonalInfo]} onChange={(event) => setBuildForm((current) => ({ ...current, personalInfo: { ...current.personalInfo, [key]: event.target.value } }))} />
                            </div>
                          ))}
                          <div className="md:col-span-2">
                            <p className="mb-2 text-sm font-medium">Headline</p>
                            <Input value={buildForm.personalInfo.headline} onChange={(event) => setBuildForm((current) => ({ ...current, personalInfo: { ...current.personalInfo, headline: event.target.value } }))} />
                          </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-sm font-medium">Target role</p>
                            <Input value={buildForm.targetRole} onChange={(event) => setBuildForm((current) => ({ ...current, targetRole: event.target.value }))} />
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-medium">Core skills</p>
                            <Input value={buildForm.coreSkills} onChange={(event) => setBuildForm((current) => ({ ...current, coreSkills: event.target.value }))} />
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-sm font-medium">Professional summary</p>
                          <Textarea className="min-h-[150px]" value={buildForm.summary} onChange={(event) => setBuildForm((current) => ({ ...current, summary: event.target.value }))} />
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                          <div>
                            <p className="mb-2 text-sm font-medium">Technical skills</p>
                            <Textarea className="min-h-[120px]" value={buildForm.technicalSkills} onChange={(event) => setBuildForm((current) => ({ ...current, technicalSkills: event.target.value }))} />
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-medium">Tools & platforms</p>
                            <Textarea className="min-h-[120px]" value={buildForm.tools} onChange={(event) => setBuildForm((current) => ({ ...current, tools: event.target.value }))} />
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-sm font-medium">Job description for targeting</p>
                          <Textarea className="min-h-[170px]" value={buildForm.jobDescription} onChange={(event) => setBuildForm((current) => ({ ...current, jobDescription: event.target.value }))} />
                        </div>
                      </CardContent>
                    </Card>

                    {renderSectionEditor('Experience', buildForm.experience, 'experience', 'experience')}
                    {renderSectionEditor('Projects', buildForm.projects, 'projects', 'project')}
                    {renderSectionEditor('Education', buildForm.education, 'education', 'education')}
                    {renderSectionEditor('Certifications', buildForm.certifications, 'certifications', 'certification')}

                    <Card className={softPanel}>
                      <CardHeader className="p-0 pb-5"><CardTitle className="text-xl">Additional professional sections</CardTitle></CardHeader>
                      <CardContent className="grid gap-5 p-0 lg:grid-cols-3">
                        <div>
                          <p className="mb-2 text-sm font-medium">Achievements</p>
                          <Textarea className="min-h-[150px]" value={buildForm.achievements} onChange={(event) => setBuildForm((current) => ({ ...current, achievements: event.target.value }))} />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium">Languages</p>
                          <Textarea className="min-h-[150px]" value={buildForm.languages} onChange={(event) => setBuildForm((current) => ({ ...current, languages: event.target.value }))} />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium">Interests</p>
                          <Textarea className="min-h-[150px]" value={buildForm.interests} onChange={(event) => setBuildForm((current) => ({ ...current, interests: event.target.value }))} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={softPanel}>
                      <CardHeader className="p-0 pb-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <CardTitle className="text-xl">Custom sections</CardTitle>
                            <CardDescription>Add any extra resume block you want at the end, such as volunteering, publications, leadership, or workshops.</CardDescription>
                          </div>
                          <Button variant="outline" onClick={() => setBuildForm((current) => ({ ...current, customSections: [...current.customSections, { id: createId('custom'), title: '', items: [''] }] }))}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Custom Section
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5 p-0">
                        {buildForm.customSections.length === 0 ? <p className="text-sm text-muted-foreground">No custom section added yet.</p> : null}
                        {buildForm.customSections.map((section) => (
                          <div key={section.id} className={cn('rounded-3xl border p-5', darkTheme ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')}>
                            <Input placeholder="Custom section title" value={section.title} onChange={(event) => setBuildForm((current) => ({ ...current, customSections: current.customSections.map((item) => item.id === section.id ? { ...item, title: event.target.value } : item) }))} />
                            <Textarea className="mt-4 min-h-[130px]" placeholder="One item per line" value={section.items.join('\n')} onChange={(event) => setBuildForm((current) => ({ ...current, customSections: current.customSections.map((item) => item.id === section.id ? { ...item, items: event.target.value.split('\n') } : item) }))} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <div className="flex flex-wrap gap-4">
                      <Button onClick={handleGenerate} disabled={loading.generate} size="lg">
                        {loading.generate ? <LoadingSpinner size="sm" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Resume
                      </Button>
                      <Button onClick={handleImprove} disabled={loading.improve} size="lg" variant="outline">
                        {loading.improve ? <LoadingSpinner size="sm" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Improve Resume
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </AnimatedSection>

          {activeTab === 'build' ? (
            <AnimatedSection delay={0.12}>
              <Card className={cardClass}>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Live preview</CardTitle>
                    <CardDescription>Visible only while building the resume and styled to match the current theme.</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Select value={template} onValueChange={(value) => setTemplate(value as ResumeTemplateId)}>
                      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_OPTIONS.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleDownload} disabled={loading.download}>
                      {loading.download ? <LoadingSpinner size="sm" /> : <Download className="mr-2 h-4 w-4" />}
                      Download PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className={cn('h-[calc(100vh-210px)] min-h-[820px] rounded-[28px] border p-4', darkTheme ? 'border-white/10 bg-black/10' : 'border-slate-200 bg-slate-100/80')}>
                    <div ref={previewRef}>
                      <ResumePreview resume={deferredPreview || EMPTY_PREVIEW} template={template} darkTheme={darkTheme} accentColor={themePreview.primary} exportMode={exportMode} />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </AnimatedSection>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
