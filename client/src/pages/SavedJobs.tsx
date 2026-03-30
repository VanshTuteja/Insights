import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AnimatedSection from '@/components/AnimatedSection';
import JobCard from '@/components/JobCard';
import JobDetailsDialog from '@/components/JobDetailsDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Search, BookmarkCheck, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { formatSalaryDisplay } from '@/lib/currency';

const SavedJobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/jobs/saved/list');
        const list = res.data?.data || [];
        const mapped = (Array.isArray(list) ? list : []).map((job: any) => ({
          id: String(job._id),
          title: job.title,
          company: job.company,
          location: job.location,
          salary: formatSalaryDisplay(job.salary),
          type: job.type,
          tags: job.tags || [],
          description: job.description,
          postedTime: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '',
          raw: {
            requirements: job.requirements,
            benefits: job.benefits,
          },
        }));
        setSavedJobs(mapped);
      } catch {
        setSavedJobs([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filteredJobs = savedJobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.tags || []).some((tag: string) =>
        String(tag).toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLocation =
      !locationFilter ||
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  const handleRemoveJob = async (jobId: string) => {
    const id = String(jobId);
    try {
      await axios.post(`/jobs/${id}/save`);
      setSavedJobs((prev) => prev.filter((j) => String(j.id) !== id));
      toast({
        title: 'Job removed',
        description: 'The job has been removed from your saved list.',
      });
      if (selectedJob && String(selectedJob.id) === id) {
        setJobDetailsOpen(false);
        setSelectedJob(null);
      }
    } catch (err: any) {
      toast({
        title: 'Failed to remove',
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
      toast({
        title: 'Application failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Saved Jobs
            </h1>
            <p className="text-lg text-muted-foreground">
              Your bookmarked job opportunities (saved in your account)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BookmarkCheck className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{savedJobs.length} saved jobs</span>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Saved Jobs</span>
            </CardTitle>
            <CardDescription>Filter through your saved opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search by title, company, or skills"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Input
                placeholder="Filter by location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.3}>
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  className="relative"
                >
                  <JobCard
                    job={job}
                    onApply={handleApplyJob}
                    onViewDetails={handleViewDetails}
                    isSaved={true}
                    onSave={() => handleRemoveJob(job.id)}
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(job)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveJob(job.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookmarkCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved jobs</h3>
              <p className="text-muted-foreground">
                {searchQuery || locationFilter
                  ? 'Try adjusting your search criteria'
                  : 'Save jobs from Find Jobs and they will appear here. Reload the page to see your saved list.'}
              </p>
            </div>
          )}
        </div>
      </AnimatedSection>

      <JobDetailsDialog
        job={selectedJob}
        open={jobDetailsOpen}
        onOpenChange={setJobDetailsOpen}
        onApply={handleApplyJob}
        onSave={(id) => selectedJob && handleRemoveJob(id)}
      />
    </div>
  );
};

export default SavedJobs;
