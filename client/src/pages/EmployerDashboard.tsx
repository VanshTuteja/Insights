import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Form imports reserved for future inline editing
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedSection from '@/components/AnimatedSection';
import CreateJobDialog from '@/components/CreateJobDialog';
import EditJobDialog from '@/components/EditJobDialog';
import CandidateDetailsDialog from '@/components/CandidateDetailsDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmployerAnalyticsView from '@/components/employer/EmployerAnalyticsView';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { cn, resolveAssetUrl } from '@/lib/utils';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Briefcase, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const EmployerDashboard: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const navigate = useNavigate();
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [editJobOpen, setEditJobOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [candidateDetailsOpen, setCandidateDetailsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [interviewsCount, setInterviewsCount] = useState(0);
  const [employerInterviews, setEmployerInterviews] = useState<any[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleCandidateId, setScheduleCandidateId] = useState<string | null>(null);
  const [scheduleJobId, setScheduleJobId] = useState<string | null>(null);
  const [scheduleApplicationId, setScheduleApplicationId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleType, setScheduleType] = useState<'video' | 'phone' | 'onsite'>('video');
  const [scheduleLink, setScheduleLink] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState('60');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [jobApplicantsOpen, setJobApplicantsOpen] = useState(false);
  const [jobApplicantsLoading, setJobApplicantsLoading] = useState(false);
  const [selectedApplicantsJob, setSelectedApplicantsJob] = useState<any>(null);
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const { user } = useAuthStore();
  const refreshPublicJobs = useJobStore((state) => state.fetchJobs);
  const scheduleDateInputRef = React.useRef<HTMLInputElement | null>(null);
  const scheduleTimeInputRef = React.useRef<HTMLInputElement | null>(null);
  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.22), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.16), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.94) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.12), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.18), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.72) 52%, hsl(var(--background)) 100%)',
  };
  const heroClass = cn(
    'rounded-3xl border px-6 py-8 shadow-premium-lg backdrop-blur-xl',
    darkTheme ? 'border-primary/20 bg-card/80 text-card-foreground' : 'border-primary/10 bg-card/90 text-card-foreground',
  );
  const cardClass = cn(
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95',
  );

  const loadData = useCallback(async () => {
    try {
      const [jobsRes, appsRes, interviewsRes] = await Promise.allSettled([
        axios.get('/jobs/employer'),
        axios.get('/applications/employer'),
        axios.get('/interviews/employer'),
      ]);

      if (jobsRes.status === 'fulfilled') {
        const jobs = jobsRes.value.data?.data || [];
        setActiveJobs(jobs.map((job: any) => ({
          ...job,
          id: job._id,
          applications: 0,
          views: job.views || 0,
          posted: new Date(job.createdAt).toLocaleDateString(),
          status: job.isActive ? 'Active' : 'Paused',
        })));
      }

      if (appsRes.status === 'fulfilled') {
        const items = appsRes.value.data?.data || [];
          const mapped = items.map((item: any) => {
            const candidate = item.candidate;
            const cId = candidate?._id ?? candidate?.id;
            const jId = item.jobId?._id ?? item.jobId;
            const appliedAt = item.appliedAt
              ? new Date(item.appliedAt).toLocaleString()
              : new Date().toLocaleString();
            const skills: string[] = Array.isArray(candidate?.skills) ? candidate.skills : [];
            const resumePath: string | undefined =
              candidate?.resumeUrl || item.resume || undefined;
            const resumeUrl = resolveAssetUrl(resumePath);

            const match = Math.min(100, 60 + skills.length * 5);

            return {
              id: item._id,
              applicationId: item._id,
              candidateId: cId,
              candidateName: candidate?.name || 'Candidate',
              position: item.jobTitle || (item.jobId as any)?.title,
              applied: appliedAt,
              match,
              email: candidate?.email,
              location: candidate?.location,
              experience: candidate?.experience,
              education: candidate?.education,
              phone: candidate?.phone,
              bio: candidate?.bio,
              skills,
              avatar: candidate?.avatar,
              jobId: jId,
              status: item.status,
              resume: item.resume,
              resumeUrl,
            };
          });

          mapped.sort(
            (a: any, b: any) => new Date(b.applied).getTime() - new Date(a.applied).getTime(),
          );
          setRecentApplications(mapped);
          const appCountByJob = mapped.reduce((acc: Record<string, number>, app: any) => {
            const id = (app.jobId?._id ?? app.jobId)?.toString();
            if (id) acc[id] = (acc[id] || 0) + 1;
            return acc;
          }, {});
          setActiveJobs((prev: any[]) =>
            prev.map((job: any) => ({
              ...job,
              applications: appCountByJob[(job._id || job.id)?.toString()] ?? 0,
            })),
          );
        }

      if (interviewsRes.status === 'fulfilled') {
        const interviews = interviewsRes.value.data?.data || [];
        setEmployerInterviews(interviews);
        setInterviewsCount(interviews.length);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load employer data',
        description: error.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'employer') {
      void loadData();
    }
  }, [loadData, user]);

  const totalApplications = recentApplications.length;

  const activeJobCount = activeJobs.filter((job) => job.status === 'Active').length;
  const averageApplicantsPerJob = activeJobs.length > 0 ? (totalApplications / activeJobs.length).toFixed(1) : '0.0';
  const employerStats = useMemo(() => [
    { label: 'Active Jobs', value: String(activeJobCount), icon: Briefcase, color: 'from-slate-900 to-slate-700', detail: 'Roles currently live' },
    { label: 'Applicants', value: String(totalApplications), icon: Users, color: 'from-emerald-600 to-emerald-500', detail: `${averageApplicantsPerJob} per job` },
    { label: 'Profile Views', value: '—', icon: Eye, color: 'from-purple-500 to-purple-600' },
    { label: 'Interviews', value: String(interviewsCount), icon: Calendar, color: 'from-blue-600 to-cyan-500', detail: 'Scheduled candidate calls' },
    { label: 'Role Visibility', value: String(activeJobs.reduce((sum, job) => sum + Number(job.views || 0), 0)), icon: TrendingUp, color: 'from-amber-500 to-orange-500', detail: 'Tracked job post views' },
  ], [activeJobCount, activeJobs, averageApplicantsPerJob, interviewsCount, totalApplications]);

  const handleJobCreated = (newJob: any) => {
    const jobWithDerived = {
      ...newJob,
      id: newJob._id || newJob.id,
      applications: newJob.applications?.length || 0,
      views: newJob.views || 0,
      posted: new Date(newJob.createdAt || Date.now()).toLocaleDateString(),
      status: newJob.isActive ? 'Active' : 'Active',
    };
    setActiveJobs([jobWithDerived, ...activeJobs]);
    toast({
      title: 'Job posted successfully',
      description: 'Your job posting is now live and visible to candidates.',
    });
    void refreshPublicJobs({ limit: 12 });
  };

  const handleJobUpdated = (updatedJob: any) => {
    setActiveJobs(activeJobs.map(job => 
      (job.id === updatedJob.id || job.id === updatedJob._id) ? {
        ...job,
        ...updatedJob,
      } : job
    ));
    toast({
      title: 'Job updated successfully',
      description: 'Your job posting has been updated.',
    });
    void loadData();
    void refreshPublicJobs({ limit: 12 });
  };

  const handleEditJob = (job: any) => {
    setSelectedJob(job);
    setEditJobOpen(true);
  };

  const handleDeleteJob = (job: any) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteJob = async () => {
    if (selectedJob) {
      try {
        await axios.delete(`/jobs/delete/${selectedJob.id || selectedJob._id}`);
        if ((selectedApplicantsJob?.id || selectedApplicantsJob?._id) === (selectedJob.id || selectedJob._id)) {
          setJobApplicantsOpen(false);
          setSelectedApplicantsJob(null);
          setJobApplicants([]);
        }
        toast({
          title: 'Job deleted',
          description: 'The job posting has been removed.',
        });
        await loadData();
        void refreshPublicJobs({ limit: 12 });
      } catch (error: any) {
        toast({
          title: 'Failed to delete job',
          description: error.response?.data?.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    }
    setDeleteDialogOpen(false);
    setSelectedJob(null);
  };

  const handleViewCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setScheduleCandidateId(candidate.candidateId || null);
    setScheduleJobId(candidate.jobId || null);
    setScheduleApplicationId(candidate.applicationId || null);
    setCandidateDetailsOpen(true);
  };

  const handleViewApplicants = async (job: any) => {
    setSelectedApplicantsJob(job);
    setJobApplicantsOpen(true);
    setJobApplicantsLoading(true);

    try {
      const response = await axios.get(`/applications/job/${job.id || job._id}`);
      const items = response.data?.data || [];
      const mapped = items.map((item: any) => {
        const candidate = item.candidate || {};
        const resumePath = candidate.resumeUrl || item.resume || '';
        return {
          id: item._id,
          applicationId: item._id,
          candidateId: candidate._id,
          candidateName: candidate.name || 'Candidate',
          position: job.title,
          applied: item.appliedAt ? new Date(item.appliedAt).toLocaleString() : 'Recently',
          match: Math.min(100, 60 + ((candidate.skills || []).length * 5)),
          email: candidate.email,
          location: candidate.location,
          experience: candidate.experience,
          education: candidate.education,
          phone: candidate.phone,
          bio: candidate.bio,
          skills: candidate.skills || [],
          avatar: candidate.avatar,
          jobId: job.id || job._id,
          status: item.status,
          resumeUrl: resolveAssetUrl(resumePath),
        };
      });

      setJobApplicants(mapped);
    } catch (error: any) {
      toast({
        title: 'Failed to load applicants',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
      setJobApplicantsOpen(false);
    } finally {
      setJobApplicantsLoading(false);
    }
  };

  const handleContactCandidate = () => {
    toast({
      title: 'Message sent',
      description: 'Your message has been sent to the candidate.',
    });
    setCandidateDetailsOpen(false);
  };

  const handleOpenSchedule = (candidateId: string, jobId?: string, applicationId?: string) => {
    setScheduleCandidateId(candidateId || selectedCandidate?.candidateId || null);
    setScheduleJobId(jobId || selectedCandidate?.jobId || selectedApplicantsJob?.id || selectedApplicantsJob?._id || null);
    setScheduleApplicationId(applicationId || selectedCandidate?.applicationId || null);
    setScheduleDate('');
    setScheduleTime('');
    setScheduleType('video');
    setScheduleLink('');
    setScheduleNotes('');
    setScheduleDuration('60');
    setScheduleOpen(true);
  };

  const handleScheduleInterview = async () => {
    if ((!scheduleCandidateId && !scheduleApplicationId) || !scheduleJobId || !scheduleDate || !scheduleTime) {
      toast({
        title: 'Missing details',
        description: 'Please choose an applicant, job, date, time, and interview type.',
        variant: 'destructive',
      });
      return;
    }

    if ((scheduleType === 'video' || scheduleType === 'phone') && !scheduleLink.trim()) {
      toast({
        title: 'Missing meeting details',
        description: scheduleType === 'video'
          ? 'Please add a meeting link for the video interview.'
          : 'Please add phone or meeting details for the phone interview.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setScheduleLoading(true);
      await axios.post('/interviews/schedule', {
        jobId: scheduleJobId,
        candidateId: scheduleCandidateId,
        applicationId: scheduleApplicationId,
        date: scheduleDate,
        time: scheduleTime,
        type: scheduleType,
        meetingLink: scheduleLink,
        notes: scheduleNotes,
        duration: Number(scheduleDuration) || 60,
      });

      toast({
        title: 'Interview scheduled',
        description: 'The candidate has been invited.',
      });
      await loadData();
      if (selectedApplicantsJob) {
        await handleViewApplicants(selectedApplicantsJob);
      }
      setScheduleOpen(false);
      setCandidateDetailsOpen(false);
    } catch (error: any) {
      toast({
        title: 'Failed to schedule interview',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setScheduleLoading(false);
    }
  };

  return (
    <div className="space-y-6" style={pageShellStyle}>
      <AnimatedSection>
        <div className={heroClass}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Hiring Command Center</p>
              <h1 className="text-3xl font-semibold">Dashboard</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Manage job posts, review applicants, schedule interviews, and monitor hiring performance from one place.
              </p>
              <p className="text-xs text-muted-foreground">
                Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className={cn(darkTheme ? 'border-primary/20 bg-background/40' : 'border-border bg-background/80')} onClick={() => navigate('/employer/interviews')}>
                <Calendar className="mr-2 h-4 w-4" />
                Track Interviews
              </Button>
              <Button variant="outline" className={cn(darkTheme ? 'border-primary/20 bg-background/40' : 'border-border bg-background/80')} onClick={() => navigate('/insights')}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Open Career Insights
              </Button>
              <Button 
                onClick={() => setCreateJobOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={0.2}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {employerStats.filter((stat) => stat.label !== 'Profile Views').map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className={cardClass}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={cn('p-3 rounded-full', darkTheme ? 'bg-primary/18' : 'bg-primary/10')}>
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      {'detail' in stat ? <p className="text-xs text-muted-foreground/80">{stat.detail}</p> : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Job Management */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatedSection delay={0.3}>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-1 gap-2 sm:grid-cols-3">
                <TabsTrigger value="active">Job Posts</TabsTrigger>
                <TabsTrigger value="create">New Post</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                <Card className={cardClass}>
                  <CardHeader>
                    <CardTitle>Your Job Postings</CardTitle>
                    <CardDescription>Manage your active job listings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeJobs.map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={cn('p-4 border rounded-lg hover:shadow-md transition-shadow', darkTheme ? 'border-border/70 bg-background/45' : 'border-border bg-background')}
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0 space-y-2">
                              <h3 className="font-semibold">{job.title}</h3>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>{job.applications} applications</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{job.views} views</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{job.posted}</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                              <Badge variant={job.status === 'Active' ? 'default' : 'secondary'} className="w-fit">
                                {job.status}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewApplicants(job)}
                              >
                                Applicants
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditJob(job)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteJob(job)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="create" className="space-y-4">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Create a New Job Posting</h3>
                  <p className="text-muted-foreground mb-6">
                    Click the "Post New Job" button above to get started
                  </p>
                  <Button 
                    onClick={() => setCreateJobOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job Posting
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <EmployerAnalyticsView
                  jobs={activeJobs}
                  applications={recentApplications}
                  interviews={employerInterviews}
                  title="Dashboard Analytics"
                  description="Review all job posts together or switch to a single role for focused performance data."
                />
              </TabsContent>
            </Tabs>
          </AnimatedSection>
        </div>

        {/* Recent Applications */}
        <AnimatedSection delay={0.4}>
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest candidates who applied</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.slice(0, 10).map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    className={cn('p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow', darkTheme ? 'border-border/70 bg-background/45' : 'border-border bg-background')}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold">{application.candidateName}</h4>
                        {/* <Badge variant="outline" className="text-green-600 border-green-600">
                          {application.match}% match
                        </Badge> */}
                      </div>
                      <p className="text-sm text-muted-foreground">{application.position}</p>
                      <p className="text-xs text-muted-foreground">Applied {application.applied}</p>
                      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewCandidate(application)}
                        >
                          View
                        </Button>
                        {/* <Button 
                          size="sm"
                          onClick={() => handleContactCandidate()}
                        >
                          Contact
                        </Button> */}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      <CreateJobDialog
        open={createJobOpen}
        onOpenChange={setCreateJobOpen}
        onJobCreated={handleJobCreated}
      />

      <EditJobDialog
        job={selectedJob}
        open={editJobOpen}
        onOpenChange={setEditJobOpen}
        onJobUpdated={handleJobUpdated}
      />

      <CandidateDetailsDialog
        candidate={selectedCandidate}
        open={candidateDetailsOpen}
        onOpenChange={setCandidateDetailsOpen}
        onContact={handleContactCandidate}
        onScheduleInterview={handleOpenSchedule}
      />

      <Dialog open={jobApplicantsOpen} onOpenChange={setJobApplicantsOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicants for {selectedApplicantsJob?.title}</DialogTitle>
            <DialogDescription>
              Review everyone who applied to this job post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {jobApplicantsLoading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner />
              </div>
            ) : jobApplicants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applicants yet for this job.</p>
            ) : (
              jobApplicants.map((application) => (
                <div key={application.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">{application.candidateName}</h4>
                      <p className="text-sm text-muted-foreground">{application.email || 'No email available'}</p>
                      <p className="text-xs text-muted-foreground">Applied {application.applied}</p>
                    </div>
                    <Badge variant="outline">{application.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(application.skills || []).slice(0, 6).map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button size="sm" variant="outline" onClick={() => handleViewCandidate(application)}>
                      View Details
                    </Button>
                    <Button size="sm" onClick={() => handleOpenSchedule(application.candidateId, application.jobId, application.applicationId || application.id)}>
                      Schedule Interview
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={(open) => {
        if (!scheduleLoading) {
          setScheduleOpen(open);
        }
      }}>
        <DialogContent className="max-w-xl" showCloseButton={!scheduleLoading}>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Choose date, time and interview type for this candidate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <Input
                  ref={scheduleDateInputRef}
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  disabled={scheduleLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    const input = scheduleDateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                    input?.showPicker?.();
                    input?.focus();
                  }}
                  disabled={scheduleLoading}
                  aria-label="Open calendar"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <Input
                  ref={scheduleTimeInputRef}
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  disabled={scheduleLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    const input = scheduleTimeInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                    input?.showPicker?.();
                    input?.focus();
                  }}
                  disabled={scheduleLoading}
                  aria-label="Open time picker"
                >
                  <Clock className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
              value={scheduleType}
              onValueChange={(value) => setScheduleType(value as 'video' | 'phone' | 'onsite')}
              disabled={scheduleLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="15"
                max="480"
                step="15"
                value={scheduleDuration}
                onChange={(e) => setScheduleDuration(e.target.value)}
                disabled={scheduleLoading}
                placeholder="Duration in minutes"
              />
            </div>
            <Input
              type="text"
              placeholder={scheduleType === 'onsite' ? 'Office address or meeting location' : scheduleType === 'phone' ? 'Phone number or call details' : 'Meeting link'}
              value={scheduleLink}
              onChange={(e) => setScheduleLink(e.target.value)}
              disabled={scheduleLoading}
            />
            <Textarea
              placeholder="Notes for the candidate (optional)"
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              disabled={scheduleLoading}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setScheduleOpen(false)} disabled={scheduleLoading}>
              Cancel
            </Button>
            <Button onClick={handleScheduleInterview} disabled={scheduleLoading}>
              {scheduleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteJob} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployerDashboard;
