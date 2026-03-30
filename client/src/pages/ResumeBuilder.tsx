import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Briefcase,
  CheckCircle2,
  Download,
  FileText,
  FolderKanban,
  GraduationCap,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  Wand2,
} from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';

type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string;
};

type ProjectItem = {
  id: string;
  name: string;
  techStack: string;
  bullets: string;
};

type EducationItem = {
  id: string;
  school: string;
  degree: string;
  year: string;
};

type CertificationItem = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

type ResumeCore = {
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
  technicalSkills: string;
  tools: string[];
  achievements: string[];
  keywordBlock: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  jobDescription: string;
};

type AtsBreakdown = {
  overall: number;
  keywordMatch: number;
  structure: number;
  impact: number;
  readability: number;
  professionalism: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
};

type RoleBlueprint = {
  label: string;
  headline: string;
  summary: string;
  skills: string[];
  technicalSkills: string;
  tools: string[];
  achievements: string[];
  keywords: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
};

type TemplateId = 'modern' | 'executive' | 'minimal';
type RoleKey =
  | 'frontend-developer'
  | 'backend-developer'
  | 'full-stack-developer'
  | 'data-analyst'
  | 'data-scientist'
  | 'product-manager'
  | 'ui-ux-designer'
  | 'devops-engineer';

const STORAGE_KEY = 'resume-builder-professional-v2';

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const splitLines = (value: string) =>
  value
    .split(/\n|•|-/)
    .map((item) => item.trim())
    .filter(Boolean);

const unique = (values: string[]) => Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const starterEducation = (): EducationItem[] => [
  {
    id: createId('edu'),
    school: 'Your University',
    degree: 'Bachelor of Technology / Bachelor of Science',
    year: '2026',
  },
];

