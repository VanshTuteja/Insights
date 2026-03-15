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
import { useNavigate } from 'react-router-dom';

const Jobs: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);

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

  useEffect(() => {
    // Client-side filtering for salary range
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.tags || []).some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase()),
      );
    }

    if (salaryFilter) {
      filtered = filtered.filter((job) => {
        const salary = String(job.salary).toLowerCase();
        switch (salaryFilter) {
          case '0-50k':
            return salary.includes('50') || salary.includes('40') || salary.includes('30');
          case '50k-100k':
            return salary.includes('90') || salary.includes('80') || salary.includes('70');
          case '100k-150k':
            return salary.includes('120') || salary.includes('130') || salary.includes('140');
          case '150k+':
            return salary.includes('160') || salary.includes('170') || salary.includes('180');
          default:
            return true;
        }
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, locationFilter, salaryFilter]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (locationFilter) params.location = locationFilter;
      if (salaryFilter) params.salary = salaryFilter;

      const response = await axios.get('/jobs', { params });
      const apiJobs = response.data?.data?.jobs || [];

      const mapped = apiJobs.map((job: any) => ({
        id: String(job._id),
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
        tags: job.tags || [],
        description: job.description,
        postedTime: new Date(job.createdAt).toLocaleDateString(),
        raw: {
          requirements: job.requirements,
          benefits: job.benefits,
        },
      }));

      setJobs(mapped);
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <AnimatedSection>
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Find Your Perfect Job</span>
            </CardTitle>
            <CardDescription>
              Search through thousands of opportunities
            </CardDescription>
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
                  <SelectItem value="0-50k">$0 - $50k</SelectItem>
                  <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                  <SelectItem value="100k-150k">$100k - $150k</SelectItem>
                  <SelectItem value="150k+">$150k+</SelectItem>
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
              <span>{filteredJobs.length} jobs found</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
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

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}

          <div className="flex justify-center pt-6">
            <Button variant="outline" size="lg">
              Load More Jobs
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
      />
    </div>
  );
};

export default Jobs;
