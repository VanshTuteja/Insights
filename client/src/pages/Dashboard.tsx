import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AnimatedSection from '@/components/AnimatedSection';
import CarouselSection from '@/components/CarouselSection';
import JobCard from '@/components/JobCard';
import JobDetailsDialog from '@/components/JobDetailsDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { toast } from '@/hooks/use-toast';
import { getMissingProfileFields } from '@/lib/profileCompletion';
import { formatSalaryDisplay } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import {
  Search,
  Briefcase,
  Users,
  TrendingUp,
  Star,
  Calendar,
  Target,
  MessageCircle,
  Bell,
  FileText,
  Zap,
  CheckCheck,
  X,
} from 'lucide-react';

type RecommendedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  description: string;
  postedTime: string;
  raw?: {
    requirements?: string;
    benefits?: string;
  };
};

const Dashboard: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<RecommendedJob | null>(null);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showAllInterviews, setShowAllInterviews] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { jobs, savedJobs, pagination, fetchJobs, fetchSavedJobs, saveJob } = useJobStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore();

  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.22), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.16), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.94) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.12), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.18), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.72) 52%, hsl(var(--background)) 100%)',
  };
  const mainCardClass = cn(
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95',
  );
  const heroCardClass = cn(
    'rounded-3xl border px-6 py-6 shadow-premium-lg backdrop-blur-xl',
    darkTheme ? 'border-primary/20 bg-card/80' : 'border-primary/10 bg-card/90',
  );

  useEffect(() => {
    if (user?.role !== 'jobseeker') {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchJobs({ limit: 24 }),
          fetchSavedJobs(),
          axios.get('/applications/candidate').then((res) => setApplications(res.data?.data || [])),
          axios.get('/interviews/candidate').then((res) => setInterviews(res.data?.data || [])),
        ]);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Dashboard data unavailable',
          description: 'Some live dashboard data could not be loaded.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, [user?.role, fetchJobs, fetchSavedJobs]);

  useEffect(() => {
    if (user?.role !== 'jobseeker') {
      return;
    }

    const runFetch = async () => {
      setNotificationLoading(true);
      try {
        await fetchNotifications(showAllNotifications ? 10 : 3, 1);
      } finally {
        setNotificationLoading(false);
      }
    };

    void runFetch();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void runFetch();
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void runFetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.role, fetchNotifications, showAllNotifications]);

  const profileMissingFields = useMemo(() => getMissingProfileFields(user), [user]);
  const profileCompletion = useMemo(() => {
    const totalFields = user?.role === 'jobseeker' ? 8 : 3;
    return Math.max(0, Math.round(((totalFields - profileMissingFields.length) / totalFields) * 100));
  }, [profileMissingFields.length, user?.role]);

  const activeApplications = useMemo(
    () => applications.filter((item) => !['Rejected', 'Hired'].includes(item.status)).length,
    [applications],
  );

  const upcomingInterviews = useMemo(
    () =>
      interviews
        .filter((item) => item.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [interviews],
  );

  const formatPostedTime = (value?: string) => {
    if (!value) return 'Recently posted';
    const diff = Date.now() - new Date(value).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(value).toLocaleDateString();
  };

  const recommendedJobs: RecommendedJob[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filteredJobs = jobs
      .filter((job) => job.isActive)
      .filter((job) => {
        if (!query) return true;
        return [job.title, job.company, job.location, ...(job.tags || [])]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      });

    const strongMatches = filteredJobs
      .filter((job) => (job.matchScore ?? 0) >= 80)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    const fallbackJobs = [...filteredJobs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 18)
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    return (strongMatches.length > 0 ? strongMatches : fallbackJobs).map((job) => ({
        id: job._id,
        title: job.title,
        company: job.company || job.employerId?.company || 'Company',
        location: job.location || 'Location not specified',
        salary: formatSalaryDisplay(job.salary),
        type: job.type,
        tags: job.tags || [],
        description: job.description,
        postedTime: formatPostedTime(job.createdAt),
        raw: {
          requirements: job.requirements,
          benefits: job.benefits,
        },
      }));
  }, [jobs, searchQuery]);

  const savedJobIds = useMemo(() => savedJobs.map((job) => job._id), [savedJobs]);
  const visibleNotifications = useMemo(
    () => (showAllNotifications ? notifications : notifications.slice(0, 3)),
    [notifications, showAllNotifications],
  );
  const visibleInterviews = useMemo(
    () => (showAllInterviews ? upcomingInterviews : upcomingInterviews.slice(0, 2)),
    [showAllInterviews, upcomingInterviews],
  );

  const stats = [
    {
      label: 'Jobs Available',
      value: String(pagination.total || jobs.length),
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      change: `${recommendedJobs.length} shown now`,
    },
    {
      label: 'Active Applications',
      value: String(activeApplications),
      icon: Users,
      color: 'from-green-500 to-green-600',
      change: `${applications.length} total submitted`,
    },
    {
      label: 'Upcoming Interviews',
      value: String(upcomingInterviews.length),
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      change: `${interviews.length} total interviews`,
    },
    {
      label: 'Saved Jobs',
      value: String(savedJobs.length),
      icon: Star,
      color: 'from-orange-500 to-orange-600',
      change: 'Live from your account',
    },
  ];

  const achievements = [
    { title: 'Profile Completeness', progress: profileCompletion, target: 100 },
    { title: 'Applications Submitted', progress: Math.min(applications.length, 10), target: 10 },
    {
      title: 'Interview Pipeline',
      progress: Math.min(
        upcomingInterviews.length + applications.filter((item) => item.status === 'Interview Scheduled').length,
        5,
      ),
      target: 5,
    },
  ];

  const quickActions = [
    {
      title: 'Update Resume',
      desc: 'Keep your profile fresh and competitive',
      action: 'Update Now',
      icon: FileText,
      path: '/resume',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Practice Interview',
      desc: 'Prepare with AI mock interviews',
      action: 'Start Practice',
      icon: MessageCircle,
      path: '/interview',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Salary Insights',
      desc: 'Check market rates for your skills',
      action: 'View Insights',
      icon: TrendingUp,
      path: '/insights',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Browse Jobs',
      desc: 'Find new opportunities matching your profile',
      action: 'Browse Now',
      icon: Briefcase,
      path: '/jobs',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const handleViewDetails = (job: RecommendedJob) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      await saveJob(jobId);
      await fetchSavedJobs();
      toast({
        title: savedJobIds.includes(jobId) ? 'Saved jobs refreshed' : 'Job saved successfully',
        description: savedJobIds.includes(jobId)
          ? 'Your saved jobs list has been refreshed.'
          : 'The job has been added to your saved list.',
      });
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message || 'Could not save this job right now.',
        variant: 'destructive',
      });
    }
  };

  const handleApplyJob = (_jobId: string) => {
    navigate('/jobs');
    toast({
      title: 'Continue from jobs',
      description: 'Open the Jobs page to complete the application with full details.',
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8" style={pageShellStyle}>
      <AnimatedSection>
        <div className={heroCardClass}>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your job search today.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <CarouselSection />
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <Card
          className={cn(
            mainCardClass,
            darkTheme ? 'bg-gradient-to-r from-primary/10 to-accent/10' : 'bg-gradient-to-r from-primary/5 to-secondary/5',
          )}
        >
          <CardContent className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto" onClick={() => navigate('/jobs')}>
                Search Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.3}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className={cn('overflow-hidden', mainCardClass)}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={cn('rounded-full p-3', darkTheme ? 'bg-primary/18' : 'bg-primary/10')}>
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xs font-medium text-primary">{stat.change}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <AnimatedSection delay={0.4}>
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">Recommended for You</h2>
                <Button variant="outline" asChild className="shrink-0">
                  <Link to="/jobs">View All</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {jobs.some((job) => (job.matchScore ?? 0) >= 80)
                  ? 'Newest top 6 jobs with at least an 80% match against your profile and preference settings.'
                  : 'No 80%+ matches yet, so we are showing newly posted jobs for you.'}
              </p>

              {recommendedJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {recommendedJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                    >
                      <JobCard
                        job={job}
                        onSave={handleSaveJob}
                        onApply={handleApplyJob}
                        onViewDetails={handleViewDetails}
                        isSaved={savedJobIds.includes(job.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className={mainCardClass}>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="font-medium">No jobs available right now</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try a broader search or explore all openings on the Jobs page.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.6}>
            <Card
              className={cn(
                mainCardClass,
                darkTheme ? 'bg-gradient-to-br from-primary/10 to-accent/10' : 'bg-gradient-to-br from-accent/10 to-secondary/5',
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Accelerate your job search with these tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {quickActions.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={cn(
                        'rounded-lg border p-4 transition-all hover:shadow-md',
                        darkTheme ? 'border-border/70 bg-background/50' : 'border-border bg-background',
                      )}
                    >
                      <div className="mb-3 flex items-center space-x-3">
                        <div className={cn('rounded-lg p-2', darkTheme ? 'bg-primary/18' : 'bg-primary/10')}>
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">{item.desc}</p>
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link to={item.path}>{item.action}</Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        <div className="space-y-6">
          <AnimatedSection delay={0.5}>
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                {notifications.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      onClick={async () => {
                        try {
                          await markAllAsRead();
                          toast({
                            title: 'Notifications updated',
                            description: 'All notifications have been marked as read.',
                          });
                        } catch {
                          toast({
                            title: 'Update failed',
                            description: 'Could not mark all notifications as read.',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <CheckCheck className="mr-1 h-3.5 w-3.5" />
                      Mark all as read
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {notificationLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : visibleNotifications.length > 0 ? (
                  visibleNotifications.map((notification, index) => {
                    const typeConfig = {
                      'job-match': {
                        icon: Briefcase,
                        bg: darkTheme ? 'bg-primary/18' : 'bg-blue-100',
                        text: darkTheme ? 'text-primary' : 'text-blue-600',
                      },
                      'interview-scheduled': {
                        icon: Calendar,
                        bg: darkTheme ? 'bg-primary/18' : 'bg-green-100',
                        text: darkTheme ? 'text-primary' : 'text-green-600',
                      },
                      'profile-viewed': {
                        icon: Users,
                        bg: darkTheme ? 'bg-primary/18' : 'bg-purple-100',
                        text: darkTheme ? 'text-primary' : 'text-purple-600',
                      },
                      'application-update': {
                        icon: FileText,
                        bg: darkTheme ? 'bg-primary/18' : 'bg-yellow-100',
                        text: darkTheme ? 'text-primary' : 'text-yellow-600',
                      },
                      'job-posted': {
                        icon: Briefcase,
                        bg: darkTheme ? 'bg-primary/18' : 'bg-indigo-100',
                        text: darkTheme ? 'text-primary' : 'text-indigo-600',
                      },
                    };

                    const config = typeConfig[notification.type] || typeConfig['job-match'];
                    const timeSince = new Date(notification.createdAt).toLocaleString();

                    const handleMarkAsRead = async (e: React.MouseEvent) => {
                      e.stopPropagation();
                      try {
                        await markAsRead(notification._id);
                        toast({
                          title: 'Success',
                          description: 'Notification marked as read',
                        });
                      } catch {
                        toast({
                          title: 'Error',
                          description: 'Failed to mark notification as read',
                          variant: 'destructive',
                        });
                      }
                    };

                    const handleDelete = async (e: React.MouseEvent) => {
                      e.stopPropagation();
                      try {
                        await deleteNotification(notification._id);
                        toast({
                          title: 'Success',
                          description: 'Notification deleted',
                        });
                      } catch {
                        toast({
                          title: 'Error',
                          description: 'Failed to delete notification',
                          variant: 'destructive',
                        });
                      }
                    };

                    return (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={cn(
                          'rounded-lg border p-3 transition-all',
                          !notification.read
                            ? 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                            : darkTheme
                              ? 'bg-background/45 hover:bg-background/60'
                              : 'bg-accent/10 hover:bg-accent/20',
                        )}
                      >
                        <div className="group flex items-start space-x-3">
                          <div className={cn('flex-shrink-0 rounded-full p-2', config.bg, config.text)}>
                            <config.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1 cursor-pointer" onClick={handleMarkAsRead}>
                            <p className="line-clamp-1 text-sm font-medium">{notification.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notification.description}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{timeSince}</p>
                          </div>
                          <div className="flex flex-shrink-0 items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={handleDelete}
                              title="Delete notification"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <Bell className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      We&apos;ll notify you about job matches, applications, and interviews here.
                    </p>
                  </div>
                )}
                {notifications.length > 3 ? (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-muted-foreground">
                      Showing {visibleNotifications.length} of {notifications.length} notifications
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setShowAllNotifications((current) => !current)}
                    >
                      {showAllNotifications ? 'Show less' : 'More'}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.6}>
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Interviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visibleInterviews.length > 0 ? (
                  visibleInterviews.map((interview, index) => (
                    <motion.div
                      key={interview._id || index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        'rounded-lg border p-3 transition-all hover:shadow-md',
                        darkTheme ? 'border-border/70 bg-background/45' : 'bg-gradient-to-r from-accent/10 to-accent/5',
                      )}
                    >
                      <h4 className="text-sm font-semibold">{interview.jobId?.title || 'Interview'}</h4>
                      <p className="text-xs text-muted-foreground">{interview.jobId?.company || 'Company'}</p>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-medium">
                          {new Date(interview.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(interview.scheduledAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <Badge variant="outline" className="w-fit text-xs capitalize">
                          {interview.type || 'Interview'}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs sm:h-6" asChild>
                          <Link to="/interviews">Manage</Link>
                        </Button>
                        <Button size="sm" className="h-8 text-xs sm:h-6" asChild>
                          <Link to="/interview">Prepare</Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No upcoming interviews</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Scheduled interviews will show up here automatically.
                    </p>
                  </div>
                )}
                {upcomingInterviews.length > 2 ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setShowAllInterviews((current) => !current)}
                    >
                      {showAllInterviews ? 'Show less' : 'More'}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.7}>
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Your Progress</span>
                </CardTitle>
                <CardDescription>Complete your profile to get better matches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{achievement.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                    <div className={cn('h-2 overflow-hidden rounded-full', darkTheme ? 'bg-background/60' : 'bg-secondary')}>
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        transition={{ delay: 0.5 + 0.2 * index, duration: 0.8 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {achievement.progress === achievement.target
                        ? 'Completed!'
                        : `${achievement.target - achievement.progress} more to go`}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>

      <JobDetailsDialog
        job={selectedJob}
        open={jobDetailsOpen}
        onOpenChange={setJobDetailsOpen}
        onApply={handleApplyJob}
        onSave={handleSaveJob}
      />
    </div>
  );
};

export default Dashboard;
