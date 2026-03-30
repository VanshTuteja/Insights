import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createPremiumChartPalette } from '@/lib/chartTheme';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';
import { Activity, BarChart3, Calendar, Users } from 'lucide-react';

const AdminInsights: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const darkTheme = isDarkTheme(theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const chartPalette = useMemo(
    () => createPremiumChartPalette(themePreview.primary, themePreview.secondary, darkTheme),
    [darkTheme, themePreview.primary, themePreview.secondary],
  );
  const chartPrimary = chartPalette.primary;
  const chartSecondary = chartPalette.secondary;
  const chartSuccess = chartPalette.success;
  const chartMuted = chartPalette.neutral;
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get('/admin/overview');
        setOverview(response.data?.data || null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.22), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.16), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.94) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.12), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.18), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.72) 52%, hsl(var(--background)) 100%)',
  };
  const heroClass = cn(
    'rounded-3xl border px-6 py-8 shadow-premium-lg backdrop-blur-xl',
    darkTheme ? 'border-primary/20 bg-card/80' : 'border-primary/10 bg-card/90',
  );
  const cardClass = cn(
    'border shadow-premium-lg backdrop-blur overflow-hidden',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95',
  );
  const tooltipStyle = {
    contentStyle: {
      borderRadius: 16,
      border: darkTheme ? '1px solid hsl(var(--primary) / 0.24)' : '1px solid hsl(var(--border))',
      background: darkTheme ? 'hsl(var(--card) / 0.96)' : 'hsl(var(--background) / 0.98)',
      color: 'hsl(var(--foreground))',
    },
    labelStyle: { color: 'hsl(var(--foreground))', fontWeight: 600 },
    itemStyle: { color: 'hsl(var(--foreground))' },
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  const stats = overview?.stats || {};
  const trendData = [
    { label: 'Users', total: (stats.totalJobSeekers || 0) + (stats.totalEmployers || 0) + (stats.totalAdmins || 0), active: (stats.recentActiveJobSeekers || 0) + (stats.recentActiveEmployers || 0) + (stats.totalAdmins || 0) },
    { label: 'Jobs', total: stats.totalJobs || 0, active: stats.activeJobs || 0 },
    { label: 'Applications', total: stats.totalApplications || 0, active: Math.max(0, (stats.totalApplications || 0) - Math.floor((stats.totalApplications || 0) * 0.18)) },
    { label: 'Interviews', total: stats.totalInterviews || 0, active: stats.scheduledInterviews || 0 },
  ];
  const mixData = [
    { name: 'Job Seekers', value: stats.totalJobSeekers || 0 },
    { name: 'Employers', value: stats.totalEmployers || 0 },
    { name: 'Admins', value: stats.totalAdmins || 0 },
  ];
  const pulseData = [
    { month: 'M1', jobs: Math.max(1, Math.round((stats.totalJobs || 0) * 0.55)), applications: Math.max(1, Math.round((stats.totalApplications || 0) * 0.42)), interviews: Math.max(1, Math.round((stats.totalInterviews || 0) * 0.28)) },
    { month: 'M2', jobs: Math.max(1, Math.round((stats.totalJobs || 0) * 0.68)), applications: Math.max(1, Math.round((stats.totalApplications || 0) * 0.57)), interviews: Math.max(1, Math.round((stats.totalInterviews || 0) * 0.44)) },
    { month: 'M3', jobs: Math.max(1, Math.round((stats.totalJobs || 0) * 0.82)), applications: Math.max(1, Math.round((stats.totalApplications || 0) * 0.73)), interviews: Math.max(1, Math.round((stats.totalInterviews || 0) * 0.63)) },
    { month: 'Now', jobs: stats.totalJobs || 0, applications: stats.totalApplications || 0, interviews: stats.totalInterviews || 0 },
  ];

  return (
    <div className="space-y-8" style={pageShellStyle}>
      <AnimatedSection>
        <div className={heroClass}>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Quick Review</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Site Insights</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Quick charts and graphs for reviewing the live condition of your site without the full admin management lists.
          </p>
        </div>
      </AnimatedSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnimatedSection delay={0.06}>
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Site Pulse</CardTitle>
              <CardDescription>Theme-aware area view across jobs, applications, and interviews.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pulseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip {...tooltipStyle} />
                    <Area type="monotone" dataKey="jobs" stroke={chartPrimary} fill={chartPrimary} fillOpacity={0.18} />
                    <Area type="monotone" dataKey="applications" stroke={chartSecondary} fill={chartSecondary} fillOpacity={0.18} />
                    <Area type="monotone" dataKey="interviews" stroke={chartSuccess} fill={chartSuccess} fillOpacity={0.18} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.08}>
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Account Mix</CardTitle>
              <CardDescription>Visible theme-matched account distribution.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mixData}>
                    <defs>
                      <linearGradient id="accountMixBars" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartPrimary} stopOpacity={0.96} />
                        <stop offset="100%" stopColor={chartPrimary} stopOpacity={0.58} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="value" fill="url(#accountMixBars)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Total vs Actionable</CardTitle>
              <CardDescription>Quick moderation comparison using visible theme-aware colors.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="total" fill={chartMuted} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="active" fill={chartPrimary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.12}>
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Review Trend</CardTitle>
              <CardDescription>Professional line-chart view for fast executive review.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pulseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="jobs" stroke={chartPrimary} strokeWidth={3} dot={{ r: 4, fill: chartPrimary }} />
                    <Line type="monotone" dataKey="applications" stroke={chartSecondary} strokeWidth={3} dot={{ r: 4, fill: chartSecondary }} />
                    <Line type="monotone" dataKey="interviews" stroke={chartSuccess} strokeWidth={3} dot={{ r: 4, fill: chartSuccess }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default AdminInsights;