const ROLE_BLUEPRINTS: Record<RoleKey, RoleBlueprint> = {
  'frontend-developer': {
    label: 'Frontend Developer',
    headline: 'Frontend Developer | React, TypeScript, Performance Optimization',
    summary:
      'Frontend developer with experience building responsive web products, improving usability, and shipping performant interfaces with React, TypeScript, and design systems. Strong at translating business requirements into clean, accessible experiences that improve conversion and user satisfaction.',
    skills: [
      'React',
      'TypeScript',
      'JavaScript',
      'HTML5',
      'CSS3',
      'Tailwind CSS',
      'Responsive Design',
      'Accessibility',
      'Redux',
      'REST API Integration',
      'Performance Optimization',
      'Component Architecture',
    ],
    technicalSkills: 'React, TypeScript, JavaScript, Tailwind CSS, Redux Toolkit, Next.js, Vite, Jest, Cypress, REST APIs',
    tools: ['Figma', 'Git', 'GitHub', 'Jira', 'Postman', 'Vercel'],
    achievements: [
      'Improved Lighthouse performance score from 68 to 93 by optimizing bundle size and image delivery.',
      'Reduced onboarding drop-off by 24% after redesigning key user flows and simplifying form validation.',
    ],
    keywords: [
      'react',
      'typescript',
      'javascript',
      'frontend',
      'ui',
      'ux',
      'accessibility',
      'responsive design',
      'performance optimization',
      'component library',
      'state management',
      'rest api',
    ],
    experience: [
      {
        id: createId('exp'),
        title: 'Frontend Developer Intern',
        company: 'Product Studio',
        location: 'Remote',
        startDate: 'Jan 2025',
        endDate: 'Present',
        current: true,
        bullets:
          'Built reusable React components and responsive pages used across 3 customer-facing modules.\nImproved page load speed by 31% through code splitting, lazy loading, and CSS cleanup.\nPartnered with designers and backend engineers to deliver 12 production-ready features on schedule.',
      },
    ],
    projects: [
      {
        id: createId('proj'),
        name: 'ATS Resume Platform',
        techStack: 'React, TypeScript, Tailwind CSS, Node.js',
        bullets:
          'Designed a resume workflow with live ATS feedback, keyword targeting, and export-ready templates.\nCreated form validation and structured resume sections that improved completion quality for end users.',
      },
    ],
    education: starterEducation(),
    certifications: [
      {
        id: createId('cert'),
        name: 'Front-End Web Developer Certification',
        issuer: 'Coursera / Meta',
        year: '2025',
      },
    ],
  },
  'backend-developer': {
    label: 'Backend Developer',
    headline: 'Backend Developer | APIs, Databases, System Reliability',
    summary:
      'Backend developer focused on scalable API design, database modeling, and secure service architecture. Experienced in improving response times, maintaining clean codebases, and building reliable server-side workflows that support product growth.',
    skills: [
      'Node.js',
      'Express.js',
      'REST APIs',
      'SQL',
      'MongoDB',
      'PostgreSQL',
      'Authentication',
      'System Design',
      'Caching',
      'Microservices',
      'Error Handling',
      'API Documentation',
    ],
    technicalSkills: 'Node.js, Express.js, TypeScript, PostgreSQL, MongoDB, Redis, JWT, Docker, REST APIs, Swagger',
    tools: ['Postman', 'Docker', 'GitHub Actions', 'Jira', 'AWS'],
    achievements: [
      'Reduced average API response time by 38% by optimizing queries, indexing, and caching frequently accessed data.',
      'Improved production stability by introducing structured logging and error tracking across critical services.',
    ],
    keywords: [
      'backend',
      'node.js',
      'api',
      'rest',
      'database',
      'sql',
      'microservices',
      'authentication',
      'scalability',
      'docker',
      'aws',
      'security',
    ],
    experience: [
      {
        id: createId('exp'),
        title: 'Backend Developer Intern',
        company: 'Cloud Systems Lab',
        location: 'Bengaluru',
        startDate: 'Feb 2025',
        endDate: 'Present',
        current: true,
        bullets:
          'Developed secure REST APIs for application workflows serving 5 internal teams.\nOptimized database queries and reduced report generation time from 14 seconds to 6 seconds.\nWrote validation and audit logging flows that improved production traceability and reduced support effort.',
      },
    ],
    projects: [
      {
        id: createId('proj'),
        name: 'Interview Scheduling API',
        techStack: 'Node.js, Express.js, MongoDB, JWT',
        bullets:
          'Built role-based APIs for interview scheduling, reminders, and status tracking.\nImplemented schema validation and reusable middleware to improve data consistency and maintainability.',
      },
    ],
    education: starterEducation(),
    certifications: [],
  },
  'full-stack-developer': {
    label: 'Full Stack Developer',
    headline: 'Full Stack Developer | React, Node.js, Product Delivery',
    summary:
      'Full stack developer with hands-on experience building complete web applications from user interface to API and deployment. Comfortable owning features end to end, improving product quality, and aligning engineering decisions with business goals.',
    skills: [
      'React',
      'TypeScript',
      'Node.js',
      'Express.js',
      'MongoDB',
      'PostgreSQL',
      'REST APIs',
      'Authentication',
      'Responsive Design',
      'Testing',
      'Deployment',
      'System Integration',
    ],
    technicalSkills: 'React, TypeScript, Node.js, Express.js, MongoDB, PostgreSQL, Docker, Tailwind CSS, REST APIs',
    tools: ['Git', 'GitHub', 'Postman', 'Render', 'Vercel', 'Jira'],
    achievements: [
      'Delivered full-stack features 20% faster by creating reusable API and UI building blocks.',
      'Improved application completion rate by 18% after simplifying backend validation and front-end form UX.',
    ],
    keywords: [
      'full stack',
      'react',
      'node.js',
      'typescript',
      'api',
      'database',
      'deployment',
      'testing',
      'authentication',
      'product delivery',
    ],
    experience: [
      {
        id: createId('exp'),
        title: 'Full Stack Developer',
        company: 'Campus Innovation Team',
        location: 'Remote',
        startDate: 'Aug 2024',
        endDate: 'Present',
        current: true,
        bullets:
          'Built and maintained a full-stack job platform covering authentication, applications, messaging, and analytics.\nReduced bug turnaround time by introducing reusable validation patterns and clearer API contracts.\nWorked closely with stakeholders to prioritize high-impact features and ship iterative improvements.',
      },
    ],
    projects: [
      {
        id: createId('proj'),
        name: 'Recruitment Workflow App',
        techStack: 'React, Node.js, MongoDB, Tailwind CSS',
        bullets:
          'Created an end-to-end recruitment system with dashboards, application tracking, and interview modules.\nAdded analytics and resume tooling that increased user engagement and improved task completion flow.',
      },
    ],
    education: starterEducation(),
    certifications: [],
  },
  'data-analyst': {
    label: 'Data Analyst',
    headline: 'Data Analyst | SQL, Excel, BI Dashboards, Insights',
    summary:
      'Data analyst with experience turning raw business data into clear dashboards, reports, and decision-ready insights. Strong in SQL, spreadsheets, and visualization, with a focus on improving visibility, identifying trends, and supporting operational improvements.',
    skills: [
      'SQL',
      'Excel',
      'Power BI',
      'Data Cleaning',
      'Dashboarding',
      'Reporting',
      'Statistics',
      'Data Visualization',
      'Business Insights',
      'A/B Analysis',
      'KPI Tracking',
      'Stakeholder Communication',
    ],
    technicalSkills: 'SQL, Excel, Power BI, Tableau, Python, Pandas, Google Sheets, Data Modeling',
    tools: ['Power BI', 'Tableau', 'Excel', 'Jupyter', 'Google Sheets'],
    achievements: [
      'Automated recurring performance reports and reduced manual reporting effort by 9 hours per week.',
      'Built executive dashboards that improved KPI visibility and enabled faster weekly decision-making.',
    ],
    keywords: [
      'sql',
      'dashboard',
      'reporting',
      'excel',
      'power bi',
      'tableau',
      'data analysis',
      'kpi',
      'insights',
      'data cleaning',
    ],
    experience: [
      {
        id: createId('exp'),
        title: 'Data Analyst Intern',
        company: 'Insight Metrics',
        location: 'Hybrid',
        startDate: 'Jan 2025',
        endDate: 'Present',
        current: true,
        bullets:
          'Created SQL queries and automated dashboards for operational and hiring performance metrics.\nImproved data accuracy by standardizing source files and validating business rules before reporting.\nPresented weekly insights to stakeholders and highlighted trends that informed backlog priorities.',
      },
    ],
    projects: [
      {
        id: createId('proj'),
        name: 'Hiring Funnel Dashboard',
        techStack: 'Power BI, SQL, Excel',
        bullets:
          'Built an interactive dashboard to track applicant volume, interview conversion, and turnaround time.\nIdentified process bottlenecks that supported a 15% improvement in recruiter response time.',
      },
    ],
    education: starterEducation(),
    certifications: [],
  },
  'data-scientist': {
    label: 'Data Scientist',
    headline: 'Data Scientist | Machine Learning, Python, Predictive Modeling',
    summary:
      'Data scientist with practical experience in machine learning workflows, feature engineering, and translating data findings into measurable outcomes. Comfortable working from exploration to model evaluation while keeping business impact and clarity in focus.',
    skills: [
      'Python',
      'Machine Learning',
      'Pandas',
      'NumPy',
      'Scikit-learn',
      'Feature Engineering',
      'Model Evaluation',
      'Statistics',
      'SQL',
      'Data Visualization',
      'Experimentation',
      'Forecasting',
    ],
    technicalSkills: 'Python, Pandas, NumPy, Scikit-learn, SQL, Jupyter, Matplotlib, Seaborn, Model Evaluation',
    tools: ['Jupyter', 'Git', 'MLflow', 'Power BI'],
    achievements: [
      'Improved prediction accuracy by 14% after revising feature engineering and model selection strategy.',
      'Reduced manual analysis time by automating exploratory analysis and reusable model reporting notebooks.',
    ],
    keywords: [
      'python',
      'machine learning',
      'statistics',
      'modeling',
      'feature engineering',
      'sql',
      'forecasting',
      'classification',
      'regression',
      'experimentation',
    ],
    experience: [
      {
        id: createId('exp'),
        title: 'Data Science Intern',
        company: 'Predictive Labs',
        location: 'Remote',
        startDate: 'Dec 2024',
        endDate: 'Present',
        current: true,
        bullets:
          'Prepared datasets, engineered features, and evaluated machine learning models for classification tasks.\nBuilt reproducible notebooks that improved collaboration and shortened review cycles.\nCommunicated model performance and practical trade-offs to non-technical stakeholders.',
      },
    ],
    projects: [
      {
        id: createId('proj'),
        name: 'Candidate Match Score Model',
        techStack: 'Python, Pandas, Scikit-learn, SQL',
        bullets:
          'Developed a scoring workflow to rank candidate-job alignment using structured profile signals.\nMeasured performance with precision, recall, and feature importance to support practical interpretability.',
      },
    ],
    education: starterEducation(),
    certifications: [],
  },
  'product-manager': {
    label: 'Product Manager',
    headline: 'Product Manager | Roadmaps, User Research, Product Execution',
    summary:
      'Product manager with a strong bias toward clarity, prioritization, and measurable delivery. Experienced in gathering stakeholder input, turning insights into roadmap decisions, and partnering with engineering and design teams to ship improvements that matter to users.',
    skills: [
      'Roadmapping',
      'User Research',
      'Requirement Gathering',
      'Backlog Prioritization',
      'Stakeholder Management',
      'Product Analytics',
      'Experimentation',
      'Go-to-Market',
      'KPI Definition',
      'Agile Delivery',
      'Competitive Analysis',
      'Cross-functional Leadership',
    ],
    technicalSkills: 'Product Analytics, Jira, Confluence, SQL, A/B Testing, User Interviews, PRDs, Agile Planning',
    tools: ['Jira', 'Confluence', 'Notion', 'Figma', 'Mixpanel'],
    achievements: [
      'Launched a workflow improvement that increased candidate application completion by 19%.',
      'Reduced cross-team ambiguity by introducing clearer PRDs, success metrics, and release checklists.',
    ],
    keywords: [
      'product manager',
      'roadmap',
      'stakeholders',
      'requirements',
      'prioritization',
      'analytics',
      'kpi',
      'user research',
      'go to market',
      'experimentation',
    ],
    experience: [
      {
        id: createId('exp'),
        title: 'Associate Product Manager',
        company: 'Digital Growth Team',
        location: 'Hybrid',
        startDate: 'Jul 2024',
        endDate: 'Present',
        current: true,
        bullets:
          'Owned discovery and delivery planning for candidate experience improvements across web workflows.\nWorked with engineers and designers to define requirements, acceptance criteria, and release priorities.\nTracked user behavior and feature performance to refine roadmap decisions and improve conversion metrics.',
      },
    ],
    projects: [
      {
        id: createId('proj'),
        name: 'Resume Quality Improvement Initiative',
        techStack: 'Product Discovery, Analytics, Figma, Jira',
        bullets:
          'Defined a product concept for ATS-focused resume support with clear user problems, success metrics, and phased scope.\nAligned engineering and design around a roadmap that balanced quality, delivery speed, and user value.',
      },
    ],
    education: starterEducation(),
    certifications: [],
  },
  'ui-ux-designer': {
    label: 'UI/UX Designer',
    headline: 'UI/UX Designer | Design Systems, Research, User-Centered Interfaces',
    summary:
      'UI/UX designer focused on creating intuitive digital experiences grounded in research, hierarchy, and usability. Strong in wireframing, prototyping, and translating complex requirements into clean flows that feel clear and credible.',
    skills: [
      'User Experience Design',
      'User Interface Design',
      'Wireframing',
      'Prototyping',
      'Design Systems',
      'Usability Testing',
      'Information Architecture',
      'Interaction Design',
      'Visual Hierarchy',
      'Accessibility',
      'Research Synthesis',
      'Design Handoff',
    ],
    technicalSkills: 'Figma, Adobe XD, Wireframing, Prototyping, User Flows, Design Systems, Accessibility Reviews',
    tools: ['Figma', 'FigJam', 'Adobe XD', 'Notion', 'Miro'],
    achievements: [
      'Improved task completion rate by 21% after simplifying a multi-step application form and strengthening layout hierarchy.',
      'Created reusable design system patterns that accelerated new screen design and reduced handoff issues.',
    ],
    keywords: [
      'ui',
      'ux',
      'figma',
      'design system',
      'user research',
      'wireframe',
      'prototype',
      'accessibility',
      'interaction design',
      'usability',
    ],
    experience: [
      {
        id: createId('exp'),
        title: 'UI/UX Designer',
        company: 'Experience Studio',
        location: 'Remote',
        startDate: 'Nov 2024',
        endDate: 'Present',
        current: true,
        bullets:
          'Designed user flows, wireframes, and polished interfaces for candidate and recruiter journeys.\nRan usability reviews and translated research findings into simpler, more confident interaction patterns.\nWorked with engineering to maintain consistency, accessibility, and feasible implementation scope.',
      },
    ],
    projects: [
      {
        id: createId('proj'),
        name: 'Resume Builder Redesign',
        techStack: 'Figma, Design System, Usability Testing',
        bullets:
          'Redesigned an ATS-first resume experience with stronger hierarchy, clearer editing flow, and professional presentation.\nValidated layout changes against readability and usability feedback before development handoff.',
      },
    ],
    education: starterEducation(),
    certifications: [],
  },
  'devops-engineer': {
    label: 'DevOps Engineer',
    headline: 'DevOps Engineer | CI/CD, Cloud Infrastructure, Reliability',
    summary:
      'DevOps engineer with experience improving deployment workflows, operational visibility, and service reliability. Comfortable with automation, cloud tooling, and building engineering systems that support faster and safer releases.',
    skills: [
      'CI/CD',
      'Docker',
      'Kubernetes',
      'AWS',
      'Linux',
      'Infrastructure Automation',
      'Monitoring',
      'Logging',
      'Scripting',
      'Deployment Pipelines',
      'Reliability',
      'Security Basics',
    ],
    technicalSkills: 'Docker, Kubernetes, AWS, Linux, Bash, GitHub Actions, Terraform, Monitoring, Nginx',
    tools: ['AWS', 'Docker', 'GitHub Actions', 'Grafana', 'Prometheus'],
    achievements: [
      'Reduced deployment time by 42% by streamlining CI/CD workflows and release checks.',
      'Improved environment stability through monitoring dashboards, alerting, and deployment rollback practices.',
    ],
    keywords: [
      'devops',
      'ci/cd',
      'docker',
      'kubernetes',
      'aws',
      'linux',
      'automation',
      'monitoring',
      'reliability',
      'infrastructure',
    ],
    experience: [
      {
        id: createId('exp'),
        title: 'DevOps Engineer Intern',
        company: 'Platform Operations',
        location: 'Remote',
        startDate: 'Jan 2025',
        endDate: 'Present',
        current: true,
        bullets:
          'Maintained CI/CD pipelines and deployment scripts for web services across staging and production environments.\nImproved observability with centralized logs and dashboarding for critical workflows.\nPartnered with developers to reduce release risk and standardize build and deployment practices.',
      },
    ],
    projects: [
      {
        id: createId('proj'),
        name: 'Automated Deployment Workflow',
        techStack: 'Docker, GitHub Actions, AWS',
        bullets:
          'Built an automated deployment pipeline with environment checks and release notifications.\nReduced manual deployment steps and improved release consistency for multi-service applications.',
      },
    ],
    education: starterEducation(),
    certifications: [],
  },
};

