import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AnimatedSection from '@/components/AnimatedSection';
import JobCard from '@/components/JobCard';
import JobDetailsDialog from '@/components/JobDetailsDialog';
import { toast } from '@/hooks/use-toast';
import { Search, Filter, BookmarkCheck, Trash2, Eye } from 'lucide-react';

const SavedJobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState([
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
      savedDate: '2 days ago',
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
      savedDate: '3 days ago',
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
      savedDate: '1 week ago',
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
      savedDate: '1 week ago',
    },
    {
      id: '5',
      title: 'Product Manager',
      company: 'Innovation Corp',
      location: 'Seattle, WA',
      salary: '$140k - $180k',
      type: 'Full-time',
      tags: ['Strategy', 'Analytics', 'Agile', 'Leadership'],
      description: 'Lead product strategy and development for our flagship products.',
      postedTime: '1 week ago',
      savedDate: '2 weeks ago',
    },
  ]);

  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = locationFilter === '' || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  const handleRemoveJob = (jobId: string) => {
    setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    toast({
      title: 'Job removed',
      description: 'The job has been removed from your saved list.',
    });
  };

  const handleApplyJob = (jobId: string) => {
    toast({
      title: 'Application submitted',
      description: 'Your application has been sent to the employer.',
    });
  };

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Saved Jobs
            </h1>
            <p className="text-lg text-muted-foreground">
              Your bookmarked job opportunities
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BookmarkCheck className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{savedJobs.length} saved jobs</span>
          </div>
        </div>
      </AnimatedSection>

      {/* Search and Filters */}
      <AnimatedSection delay={0.2}>
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Saved Jobs</span>
            </CardTitle>
            <CardDescription>
              Filter through your saved opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, company, or skills"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                placeholder="Filter by location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Saved Jobs List */}
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
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      Saved {job.savedDate}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookmarkCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved jobs found</h3>
              <p className="text-muted-foreground">
                {searchQuery || locationFilter 
                  ? 'Try adjusting your search criteria' 
                  : 'Start saving jobs to see them here'
                }
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
        onSave={() => selectedJob && handleRemoveJob(selectedJob.id)}
      />
    </div>
  );
};

export default SavedJobs;