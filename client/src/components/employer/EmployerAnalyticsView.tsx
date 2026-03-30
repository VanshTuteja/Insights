import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import { BarChart3, Briefcase, CalendarDays, Eye, TrendingUp, Users } from 'lucide-react';

interface EmployerAnalyticsViewProps {
  jobs: any[];
  applications: any[];
  interviews: any[];
  title?: string;
  description?: string;
}

const EmployerAnalyticsView: React.FC<EmployerAnalyticsViewProps> = ({
  jobs,
  applications,
  interviews,
  title = 'Hiring Analytics',
  description = 'Track performance across all job posts and drill into individual roles.',
}) => {
  const [selectedJobId, setSelectedJobId] = React.useState<string>('all');
  const theme = useThemeStore((state) => state.theme);
  const themePreview = React.useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);

  const jobsWithMetrics = React.useMemo(() => {
    return jobs.map((job) => {
      const jobId = String(job.id || job._id);
      const relatedApplications = applications.filter(
        (application) => String(application.jobId?._id || application.jobId || '') === jobId,
      );
      const relatedInterviews = interviews.filter(
        (interview) => String(interview.jobId?._id || interview.jobId || '') === jobId,
      );
      const views = Number(job.views || 0);
      const applicants = relatedApplications.length;
      const interviewsScheduled = relatedInterviews.length;
      const conversionRate = views > 0 ? Math.round((applicants / views) * 100) : 0;
      const interviewRate = applicants > 0 ? Math.round((interviewsScheduled / applicants) * 100) : 0;

      return {
        ...job,
        id: jobId,
        applicants,
        interviewsScheduled,
        conversionRate,
        interviewRate,
        latestApplicationAt: relatedApplications[0]?.appliedAt || null,
      };
    });
  }, [applications, interviews, jobs]);

  const filteredJobs =
    selectedJobId === 'all'
      ? jobsWithMetrics
      : jobsWithMetrics.filter((job) => job.id === selectedJobId);

  const totals = React.useMemo(() => {
    const totalViews = filteredJobs.reduce((sum, job) => sum + Number(job.views || 0), 0);
    const totalApplicants = filteredJobs.reduce((sum, job) => sum + job.applicants, 0);
    const totalInterviews = filteredJobs.reduce((sum, job) => sum + job.interviewsScheduled, 0);
    const totalJobs = filteredJobs.length;

    return {
      totalJobs,
      totalViews,
      totalApplicants,
      totalInterviews,
      avgApplicantsPerJob: totalJobs > 0 ? (totalApplicants / totalJobs).toFixed(1) : '0.0',
      applicantConversion: totalViews > 0 ? Math.round((totalApplicants / totalViews) * 100) : 0,
      interviewConversion: totalApplicants > 0 ? Math.round((totalInterviews / totalApplicants) * 100) : 0,
    };
  }, [filteredJobs]);

  const mainCardClass = cn(
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95',
  );
  const metricCardClass = cn(
    'rounded-2xl border p-4',
    darkTheme ? 'border-border/70 bg-background/55' : 'border-border bg-muted/55',
  );
  const itemCardClass = cn(
    'rounded-2xl border p-4',
    darkTheme ? 'border-border/70 bg-background/45' : 'border-border bg-background/80',
  );

  return (
    <div className="space-y-6">
      <Card className={mainCardClass}>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>
              {description} <span className="text-foreground/70">Theme: {themePreview.label}</span>
            </CardDescription>
          </div>
          <div className="w-full lg:w-72">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select job post" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All job posts</SelectItem>
                {jobsWithMetrics.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className={metricCardClass}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Active job posts</span>
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-semibold text-foreground">{totals.totalJobs}</p>
            <p className="mt-1 text-sm text-muted-foreground">Roles currently included in this view.</p>
          </div>
          <div className={metricCardClass}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Applicants</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-semibold text-foreground">{totals.totalApplicants}</p>
            <p className="mt-1 text-sm text-muted-foreground">{totals.avgApplicantsPerJob} applicants per job on average.</p>
          </div>
          <div className={metricCardClass}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Interview conversion</span>
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-semibold text-foreground">{totals.interviewConversion}%</p>
            <p className="mt-1 text-sm text-muted-foreground">{totals.totalInterviews} interviews scheduled.</p>
          </div>
          <div className={metricCardClass}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Applicant conversion</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-semibold text-foreground">{totals.applicantConversion}%</p>
            <p className="mt-1 text-sm text-muted-foreground">{totals.totalViews} tracked views across selected jobs.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card className={mainCardClass}>
          <CardHeader>
            <CardTitle>Job-by-job performance</CardTitle>
            <CardDescription>Live metrics for every role you have posted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs available for analytics yet.</p>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className={itemCardClass}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>{job.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{job.company} - {job.location}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Posted {job.posted || new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Views</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{job.views || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Applicants</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{job.applicants}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Interviews</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{job.interviewsScheduled}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Application rate</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{job.conversionRate}%</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">View to applicant conversion</span>
                        <span className="font-medium text-foreground">{job.conversionRate}%</span>
                      </div>
                      <Progress value={job.conversionRate} />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Applicant to interview conversion</span>
                        <span className="font-medium text-foreground">{job.interviewRate}%</span>
                      </div>
                      <Progress value={job.interviewRate} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className={mainCardClass}>
          <CardHeader>
            <CardTitle>Actionable insights</CardTitle>
            <CardDescription>What the numbers suggest you should do next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className={metricCardClass}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-foreground">Most viewed role</span>
                {/* <Eye className="h-4 w-4 text-primary" /> */}
              </div>
              <p className="text-foreground/80">
                {jobsWithMetrics.sort((a, b) => (b.views || 0) - (a.views || 0))[0]?.title || 'No jobs yet'}
              </p>
            </div>
            <div className={metricCardClass}>
              <p className="font-medium text-foreground">Fastest hiring funnel</p>
              <p className="mt-2 text-muted-foreground">
                {jobsWithMetrics.sort((a, b) => b.interviewRate - a.interviewRate)[0]?.title || 'No interview data yet'}
              </p>
            </div>
            <div className={metricCardClass}>
              <p className="font-medium text-foreground">Recommendation</p>
              <p className="mt-2 text-muted-foreground">
                {totals.applicantConversion < 10
                  ? 'Your posts are getting views but low applicant conversion. Tighten the role summary, salary clarity, and requirements.'
                  : totals.interviewConversion < 25
                    ? 'Applicants are coming in, but interviews are low. Shortlist faster and refine candidate screening criteria.'
                    : 'Your funnel is performing well. Focus on response speed and candidate communication to close strong hires.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerAnalyticsView;