const createResumeFromBlueprint = (role: RoleKey): ResumeCore => {
  const blueprint = ROLE_BLUEPRINTS[role];
  return {
    personal: {
      name: 'Your Name',
      email: 'your.email@example.com',
      phone: '+91 98765 43210',
      location: 'Your City, India',
      headline: blueprint.headline,
      linkedin: 'linkedin.com/in/yourprofile',
      portfolio: 'portfolio.example.com',
    },
    summary: blueprint.summary,
    skills: [...blueprint.skills],
    technicalSkills: blueprint.technicalSkills,
    tools: [...blueprint.tools],
    achievements: [...blueprint.achievements],
    keywordBlock: blueprint.keywords.join(', '),
    experience: blueprint.experience.map((item) => ({ ...item, id: createId('exp') })),
    projects: blueprint.projects.map((item) => ({ ...item, id: createId('proj') })),
    education: blueprint.education.map((item) => ({ ...item, id: createId('edu') })),
    certifications: blueprint.certifications.map((item) => ({ ...item, id: createId('cert') })),
    jobDescription: '',
  };
};

const getInitialState = (): { selectedRole: RoleKey; template: TemplateId; resume: ResumeCore } => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          selectedRole: RoleKey;
          template: TemplateId;
          resume: ResumeCore;
        };
        if (parsed?.selectedRole && parsed?.template && parsed?.resume) {
          return parsed;
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  return {
    selectedRole: 'full-stack-developer',
    template: 'modern',
    resume: createResumeFromBlueprint('full-stack-developer'),
  };
};

const countWords = (value: string) => value.split(/\s+/).filter(Boolean).length;

const buildResumeText = (resume: ResumeCore) => {
  const sections = [
    resume.personal.name,
    resume.personal.headline,
    resume.personal.email,
    resume.personal.phone,
    resume.personal.location,
    resume.personal.linkedin,
    resume.personal.portfolio,
    resume.summary,
    resume.skills.join(' '),
    resume.technicalSkills,
    resume.tools.join(' '),
    resume.achievements.join(' '),
    resume.keywordBlock,
    resume.jobDescription,
    resume.experience.map((item) => `${item.title} ${item.company} ${item.location} ${item.bullets}`).join(' '),
    resume.projects.map((item) => `${item.name} ${item.techStack} ${item.bullets}`).join(' '),
    resume.education.map((item) => `${item.school} ${item.degree} ${item.year}`).join(' '),
    resume.certifications.map((item) => `${item.name} ${item.issuer} ${item.year}`).join(' '),
  ];

  return sections.join(' ').replace(/\s+/g, ' ').trim();
};

const extractRoleKeywords = (jobDescription: string, blueprint: RoleBlueprint) => {
  const lower = jobDescription.toLowerCase();
  return unique(
    blueprint.keywords.filter((keyword) => lower.includes(keyword.toLowerCase())),
  );
};

