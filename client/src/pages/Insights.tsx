import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Briefcase, DollarSign, MapPin, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import EmployerAnalyticsView from '@/components/employer/EmployerAnalyticsView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPremiumChartPalette } from '@/lib/chartTheme';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type RegionKey = 'pan-india' | 'metros' | 'remote-friendly';
type RoleKey =
  | 'frontend-developer'
  | 'backend-developer'
  | 'full-stack-developer'
  | 'data-analyst'
  | 'data-scientist'
  | 'devops-engineer';

type RoleInsight = {
  label: string;
  summary: string;
  growthRate: string;
  remoteShare: number;
  growthPotential: string;
  entryDifficulty: Record<ExperienceLevel, number>;
  salary: Record<ExperienceLevel, { current: [number, number]; future: [number, number]; premium: string }>;
  growth: { year: string; openings: number }[];
  skills: { skill: string; required: number; coverage: Record<ExperienceLevel, number> }[];
  competition: { label: string; applicants: number; openings: number }[];
  locations: Record<RegionKey, { name: string; value: number }[]>;
  roadmap: { stage: string; title: string; duration: string; items: string[] }[];
  emergingTech: { label: string; impact: string; timeline: string }[];
  demand: { skill: string; demand: number; openings: number }[];
  highlights: string[];
};

const REGION_CONFIG: Record<RegionKey, { label: string; description: string; salaryMultiplier: number; openingsMultiplier: number; competitionMultiplier: number; remoteAdjustment: number }> = {
  'pan-india': { label: 'Pan India', description: 'Blended India-wide market view.', salaryMultiplier: 1, openingsMultiplier: 1, competitionMultiplier: 1, remoteAdjustment: 0 },
  metros: { label: 'Metro cities', description: 'Bengaluru, Hyderabad, Pune, NCR, Chennai, Mumbai.', salaryMultiplier: 1.14, openingsMultiplier: 0.72, competitionMultiplier: 1.08, remoteAdjustment: -8 },
  'remote-friendly': { label: 'Remote-friendly', description: 'India-based distributed teams and remote hiring.', salaryMultiplier: 1.06, openingsMultiplier: 0.44, competitionMultiplier: 1.15, remoteAdjustment: 16 },
};

const ROLE_OPTIONS: { value: RoleKey; label: string }[] = [
  { value: 'frontend-developer', label: 'Frontend Developer' },
  { value: 'backend-developer', label: 'Backend Developer' },
  { value: 'full-stack-developer', label: 'Full Stack Developer' },
  { value: 'data-analyst', label: 'Data Analyst' },
  { value: 'data-scientist', label: 'Data Scientist' },
  { value: 'devops-engineer', label: 'DevOps Engineer' },
];

const BASE_LOCATIONS = {
  'frontend-developer': {
    'pan-india': [{ name: 'Bengaluru', value: 29 }, { name: 'Hyderabad', value: 19 }, { name: 'Pune', value: 16 }, { name: 'Delhi NCR', value: 15 }, { name: 'Chennai', value: 11 }, { name: 'Remote India', value: 10 }],
    metros: [{ name: 'Bengaluru', value: 35 }, { name: 'Hyderabad', value: 22 }, { name: 'Pune', value: 18 }, { name: 'Delhi NCR', value: 15 }, { name: 'Chennai', value: 10 }],
    'remote-friendly': [{ name: 'Remote India', value: 34 }, { name: 'Bengaluru', value: 20 }, { name: 'Hyderabad', value: 15 }, { name: 'Pune', value: 13 }, { name: 'Delhi NCR', value: 10 }, { name: 'Tier 2 talent pools', value: 8 }],
  },
  'backend-developer': {
    'pan-india': [{ name: 'Bengaluru', value: 27 }, { name: 'Hyderabad', value: 21 }, { name: 'Pune', value: 17 }, { name: 'Delhi NCR', value: 14 }, { name: 'Chennai', value: 12 }, { name: 'Remote India', value: 9 }],
    metros: [{ name: 'Bengaluru', value: 32 }, { name: 'Hyderabad', value: 24 }, { name: 'Pune', value: 19 }, { name: 'Delhi NCR', value: 14 }, { name: 'Chennai', value: 11 }],
    'remote-friendly': [{ name: 'Remote India', value: 31 }, { name: 'Bengaluru', value: 21 }, { name: 'Hyderabad', value: 17 }, { name: 'Pune', value: 13 }, { name: 'Delhi NCR', value: 10 }, { name: 'Tier 2 hubs', value: 8 }],
  },
  'full-stack-developer': {
    'pan-india': [{ name: 'Bengaluru', value: 30 }, { name: 'Hyderabad', value: 18 }, { name: 'Pune', value: 15 }, { name: 'Delhi NCR', value: 14 }, { name: 'Mumbai', value: 9 }, { name: 'Remote India', value: 14 }],
    metros: [{ name: 'Bengaluru', value: 36 }, { name: 'Hyderabad', value: 21 }, { name: 'Pune', value: 17 }, { name: 'Delhi NCR', value: 15 }, { name: 'Mumbai', value: 11 }],
    'remote-friendly': [{ name: 'Remote India', value: 38 }, { name: 'Bengaluru', value: 19 }, { name: 'Hyderabad', value: 14 }, { name: 'Pune', value: 12 }, { name: 'Delhi NCR', value: 9 }, { name: 'Tier 2 hubs', value: 8 }],
  },
  'data-analyst': {
    'pan-india': [{ name: 'Bengaluru', value: 24 }, { name: 'Hyderabad', value: 16 }, { name: 'Delhi NCR', value: 18 }, { name: 'Mumbai', value: 17 }, { name: 'Pune', value: 11 }, { name: 'Remote India', value: 14 }],
    metros: [{ name: 'Bengaluru', value: 28 }, { name: 'Delhi NCR', value: 22 }, { name: 'Mumbai', value: 20 }, { name: 'Hyderabad', value: 17 }, { name: 'Pune', value: 13 }],
    'remote-friendly': [{ name: 'Remote India', value: 30 }, { name: 'Bengaluru', value: 20 }, { name: 'Delhi NCR', value: 16 }, { name: 'Mumbai', value: 14 }, { name: 'Hyderabad', value: 12 }, { name: 'Tier 2 hubs', value: 8 }],
  },
  'data-scientist': {
    'pan-india': [{ name: 'Bengaluru', value: 33 }, { name: 'Hyderabad', value: 18 }, { name: 'Delhi NCR', value: 16 }, { name: 'Mumbai', value: 12 }, { name: 'Pune', value: 9 }, { name: 'Remote India', value: 12 }],
    metros: [{ name: 'Bengaluru', value: 38 }, { name: 'Hyderabad', value: 21 }, { name: 'Delhi NCR', value: 18 }, { name: 'Mumbai', value: 14 }, { name: 'Pune', value: 9 }],
    'remote-friendly': [{ name: 'Remote India', value: 28 }, { name: 'Bengaluru', value: 24 }, { name: 'Hyderabad', value: 17 }, { name: 'Delhi NCR', value: 13 }, { name: 'Mumbai', value: 10 }, { name: 'Tier 2 hubs', value: 8 }],
  },
  'devops-engineer': {
    'pan-india': [{ name: 'Bengaluru', value: 31 }, { name: 'Hyderabad', value: 20 }, { name: 'Pune', value: 16 }, { name: 'Chennai', value: 12 }, { name: 'Delhi NCR', value: 10 }, { name: 'Remote India', value: 11 }],
    metros: [{ name: 'Bengaluru', value: 37 }, { name: 'Hyderabad', value: 23 }, { name: 'Pune', value: 19 }, { name: 'Chennai', value: 12 }, { name: 'Delhi NCR', value: 9 }],
    'remote-friendly': [{ name: 'Remote India', value: 29 }, { name: 'Bengaluru', value: 23 }, { name: 'Hyderabad', value: 18 }, { name: 'Pune', value: 12 }, { name: 'Chennai', value: 10 }, { name: 'Tier 2 hubs', value: 8 }],
  },
} satisfies Record<RoleKey, Record<RegionKey, { name: string; value: number }[]>>;

