import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore, getThemePreview, isDarkTheme } from '@/stores/themeStore';
import { cn, resolveAssetUrl } from '@/lib/utils';
import { createPremiumChartPalette } from '@/lib/chartTheme';
import { toast } from '@/hooks/use-toast';
import { Shield, Users, Briefcase, Calendar, FileText, Activity, Eye, Sparkles, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const darkTheme = isDarkTheme(theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const chartPalette = useMemo(
    () => createPremiumChartPalette(themePreview.primary, themePreview.secondary, darkTheme),
    [darkTheme, themePreview.primary, themePreview.secondary],
  );
  const chartPrimary = chartPalette.primary;
  const chartMuted = chartPalette.neutral;
  const chartSuccess = chartPalette.success;
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProfileOpen, setUserProfileOpen] = useState(false);

  const loadOverview = async () => {
    try {
      const response = await axios.get('/admin/overview');
      setOverview(response.data?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
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
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95',
  );
  const chartCardClass = cn(
    'border shadow-premium-lg backdrop-blur overflow-hidden',
    darkTheme ? 'border-primary/15 bg-gradient-to-br from-card/90 to-background/70' : 'border-border/80 bg-gradient-to-br from-background to-muted/40',
  );
  const tooltipStyle = {
    contentStyle: {
      borderRadius: 16,
      border: darkTheme ? '1px solid hsl(var(--primary) / 0.24)' : '1px solid hsl(var(--border))',
      background: darkTheme ? 'hsl(var(--card) / 0.96)' : 'hsl(var(--background) / 0.98)',
      color: 'hsl(var(--foreground))',
      boxShadow: darkTheme ? '0 18px 45px rgba(0, 0, 0, 0.38)' : '0 18px 45px rgba(15, 23, 42, 0.14)',
    },
    labelStyle: { color: 'hsl(var(--foreground))', fontWeight: 600 },
    itemStyle: { color: 'hsl(var(--foreground))' },
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  const stats = overview?.stats || {};
  const recentUsers = overview?.recentUsers || [];
  const recentJobs = overview?.recentJobs || [];
  const recentApplications = overview?.recentApplications || [];
  const recentInterviews = overview?.recentInterviews || [];
  const statCards = [
    { label: 'Active Job Seekers', value: stats.activeJobSeekers || 0, detail: `${stats.recentActiveJobSeekers || 0} logged in during last 24h`, icon: Users },
    { label: 'Active Employers', value: stats.activeEmployers || 0, detail: `${stats.recentActiveEmployers || 0} logged in during last 24h`, icon: Briefcase },
    { label: 'Live Jobs', value: stats.activeJobs || 0, detail: `${stats.totalJobs || 0} total`, icon: FileText },
    { label: 'Scheduled Interviews', value: stats.scheduledInterviews || 0, detail: `${stats.totalInterviews || 0} total`, icon: Calendar },
  ];
  const platformMixData = [
    { label: 'Job Seekers', value: stats.totalJobSeekers || 0 },
    { label: 'Employers', value: stats.totalEmployers || 0 },
    { label: 'Admins', value: stats.totalAdmins || 0 },
  ];
  const activityTrendData = [
    { label: 'Jobs', total: stats.totalJobs || 0, active: stats.activeJobs || 0 },
    { label: 'Applications', total: stats.totalApplications || 0, active: Math.max(0, (stats.totalApplications || 0) - Math.floor((stats.totalApplications || 0) * 0.18)) },
    { label: 'Interviews', total: stats.totalInterviews || 0, active: stats.scheduledInterviews || 0 },
  ];
  const livePulseData = [
    { name: 'Profiles', value: (stats.activeJobSeekers || 0) + (stats.activeEmployers || 0) + (stats.totalAdmins || 0) },
    { name: 'Jobs', value: stats.activeJobs || 0 },
    { name: 'Applications', value: stats.totalApplications || 0 },
    { name: 'Interviews', value: stats.scheduledInterviews || 0 },
  ];

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`/admin/users/${userId}`);
      toast({ title: 'Profile deleted', description: 'The user profile has been removed.' });
      await loadOverview();
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.message || 'Could not delete this profile.',
        variant: 'destructive',
      });
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await axios.get(`/admin/users/${userId}`);
      setSelectedUser(response.data?.data || null);
      setUserProfileOpen(true);
    } catch (error: any) {
      toast({
        title: 'Profile load failed',
        description: error.response?.data?.message || 'Could not load this user profile.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await axios.delete(`/admin/jobs/${jobId}`);
      toast({ title: 'Job deleted', description: 'The job post has been removed.' });
      await loadOverview();
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.message || 'Could not delete this job post.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6" style={pageShellStyle}>
      <AnimatedSection>
        <div className={heroClass}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Admin Control Center
                </span>
                <span className="inline-flex items-center rounded-full border border-border/70 bg-background/40 px-3 py-1 text-xs font-medium text-foreground/80">
                  Theme synced: {themePreview.label}
                </span>
              </div>
              <h1 className="text-3xl font-semibold md:text-4xl">Platform Dashboard</h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Monitor job seekers, employers, job posts, applications, and platform activity from one place.
              </p>
            </div>

            <div className={cn('rounded-3xl border p-5', darkTheme ? 'border-primary/15 bg-background/55' : 'border-border bg-background/80')}>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-primary/15">
                  <AvatarImage src={resolveAssetUrl(user?.avatar)} />
                  <AvatarFallback className={cn(darkTheme ? 'bg-primary/20 text-primary-foreground' : 'bg-primary/10 text-foreground')}>
                    {user?.name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Admin Profile</p>
                  <p className="text-lg font-semibold">{user?.name || 'Vansh Tuteja'}</p>
                  <p className="text-sm text-muted-foreground">Platform Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Card className={cardClass}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={cn('rounded-full p-3', darkTheme ? 'bg-primary/18' : 'bg-primary/10')}>
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xs text-muted-foreground">{stat.detail}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.14}>
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className={chartCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Activity Overview
              </CardTitle>
              <CardDescription>Live view of platform scale across jobs, applications, and interviews.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={livePulseData}>
                      <defs>
                        <linearGradient id="adminPulse" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartPrimary} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={chartPrimary} stopOpacity={0.08} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip {...tooltipStyle} />
                      <Area type="monotone" dataKey="value" stroke={chartPrimary} fill="url(#adminPulse)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader>
              <CardTitle>Platform Mix</CardTitle>
              <CardDescription>Current account distribution across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformMixData}>
                    <defs>
                      <linearGradient id="platformMixBars" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartPrimary} stopOpacity={0.96} />
                        <stop offset="100%" stopColor={chartPrimary} stopOpacity={0.58} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="value" fill="url(#platformMixBars)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.18}>
        <Card className={chartCardClass}>
          <CardHeader>
            <CardTitle>Moderation Workload</CardTitle>
            <CardDescription>Compare total records with the live actionable subset.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="total" fill={chartMuted} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="active" fill={chartSuccess} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Recent Profiles</CardTitle>
                <CardDescription>Recent job seeker, employer, and admin accounts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentUsers.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.company || user.jobTitle || user.location || 'Profile details pending'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 mr-2"
                        onClick={() => void handleViewUser(user._id)}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        View Profile
                      </Button>
                      {user.role !== 'admin' ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="mt-3"
                          onClick={() => void handleDeleteUser(user._id)}
                        >
                          Delete Profile
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Recent Job Posts</CardTitle>
                <CardDescription>Latest jobs across all employers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentJobs.map((job: any) => (
                  <div key={job._id} className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <p className="text-xs text-muted-foreground">{job.location} • {job.type}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={job.isActive ? 'default' : 'secondary'}>{job.isActive ? 'Active' : 'Paused'}</Badge>
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString()}</p>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-3"
                        onClick={() => void handleDeleteJob(job._id)}
                      >
                        Delete Job
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Recent Applications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentApplications.map((application: any) => (
                    <div key={application._id} className="rounded-xl border p-4">
                      <p className="font-medium">{application.candidateId?.name || 'Candidate'}</p>
                      <p className="text-sm text-muted-foreground">{application.jobId?.title || 'Job'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(application.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Recent Interviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentInterviews.map((interview: any) => (
                    <div key={interview._id} className="rounded-xl border p-4">
                      <p className="font-medium">{interview.jobId?.title || 'Interview'}</p>
                      <p className="text-sm text-muted-foreground">{interview.candidateId?.name || 'Candidate'}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">{interview.status}</Badge>
                        <p className="text-xs text-muted-foreground">{new Date(interview.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </AnimatedSection>

      <Dialog open={userProfileOpen} onOpenChange={setUserProfileOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>Admin view of the selected account profile.</DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Name', selectedUser.name],
                ['Email', selectedUser.email],
                ['Role', selectedUser.role],
                ['Phone', selectedUser.phone],
                ['Location', selectedUser.location],
                ['Job Title', selectedUser.jobTitle],
                ['Company', selectedUser.company],
                ['Experience', selectedUser.experience],
                ['Education', selectedUser.education],
                ['Website', selectedUser.website],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-2 text-sm font-medium">{value || 'Not provided'}</p>
                </div>
              ))}
              <div className="rounded-xl border p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Bio</p>
                <p className="mt-2 text-sm">{selectedUser.bio || 'Not provided'}</p>
              </div>
              <div className="rounded-xl border p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.isArray(selectedUser.skills) && selectedUser.skills.length > 0 ? selectedUser.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  )) : <p className="text-sm">No skills listed</p>}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