const calculateAtsScore = (resume: ResumeCore, blueprint: RoleBlueprint): AtsBreakdown => {
  const text = buildResumeText(resume).toLowerCase();
  const targetedKeywords = unique([...blueprint.keywords, ...extractRoleKeywords(resume.jobDescription, blueprint)]);
  const matchedKeywords = targetedKeywords.filter((keyword) => text.includes(keyword.toLowerCase()));
  const missingKeywords = targetedKeywords.filter((keyword) => !matchedKeywords.includes(keyword));

  const keywordMatch = targetedKeywords.length
    ? Math.round((matchedKeywords.length / targetedKeywords.length) * 100)
    : 65;

  let structure = 0;
  if (resume.personal.name && resume.personal.email && resume.personal.phone) structure += 20;
  if (resume.summary.length >= 80) structure += 20;
  if (resume.skills.length >= 8) structure += 15;
  if (resume.experience.length > 0) structure += 20;
  if (resume.projects.length > 0) structure += 10;
  if (resume.education.length > 0) structure += 10;
  if (resume.achievements.length > 0 || resume.certifications.length > 0) structure += 5;

  const impactBullets = resume.experience
    .flatMap((item) => splitLines(item.bullets))
    .filter((bullet) => /\d/.test(bullet)).length;
  const projectImpact = resume.projects
    .flatMap((item) => splitLines(item.bullets))
    .filter((bullet) => /\d/.test(bullet)).length;
  const impact = Math.min(100, 35 + impactBullets * 14 + projectImpact * 8 + resume.achievements.length * 6);

  const words = countWords(text);
  const longBullets = resume.experience
    .flatMap((item) => splitLines(item.bullets))
    .filter((bullet) => countWords(bullet) > 28).length;
  const readability = Math.max(45, 100 - Math.max(0, words - 750) * 0.08 - longBullets * 4);

  const summaryHasRole = resume.summary.toLowerCase().includes(blueprint.label.toLowerCase().split(' ')[0].toLowerCase());
  const headlineFilled = resume.personal.headline.trim().length >= 12;
  const cleanLinks = [resume.personal.linkedin, resume.personal.portfolio].filter(Boolean).length;
  const professionalism = Math.min(
    100,
    55 +
      (summaryHasRole ? 15 : 0) +
      (headlineFilled ? 10 : 0) +
      Math.min(10, cleanLinks * 5) +
      Math.min(10, resume.certifications.length * 5),
  );

  const suggestions: string[] = [];
  if (resume.summary.length < 80) suggestions.push('Expand the summary to 3-4 strong lines focused on role fit and measurable value.');
  if (resume.skills.length < 10) suggestions.push('Add more role-specific skills so the resume looks targeted instead of generic.');
  if (impactBullets < 3) suggestions.push('Add numbers to experience bullets such as percentages, volumes, revenue, time saved, or performance gains.');
  if (missingKeywords.length > 0) {
    suggestions.push(`Include missing target keywords naturally across the summary, skills, and bullets: ${missingKeywords.slice(0, 6).join(', ')}.`);
  }
  if (!resume.projects.length) suggestions.push('Add at least one project that supports the selected profile and showcases tools you used.');
  if (countWords(resume.summary) > 95) suggestions.push('Tighten the summary so it stays concise and easier for recruiters to scan.');

  const overall = Math.round(
    keywordMatch * 0.33 +
      structure * 0.2 +
      impact * 0.2 +
      readability * 0.12 +
      professionalism * 0.15,
  );

  return {
    overall,
    keywordMatch,
    structure,
    impact,
    readability: Math.round(readability),
    professionalism,
    missingKeywords,
    matchedKeywords,
    suggestions: suggestions.slice(0, 5),
  };
};

const getResumeLinesForExport = (resume: ResumeCore) => {
  const lines: string[] = [];
  lines.push(resume.personal.name || 'Your Name');
  if (resume.personal.headline) lines.push(resume.personal.headline);
  lines.push(
    [
      resume.personal.email,
      resume.personal.phone,
      resume.personal.location,
      resume.personal.linkedin,
      resume.personal.portfolio,
    ]
      .filter(Boolean)
      .join(' | '),
  );
  lines.push('');

  const pushSection = (title: string, content: string[]) => {
    if (!content.some((item) => item.trim().length > 0)) return;
    lines.push(title);
    content.forEach((item) => lines.push(item));
    lines.push('');
  };

  pushSection('PROFESSIONAL SUMMARY', [resume.summary]);
  pushSection('CORE SKILLS', [resume.skills.join(', ')]);
  pushSection('TECHNICAL STACK', [resume.technicalSkills]);
  pushSection('TOOLS', [resume.tools.join(', ')]);
  pushSection('KEY ACHIEVEMENTS', resume.achievements.map((item) => `- ${item}`));

  if (resume.experience.length > 0) {
    const content = resume.experience.flatMap((item) => [
      `${item.title} | ${item.company} | ${item.location}`,
      `${item.startDate} - ${item.current ? 'Present' : item.endDate}`,
      ...splitLines(item.bullets).map((bullet) => `- ${bullet}`),
      '',
    ]);
    pushSection('PROFESSIONAL EXPERIENCE', content);
  }

  if (resume.projects.length > 0) {
    const content = resume.projects.flatMap((item) => [
      `${item.name}${item.techStack ? ` | ${item.techStack}` : ''}`,
      ...splitLines(item.bullets).map((bullet) => `- ${bullet}`),
      '',
    ]);
    pushSection('PROJECTS', content);
  }

  if (resume.education.length > 0) {
    pushSection(
      'EDUCATION',
      resume.education.map((item) => `${item.school} | ${item.degree} | ${item.year}`),
    );
  }

  if (resume.certifications.length > 0) {
    pushSection(
      'CERTIFICATIONS',
      resume.certifications.map((item) => `${item.name} | ${item.issuer} | ${item.year}`),
    );
  }

  return lines;
};

const sanitizeFileName = (name: string) =>
  (name || 'resume')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'resume';

const saveBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const scoreTone = (score: number) => {
  if (score >= 85) return { label: 'Excellent', bar: 'bg-emerald-500' };
  if (score >= 70) return { label: 'Strong', bar: 'bg-sky-500' };
  if (score >= 55) return { label: 'Needs refinement', bar: 'bg-amber-500' };
  return { label: 'Low', bar: 'bg-rose-500' };
};