const INDIA_ROLE_INSIGHTS: Record<RoleKey, RoleInsight> = {
  'frontend-developer': { label: 'Frontend Developer', summary: 'Strong India demand for React, TypeScript, and polished UI delivery.', growthRate: '+15.2% YoY', remoteShare: 38, growthPotential: '2.0x in 3 yrs', entryDifficulty: { beginner: 71, intermediate: 56, advanced: 43 }, salary: { beginner: { current: [4.8, 7.5], future: [6.2, 9.4], premium: '10+ LPA in strong product teams' }, intermediate: { current: [8.5, 14], future: [10.5, 17], premium: '18+ LPA with performance focus' }, advanced: { current: [16, 26], future: [20, 31], premium: '35+ LPA in top firms' } }, growth: [{ year: '2023', openings: 18000 }, { year: '2024', openings: 20800 }, { year: '2025', openings: 23800 }, { year: '2026', openings: 27200 }], skills: [{ skill: 'HTML/CSS', required: 90, coverage: { beginner: 48, intermediate: 74, advanced: 88 } }, { skill: 'JavaScript', required: 92, coverage: { beginner: 44, intermediate: 73, advanced: 87 } }, { skill: 'React', required: 90, coverage: { beginner: 36, intermediate: 70, advanced: 84 } }, { skill: 'TypeScript', required: 78, coverage: { beginner: 24, intermediate: 58, advanced: 78 } }, { skill: 'Testing', required: 60, coverage: { beginner: 18, intermediate: 42, advanced: 67 } }, { skill: 'UX polish', required: 72, coverage: { beginner: 30, intermediate: 56, advanced: 76 } }], competition: [{ label: 'Entry', applicants: 290, openings: 88 }, { label: 'Mid', applicants: 170, openings: 116 }, { label: 'Senior', applicants: 96, openings: 89 }], locations: BASE_LOCATIONS['frontend-developer'], roadmap: [{ stage: 'Step 1', title: 'Build UI foundations', duration: '0-2 months', items: ['HTML, CSS, responsive layouts', 'JavaScript fundamentals', 'Git and GitHub workflow'] }, { stage: 'Step 2', title: 'Become React-ready', duration: '2-5 months', items: ['React components and routing', 'API integration', '2 polished portfolio projects'] }, { stage: 'Step 3', title: 'Stand out in India hiring', duration: '5-8 months', items: ['TypeScript and testing basics', 'Design-system thinking', 'Resume and mock interviews'] }, { stage: 'Step 4', title: 'Move into product teams', duration: '8-12 months', items: ['Performance optimization', 'Accessibility', 'Deploy real projects and case studies'] }], emergingTech: [{ label: 'AI-assisted UI build', impact: 'High', timeline: 'Now' }, { label: 'Design systems at scale', impact: 'High', timeline: 'Now-2 yrs' }, { label: 'Edge-rendered frontend', impact: 'Medium', timeline: '1-2 yrs' }, { label: 'Analytics-driven UX', impact: 'Medium', timeline: 'Now-1 yr' }], demand: [{ skill: 'React', demand: 95, openings: 8400 }, { skill: 'TypeScript', demand: 84, openings: 6200 }, { skill: 'Next.js', demand: 72, openings: 4100 }, { skill: 'Testing', demand: 63, openings: 2900 }, { skill: 'Accessibility', demand: 58, openings: 2400 }], highlights: ['Product teams in India reward clean execution more than flashy portfolios.', 'A strong React project plus a sharper resume creates real separation.'] },
  'backend-developer': { label: 'Backend Developer', summary: 'Backend hiring is healthy across SaaS, fintech, and internal platforms.', growthRate: '+16.1% YoY', remoteShare: 33, growthPotential: '2.2x in 3 yrs', entryDifficulty: { beginner: 74, intermediate: 58, advanced: 46 }, salary: { beginner: { current: [5.4, 8.2], future: [6.9, 10.4], premium: '11+ LPA with solid APIs and DB work' }, intermediate: { current: [9.5, 15.5], future: [12, 19], premium: '22+ LPA in product and fintech teams' }, advanced: { current: [18, 30], future: [22, 36], premium: '40+ LPA in platform roles' } }, growth: [{ year: '2023', openings: 16500 }, { year: '2024', openings: 19400 }, { year: '2025', openings: 22700 }, { year: '2026', openings: 26100 }], skills: [{ skill: 'Node/Java/Python', required: 92, coverage: { beginner: 42, intermediate: 72, advanced: 87 } }, { skill: 'REST APIs', required: 90, coverage: { beginner: 38, intermediate: 70, advanced: 84 } }, { skill: 'Databases', required: 88, coverage: { beginner: 34, intermediate: 67, advanced: 82 } }, { skill: 'Caching', required: 64, coverage: { beginner: 14, intermediate: 42, advanced: 70 } }, { skill: 'System design', required: 68, coverage: { beginner: 10, intermediate: 38, advanced: 74 } }, { skill: 'Monitoring', required: 58, coverage: { beginner: 12, intermediate: 35, advanced: 66 } }], competition: [{ label: 'Entry', applicants: 260, openings: 78 }, { label: 'Mid', applicants: 155, openings: 102 }, { label: 'Senior', applicants: 84, openings: 93 }], locations: BASE_LOCATIONS['backend-developer'], roadmap: [{ stage: 'Step 1', title: 'Programming and database basics', duration: '0-2 months', items: ['Pick one backend language', 'Learn SQL and data models', 'Build CRUD projects'] }, { stage: 'Step 2', title: 'API-first development', duration: '2-5 months', items: ['REST APIs and auth', 'Framework basics', 'Deployment fundamentals'] }, { stage: 'Step 3', title: 'Production thinking', duration: '5-8 months', items: ['Caching and queues', 'Error handling and logging', 'Problem solving prep'] }, { stage: 'Step 4', title: 'Platform depth', duration: '8-12 months', items: ['System design basics', 'Cloud services', 'Reliability thinking'] }], emergingTech: [{ label: 'LLM-powered APIs', impact: 'High', timeline: 'Now' }, { label: 'Event-driven systems', impact: 'High', timeline: 'Now-2 yrs' }, { label: 'Platform engineering', impact: 'Medium', timeline: '1-3 yrs' }, { label: 'Cost-aware infra design', impact: 'Medium', timeline: 'Now-1 yr' }], demand: [{ skill: 'Node.js', demand: 88, openings: 6900 }, { skill: 'SQL', demand: 85, openings: 6500 }, { skill: 'Java', demand: 80, openings: 5700 }, { skill: 'Python', demand: 77, openings: 5200 }, { skill: 'AWS', demand: 73, openings: 4300 }], highlights: ['Backend reliability is still a premium skill in the India market.', 'Database design plus API performance makes profiles look more senior faster.'] },
  'full-stack-developer': { label: 'Full Stack Developer', summary: 'Startups still hire full-stack engineers heavily for broad ownership.', growthRate: '+17.4% YoY', remoteShare: 41, growthPotential: '2.3x in 3 yrs', entryDifficulty: { beginner: 76, intermediate: 60, advanced: 48 }, salary: { beginner: { current: [5.8, 8.8], future: [7.5, 11.5], premium: '12+ LPA in startup product teams' }, intermediate: { current: [10.5, 17], future: [13, 21], premium: '24+ LPA with ownership' }, advanced: { current: [19, 31], future: [24, 38], premium: '42+ LPA in top product orgs' } }, growth: [{ year: '2023', openings: 15200 }, { year: '2024', openings: 18300 }, { year: '2025', openings: 22100 }, { year: '2026', openings: 25900 }], skills: [{ skill: 'Frontend', required: 86, coverage: { beginner: 34, intermediate: 63, advanced: 80 } }, { skill: 'Backend', required: 86, coverage: { beginner: 30, intermediate: 61, advanced: 79 } }, { skill: 'Databases', required: 74, coverage: { beginner: 24, intermediate: 56, advanced: 75 } }, { skill: 'Deployment', required: 66, coverage: { beginner: 12, intermediate: 41, advanced: 69 } }, { skill: 'Debugging', required: 72, coverage: { beginner: 28, intermediate: 57, advanced: 78 } }, { skill: 'Product thinking', required: 68, coverage: { beginner: 22, intermediate: 48, advanced: 72 } }], competition: [{ label: 'Entry', applicants: 310, openings: 76 }, { label: 'Mid', applicants: 182, openings: 108 }, { label: 'Senior', applicants: 104, openings: 86 }], locations: BASE_LOCATIONS['full-stack-developer'], roadmap: [{ stage: 'Step 1', title: 'Choose one stack', duration: '0-2 months', items: ['JavaScript and databases', 'Git workflow', 'Ship one simple app'] }, { stage: 'Step 2', title: 'Build end-to-end projects', duration: '2-5 months', items: ['React plus backend APIs', 'Auth and deployment', '2 strong portfolio projects'] }, { stage: 'Step 3', title: 'Production readiness', duration: '5-8 months', items: ['Debugging and monitoring', 'Performance basics', 'Resume and interviews'] }, { stage: 'Step 4', title: 'Own features', duration: '8-12 months', items: ['Testing strategy', 'Cloud and CI/CD', 'Metrics and tradeoffs'] }], emergingTech: [{ label: 'AI product features', impact: 'High', timeline: 'Now' }, { label: 'Serverless workflows', impact: 'Medium', timeline: 'Now-2 yrs' }, { label: 'Platform DX tooling', impact: 'Medium', timeline: '1-2 yrs' }, { label: 'Edge apps', impact: 'Medium', timeline: '1-3 yrs' }], demand: [{ skill: 'React', demand: 90, openings: 6100 }, { skill: 'Node.js', demand: 88, openings: 5900 }, { skill: 'SQL', demand: 79, openings: 4300 }, { skill: 'AWS', demand: 76, openings: 3900 }, { skill: 'TypeScript', demand: 74, openings: 3500 }], highlights: ['Breadth helps, but real depth on one side still wins interviews.', 'One polished end-to-end project beats many shallow demos.'] },
  'data-analyst': { label: 'Data Analyst', summary: 'Analytics hiring stays steady across product, fintech, consulting, and ops.', growthRate: '+13.1% YoY', remoteShare: 29, growthPotential: '1.9x in 3 yrs', entryDifficulty: { beginner: 67, intermediate: 54, advanced: 40 }, salary: { beginner: { current: [4.5, 6.8], future: [5.8, 8.3], premium: '9+ LPA with SQL and BI strength' }, intermediate: { current: [7.2, 11.5], future: [8.8, 14], premium: '16+ LPA in product analytics' }, advanced: { current: [12.5, 20], future: [15, 24], premium: '28+ LPA in high-impact analytics teams' } }, growth: [{ year: '2023', openings: 14300 }, { year: '2024', openings: 15800 }, { year: '2025', openings: 17700 }, { year: '2026', openings: 19600 }], skills: [{ skill: 'SQL', required: 92, coverage: { beginner: 40, intermediate: 72, advanced: 86 } }, { skill: 'Excel', required: 84, coverage: { beginner: 58, intermediate: 78, advanced: 86 } }, { skill: 'BI tools', required: 80, coverage: { beginner: 28, intermediate: 62, advanced: 79 } }, { skill: 'Statistics', required: 72, coverage: { beginner: 24, intermediate: 55, advanced: 74 } }, { skill: 'Storytelling', required: 74, coverage: { beginner: 31, intermediate: 58, advanced: 76 } }, { skill: 'Python', required: 55, coverage: { beginner: 14, intermediate: 37, advanced: 62 } }], competition: [{ label: 'Entry', applicants: 240, openings: 92 }, { label: 'Mid', applicants: 146, openings: 105 }, { label: 'Senior', applicants: 72, openings: 82 }], locations: BASE_LOCATIONS['data-analyst'], roadmap: [{ stage: 'Step 1', title: 'Master data basics', duration: '0-2 months', items: ['Excel or Sheets fluency', 'SQL basics', 'Descriptive statistics'] }, { stage: 'Step 2', title: 'Dashboards and reporting', duration: '2-4 months', items: ['Power BI or Tableau', 'Business metrics', '2 case studies'] }, { stage: 'Step 3', title: 'Analyst mindset', duration: '4-7 months', items: ['Storytelling with data', 'A/B testing basics', 'Stakeholder presentation'] }, { stage: 'Step 4', title: 'Move toward product analytics', duration: '7-10 months', items: ['Python basics', 'Event tracking', 'Funnel analysis'] }], emergingTech: [{ label: 'Self-serve BI', impact: 'High', timeline: 'Now' }, { label: 'Product analytics', impact: 'High', timeline: 'Now-2 yrs' }, { label: 'AI-assisted reporting', impact: 'Medium', timeline: 'Now-1 yr' }, { label: 'Experimentation platforms', impact: 'Medium', timeline: '1-2 yrs' }], demand: [{ skill: 'SQL', demand: 93, openings: 5600 }, { skill: 'Power BI', demand: 86, openings: 4900 }, { skill: 'Excel', demand: 82, openings: 4700 }, { skill: 'Python', demand: 60, openings: 2600 }, { skill: 'Statistics', demand: 58, openings: 2300 }], highlights: ['Business clarity matters almost as much as technical skill here.', 'SQL plus one sharp dashboard case study is a strong India entry combination.'] },
  'data-scientist': { label: 'Data Scientist', summary: 'Selective role with strong pay where ML is tied to product or business impact.', growthRate: '+14.4% YoY', remoteShare: 31, growthPotential: '2.1x in 3 yrs', entryDifficulty: { beginner: 81, intermediate: 63, advanced: 51 }, salary: { beginner: { current: [6.5, 10], future: [8, 12], premium: '14+ LPA with strong ML projects' }, intermediate: { current: [11.5, 19], future: [14, 23], premium: '26+ LPA in AI product teams' }, advanced: { current: [22, 35], future: [26, 42], premium: '50+ LPA in elite orgs' } }, growth: [{ year: '2023', openings: 9600 }, { year: '2024', openings: 10900 }, { year: '2025', openings: 12500 }, { year: '2026', openings: 14300 }], skills: [{ skill: 'Python', required: 94, coverage: { beginner: 36, intermediate: 70, advanced: 86 } }, { skill: 'Statistics', required: 90, coverage: { beginner: 28, intermediate: 64, advanced: 84 } }, { skill: 'ML models', required: 88, coverage: { beginner: 24, intermediate: 61, advanced: 83 } }, { skill: 'SQL', required: 76, coverage: { beginner: 22, intermediate: 55, advanced: 74 } }, { skill: 'MLOps', required: 62, coverage: { beginner: 8, intermediate: 31, advanced: 63 } }, { skill: 'Communication', required: 72, coverage: { beginner: 26, intermediate: 50, advanced: 71 } }], competition: [{ label: 'Entry', applicants: 220, openings: 54 }, { label: 'Mid', applicants: 122, openings: 78 }, { label: 'Senior', applicants: 64, openings: 74 }], locations: BASE_LOCATIONS['data-scientist'], roadmap: [{ stage: 'Step 1', title: 'Math and Python base', duration: '0-3 months', items: ['Python and notebooks', 'Probability and statistics', 'Data cleaning practice'] }, { stage: 'Step 2', title: 'Core ML workflow', duration: '3-6 months', items: ['Supervised learning', 'Feature engineering', 'End-to-end ML project'] }, { stage: 'Step 3', title: 'Business-ready portfolio', duration: '6-9 months', items: ['Case studies with metrics', 'SQL and dashboards', 'Explainability and storytelling'] }, { stage: 'Step 4', title: 'Production awareness', duration: '9-12 months', items: ['Model deployment basics', 'MLOps concepts', 'Interview prep for ML and stats'] }], emergingTech: [{ label: 'Generative AI applications', impact: 'Very High', timeline: 'Now' }, { label: 'MLOps platforms', impact: 'High', timeline: 'Now-2 yrs' }, { label: 'Vector search systems', impact: 'Medium', timeline: '1-2 yrs' }, { label: 'Responsible AI', impact: 'Medium', timeline: 'Now-3 yrs' }], demand: [{ skill: 'Python', demand: 94, openings: 4100 }, { skill: 'Machine Learning', demand: 88, openings: 3700 }, { skill: 'SQL', demand: 70, openings: 2500 }, { skill: 'Deep Learning', demand: 66, openings: 2200 }, { skill: 'MLOps', demand: 58, openings: 1700 }], highlights: ['This path pays well, but entry hiring is more selective than analyst or frontend tracks.', 'Applied projects with measurable outcomes matter more than experimentation alone.'] },
  'devops-engineer': { label: 'DevOps Engineer', summary: 'Strong India demand around cloud, CI/CD, and release reliability.', growthRate: '+18.0% YoY', remoteShare: 35, growthPotential: '2.4x in 3 yrs', entryDifficulty: { beginner: 79, intermediate: 61, advanced: 47 }, salary: { beginner: { current: [6.2, 9.5], future: [7.8, 11.8], premium: '13+ LPA with cloud and CI/CD depth' }, intermediate: { current: [11.8, 19.5], future: [14.5, 24], premium: '28+ LPA in cloud-heavy teams' }, advanced: { current: [22, 36], future: [27, 44], premium: '48+ LPA in platform engineering' } }, growth: [{ year: '2023', openings: 10200 }, { year: '2024', openings: 12300 }, { year: '2025', openings: 14900 }, { year: '2026', openings: 17800 }], skills: [{ skill: 'Linux', required: 88, coverage: { beginner: 34, intermediate: 65, advanced: 82 } }, { skill: 'Cloud', required: 92, coverage: { beginner: 26, intermediate: 61, advanced: 84 } }, { skill: 'CI/CD', required: 86, coverage: { beginner: 18, intermediate: 58, advanced: 82 } }, { skill: 'Containers', required: 84, coverage: { beginner: 22, intermediate: 56, advanced: 80 } }, { skill: 'Monitoring', required: 74, coverage: { beginner: 14, intermediate: 46, advanced: 74 } }, { skill: 'Security basics', required: 66, coverage: { beginner: 12, intermediate: 38, advanced: 68 } }], competition: [{ label: 'Entry', applicants: 170, openings: 46 }, { label: 'Mid', applicants: 105, openings: 76 }, { label: 'Senior', applicants: 62, openings: 81 }], locations: BASE_LOCATIONS['devops-engineer'], roadmap: [{ stage: 'Step 1', title: 'Systems base', duration: '0-2 months', items: ['Linux and networking basics', 'Shell scripting', 'Git workflow'] }, { stage: 'Step 2', title: 'Cloud and automation', duration: '2-5 months', items: ['AWS or Azure basics', 'CI/CD pipelines', 'Docker fundamentals'] }, { stage: 'Step 3', title: 'Reliability mindset', duration: '5-8 months', items: ['Monitoring and logs', 'Infrastructure as code', 'Deploy one full-stack project'] }, { stage: 'Step 4', title: 'Platform maturity', duration: '8-12 months', items: ['Kubernetes basics', 'Security posture', 'Performance and release engineering'] }], emergingTech: [{ label: 'Platform engineering', impact: 'Very High', timeline: 'Now-2 yrs' }, { label: 'Infrastructure as code', impact: 'High', timeline: 'Now' }, { label: 'Cloud cost optimization', impact: 'High', timeline: 'Now-1 yr' }, { label: 'DevSecOps', impact: 'Medium', timeline: '1-2 yrs' }], demand: [{ skill: 'AWS', demand: 92, openings: 4300 }, { skill: 'Docker', demand: 84, openings: 3200 }, { skill: 'Kubernetes', demand: 79, openings: 2800 }, { skill: 'Terraform', demand: 72, openings: 2100 }, { skill: 'CI/CD', demand: 86, openings: 3600 }], highlights: ['Cloud reliability pays strongly in India because strong operators are still scarce.', 'Hands-on deployment proof beats tool-name lists.'] },
};

