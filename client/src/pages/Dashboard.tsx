import React, { useMemo, useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { jobs, savedJobs, pagination, fetchJobs, fetchSavedJobs, saveJob } = useJobStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, deleteNotification } = useNotificationStore();
  const [notificationLoading, setNotificationLoading] = useState(false);
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
          fetchJobs({ limit: 12 }),
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

  // Refresh notifications frequently while the dashboard is open.
  useEffect(() => {
  if (user?.role !== 'jobseeker') {
    return;
  }

  const fetchInitial = async () => {
    setNotificationLoading(true);
    await fetchNotifications(10, 1);
    setNotificationLoading(false);
  };

  fetchInitial();

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchNotifications(10, 1);
    }
  };

  // ✅ FIXED: loading handled during polling
  const pollInterval = setInterval(async () => {
    setNotificationLoading(true);
    await fetchNotifications(10, 1);
    setNotificationLoading(false);
  }, 3000);

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    clearInterval(pollInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [user?.role]); // ✅ removed fetchNotifications

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

  const recommendedJobs: RecommendedJob[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return jobs
      .filter((job) => job.isActive)
      .filter((job) => {
        if (!query) return true;
        return [job.title, job.company, job.location, ...(job.tags || [])]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      })
      .slice(0, 4)
      .map((job) => ({
        id: job._id,
        title: job.title,
        company: job.company || job.employerId?.company || 'Company',
        location: job.location || 'Location not specified',
        salary: job.salary || 'Salary not specified',
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

  const stats = [
    { label: 'Jobs Available', value: String(pagination.total || jobs.length), icon: Briefcase, color: 'from-blue-500 to-blue-600', change: `${recommendedJobs.length} shown now` },
    { label: 'Active Applications', value: String(activeApplications), icon: Users, color: 'from-green-500 to-green-600', change: `${applications.length} total submitted` },
    { label: 'Upcoming Interviews', value: String(upcomingInterviews.length), icon: Calendar, color: 'from-purple-500 to-purple-600', change: `${interviews.length} total interviews` },
    { label: 'Saved Jobs', value: String(savedJobs.length), icon: Star, color: 'from-orange-500 to-orange-600', change: 'Live from your account' },
  ];
  const [selectedJob, setSelectedJob] = useState<RecommendedJob | null>(null);

  const achievements = [
    { title: 'Profile Completeness', progress: profileCompletion, target: 100 },
    { title: 'Applications Submitted', progress: Math.min(applications.length, 10), target: 10 },
    { title: 'Interview Pipeline', progress: Math.min(upcomingInterviews.length + applications.filter((item) => item.status === 'Interview Scheduled').length, 5), target: 5 },
  ];

  const quickActions = [
    { 
      title: 'Update Resume', 
      desc: 'Keep your profile fresh and competitive', 
      action: 'Update Now',
      icon: FileText,
      path: '/resume',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Practice Interview', 
      desc: 'Prepare with AI mock interviews', 
      action: 'Start Practice',
      icon: MessageCircle,
      path: '/interview',
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Salary Insights', 
      desc: 'Check market rates for your skills', 
      action: 'View Insights',
      icon: TrendingUp,
      path: '/insights',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      title: 'Browse Jobs', 
      desc: 'Find new opportunities matching your profile', 
      action: 'Browse Now',
      icon: Briefcase,
      path: '/jobs',
      color: 'from-orange-500 to-orange-600'
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
    navigate(`/jobs`);
    toast({
      title: 'Continue from jobs',
      description: 'Open the Jobs page to complete the application with full details.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8" style={pageShellStyle}>
      {/* Welcome Message */}
      <AnimatedSection>
        <div className={heroCardClass}>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'} 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your job search today.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
          </p>
        </div>
      </AnimatedSection>

      {/* Hero Carousel Section */}
      <AnimatedSection>
        <CarouselSection />
      </AnimatedSection>

      {/* Search Section */}
      <AnimatedSection delay={0.2}>
        <Card className={cn(mainCardClass, darkTheme ? 'bg-gradient-to-r from-primary/10 to-accent/10' : 'bg-gradient-to-r from-primary/5 to-secondary/5')}>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/jobs')}>
                Search Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Stats Section */}
      <AnimatedSection delay={0.3}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className={cn('p-3 rounded-full', darkTheme ? 'bg-primary/18' : 'bg-primary/10')}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recommended Jobs Section */}
          <AnimatedSection delay={0.4}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Recommended for You</h2>
                <Button variant="outline" asChild>
                  <Link to="/jobs">View All</Link>
                </Button>
              </div>
              
              {recommendedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="font-medium">No matching jobs right now</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try a broader search or explore all openings on the Jobs page.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </AnimatedSection>

          {/* Quick Actions - Enhanced */}
          <AnimatedSection delay={0.6}>
            <Card className={cn(mainCardClass, darkTheme ? 'bg-gradient-to-br from-primary/10 to-accent/10' : 'bg-gradient-to-br from-accent/10 to-secondary/5')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Accelerate your job search with these tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={cn('p-4 rounded-lg border hover:shadow-md transition-all', darkTheme ? 'bg-background/50 border-border/70' : 'bg-background border-border')}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={cn('p-2 rounded-lg', darkTheme ? 'bg-primary/18' : 'bg-primary/10')}>
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <AnimatedSection delay={0.5}>
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </div>
                  {notifications.filter(n => n.jobId !== null && !n.read).length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notificationLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : notifications.length > 0 ? (
                  notifications
  .filter((notification) => notification.jobId !== null)
  .map((notification, index) => {
                    // Determine type icon and colors
                    const typeConfig = {
                      'job-match': { icon: Briefcase, bg: 'bg-blue-100', text: 'text-blue-600' },
                      'interview-scheduled': { icon: Calendar, bg: 'bg-green-100', text: 'text-green-600' },
                      'profile-viewed': { icon: Users, bg: 'bg-purple-100', text: 'text-purple-600' },
                      'application-update': { icon: FileText, bg: 'bg-yellow-100', text: 'text-yellow-600' },
                      'job-posted': { icon: Briefcase, bg: 'bg-indigo-100', text: 'text-indigo-600' },
                    };
                    
                    if (!typeConfig[notification.type]) {
  console.warn("Unknown notification type:", notification.type);
}

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
                        className={`p-3 rounded-lg border transition-all ${
                          !notification.read 
                            ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                            : darkTheme ? 'bg-background/45 hover:bg-background/60' : 'bg-accent/10 hover:bg-accent/20'
                        }`}
                      >
                        <div className="flex items-start space-x-3 group">
                          <div className={cn('p-2 rounded-full flex-shrink-0', darkTheme ? 'bg-primary/18 text-primary' : `${config.bg} ${config.text}`)}>
                            <config.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={handleMarkAsRead}>
                            <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{timeSince}</p>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={handleDelete}
                              title="Delete notification"
                            >
                              <span className="text-xs">✕</span>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll notify you when new job matches are found
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Upcoming Interviews */}
          <AnimatedSection delay={0.6}>
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Interviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingInterviews.length > 0 ? upcomingInterviews.slice(0, 3).map((interview, index) => (
                  <motion.div
                    key={interview._id || index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    className={cn('p-3 rounded-lg border hover:shadow-md transition-all', darkTheme ? 'bg-background/45 border-border/70' : 'bg-gradient-to-r from-accent/10 to-accent/5')}
                  >
                    <h4 className="font-semibold text-sm">{interview.jobId?.title || 'Interview'}</h4>
                    <p className="text-xs text-muted-foreground">{interview.jobId?.company || 'Company'}</p>
                    <div className="flex justify-between items-center mt-2 gap-2">
                      <span className="text-xs font-medium">
                        {new Date(interview.scheduledAt).toLocaleDateString()} at {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">{interview.type || 'Interview'}</Badge>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" variant="outline" className="text-xs h-6" asChild>
                        <Link to="/interviews">Manage</Link>
                      </Button>
                      <Button size="sm" className="text-xs h-6" asChild>
                        <Link to="/interview">Prepare</Link>
                      </Button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming interviews</p>
                    <p className="text-xs text-muted-foreground mt-1">Scheduled interviews will show up here automatically.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Progress Tracking */}
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
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{achievement.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                    <div className={cn('h-2 rounded-full overflow-hidden', darkTheme ? 'bg-background/60' : 'bg-secondary')}>
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        transition={{ delay: 0.5 + 0.2 * index, duration: 0.8 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {achievement.progress === achievement.target ? 
                        '✅ Completed!' : 
                        `${achievement.target - achievement.progress} more to go`
                      }
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