const ResumeBuilder = () => {
  const initialState = useMemo(() => getInitialState(), []);
  const [selectedRole, setSelectedRole] = useState<RoleKey>(initialState.selectedRole);
  const [template, setTemplate] = useState<TemplateId>(initialState.template);
  const [resume, setResume] = useState<ResumeCore>(initialState.resume);
  const [activeTab, setActiveTab] = useState('profile');
  const [newSkill, setNewSkill] = useState('');
  const [newTool, setNewTool] = useState('');
  const [exportLoading, setExportLoading] = useState<'pdf' | 'docx' | null>(null);
  const [improvingContent, setImprovingContent] = useState(false);
  const blueprint = ROLE_BLUEPRINTS[selectedRole];
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedRole,
        template,
        resume,
      }),
    );
  }, [selectedRole, template, resume]);

  const ats = useMemo(() => calculateAtsScore(resume, blueprint), [resume, blueprint]);
  const qualityTone = scoreTone(ats.overall);
  const completion = useMemo(() => {
    let score = 0;
    if (resume.personal.name && resume.personal.email && resume.personal.phone) score += 20;
    if (resume.summary.length >= 80) score += 15;
    if (resume.skills.length >= 8) score += 15;
    if (resume.experience.length > 0) score += 20;
    if (resume.projects.length > 0) score += 10;
    if (resume.education.length > 0) score += 10;
    if (resume.technicalSkills.trim()) score += 5;
    if (resume.achievements.length > 0) score += 5;
    return Math.min(100, score);
  }, [resume]);

  const updatePersonal = (field: keyof ResumeCore['personal'], value: string) => {
    setResume((current) => ({
      ...current,
      personal: {
        ...current.personal,
        [field]: value,
      },
    }));
  };

  const addExperience = () => {
    setResume((current) => ({
      ...current,
      experience: [
        ...current.experience,
        {
          id: createId('exp'),
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          bullets: '',
        },
      ],
    }));
  };

  const addProject = () => {
    setResume((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          id: createId('proj'),
          name: '',
          techStack: '',
          bullets: '',
        },
      ],
    }));
  };

  const addEducation = () => {
    setResume((current) => ({
      ...current,
      education: [
        ...current.education,
        {
          id: createId('edu'),
          school: '',
          degree: '',
          year: '',
        },
      ],
    }));
  };

  const addCertification = () => {
    setResume((current) => ({
      ...current,
      certifications: [
        ...current.certifications,
        {
          id: createId('cert'),
          name: '',
          issuer: '',
          year: '',
        },
      ],
    }));
  };

  const applyRoleStarter = (replaceAll: boolean) => {
    const starter = createResumeFromBlueprint(selectedRole);
    setResume((current) => {
      if (replaceAll) return starter;
      return {
        ...current,
        personal: {
          ...starter.personal,
          ...current.personal,
          headline: current.personal.headline || starter.personal.headline,
        },
        summary: current.summary || starter.summary,
        skills: unique([...current.skills, ...starter.skills]),
        technicalSkills: current.technicalSkills || starter.technicalSkills,
        tools: unique([...current.tools, ...starter.tools]),
        achievements: current.achievements.length ? current.achievements : starter.achievements,
        keywordBlock: current.keywordBlock || starter.keywordBlock,
        experience: current.experience.length ? current.experience : starter.experience,
        projects: current.projects.length ? current.projects : starter.projects,
        education: current.education.length ? current.education : starter.education,
        certifications: current.certifications.length ? current.certifications : starter.certifications,
      };
    });

    toast({
      title: replaceAll ? 'Role starter applied' : 'Role content enhanced',
      description: replaceAll
        ? `Loaded a complete ${blueprint.label} starter resume with professional example content.`
        : `Added strong ${blueprint.label} content where your resume was still incomplete.`,
    });
  };

  const autoImprove = async () => {
    const jobKeywords = extractRoleKeywords(resume.jobDescription, blueprint);
    const keywordMerge = unique([...blueprint.keywords, ...jobKeywords]);
    const enhancementLine =
      selectedRole === 'product-manager'
        ? 'Translated stakeholder feedback and user behavior into prioritized roadmap decisions and measurable delivery outcomes.'
        : selectedRole === 'ui-ux-designer'
        ? 'Improved clarity and conversion through user-centered iteration, usability feedback, and stronger visual hierarchy.'
        : 'Delivered measurable improvements in quality, speed, and user outcomes using role-relevant tools and best practices.';

    setImprovingContent(true);
    try {
      const { data } = await axios.post<{ success: boolean; data: ResumeCore }>(
        '/resume/improve',
        {
          roleLabel: blueprint.label,
          jobDescription: resume.jobDescription,
          resume: {
            ...resume,
            personal: {
              ...resume.personal,
              headline: resume.personal.headline || blueprint.headline,
            },
            skills: unique([...resume.skills, ...jobKeywords]),
            keywordBlock: resume.keywordBlock || keywordMerge.join(', '),
          },
        },
      );

      if (!data.success || !data.data) {
        throw new Error('Resume improvement failed');
      }

      setResume(data.data);
      toast({
        title: 'Resume improved',
        description: `Groq generated stronger ${blueprint.label}-focused content from your filled details.`,
      });
      return;
    } catch (error: any) {
      setResume((current) => ({
        ...current,
        personal: {
          ...current.personal,
          headline: current.personal.headline || blueprint.headline,
        },
        summary:
          current.summary.length >= 80
            ? current.summary
            : `${blueprint.summary} Experienced in ${unique([...current.skills, ...jobKeywords]).slice(0, 6).join(', ')} with a strong focus on business impact, reliability, and professional execution.`,
        skills: unique([...current.skills, ...blueprint.skills, ...jobKeywords]),
        technicalSkills: current.technicalSkills || blueprint.technicalSkills,
        tools: unique([...current.tools, ...blueprint.tools]),
        achievements: unique([...current.achievements, ...blueprint.achievements]).slice(0, 4),
        keywordBlock: keywordMerge.join(', '),
        experience:
          current.experience.length === 0
            ? blueprint.experience
            : current.experience.map((item, index) => {
                const fallbackBullets = splitLines(blueprint.experience[index % blueprint.experience.length]?.bullets || '').slice(0, 2);
                const existingBullets = splitLines(item.bullets);
                const improvedBullets = unique([...existingBullets, ...fallbackBullets, enhancementLine]).slice(0, 4);
                return {
                  ...item,
                  bullets: improvedBullets.join('\n'),
                };
              }),
        projects:
          current.projects.length === 0
            ? blueprint.projects
            : current.projects.map((item, index) => {
                const fallback = splitLines(blueprint.projects[index % blueprint.projects.length]?.bullets || '').slice(0, 2);
                return {
                  ...item,
                  bullets: unique([...splitLines(item.bullets), ...fallback]).slice(0, 3).join('\n'),
                };
              }),
        education: current.education.length ? current.education : blueprint.education,
        certifications: current.certifications.length ? current.certifications : blueprint.certifications,
      }));

      toast({
        title: 'Resume improved with fallback',
        description:
          error.response?.data?.message || 'Groq was unavailable, so local ATS-focused improvements were applied instead.',
      });
    } finally {
      setImprovingContent(false);
    }
  };

  const resetDraft = () => {
    const starter = createResumeFromBlueprint(selectedRole);
    setResume(starter);
    toast({
      title: 'Draft reset',
      description: `Started again with the ${blueprint.label} professional template.`,
    });
  };

  const handleExport = async (type: 'pdf' | 'docx') => {
    const fileStem = sanitizeFileName(resume.personal.name || blueprint.label);
    const lines = getResumeLinesForExport(resume);
    setExportLoading(type);

    try {
      if (type === 'docx') {
        const { Document, Packer, Paragraph, TextRun } = await import('docx');
        const children = lines.map((line) => {
          if (line === '') {
            return new Paragraph({ text: '' });
          }

          const isHeading = /^[A-Z ]+$/.test(line);
          return new Paragraph({
            spacing: isHeading ? { before: 220, after: 100 } : { after: 50 },
            children: [
              new TextRun({
                text: line,
                bold: isHeading || line === (resume.personal.name || 'Your Name'),
                size: isHeading ? 24 : undefined,
              }),
            ],
          });
        });

        const doc = new Document({
          sections: [
            {
              properties: {},
              children,
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        saveBlob(blob, `${fileStem}.docx`);
        toast({
          title: 'Word download ready',
          description: 'The resume has been exported as a professional .docx file.',
        });
        return;
      }

      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const usableWidth = pageWidth - margin * 2;
      let y = 18;

      const addLine = (text: string, fontSize: number, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(fontSize);
        const split = doc.splitTextToSize(text, usableWidth);
        split.forEach((piece: string) => {
          if (y > pageHeight - 16) {
            doc.addPage();
            y = 18;
          }
          doc.text(piece, margin, y);
          y += fontSize === 18 ? 7.5 : 5.6;
        });
      };

      lines.forEach((line, index) => {
        if (!line) {
          y += 2.5;
          return;
        }

        const isHeading = /^[A-Z ]+$/.test(line);
        const isName = index === 0;
        addLine(line, isName ? 18 : isHeading ? 11.5 : 10, isHeading || isName);
        if (isHeading) y += 1;
      });

      const pdfBlob = doc.output('blob');
      saveBlob(pdfBlob, `${fileStem}.pdf`);
      toast({
        title: 'PDF download ready',
        description: 'The resume has been exported as a clean ATS-friendly PDF.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: `${type.toUpperCase()} export failed`,
        description: 'The export could not be completed. Please try again after saving your latest changes.',
      });
    } finally {
      setExportLoading(null);
    }
  };

  const setAchievementsFromText = (value: string) => {
    setResume((current) => ({
      ...current,
      achievements: splitLines(value),
    }));
  };

  const templateShell =
    template === 'executive'
      ? 'bg-white text-slate-900 border border-slate-200 shadow-xl'
      : template === 'minimal'
      ? 'bg-stone-50 text-stone-900 border border-stone-200 shadow-lg'
      : 'bg-slate-950 text-slate-100 border border-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.32)]';

  const previewMuted =
    template === 'executive'
      ? 'text-slate-600'
      : template === 'minimal'
      ? 'text-stone-600'
      : 'text-slate-300';

  const previewHeading =
    template === 'executive'
      ? 'text-slate-900 border-slate-300'
      : template === 'minimal'
      ? 'text-stone-900 border-stone-300'
      : 'text-white border-slate-700';

  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.24), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.18), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.92) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.14), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.22), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.72) 52%, hsl(var(--background)) 100%)',
  };

  const heroCardClass = cn(
    'overflow-hidden border shadow-premium-lg backdrop-blur-xl',
    darkTheme ? 'bg-card/80 text-card-foreground border-primary/20' : 'bg-card/90 text-card-foreground border-primary/10',
  );

  const mainCardClass = cn(
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'bg-card/80 border-primary/10' : 'bg-card/95 border-border/80',
  );

  const nestedCardClass = cn(
    'border shadow-sm',
    darkTheme ? 'bg-background/50 border-border/70' : 'bg-background border-border/80',
  );

  const metricCardClass = cn(
    'rounded-2xl border p-4',
    darkTheme ? 'border-primary/20 bg-background/50 backdrop-blur' : 'border-primary/10 bg-background/75',
  );

  const subtlePanelClass = cn(
    'rounded-2xl border p-3 text-sm',
    darkTheme ? 'border-border/70 bg-background/50 text-foreground/80' : 'border-border bg-muted/60 text-foreground/80',
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-6 md:px-6 lg:px-8" style={pageShellStyle}>
      <div className="pointer-events-none absolute inset-0">
        <div className={cn('absolute left-[-6rem] top-[-5rem] h-48 w-48 rounded-full blur-3xl', darkTheme ? 'bg-primary/20' : 'bg-primary/10')} />
        <div className={cn('absolute right-[-4rem] top-16 h-56 w-56 rounded-full blur-3xl', darkTheme ? 'bg-accent/20' : 'bg-accent/25')} />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6">
        <AnimatedSection>
          <Card className={heroCardClass}>
            <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.35fr_0.9fr] lg:p-8">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="w-fit border border-primary/25 bg-primary/10 text-primary hover:bg-primary/10">
                    ATS-first resume builder
                  </Badge>
                  <Badge variant="outline" className="border-border/70 bg-background/40 text-foreground/80">
                    Theme synced: {themePreview.label}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
                    Build a professional resume that is role-specific, export-ready, and recruiter-friendly.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    This version gives you a complete starter resume, profile-specific improvements, better ATS guidance,
                    and direct downloads for both PDF and Word.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="shadow-premium" onClick={() => applyRoleStarter(false)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Apply role starter
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary/20 bg-background/30 hover:bg-accent/80"
                    onClick={() => void autoImprove()}
                    disabled={improvingContent}
                  >
                    {improvingContent ? <LoadingSpinner /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {improvingContent ? 'Improving with Groq...' : 'Auto improve content'}
                  </Button>
                  <Button variant="outline" className="border-primary/20 bg-background/30 hover:bg-accent/80" onClick={resetDraft}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset draft
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: 'ATS score', value: `${ats.overall}/100`, hint: qualityTone.label },
                  { label: 'Profile completion', value: `${completion}%`, hint: completion >= 85 ? 'Ready to export' : 'Add more detail' },
                  { label: 'Matched keywords', value: `${ats.matchedKeywords.length}`, hint: blueprint.label },
                ].map((metric) => (
                  <div key={metric.label} className={metricCardClass}>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{metric.hint}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <div className="grid gap-6">
          <AnimatedSection delay={0.05}>
            <Card className={mainCardClass}>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <CardTitle className="text-2xl">Resume workspace</CardTitle>
                    <CardDescription className="mt-1 max-w-2xl">
                      Pick a target profile, refine the draft, and keep the content sharply aligned with the role you want.
                    </CardDescription>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Target profile</p>
                      <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as RoleKey)}>
                        <SelectTrigger className="w-full min-w-[220px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_BLUEPRINTS).map(([value, option]) => (
                            <SelectItem key={value} value={value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Preview style</p>
                      <Select value={template} onValueChange={(value) => setTemplate(value as TemplateId)}>
                        <SelectTrigger className="w-full min-w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Button variant="outline" className="justify-start border-primary/20 bg-background/40 hover:bg-accent/80" onClick={() => applyRoleStarter(false)}>
                    <Target className="mr-2 h-4 w-4" />
                    Fill missing profile data
                  </Button>
                  <Button variant="outline" className="justify-start border-primary/20 bg-background/40 hover:bg-accent/80" onClick={() => applyRoleStarter(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Load full profile sample
                  </Button>
                  <Button variant="outline" className="justify-start border-primary/20 bg-background/40 hover:bg-accent/80" onClick={() => handleExport('pdf')} disabled={exportLoading !== null}>
                    {exportLoading === 'pdf' ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="mr-2 h-4 w-4" />}
                    Download PDF
                  </Button>
                  <Button variant="outline" className="justify-start border-primary/20 bg-background/40 hover:bg-accent/80" onClick={() => handleExport('docx')} disabled={exportLoading !== null}>
                    {exportLoading === 'docx' ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="mr-2 h-4 w-4" />}
                    Download Word
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 bg-muted/70">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="mt-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Full name</label>
                        <Input value={resume.personal.name} onChange={(event) => updatePersonal('name', event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Headline</label>
                        <Input value={resume.personal.headline} onChange={(event) => updatePersonal('headline', event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Email</label>
                        <Input value={resume.personal.email} onChange={(event) => updatePersonal('email', event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Phone</label>
                        <Input value={resume.personal.phone} onChange={(event) => updatePersonal('phone', event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Location</label>
                        <Input value={resume.personal.location} onChange={(event) => updatePersonal('location', event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">LinkedIn</label>
                        <Input value={resume.personal.linkedin} onChange={(event) => updatePersonal('linkedin', event.target.value)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-foreground/80">Portfolio or GitHub</label>
                        <Input value={resume.personal.portfolio} onChange={(event) => updatePersonal('portfolio', event.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/80">Professional summary</label>
                      <Textarea
                        rows={5}
                        value={resume.summary}
                        onChange={(event) => setResume((current) => ({ ...current, summary: event.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/80">Target job description or required skills</label>
                      <Textarea
                        rows={6}
                        placeholder="Paste a job description here so the builder can sharpen keyword coverage and profile alignment."
                        value={resume.jobDescription}
                        onChange={(event) => setResume((current) => ({ ...current, jobDescription: event.target.value }))}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="experience" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Professional experience</h3>
                        <p className="text-sm text-muted-foreground">Use action verbs and numbers wherever possible.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={addExperience}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add experience
                      </Button>
                    </div>

                    {resume.experience.map((item) => (
                      <Card key={item.id} className={nestedCardClass}>
                        <CardContent className="space-y-4 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="grid flex-1 gap-4 md:grid-cols-2">
                              <Input placeholder="Role title" value={item.title} onChange={(event) => setResume((current) => ({
                                ...current,
                                experience: current.experience.map((entry) => entry.id === item.id ? { ...entry, title: event.target.value } : entry),
                              }))} />
                              <Input placeholder="Company" value={item.company} onChange={(event) => setResume((current) => ({
                                ...current,
                                experience: current.experience.map((entry) => entry.id === item.id ? { ...entry, company: event.target.value } : entry),
                              }))} />
                              <Input placeholder="Location" value={item.location} onChange={(event) => setResume((current) => ({
                                ...current,
                                experience: current.experience.map((entry) => entry.id === item.id ? { ...entry, location: event.target.value } : entry),
                              }))} />
                              <div className="grid gap-4 md:grid-cols-2">
                                <Input placeholder="Start date" value={item.startDate} onChange={(event) => setResume((current) => ({
                                  ...current,
                                  experience: current.experience.map((entry) => entry.id === item.id ? { ...entry, startDate: event.target.value } : entry),
                                }))} />
                                <Input placeholder="End date / Present" value={item.current ? 'Present' : item.endDate} onChange={(event) => setResume((current) => ({
                                  ...current,
                                  experience: current.experience.map((entry) => entry.id === item.id ? { ...entry, current: event.target.value.toLowerCase() === 'present', endDate: event.target.value.toLowerCase() === 'present' ? '' : event.target.value } : entry),
                                }))} />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setResume((current) => ({
                                ...current,
                                experience: current.experience.filter((entry) => entry.id !== item.id),
                              }))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            rows={5}
                            placeholder="Write 3-4 bullets, one line each. Example: Improved response time by 30% by optimizing SQL queries."
                            value={item.bullets}
                            onChange={(event) => setResume((current) => ({
                              ...current,
                              experience: current.experience.map((entry) => entry.id === item.id ? { ...entry, bullets: event.target.value } : entry),
                            }))}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="projects" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Projects</h3>
                        <p className="text-sm text-muted-foreground">Projects help freshers and early-career candidates look stronger.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={addProject}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add project
                      </Button>
                    </div>

                    {resume.projects.map((item) => (
                      <Card key={item.id} className={nestedCardClass}>
                        <CardContent className="space-y-4 p-4">
                          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                            <Input placeholder="Project name" value={item.name} onChange={(event) => setResume((current) => ({
                              ...current,
                              projects: current.projects.map((entry) => entry.id === item.id ? { ...entry, name: event.target.value } : entry),
                            }))} />
                            <Input placeholder="Tech stack" value={item.techStack} onChange={(event) => setResume((current) => ({
                              ...current,
                              projects: current.projects.map((entry) => entry.id === item.id ? { ...entry, techStack: event.target.value } : entry),
                            }))} />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setResume((current) => ({
                                ...current,
                                projects: current.projects.filter((entry) => entry.id !== item.id),
                              }))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            rows={4}
                            placeholder="Describe impact, technologies, and results."
                            value={item.bullets}
                            onChange={(event) => setResume((current) => ({
                              ...current,
                              projects: current.projects.map((entry) => entry.id === item.id ? { ...entry, bullets: event.target.value } : entry),
                            }))}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  <TabsContent value="qualifications" className="mt-6 space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card className={nestedCardClass}>
                        <CardHeader>
                          <CardTitle className="text-lg">Skills and tools</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground/80">Skills</label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add a skill"
                                value={newSkill}
                                onChange={(event) => setNewSkill(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    if (newSkill.trim()) {
                                      setResume((current) => ({ ...current, skills: unique([...current.skills, newSkill]) }));
                                      setNewSkill('');
                                    }
                                  }
                                }}
                              />
                              <Button variant="outline" onClick={() => {
                                if (newSkill.trim()) {
                                  setResume((current) => ({ ...current, skills: unique([...current.skills, newSkill]) }));
                                  setNewSkill('');
                                }
                              }}>
                                Add
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {resume.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="gap-2 px-3 py-1">
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => setResume((current) => ({
                                      ...current,
                                      skills: current.skills.filter((item) => item !== skill),
                                    }))}
                                  >
                                    x
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground/80">Tools</label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add a tool"
                                value={newTool}
                                onChange={(event) => setNewTool(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    if (newTool.trim()) {
                                      setResume((current) => ({ ...current, tools: unique([...current.tools, newTool]) }));
                                      setNewTool('');
                                    }
                                  }
                                }}
                              />
                              <Button variant="outline" onClick={() => {
                                if (newTool.trim()) {
                                  setResume((current) => ({ ...current, tools: unique([...current.tools, newTool]) }));
                                  setNewTool('');
                                }
                              }}>
                                Add
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {resume.tools.map((tool) => (
                                <Badge key={tool} variant="outline" className="gap-2 px-3 py-1">
                                  {tool}
                                  <button
                                    type="button"
                                    onClick={() => setResume((current) => ({
                                      ...current,
                                      tools: current.tools.filter((item) => item !== tool),
                                    }))}
                                  >
                                    x
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80">Technical stack</label>
                            <Textarea
                              rows={4}
                              value={resume.technicalSkills}
                              onChange={(event) => setResume((current) => ({ ...current, technicalSkills: event.target.value }))}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={nestedCardClass}>
                        <CardHeader>
                          <CardTitle className="text-lg">Achievements and keywords</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80">Achievements</label>
                            <Textarea
                              rows={5}
                              value={resume.achievements.join('\n')}
                              onChange={(event) => setAchievementsFromText(event.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80">ATS keyword bank</label>
                            <Textarea
                              rows={4}
                              value={resume.keywordBlock}
                              onChange={(event) => setResume((current) => ({ ...current, keywordBlock: event.target.value }))}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card className={nestedCardClass}>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Education</CardTitle>
                            <CardDescription>Add degrees, college, or training.</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" onClick={addEducation}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {resume.education.map((item) => (
                            <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_1fr_110px_auto]">
                              <Input placeholder="School" value={item.school} onChange={(event) => setResume((current) => ({
                                ...current,
                                education: current.education.map((entry) => entry.id === item.id ? { ...entry, school: event.target.value } : entry),
                              }))} />
                              <Input placeholder="Degree" value={item.degree} onChange={(event) => setResume((current) => ({
                                ...current,
                                education: current.education.map((entry) => entry.id === item.id ? { ...entry, degree: event.target.value } : entry),
                              }))} />
                              <Input placeholder="Year" value={item.year} onChange={(event) => setResume((current) => ({
                                ...current,
                                education: current.education.map((entry) => entry.id === item.id ? { ...entry, year: event.target.value } : entry),
                              }))} />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setResume((current) => ({
                                  ...current,
                                  education: current.education.filter((entry) => entry.id !== item.id),
                                }))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className={nestedCardClass}>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Certifications</CardTitle>
                            <CardDescription>Optional, but helpful for credibility.</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" onClick={addCertification}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {resume.certifications.map((item) => (
                            <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_1fr_110px_auto]">
                              <Input placeholder="Certification" value={item.name} onChange={(event) => setResume((current) => ({
                                ...current,
                                certifications: current.certifications.map((entry) => entry.id === item.id ? { ...entry, name: event.target.value } : entry),
                              }))} />
                              <Input placeholder="Issuer" value={item.issuer} onChange={(event) => setResume((current) => ({
                                ...current,
                                certifications: current.certifications.map((entry) => entry.id === item.id ? { ...entry, issuer: event.target.value } : entry),
                              }))} />
                              <Input placeholder="Year" value={item.year} onChange={(event) => setResume((current) => ({
                                ...current,
                                certifications: current.certifications.map((entry) => entry.id === item.id ? { ...entry, year: event.target.value } : entry),
                              }))} />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setResume((current) => ({
                                  ...current,
                                  certifications: current.certifications.filter((entry) => entry.id !== item.id),
                                }))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </AnimatedSection>

          <div className="space-y-6">
            <AnimatedSection delay={0.1}>
              <Card className={heroCardClass}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="h-5 w-5 text-primary" />
                    ATS scorecard
                  </CardTitle>
                  <CardDescription>
                    Live feedback based on structure, keywords, impact, and professional polish.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className={metricCardClass}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overall score</p>
                        <p className="mt-2 text-4xl font-semibold">{ats.overall}</p>
                      </div>
                      <Badge className={`${qualityTone.bar} border-0 text-white`}>{qualityTone.label}</Badge>
                    </div>
                    <Progress value={ats.overall} className="mt-4 h-2" />
                  </div>

                  {[
                    ['Keyword match', ats.keywordMatch],
                    ['Structure', ats.structure],
                    ['Impact', ats.impact],
                    ['Readability', ats.readability],
                    ['Professionalism', ats.professionalism],
                  ].map(([label, value]) => (
                    <div key={label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-foreground">{value}%</span>
                      </div>
                      <Progress value={Number(value)} className="h-2" />
                    </div>
                  ))}

                  <Separator className="bg-border/80" />

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Profile-specific guidance</p>
                    <div className="flex flex-wrap gap-2">
                      {ats.matchedKeywords.slice(0, 10).map((keyword) => (
                        <Badge key={keyword} className="border border-primary/25 bg-primary/10 text-primary hover:bg-primary/10">
                          {keyword}
                        </Badge>
                      ))}
                      {ats.matchedKeywords.length === 0 && (
                        <p className="text-sm text-muted-foreground">Add role-specific keywords and run the auto improve action.</p>
                      )}
                    </div>
                    {ats.missingKeywords.length > 0 && (
                      <p className="text-sm text-amber-600 dark:text-amber-300">
                        Missing important keywords: {ats.missingKeywords.slice(0, 6).join(', ')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.12}>
              <Card className={mainCardClass}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Resume improvement plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ats.suggestions.map((suggestion) => (
                    <div key={suggestion} className={subtlePanelClass}>
                      {suggestion}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <Card className={mainCardClass}>
                <CardHeader>
                  <CardTitle className="text-xl">Live resume preview</CardTitle>
                  <CardDescription>
                    A clean, ATS-safe layout with professional structure and export-friendly content.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className={cn('h-[900px] rounded-2xl border p-3', darkTheme ? 'border-primary/10 bg-background/50' : 'border-border bg-muted/60')}>
                    <motion.div
                      key={`${template}-${selectedRole}-${resume.personal.headline}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`mx-auto max-w-[820px] rounded-[28px] p-8 sm:p-10 ${templateShell}`}
                    >
                      <header className="space-y-3 border-b pb-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-2">
                            <h2 className="text-3xl font-semibold tracking-tight">{resume.personal.name}</h2>
                            <p className={`text-sm font-medium ${previewMuted}`}>{resume.personal.headline}</p>
                          </div>
                          <div className={`space-y-1 text-sm ${previewMuted}`}>
                            <p>{resume.personal.email}</p>
                            <p>{resume.personal.phone}</p>
                            <p>{resume.personal.location}</p>
                            <p>{resume.personal.linkedin}</p>
                            <p>{resume.personal.portfolio}</p>
                          </div>
                        </div>
                      </header>

                      <div className="mt-6 space-y-6 text-sm leading-6">
                        <section className="space-y-2">
                          <h3 className={`border-b pb-2 text-xs font-semibold uppercase tracking-[0.22em] ${previewHeading}`}>Professional summary</h3>
                          <p className={previewMuted}>{resume.summary}</p>
                        </section>

                        <section className="space-y-3">
                          <h3 className={`border-b pb-2 text-xs font-semibold uppercase tracking-[0.22em] ${previewHeading}`}>Core skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {resume.skills.map((skill) => (
                              <span
                                key={skill}
                                className={`rounded-full px-3 py-1 text-xs ${
                                  template === 'modern'
                                    ? 'bg-primary/10 text-primary'
                                    : template === 'executive'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-stone-200 text-stone-800'
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          <p className={previewMuted}>
                            <span className="font-semibold">Technical:</span> {resume.technicalSkills}
                          </p>
                          <p className={previewMuted}>
                            <span className="font-semibold">Tools:</span> {resume.tools.join(', ')}
                          </p>
                        </section>
                        <section className="space-y-3">
                          <h3 className={`border-b pb-2 text-xs font-semibold uppercase tracking-[0.22em] ${previewHeading}`}>Professional experience</h3>
                          {resume.experience.map((item) => (
                            <div key={item.id} className="space-y-2">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{item.title}</p>
                                  <p className={previewMuted}>
                                    {item.company} {item.location ? `| ${item.location}` : ''}
                                  </p>
                                </div>
                                <p className={previewMuted}>
                                  {item.startDate} - {item.current ? 'Present' : item.endDate}
                                </p>
                              </div>
                              <ul className={`list-disc space-y-1 pl-5 ${previewMuted}`}>
                                {splitLines(item.bullets).map((bullet) => (
                                  <li key={`${item.id}-${bullet}`}>{bullet}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </section>

                        <section className="space-y-3">
                          <h3 className={`border-b pb-2 text-xs font-semibold uppercase tracking-[0.22em] ${previewHeading}`}>Projects</h3>
                          {resume.projects.map((item) => (
                            <div key={item.id} className="space-y-2">
                              <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className={previewMuted}>{item.techStack}</p>
                              </div>
                              <ul className={`list-disc space-y-1 pl-5 ${previewMuted}`}>
                                {splitLines(item.bullets).map((bullet) => (
                                  <li key={`${item.id}-${bullet}`}>{bullet}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </section>

                        {!!resume.achievements.length && (
                          <section className="space-y-3">
                            <h3 className={`border-b pb-2 text-xs font-semibold uppercase tracking-[0.22em] ${previewHeading}`}>Achievements</h3>
                            <ul className={`list-disc space-y-1 pl-5 ${previewMuted}`}>
                              {resume.achievements.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                        )}

                        <section className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-3">
                            <h3 className={`border-b pb-2 text-xs font-semibold uppercase tracking-[0.22em] ${previewHeading}`}>Education</h3>
                            {resume.education.map((item) => (
                              <div key={item.id}>
                                <p className="font-semibold">{item.school}</p>
                                <p className={previewMuted}>
                                  {item.degree} | {item.year}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-3">
                            <h3 className={`border-b pb-2 text-xs font-semibold uppercase tracking-[0.22em] ${previewHeading}`}>Certifications</h3>
                            {resume.certifications.length ? (
                              resume.certifications.map((item) => (
                                <div key={item.id}>
                                  <p className="font-semibold">{item.name}</p>
                                  <p className={previewMuted}>
                                    {item.issuer} | {item.year}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className={previewMuted}>Optional. Add certifications to strengthen credibility.</p>
                            )}
                          </div>
                        </section>
                      </div>
                    </motion.div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>

        <AnimatedSection delay={0.18}>
          <Card className={heroCardClass}>
            <CardContent className="grid gap-6 p-6 md:grid-cols-3">
              <div className={metricCardClass}>
                <div className="mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Profile-aware content</h3>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  The builder now changes summaries, keywords, skills, and sample bullets based on the selected profile so
                  the resume looks specific instead of generic.
                </p>
              </div>

              <div className={metricCardClass}>
                <div className="mb-3 flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Professional structure</h3>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  The layout is cleaner, one-column, ATS-safe, and ready for both freshers and experienced candidates with
                  sections for projects, achievements, tools, and certifications.
                </p>
              </div>

              <div className={metricCardClass}>
                <div className="mb-3 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Real downloads</h3>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  PDF and Word download buttons now generate actual files from the same structured resume data shown in the
                  preview.
                </p>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ResumeBuilder;
