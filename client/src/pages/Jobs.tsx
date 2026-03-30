import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AnimatedSection from '@/components/AnimatedSection';
import JobCard from '@/components/JobCard';
import JobDetailsDialog from '@/components/JobDetailsDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Search, MapPin, Briefcase } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getMissingProfileFields } from '@/lib/profileCompletion';
import { useJobStore } from '@/stores/jobStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatSalaryDisplay, salaryFilterOptions } from '@/lib/currency';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';

const Jobs: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const themePreview = React.useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const { jobs, fetchJobs, pagination } = useJobStore();
  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.18), transparent 30%), radial-gradient(circle at top right, hsl(var(--accent) / 0.14), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.92) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.11), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.16), transparent 22%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.68) 52%, hsl(var(--background)) 100%)',
  };
  const mainCardClass = cn(
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95',
  );

  const popularSearches = [
    'Frontend Developer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'DevOps Engineer',
  ];

  useEffect(() => {
    void handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const res = await axios.get('/jobs/saved/list');
        const list = res.data?.data || [];
        setSavedJobIds(list.map((j: any) => (j._id || j.id)?.toString()).filter(Boolean));
      } catch {
        // not logged in or no saved
      }
    };
    void loadSaved();
  }, []);

  const mappedJobs = jobs.map((job: any) => ({
    id: String(job._id || job.id),
    title: job.title,
    company: job.company,
    location: job.location,
    salary: formatSalaryDisplay(job.salary),
    type: job.type,
    tags: job.tags || [],
    description: job.description,
    postedTime: new Date(job.createdAt || Date.now()).toLocaleDateString(),
    isExternal: Boolean(job.isExternal),
    source: job.source,
    raw: {
      requirements: job.requirements,
      benefits: job.benefits,
      applyUrl: job.applyUrl,
    },
  }));

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (locationFilter) params.location = locationFilter;
      if (salaryFilter) params.salary = salaryFilter;

      await fetchJobs({ ...params, page: 1, limit: 12 });
    } catch (error: any) {
      toast({
        title: 'Failed to load jobs',
        description: error.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  const handleSaveJob = async (jobId: string) => {
    const id = String(jobId);
    const job = mappedJobs.find((item) => item.id === id);
    if (job?.isExternal) {
      toast({
        title: 'External job',
        description: 'Saving external jobs is not supported yet. You can still open and apply on the source site.',
      });
      return;
    }
    try {
      await axios.post(`/jobs/${id}/save`);
      setSavedJobIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
      toast({
        title: savedJobIds.includes(id) ? 'Job removed from saved' : 'Job saved',
        description: savedJobIds.includes(id)
          ? 'The job has been removed from your saved list.'
          : 'The job has been added to your saved list.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update saved jobs',
        description: err.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleApplyJob = async (jobId: string) => {
    const id = String(jobId);
    const job = mappedJobs.find((item) => item.id === id);
    setApplyingJobId(id);
    if (job?.isExternal) {
      const applyUrl = job.raw?.applyUrl;
      if (applyUrl) {
        window.open(applyUrl, '_blank', 'noopener,noreferrer');
        setApplyingJobId(null);
        return;
      }
      toast({
        title: 'Apply on source site',
        description: 'This external listing does not expose a direct apply link.',
      });
      setApplyingJobId(null);
      return;
    }
    try {
      await axios.post('/applications/apply', {
        jobId: id,
        resume: user?.resumeUrl || '',
      });
      toast({
        title: 'Application submitted',
        description: 'Your application has been sent to the employer.',
      });
      setJobDetailsOpen(false);
      setSelectedJob(null);
    } catch (error: any) {
      if (error.response?.data?.data?.code === 'PROFILE_INCOMPLETE') {
        toast({
          title: 'Complete your profile first',
          description: `Missing: ${(error.response?.data?.data?.missingProfileFields || getMissingProfileFields(user)).join(', ')}`,
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }
      toast({
        title: 'Application failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleLoadMore = async () => {
    if (loading || pagination.page >= pagination.pages) return;
    setLoading(true);
    try {
      await fetchJobs(
        {
          search: searchQuery || undefined,
          location: locationFilter || undefined,
          salary: salaryFilter || undefined,
          page: pagination.page + 1,
          limit: 12,
        },
        true,
      );
    } catch (error: any) {
      toast({
        title: 'Could not load more jobs',
        description: error.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" style={pageShellStyle}>
      {/* Search and Filters */}
      <AnimatedSection>
        <Card className={cn(mainCardClass, darkTheme ? 'bg-gradient-to-br from-primary/12 to-accent/10' : 'bg-gradient-to-br from-primary/5 to-secondary/5')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Find Your Perfect Job</span>
            </CardTitle>
            <CardDescription>
              Search through thousands of opportunities
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title or keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={salaryFilter} onValueChange={setSalaryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Salary Range" />
                </SelectTrigger>
                <SelectContent>
                  {salaryFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <motion.div
                    key={search}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setSearchQuery(search)}
                    >
                      {search}
                    </Badge>
                  </motion.div>
                ))}
              </div>
              <Button onClick={handleSearch} disabled={loading} className="bg-gradient-to-r from-primary to-secondary">
                {loading ? <LoadingSpinner size="sm" /> : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Job Results */}
      <AnimatedSection delay={0.2}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Available Positions</h2>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{pagination.total || mappedJobs.length} jobs found</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mappedJobs.map((job, index) => (
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
                  isApplying={applyingJobId === job.id}
                />
              </motion.div>
            ))}
          </div>

          {mappedJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}

          <div className="flex justify-center pt-6">
            <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={loading || pagination.page >= pagination.pages}>
              {loading ? <LoadingSpinner size="sm" /> : pagination.page >= pagination.pages ? 'No More Jobs' : 'Load More Jobs'}
            </Button>
          </div>
        </div>
      </AnimatedSection>

      <JobDetailsDialog
        job={selectedJob}
        open={jobDetailsOpen}
        onOpenChange={setJobDetailsOpen}
        onApply={handleApplyJob}
        onSave={handleSaveJob}
        isApplying={selectedJob ? applyingJobId === String(selectedJob.id) : false}
      />
    </div>
  );
};

export default Jobs;
