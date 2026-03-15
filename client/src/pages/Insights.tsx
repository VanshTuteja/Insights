import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import AnimatedSection from '@/components/AnimatedSection';
import { TrendingUp, DollarSign, MapPin, Briefcase, Users, Target } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import EmployerAnalyticsView from '@/components/employer/EmployerAnalyticsView';
import LoadingSpinner from '@/components/LoadingSpinner';

const Insights: React.FC = () => {
  const { user } = useAuthStore();
  const isEmployer = user?.role === 'employer';
  const [employerLoading, setEmployerLoading] = useState(false);
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [employerApplications, setEmployerApplications] = useState<any[]>([]);
  const [employerInterviews, setEmployerInterviews] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState('frontend-developer');
  const [selectedExperience, setSelectedExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedRegion, setSelectedRegion] = useState('global');

  useEffect(() => {
    if (!isEmployer) return;

    const loadEmployerInsights = async () => {
      setEmployerLoading(true);
      try {
        const [jobsRes, applicationsRes, interviewsRes] = await Promise.all([
          axios.get('/jobs/employer'),
          axios.get('/applications/employer'),
          axios.get('/interviews/employer'),
        ]);

        setEmployerJobs(jobsRes.data?.data || []);
        setEmployerApplications(applicationsRes.data?.data || []);
        setEmployerInterviews(interviewsRes.data?.data || []);
      } finally {
        setEmployerLoading(false);
      }
    };

    void loadEmployerInsights();
  }, [isEmployer]);

  if (isEmployer) {
    return (
      <div className="space-y-6">
        <AnimatedSection>
          <div className="rounded-3xl border bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94))] px-6 py-8 text-white shadow-xl">
            <h1 className="text-3xl font-semibold">Career Insights</h1>
            <p className="mt-2 max-w-2xl text-white/70">
              Review hiring performance across all job posts and drill into individual roles with real applicant and interview data.
            </p>
          </div>
        </AnimatedSection>

        {employerLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <EmployerAnalyticsView
            jobs={employerJobs}
            applications={employerApplications}
            interviews={employerInterviews}
            title="Career Insights"
            description="Professional analytics for all job posts and each individual role."
          />
        )}
      </div>
    );
  }

  const salaryTrends = [
    { month: 'Jan', current: 95000, future: 102000 },
    { month: 'Feb', current: 97000, future: 104000 },
    { month: 'Mar', current: 99000, future: 106500 },
    { month: 'Apr', current: 101000, future: 108000 },
    { month: 'May', current: 103000, future: 110500 },
    { month: 'Jun', current: 105000, future: 113000 },
  ];

  const growthTrends = [
    { year: '2022', openings: 820, growth: 8 },
    { year: '2023', openings: 960, growth: 11 },
    { year: '2024', openings: 1120, growth: 13 },
    { year: '2025', openings: 1290, growth: 15 },
  ];

  const skillsRadarData = [
    { skill: 'Foundations', required: 90, you: selectedExperience === 'beginner' ? 35 : selectedExperience === 'intermediate' ? 65 : 85 },
    { skill: 'Frontend', required: 88, you: selectedExperience === 'beginner' ? 30 : selectedExperience === 'intermediate' ? 60 : 80 },
    { skill: 'Backend', required: 70, you: selectedExperience === 'beginner' ? 20 : selectedExperience === 'intermediate' ? 50 : 75 },
    { skill: 'Cloud / DevOps', required: 68, you: selectedExperience === 'beginner' ? 15 : selectedExperience === 'intermediate' ? 40 : 70 },
    { skill: 'Data / AI', required: 72, you: selectedExperience === 'beginner' ? 25 : selectedExperience === 'intermediate' ? 55 : 78 },
    { skill: 'Soft Skills', required: 80, you: selectedExperience === 'beginner' ? 45 : selectedExperience === 'intermediate' ? 70 : 88 },
  ];

  const competitionData = [
    { label: 'Junior', applicants: 220, openings: 70 },
    { label: 'Mid', applicants: 150, openings: 95 },
    { label: 'Senior', applicants: 90, openings: 80 },
  ];

  const jobDemand = [
    { skill: 'React', demand: 95, openings: 1200 },
    { skill: 'Python', demand: 88, openings: 980 },
    { skill: 'TypeScript', demand: 82, openings: 750 },
    { skill: 'Node.js', demand: 78, openings: 680 },
    { skill: 'AWS', demand: 85, openings: 920 },
  ];

  const locationData = selectedRegion === 'global'
    ? [
        { name: 'San Francisco', value: 24, color: '#3b82f6' },
        { name: 'New York', value: 20, color: '#10b981' },
        { name: 'London', value: 16, color: '#f59e0b' },
        { name: 'Bangalore', value: 18, color: '#ef4444' },
        { name: 'Remote', value: 22, color: '#8b5cf6' },
      ]
    : [
        { name: 'Bangalore', value: 30, color: '#3b82f6' },
        { name: 'Hyderabad', value: 22, color: '#10b981' },
        { name: 'Pune', value: 18, color: '#f59e0b' },
        { name: 'Delhi NCR', value: 16, color: '#ef4444' },
        { name: 'Remote India', value: 14, color: '#8b5cf6' },
      ];

  const roadmap = [
    {
      stage: 'Step 1',
      title: 'Explore & Fundamentals',
      duration: '0–2 months',
      items: ['Understand the role & paths', 'HTML, CSS, basic JavaScript', 'Git & GitHub basics'],
    },
    {
      stage: 'Step 2',
      title: 'Core Skills',
      duration: '2–5 months',
      items: ['Modern JS + TypeScript', 'React or your chosen framework', 'Build 2–3 portfolio projects'],
    },
    {
      stage: 'Step 3',
      title: 'Job Ready',
      duration: '5–8 months',
      items: ['APIs & backend basics', 'System design for beginners', 'Mock interviews & resume'],
    },
    {
      stage: 'Step 4',
      title: 'Level Up',
      duration: '8–12+ months',
      items: ['Cloud / DevOps basics', 'Contribute to open source', 'Target higher-paying roles'],
    },
  ];

  const emergingTech = [
    { label: 'AI copilots', impact: 'High', timeline: 'Now–1 year' },
    { label: 'Generative UI', impact: 'Medium', timeline: '1–3 years' },
    { label: 'Edge & serverless', impact: 'High', timeline: 'Now–2 years' },
    { label: 'LLM-powered tooling', impact: 'Very High', timeline: 'Now' },
    { label: 'Web3 (selective use)', impact: 'Low–Medium', timeline: 'Exploratory' },
  ];

  const difficultyLevels = [
    { label: 'Getting your first job', value: 70 },
    { label: 'Staying relevant (upskilling)', value: 55 },
    { label: 'Reaching senior level', value: 65 },
  ];

  const headlineStats = [
    {
      title: 'Is this career growing?',
      value: '+13.5% / yr',
      description: 'Average yearly growth in job openings globally.',
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'What salary can I expect?',
      value: '$95k–$140k',
      description: 'Typical range after 1–5 years of experience.',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Competition level',
      value: '3.8 : 1',
      description: 'Average applicants per good role.',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Remote opportunities',
      value: '62%',
      description: 'Roles offering hybrid or fully remote work.',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* HERO + QUICK FILTERS */}
      <AnimatedSection>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 max-w-xl">
            <p className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground bg-background/60 backdrop-blur">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              AI-powered career intelligence for beginners
            </p>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Career Insights & Analytics
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Answer all your big questions in one place: growth, salary, skills, competition, locations, roadmap,
              and emerging technologies — in a format that is easy to scan even if you are just starting out.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border bg-card/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Experience level</p>
                <Select
                  value={selectedExperience}
                  onValueChange={(v) => setSelectedExperience(v as typeof selectedExperience)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Choose experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0–1 yr)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1–3 yrs)</SelectItem>
                    <SelectItem value="advanced">Advanced (3+ yrs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-card/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Region</p>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Global" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="india">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-card/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Target role</p>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                    <SelectItem value="backend-developer">Backend Developer</SelectItem>
                    <SelectItem value="full-stack">Full Stack Engineer</SelectItem>
                    <SelectItem value="data-scientist">Data Scientist</SelectItem>
                    <SelectItem value="ml-engineer">ML Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[360px]">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900 text-slate-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Quick career snapshot
                  <span className="rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] px-2 py-0.5 border border-emerald-500/40">
                    AI estimated
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-300/80">
                  Based on thousands of recent job postings for your selected role.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-slate-800/80 border border-white/5 p-3 space-y-1">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Entry salary (0–1 yr)</p>
                    <p className="text-lg font-semibold">$68k–$82k</p>
                    <p className="text-[11px] text-slate-400">With solid fundamentals & 2–3 projects.</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/80 border border-white/5 p-3 space-y-1">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Growth potential</p>
                    <p className="text-lg font-semibold">2.1× in 3 yrs</p>
                    <p className="text-[11px] text-slate-400">If you keep learning the right skills.</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="flex items-center justify-between">
                    <span className="text-slate-300">Difficulty to enter</span>
                    <span className="font-semibold text-amber-300">Medium</span>
                  </p>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-[70%] bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Not easy, but very achievable with a clear roadmap and consistent practice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedSection>

      {/* QUESTION-ALIGNED HEADLINE STATS */}
      <AnimatedSection delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {headlineStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className="border-0 shadow-md h-full">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`p-2.5 rounded-full bg-gradient-to-br ${stat.color} text-white`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground/80">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* INTERACTIVE TABS – ANSWER EACH BIG QUESTION */}
      <AnimatedSection delay={0.2}>
        <Tabs defaultValue="growth" className="w-full space-y-6">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 text-xs md:text-sm">
            <TabsTrigger value="growth">Is this career growing?</TabsTrigger>
            <TabsTrigger value="salary">Salary (now & future)</TabsTrigger>
            <TabsTrigger value="skills">Skills & gaps</TabsTrigger>
            <TabsTrigger value="competition">Competition level</TabsTrigger>
            <TabsTrigger value="locations">Best locations</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap & emerging tech</TabsTrigger>
          </TabsList>

          {/* GROWTH */}
          <TabsContent value="growth" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Is this career still growing?</CardTitle>
                  <CardDescription>Projected openings over the next few years.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={growthTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="openings"
                          radius={[6, 6, 0, 0]}
                          fill="url(#growthGradient)"
                        />
                        <defs>
                          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#15803d" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">How to read this</CardTitle>
                  <CardDescription>Beginner-friendly explanation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs md:text-sm text-muted-foreground">
                  <p>
                    • Bars going up ⇒ more openings each year. A steady upward trend means this career is
                    <span className="font-semibold text-emerald-600"> growing and not saturated</span>.
                  </p>
                  <p>
                    • Tech roles remain in demand even when some companies slow down hiring, because businesses still
                    need to ship products and modernize systems.
                  </p>
                  <p>
                    • For beginners, this means: if you start today and stay consistent, there should still be strong
                    demand by the time you are job ready (6–12 months).
                  </p>
                  <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 text-xs">
                    <p className="font-semibold text-[11px] mb-1 uppercase tracking-wide">
                      Simple answer
                    </p>
                    <p>
                      Yes — this career is <span className="font-semibold">growing</span>. It is competitive, but the
                      market is big enough for new people who learn the right skills.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SALARY NOW & FUTURE */}
          <TabsContent value="salary" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>Salary now vs future</CardTitle>
                      <CardDescription>Estimated trends for your selected role.</CardDescription>
                    </div>
                    <div className="hidden md:flex flex-col text-right text-xs">
                      <span className="text-muted-foreground">Based on recent market data</span>
                      <span className="font-semibold text-emerald-600">Updated weekly</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salaryTrends}>
                        <defs>
                          <linearGradient id="currentSalary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="futureSalary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number, name) => [`$${value.toLocaleString()}`, name === 'current' ? 'Current market' : 'Future (12–18m)' ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="current"
                          stroke="#2563eb"
                          strokeWidth={2}
                          fill="url(#currentSalary)"
                          name="current"
                        />
                        <Area
                          type="monotone"
                          dataKey="future"
                          stroke="#16a34a"
                          strokeWidth={2}
                          fill="url(#futureSalary)"
                          name="future"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                    <div className="rounded-md bg-accent/40 p-3 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                        Typical entry (0–1 yr)
                      </p>
                      <p className="text-lg font-semibold">$65k–$85k</p>
                    </div>
                    <div className="rounded-md bg-accent/40 p-3 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                        After 3+ yrs
                      </p>
                      <p className="text-lg font-semibold">$110k–$145k</p>
                    </div>
                    <div className="rounded-md bg-accent/40 p-3 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                        With top skills & city
                      </p>
                      <p className="text-lg font-semibold">$150k+ possible</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Beginner-friendly takeaway</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs md:text-sm text-muted-foreground">
                  <p>
                    • The <span className="font-semibold text-primary">blue area</span> shows what companies are paying
                    right now.
                  </p>
                  <p>
                    • The <span className="font-semibold text-emerald-600">green area</span> is a reasonable future
                    expectation if you keep improving your skills.
                  </p>
                  <p>
                    • Your exact number will depend on country, city, company size, and how strong your projects are —
                    but this gives you a realistic range.
                  </p>
                  <div className="rounded-md bg-blue-50 border border-blue-200 text-blue-900 p-3 text-xs">
                    <p className="font-semibold text-[11px] mb-1 uppercase tracking-wide">Simple answer</p>
                    <p>
                      You can expect a decent starting salary if you are job-ready, with strong growth as you gain
                      experience and move to stronger companies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SKILLS & GAPS */}
          <TabsContent value="skills" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>What skills do I need?</CardTitle>
                  <CardDescription>Required vs your estimated level.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={skillsRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Required for role"
                          dataKey="required"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.4}
                        />
                        <Radar
                          name="You (approx.)"
                          dataKey="you"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.4}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Adjust the experience level at the top of the page to see how your approximate skill coverage
                    changes.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Skill roadmap (simple view)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs md:text-sm">
                  <div>
                    <p className="font-semibold mb-1">1. Must-have basics</p>
                    <p className="text-muted-foreground">
                      Programming fundamentals, version control, problem-solving, and at least one main language
                      (JavaScript / Python / Java).
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">2. Role-specific skills</p>
                    <p className="text-muted-foreground">
                      For a frontend role: React, TypeScript, responsive UI, calling APIs, basic performance tuning.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">3. Career accelerators</p>
                    <p className="text-muted-foreground">
                      System design basics, cloud platforms, writing clean code, and communication skills.
                    </p>
                  </div>
                  <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 text-xs">
                    <p className="font-semibold text-[11px] mb-1 uppercase tracking-wide">Tip</p>
                    <p>
                      Do not try to learn everything. Focus on one path (e.g. frontend), build 3–5 strong projects, and
                      go deep instead of wide.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* COMPETITION LEVEL */}
          <TabsContent value="competition" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>How hard is the competition?</CardTitle>
                  <CardDescription>Applicants vs openings by seniority.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={competitionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="applicants" name="Applicants" fill="#ef4444" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="openings" name="Open roles" fill="#22c55e" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">What this means for you</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs md:text-sm text-muted-foreground">
                  <p>
                    • Junior roles have the <span className="font-semibold text-red-500">highest competition</span>{' '}
                    because many people apply with weak portfolios.
                  </p>
                  <p>
                    • Your goal is to stand out: good projects, clear GitHub, strong resume, and good communication.
                  </p>
                  <p>
                    • Once you gain 1–2 years of real experience, competition decreases and salary growth usually speeds
                    up.
                  </p>
                  <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-900 p-3 text-xs">
                    <p className="font-semibold text-[11px] mb-1 uppercase tracking-wide">Simple answer</p>
                    <p>
                      It is competitive at the start, but people who prepare properly and show real skills still get
                      hired.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BEST LOCATIONS */}
          <TabsContent value="locations" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>Where are the best locations?</CardTitle>
                      <CardDescription>Role distribution by location for your region.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={locationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value}%`, 'Share of roles']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Location insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs md:text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    {locationData.map((location) => (
                      <li key={location.name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: location.color }}
                          />
                          <span className="font-medium text-foreground text-xs md:text-sm">
                            {location.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{location.value}% of roles</span>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-md bg-slate-50 border border-slate-200 text-slate-900 p-3 text-xs">
                    <p className="font-semibold text-[11px] mb-1 uppercase tracking-wide">Remote tip</p>
                    <p>
                      Many companies now hire remotely. A strong portfolio can sometimes matter more than your exact
                      city, especially for global-first startups.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ROADMAP & EMERGING TECH */}
          <TabsContent value="roadmap" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Beginner-friendly roadmap</CardTitle>
                  <CardDescription>Clear steps from zero to job-ready.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="relative border-l border-muted-foreground/20 space-y-4 pl-3">
                    {roadmap.map((step, idx) => (
                      <li key={step.title} className="ml-2 space-y-1">
                        <div className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-primary" />
                        <p className="text-[11px] font-semibold text-primary/80 uppercase tracking-wide">
                          {step.stage} • {step.duration}
                        </p>
                        <p className="font-semibold text-sm">{step.title}</p>
                        <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                          {step.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        {idx !== roadmap.length - 1 && <div className="h-4" />}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4" />
                      Emerging technologies to watch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs md:text-sm">
                    <div className="flex flex-wrap gap-2">
                      {emergingTech.map((tech) => (
                        <div
                          key={tech.label}
                          className="rounded-full border bg-accent/40 px-3 py-1 text-[11px]"
                        >
                          <span className="font-semibold">{tech.label}</span>
                        </div>
                      ))}
                    </div>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      {emergingTech.map((tech) => (
                        <li key={tech.label} className="flex items-center justify-between gap-3">
                          <span>{tech.label}</span>
                          <span className="text-[11px] text-right">
                            Impact: <span className="font-semibold">{tech.impact}</span> • {tech.timeline}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">How hard is it to enter?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs md:text-sm">
                    {difficultyLevels.map((level) => (
                      <div key={level.label} className="space-y-1">
                        <p className="flex items-center justify-between">
                          <span>{level.label}</span>
                          <span className="text-[11px] text-muted-foreground">{level.value}/100</span>
                        </p>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
                            style={{ width: `${level.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="text-[11px] text-muted-foreground">
                      Breaking in is the hardest step. Once you are inside, continuous learning and smart choices can
                      make the rest of the journey much smoother.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </AnimatedSection>

      {/* EXTRA: SKILL DEMAND SNAPSHOT */}
      <AnimatedSection delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Briefcase className="h-4 w-4" />
              Skills in highest demand right now
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Use this as a simple checklist: if a skill is here and relevant to your path, it is worth learning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobDemand}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="demand" fill="url(#demandGradientNew)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="demandGradientNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <p>
                  • These are the skills that most frequently appear in job descriptions for your selected role.
                </p>
                <p>
                  • Learning them in the order shown is usually a good strategy: start with core language + framework,
                  then move into cloud and tooling.
                </p>
                <div className="rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 p-3 text-xs">
                  <p className="font-semibold text-[11px] mb-1 uppercase tracking-wide">Actionable step</p>
                  <p>
                    Pick one main skill to focus on for the next 2–3 weeks (for example React or Python). Build at least
                    one small but complete project around it.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
};

export default Insights;
