import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { useNotificationStore } from '@/stores/notificationStore';
import { toast } from '@/hooks/use-toast';
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, deleteNotification } = useNotificationStore();
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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

  const stats = [
    { label: 'Jobs Available', value: '2,847', icon: Briefcase, color: 'from-blue-500 to-blue-600', change: '+12%' },
    { label: 'Active Applications', value: '23', icon: Users, color: 'from-green-500 to-green-600', change: '+5' },
    { label: 'Profile Views', value: '156', icon: TrendingUp, color: 'from-purple-500 to-purple-600', change: '+18%' },
    { label: 'Saved Jobs', value: savedJobs.length.toString(), icon: Star, color: 'from-orange-500 to-orange-600', change: '+3' },
  ];

  const recommendedJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      type: 'Full-time',
      tags: ['React', 'TypeScript', 'Next.js'],
      description: 'Looking for an experienced frontend developer to join our growing team...',
      postedTime: '2 hours ago',
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'Startup Labs',
      location: 'Remote',
      salary: '$100k - $140k',
      type: 'Full-time',
      tags: ['Node.js', 'React', 'PostgreSQL'],
      description: 'Join our innovative team working on cutting-edge solutions...',
      postedTime: '1 day ago',
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      company: 'Design Studio',
      location: 'New York, NY',
      salary: '$90k - $120k',
      type: 'Full-time',
      tags: ['Figma', 'Adobe XD', 'Prototyping'],
      description: 'Create beautiful and intuitive user experiences...',
      postedTime: '3 days ago',
    },
  ];

  type RecommendedJob = (typeof recommendedJobs)[number];
  const [selectedJob, setSelectedJob] = useState<RecommendedJob | null>(null);

  const upcomingInterviews = [
    {
      company: 'TechCorp Inc.',
      position: 'Senior Frontend Developer',
      date: 'Tomorrow',
      time: '2:00 PM',
      type: 'Technical Interview',
    },
    {
      company: 'Startup Labs',
      position: 'Full Stack Engineer',
      date: 'Friday',
      time: '10:00 AM',
      type: 'Final Interview',
    },
  ];

  const achievements = [
    { title: 'Profile Completeness', progress: 85, target: 100 },
    { title: 'Skill Assessments', progress: 3, target: 5 },
    { title: 'Interview Practice', progress: 7, target: 10 },
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

  const handleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      toast({
        title: 'Job removed from saved',
        description: 'The job has been removed from your saved list.',
      });
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast({
        title: 'Job saved successfully',
        description: 'The job has been added to your saved list.',
      });
    }
  };

  const handleApplyJob = () => {
    toast({
      title: 'Application submitted',
      description: 'Your application has been sent to the employer.',
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
    <div className="space-y-8">
      {/* Welcome Message */}
      <AnimatedSection>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'} 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your job search today.</p>
      </AnimatedSection>

      {/* Hero Carousel Section */}
      <AnimatedSection>
        <CarouselSection />
      </AnimatedSection>

      {/* Search Section */}
      <AnimatedSection delay={0.2}>
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
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
              <Button className="bg-gradient-to-r from-primary to-secondary">
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
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xs text-green-600 font-medium">{stat.change} this week</p>
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
                <Button variant="outline">View All</Button>
              </div>
              
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
                      isSaved={savedJobs.includes(job.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Quick Actions - Enhanced */}
          <AnimatedSection delay={0.6}>
            <Card className="bg-gradient-to-br from-accent/10 to-secondary/5 border-0 shadow-lg">
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
                      className="p-4 bg-background rounded-lg border hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 bg-gradient-to-br ${item.color} rounded-lg`}>
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                      <Button size="sm" variant="outline" className="w-full">
                        {item.action}
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
            <Card>
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
                            : 'bg-accent/10 hover:bg-accent/20'
                        }`}
                      >
                        <div className="flex items-start space-x-3 group">
                          <div className={`p-2 rounded-full ${config.bg} ${config.text} flex-shrink-0`}>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Interviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingInterviews.map((interview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border cursor-pointer hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold text-sm">{interview.position}</h4>
                    <p className="text-xs text-muted-foreground">{interview.company}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-medium">{interview.date} at {interview.time}</span>
                      <Badge variant="outline" className="text-xs">{interview.type}</Badge>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" variant="outline" className="text-xs h-6">
                        Reschedule
                      </Button>
                      <Button size="sm" className="text-xs h-6">
                        Prepare
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Progress Tracking */}
          <AnimatedSection delay={0.7}>
            <Card>
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
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
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