const avg = (range: [number, number]) => (range[0] + range[1]) / 2;
const round1 = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const formatLpa = (value: number) => `Rs ${value.toFixed(1)} LPA`;
const formatRange = (range: [number, number]) => `${formatLpa(range[0])} - ${formatLpa(range[1])}`;
const difficultyLabel = (score: number) => (score >= 75 ? 'High' : score >= 58 ? 'Medium' : 'Moderate');

const Insights = () => {
  const { user } = useAuthStore();
  const isEmployer = user?.role === 'employer';
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const [employerLoading, setEmployerLoading] = useState(false);
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [employerApplications, setEmployerApplications] = useState<any[]>([]);
  const [employerInterviews, setEmployerInterviews] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleKey>('frontend-developer');
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel>('beginner');
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('pan-india');

  useEffect(() => {
    if (!isEmployer) return;
    const loadEmployerInsights = async () => {
      setEmployerLoading(true);
      try {
        const [jobsRes, applicationsRes, interviewsRes] = await Promise.all([axios.get('/jobs/employer'), axios.get('/applications/employer'), axios.get('/interviews/employer')]);
        setEmployerJobs(jobsRes.data?.data || []);
        setEmployerApplications(applicationsRes.data?.data || []);
        setEmployerInterviews(interviewsRes.data?.data || []);
      } finally {
        setEmployerLoading(false);
      }
    };
    void loadEmployerInsights();
  }, [isEmployer]);

  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.22), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.16), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.94) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.12), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.18), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.70) 52%, hsl(var(--background)) 100%)',
  };
  const heroCardClass = cn('overflow-hidden border shadow-premium-lg backdrop-blur-xl', darkTheme ? 'bg-card/80 border-primary/20 text-card-foreground' : 'bg-card/90 border-primary/10 text-card-foreground');
  const mainCardClass = cn('border shadow-premium-lg backdrop-blur', darkTheme ? 'bg-card/80 border-primary/10' : 'bg-card/95 border-border/80');
  const metricCardClass = cn('rounded-2xl border p-4', darkTheme ? 'border-primary/20 bg-background/50' : 'border-primary/10 bg-background/80');
  const infoPanelClass = cn('rounded-2xl border p-4 text-sm', darkTheme ? 'border-border/70 bg-background/50 text-foreground/80' : 'border-border bg-muted/60 text-foreground/80');
  const tooltipStyle = useMemo(
    () => ({
      contentStyle: {
        backgroundColor: darkTheme ? 'hsl(var(--card) / 0.96)' : 'hsl(var(--background) / 0.98)',
        borderColor: darkTheme ? 'hsl(var(--primary) / 0.24)' : 'hsl(var(--border))',
        borderRadius: '14px',
        boxShadow: darkTheme
          ? '0 18px 45px rgba(0, 0, 0, 0.38)'
          : '0 18px 45px rgba(15, 23, 42, 0.14)',
        color: 'hsl(var(--foreground))',
      },
      labelStyle: {
        color: 'hsl(var(--foreground))',
        fontWeight: 600,
      },
      itemStyle: {
        color: 'hsl(var(--foreground))',
      },
      cursor: {
        fill: darkTheme ? 'hsl(var(--primary) / 0.08)' : 'hsl(var(--primary) / 0.06)',
      },
    }),
    [darkTheme],
  );

  if (isEmployer) {
    return (
      <div className="space-y-6" style={pageShellStyle}>
        <AnimatedSection>
          <Card className={heroCardClass}>
            <CardContent className="px-6 py-8">
              <h1 className="text-3xl font-semibold">Career Insights</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">Review hiring performance across all job posts and drill into individual roles with real applicant and interview data.</p>
            </CardContent>
          </Card>
        </AnimatedSection>
        {employerLoading ? <div className="flex justify-center py-16"><LoadingSpinner /></div> : <EmployerAnalyticsView jobs={employerJobs} applications={employerApplications} interviews={employerInterviews} title="Career Insights" description="Professional analytics for all job posts and each individual role." />}
      </div>
    );
  }

  const roleInsight = INDIA_ROLE_INSIGHTS[selectedRole];
  const regionInsight = REGION_CONFIG[selectedRegion];
  const chartPalette = createPremiumChartPalette(themePreview.primary, themePreview.secondary, darkTheme);
  const chartPrimary = chartPalette.primary;
  const chartSecondary = chartPalette.secondary;
  const chartSuccess = chartPalette.success;
  const chartWarning = chartPalette.warning;
  const chartDanger = chartPalette.danger;
  const salaryBand = roleInsight.salary[selectedExperience];
  const salaryRange: [number, number] = [round1(salaryBand.current[0] * regionInsight.salaryMultiplier), round1(salaryBand.current[1] * regionInsight.salaryMultiplier)];
  const futureSalaryRange: [number, number] = [round1(salaryBand.future[0] * regionInsight.salaryMultiplier), round1(salaryBand.future[1] * regionInsight.salaryMultiplier)];
  const salaryTrends = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, index) => ({
    month,
    current: round1(avg(salaryRange) * [0.92, 0.96, 0.99, 1.01, 1.04, 1.08][index]),
    future: round1(avg(futureSalaryRange) * [0.98, 1.01, 1.04, 1.08, 1.11, 1.14][index]),
  }));
  const growthTrends = roleInsight.growth.map((item) => ({ ...item, openings: Math.round(item.openings * regionInsight.openingsMultiplier) }));
  const skillsRadarData = roleInsight.skills.map((item) => ({ skill: item.skill, required: item.required, you: clamp(item.coverage[selectedExperience] + (selectedRegion === 'remote-friendly' ? 2 : 0)) }));
  const competitionFactor = selectedExperience === 'beginner' ? 1.08 : selectedExperience === 'intermediate' ? 1 : 0.92;
  const competitionData = roleInsight.competition.map((item) => ({
    label: item.label,
    applicants: Math.round(item.applicants * competitionFactor * regionInsight.competitionMultiplier),
    openings: Math.round(item.openings * regionInsight.openingsMultiplier),
  }));
  const locationPalette = [chartPrimary, chartSuccess, chartSecondary, chartWarning, chartDanger, chartPalette.neutral];
  const locationData = roleInsight.locations[selectedRegion].map((item, index) => ({ ...item, color: locationPalette[index % locationPalette.length] }));
  const jobDemand = roleInsight.demand.map((item) => ({ ...item, openings: Math.round(item.openings * regionInsight.openingsMultiplier) }));
  const difficultyScore = clamp(roleInsight.entryDifficulty[selectedExperience] + (selectedRegion === 'remote-friendly' ? 4 : selectedRegion === 'metros' ? 2 : 0));
  const marketPulseData = growthTrends.map((item, index) => ({
    year: item.year,
    openings: item.openings,
    salary: round1(avg(salaryRange) + index * 0.8),
    remoteShare: clamp(roleInsight.remoteShare + regionInsight.remoteAdjustment + index),
  }));
  const readinessTrendData = roleInsight.skills.slice(0, 5).map((item, index) => ({
    skill: item.skill,
    market: item.required,
    current: clamp(item.coverage[selectedExperience] + (selectedRegion === 'remote-friendly' ? 2 : 0)),
    opportunity: clamp(item.required - item.coverage[selectedExperience] + 20 + index * 2),
  }));
  const headlineStats = [
    { title: 'India hiring growth', value: roleInsight.growthRate, description: `${roleInsight.label} openings are still expanding across India.`, icon: TrendingUp },
    { title: 'Salary range', value: formatRange(salaryRange), description: `${selectedExperience} market estimate in ${regionInsight.label.toLowerCase()}.`, icon: DollarSign },
    { title: 'Competition ratio', value: `${competitionData[0].applicants}:${competitionData[0].openings}`, description: 'Entry-level pressure is still the biggest hurdle.', icon: Users },
    { title: 'Remote / hybrid share', value: `${clamp(roleInsight.remoteShare + regionInsight.remoteAdjustment)}%`, description: `Flexible work share for ${roleInsight.label.toLowerCase()} roles.`, icon: MapPin },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-6 md:px-6 lg:px-8" style={pageShellStyle}>
      <div className="pointer-events-none absolute inset-0">
        <div className={cn('absolute left-[-5rem] top-[-4rem] h-44 w-44 rounded-full blur-3xl', darkTheme ? 'bg-primary/20' : 'bg-primary/10')} />
        <div className={cn('absolute right-[-4rem] top-12 h-52 w-52 rounded-full blur-3xl', darkTheme ? 'bg-accent/20' : 'bg-accent/25')} />
      </div>

      <div className="relative space-y-8">
        <AnimatedSection>
          <Card className={heroCardClass}>
            <CardContent className="grid gap-6 p-6 lg:p-8">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    India market intelligence
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border/70 bg-background/40 px-3 py-1 text-xs font-medium text-foreground/80">
                    Theme synced: {themePreview.label}
                  </span>
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Career insights for the Indian job market</h1>
                  <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                    Explore salary ranges, hiring growth, skill gaps, location demand, and a practical path forward for Indian tech roles.
                    Every chart updates from the role, experience level, and hiring region you select.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className={metricCardClass}>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Experience level</p>
                    <Select value={selectedExperience} onValueChange={(value) => setSelectedExperience(value as ExperienceLevel)}>
                      <SelectTrigger className="h-10 bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-1 yr)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 yrs)</SelectItem>
                        <SelectItem value="advanced">Advanced (3+ yrs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={metricCardClass}>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Hiring region</p>
                    <Select value={selectedRegion} onValueChange={(value) => setSelectedRegion(value as RegionKey)}>
                      <SelectTrigger className="h-10 bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pan-india">Pan India</SelectItem>
                        <SelectItem value="metros">Metro cities</SelectItem>
                        <SelectItem value="remote-friendly">Remote-friendly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={metricCardClass}>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Target role</p>
                    <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as RoleKey)}>
                      <SelectTrigger className="h-10 bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className={metricCardClass}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quick career snapshot</p>
                      <p className="mt-2 text-2xl font-semibold">{roleInsight.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{roleInsight.summary}</p>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                      {regionInsight.label}
                    </span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={metricCardClass}>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Current salary band</p>
                    <p className="mt-2 text-xl font-semibold">{formatRange(salaryRange)}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{salaryBand.premium}</p>
                  </div>
                  <div className={metricCardClass}>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Growth potential</p>
                    <p className="mt-2 text-xl font-semibold">{roleInsight.growthPotential}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{regionInsight.description}</p>
                  </div>
                </div>
                <div className={metricCardClass}>
                  <p className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty to enter</span>
                    <span className="font-semibold text-foreground">{difficultyLabel(difficultyScore)}</span>
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-rose-500" style={{ width: `${difficultyScore}%` }} />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">Score: {difficultyScore}/100. This now updates with your role, region, and experience filters.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.08}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {headlineStats.map((stat) => (
              <Card key={stat.title} className={mainCardClass}>
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-semibold">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <Card className={mainCardClass}>
            <CardHeader>
              <CardTitle>Market pulse dashboard</CardTitle>
              <CardDescription>A more visual snapshot of demand, salary direction, and flexible work for your current filters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={marketPulseData}>
                      <defs>
                        <linearGradient id="pulseOpenings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartPrimary} stopOpacity={0.82} />
                          <stop offset="100%" stopColor={chartPrimary} stopOpacity={0.08} />
                        </linearGradient>
                        <linearGradient id="pulseRemote" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartSecondary} stopOpacity={0.72} />
                          <stop offset="100%" stopColor={chartSecondary} stopOpacity={0.08} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                      <Tooltip {...tooltipStyle} />
                      <Area yAxisId="left" type="monotone" dataKey="openings" stroke={chartPrimary} fill="url(#pulseOpenings)" strokeWidth={2.5} name="Openings" />
                      <Area yAxisId="right" type="monotone" dataKey="remoteShare" stroke={chartSecondary} fill="url(#pulseRemote)" strokeWidth={2.5} name="Remote share" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-4">
                  <div className={metricCardClass}>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Projected openings</p>
                    <p className="mt-2 text-2xl font-semibold">{growthTrends[growthTrends.length - 1]?.openings?.toLocaleString('en-IN')}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Demand outlook for your current region selection.</p>
                  </div>
                  <div className={metricCardClass}>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Remote flexibility</p>
                    <p className="mt-2 text-2xl font-semibold">{clamp(roleInsight.remoteShare + regionInsight.remoteAdjustment)}%</p>
                    <p className="mt-1 text-sm text-muted-foreground">Estimated share of remote or hybrid roles.</p>
                  </div>
                  <div className={metricCardClass}>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Salary midpoint</p>
                    <p className="mt-2 text-2xl font-semibold">{formatLpa(avg(salaryRange))}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Current average for {selectedExperience} talent.</p>
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="salary" name="Salary midpoint" unit=" LPA" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="openings" name="Openings" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip {...tooltipStyle} formatter={(value: number, name) => [name === 'salary' ? formatLpa(value) : value.toLocaleString('en-IN'), name]} />
                    <Scatter data={marketPulseData} fill={chartWarning} name="Market pulse" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.11}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle>Readiness vs market expectation</CardTitle>
                <CardDescription>Theme-aware comparison of skill readiness, demand, and upside for the selected role.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readinessTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip {...tooltipStyle} />
                      <Line type="monotone" dataKey="market" name="Market expectation" stroke={chartWarning} strokeWidth={2.5} dot={{ r: 4, fill: chartWarning }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="current" name="Current readiness" stroke={chartPrimary} strokeWidth={3} dot={{ r: 4, fill: chartPrimary }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="opportunity" name="Upside potential" stroke={chartSuccess} strokeWidth={2.5} dot={{ r: 4, fill: chartSuccess }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="text-base">Professional readout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className={infoPanelClass}>
                  <p className="font-semibold text-foreground">Best next move</p>
                  <p className="mt-1">Focus on the largest gap between current readiness and market expectation to get the fastest visible resume improvement.</p>
                </div>
                <div className={infoPanelClass}>
                  <p className="font-semibold text-foreground">Market signal</p>
                  <p className="mt-1">Hover over the chart to compare exactly where your current experience band is strongest and where hiring pressure is highest.</p>
                </div>
                <div className={infoPanelClass}>
                  <p className="font-semibold text-foreground">Theme-aware data view</p>
                  <p className="mt-1">Chart colors, tooltips, and grid contrast now follow the active theme so data remains readable in every theme preset.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.12}>
          <Tabs defaultValue="growth" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 gap-2 bg-muted/70 p-1 md:grid-cols-3 xl:grid-cols-6">
              <TabsTrigger value="growth">Growth</TabsTrigger>
              <TabsTrigger value="salary">Salary</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="competition">Competition</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            </TabsList>

            <TabsContent value="growth" className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Card className={mainCardClass}>
                <CardHeader>
                  <CardTitle>India hiring growth for {roleInsight.label}</CardTitle>
                  <CardDescription>Projected openings shaped by your selected hiring region.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={growthTrends}>
                        <defs>
                          <linearGradient id="growthGradientIndia" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chartPrimary} />
                            <stop offset="100%" stopColor={chartSuccess} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip {...tooltipStyle} formatter={(value: number) => [value.toLocaleString('en-IN'), 'Openings']} />
                        <Bar dataKey="openings" radius={[8, 8, 0, 0]} fill="url(#growthGradientIndia)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className={mainCardClass}>
                <CardHeader>
                  <CardTitle className="text-base">What this means</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{roleInsight.highlights[0]}</p>
                  <p>{roleInsight.highlights[1]}</p>
                  <div className={infoPanelClass}>
                    <p className="font-semibold text-foreground">Simple answer</p>
                    <p className="mt-1">Yes. {roleInsight.label} demand is still healthy in India when your profile looks specific and execution-focused.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="salary" className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Card className={mainCardClass}>
                <CardHeader>
                  <CardTitle>Salary now vs next 12-18 months</CardTitle>
                  <CardDescription>India-focused compensation trend for your selected role and experience.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salaryTrends}>
                        <defs>
                          <linearGradient id="salaryCurrentIndia" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chartPrimary} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={chartPrimary} stopOpacity={0.08} />
                          </linearGradient>
                          <linearGradient id="salaryFutureIndia" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chartSuccess} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={chartSuccess} stopOpacity={0.08} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip {...tooltipStyle} formatter={(value: number, name) => [formatLpa(value), name === 'current' ? 'Current market' : 'Future projection']} />
                        <Area type="monotone" dataKey="current" stroke={chartPrimary} strokeWidth={2.5} fill="url(#salaryCurrentIndia)" />
                        <Area type="monotone" dataKey="future" stroke={chartSuccess} strokeWidth={2.5} fill="url(#salaryFutureIndia)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className={metricCardClass}><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Current band</p><p className="mt-2 text-lg font-semibold">{formatRange(salaryRange)}</p></div>
                    <div className={metricCardClass}><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Future band</p><p className="mt-2 text-lg font-semibold">{formatRange(futureSalaryRange)}</p></div>
                    <div className={metricCardClass}><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Premium upside</p><p className="mt-2 text-sm font-semibold">{salaryBand.premium}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className={mainCardClass}>
                <CardHeader><CardTitle className="text-base">Takeaway</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Metro cities typically pay more, but remote-friendly roles still stay competitive for strong candidates.</p>
                  <p>Your upside mostly comes from projects, interview readiness, and sharper role alignment.</p>
                  <div className={infoPanelClass}>
                    <p className="font-semibold text-foreground">Simple answer</p>
                    <p className="mt-1">For {selectedExperience} talent in {regionInsight.label.toLowerCase()}, this role still has a realistic and improving compensation curve.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Card className={mainCardClass}>
                <CardHeader><CardTitle>Skill coverage for {roleInsight.label}</CardTitle><CardDescription>Required market depth vs your selected experience level.</CardDescription></CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={skillsRadarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Radar dataKey="required" name="Market requirement" stroke={chartWarning} fill={chartWarning} fillOpacity={0.28} />
                        <Radar dataKey="you" name="Selected experience" stroke={chartPrimary} fill={chartPrimary} fillOpacity={0.32} />
                        <Tooltip {...tooltipStyle} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className={mainCardClass}>
                <CardHeader><CardTitle className="text-base">Skill roadmap</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {roleInsight.skills.slice(0, 4).map((item) => (
                    <div key={item.skill} className={infoPanelClass}>
                      <p className="font-semibold text-foreground">{item.skill}</p>
                      <p className="mt-1">Target {item.required}% comfort here. The current filters map you to roughly {item.coverage[selectedExperience]}% readiness before region adjustments.</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competition" className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Card className={mainCardClass}>
                <CardHeader><CardTitle>Competition pressure</CardTitle><CardDescription>Applicants vs openings in India for your current filter set.</CardDescription></CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={competitionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="applicants" name="Applicants" fill={chartDanger} radius={[6, 6, 0, 0]} />
                        <Bar dataKey="openings" name="Openings" fill={chartSuccess} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className={mainCardClass}>
                <CardHeader><CardTitle className="text-base">How to stand out</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Entry roles are crowded because many applicants still look generic on resumes and projects.</p>
                  <p>Sharper projects, better resume targeting, and cleaner communication matter a lot in India hiring.</p>
                  <div className={infoPanelClass}>
                    <p className="font-semibold text-foreground">Simple answer</p>
                    <p className="mt-1">It is competitive, but a prepared candidate still stands out clearly from the average applicant pool.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Card className={mainCardClass}>
                <CardHeader><CardTitle>Best locations in {regionInsight.label}</CardTitle><CardDescription>Role concentration across the India-focused market slice you selected.</CardDescription></CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={locationData} cx="50%" cy="50%" innerRadius={62} outerRadius={110} paddingAngle={4} dataKey="value">
                          {locationData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        </Pie>
                        <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`, 'Share of roles']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className={mainCardClass}>
                <CardHeader><CardTitle className="text-base">Location insights</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    {locationData.map((location) => (
                      <li key={location.name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: location.color }} />
                          <span className="font-medium text-foreground">{location.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{location.value}%</span>
                      </li>
                    ))}
                  </ul>
                  <div className={infoPanelClass}>
                    <p className="font-semibold text-foreground">Remote tip</p>
                    <p className="mt-1">Location still matters in India, but remote-friendly employers increasingly hire beyond the usual metro shortlist.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roadmap" className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Card className={mainCardClass}>
                <CardHeader><CardTitle>Role roadmap</CardTitle><CardDescription>Practical next steps for becoming job-ready in India.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-4 border-l border-border/70 pl-4">
                    {roleInsight.roadmap.map((step) => (
                      <li key={step.title} className="relative space-y-2">
                        <span className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full bg-primary" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">{step.stage} - {step.duration}</p>
                        <p className="text-sm font-semibold">{step.title}</p>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {step.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Card className={mainCardClass}>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4 text-primary" />Emerging technologies to watch</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {roleInsight.emergingTech.map((tech) => <span key={tech.label} className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs text-primary">{tech.label}</span>)}
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {roleInsight.emergingTech.map((tech) => (
                        <li key={tech.label} className="flex items-center justify-between gap-3">
                          <span>{tech.label}</span>
                          <span className="text-xs">{tech.impact} - {tech.timeline}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className={mainCardClass}>
                  <CardHeader><CardTitle className="text-base">Entry difficulty meter</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className={infoPanelClass}>
                      <p className="font-semibold text-foreground">Current reading</p>
                      <p className="mt-1">{difficultyLabel(difficultyScore)} difficulty for {selectedExperience} candidates in {regionInsight.label.toLowerCase()}.</p>
                    </div>
                    {[{ label: 'Breaking in', value: difficultyScore }, { label: 'Staying relevant', value: clamp(difficultyScore - 16) }, { label: 'Reaching senior level', value: clamp(difficultyScore - 8) }].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <p className="flex items-center justify-between text-sm"><span>{item.label}</span><span className="text-xs text-muted-foreground">{item.value}/100</span></p>
                        <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" style={{ width: `${item.value}%` }} /></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </AnimatedSection>

        <AnimatedSection delay={0.18}>
          <Card className={mainCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Briefcase className="h-4 w-4 text-primary" />Skills in highest demand right now</CardTitle>
              <CardDescription>Demand updates with the selected role and region, so the filters are now actually useful.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobDemand}>
                      <defs>
                        <linearGradient id="demandGradientIndia" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartPrimary} />
                          <stop offset="100%" stopColor={chartSecondary} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`, 'Demand score']} />
                      <Bar dataKey="demand" fill="url(#demandGradientIndia)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>These are the most repeated skills across the selected role in the India market slice you chose.</p>
                  <p>The role filter changes the skill stack, the region filter scales demand context, and the experience filter helps you judge the gap more realistically.</p>
                  <div className={infoPanelClass}>
                    <p className="font-semibold text-foreground">Action step</p>
                    <p className="mt-1">Pick one of the top two skills above and build a small but complete project around it over the next 2-3 weeks.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Insights;
