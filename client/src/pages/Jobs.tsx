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
import { Search, Filter, MapPin, Briefcase } from 'lucide-react';

const Jobs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);

  const jobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      type: 'Full-time',
      tags: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      description: 'We are looking for an experienced frontend developer to join our growing team and help build the next generation of web applications.',
      postedTime: '2 hours ago',
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'Startup Labs',
      location: 'Remote',
      salary: '$100k - $140k',
      type: 'Full-time',
      tags: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
      description: 'Join our innovative team working on cutting-edge solutions that impact millions of users worldwide.',
      postedTime: '1 day ago',
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      company: 'Design Studio',
      location: 'New York, NY',
      salary: '$90k - $120k',
      type: 'Full-time',
      tags: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      description: 'Create beautiful and intuitive user experiences for our suite of products.',
      postedTime: '3 days ago',
    },
    {
      id: '4',
      title: 'Data Scientist',
      company: 'AI Solutions',
      location: 'Boston, MA',
      salary: '$130k - $170k',
      type: 'Full-time',
      tags: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
      description: 'Apply machine learning algorithms to solve complex business problems.',
      postedTime: '5 days ago',
    },
    {
      id: '5',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Austin, TX',
      salary: '$110k - $150k',
      type: 'Full-time',
      tags: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
      description: 'Build and maintain scalable infrastructure for our cloud-native applications.',
      postedTime: '1 week ago',
    },
    {
      id: '6',
      title: 'Product Manager',
      company: 'Innovation Corp',
      location: 'Seattle, WA',
      salary: '$140k - $180k',
      type: 'Full-time',
      tags: ['Strategy', 'Analytics', 'Agile', 'Leadership'],
      description: 'Lead product strategy and development for our flagship products.',
      postedTime: '1 week ago',
    },
  ];

  const popularSearches = [
    'Frontend Developer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'DevOps Engineer',
  ];

  useEffect(() => {
    // Filter jobs based on search and filters
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (salaryFilter) {
      // Simple salary filtering logic
      filtered = filtered.filter(job => {
        const salary = job.salary.toLowerCase();
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
  }, [searchQuery, locationFilter, salaryFilter]);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleViewDetails = (job: any) => {
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

  const handleApplyJob = (jobId: string) => {
    toast({
      title: 'Application submitted',
      description: 'Your application has been sent to the employer.',
    });
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
                  isSaved={savedJobs.includes(job.id)}
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