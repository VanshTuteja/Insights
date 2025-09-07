import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AnimatedSection from '@/components/AnimatedSection';
import CreateJobDialog from '@/components/CreateJobDialog';
import EditJobDialog from '@/components/EditJobDialog';
import CandidateDetailsDialog from '@/components/CandidateDetailsDialog';
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
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Briefcase, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3,
  Calendar,
  Clock
} from 'lucide-react';

const EmployerDashboard: React.FC = () => {
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [editJobOpen, setEditJobOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [candidateDetailsOpen, setCandidateDetailsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced frontend developer...',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      type: 'full-time',
      applications: 45,
      views: 234,
      posted: '3 days ago',
      status: 'Active',
    },
    {
      id: '2',
      title: 'Product Manager',
      description: 'Lead product strategy and development...',
      location: 'Remote',
      salary: '$140k - $180k',
      type: 'full-time',
      applications: 67,
      views: 189,
      posted: '1 week ago',
      status: 'Active',
    },
    {
      id: '3',
      title: 'UX Designer',
      description: 'Create beautiful and intuitive user experiences...',
      location: 'New York, NY',
      salary: '$90k - $120k',
      type: 'full-time',
      applications: 32,
      views: 156,
      posted: '2 weeks ago',
      status: 'Paused',
    },
  ]);

  const employerStats = [
    { label: 'Active Jobs', value: '12', icon: Briefcase, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Applications', value: '284', icon: Users, color: 'from-green-500 to-green-600' },
    { label: 'Views This Month', value: '1,247', icon: Eye, color: 'from-purple-500 to-purple-600' },
    { label: 'Interviews Scheduled', value: '18', icon: Calendar, color: 'from-orange-500 to-orange-600' },
  ];

  const recentApplications = [
    {
      id: '1',
      candidateName: 'Sarah Johnson',
      position: 'Senior Frontend Developer',
      applied: '2 hours ago',
      match: 95,
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      experience: '5+ years in Frontend Development',
      skills: ['React', 'TypeScript', 'Node.js', 'Python'],
    },
    {
      id: '2',
      candidateName: 'Mike Chen',
      position: 'Product Manager',
      applied: '5 hours ago',
      match: 88,
      email: 'mike.chen@email.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      experience: '7+ years in Product Management',
      skills: ['Strategy', 'Analytics', 'Agile', 'Leadership'],
    },
    {
      id: '3',
      candidateName: 'Emily Davis',
      position: 'UX Designer',
      applied: '1 day ago',
      match: 92,
      email: 'emily.davis@email.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      experience: '4+ years in UX Design',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    },
  ];

  const handleJobCreated = (newJob: any) => {
    setActiveJobs([newJob, ...activeJobs]);
    toast({
      title: 'Job posted successfully',
      description: 'Your job posting is now live and visible to candidates.',
    });
  };

  const handleJobUpdated = (updatedJob: any) => {
    setActiveJobs(activeJobs.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    ));
    toast({
      title: 'Job updated successfully',
      description: 'Your job posting has been updated.',
    });
  };

  const handleEditJob = (job: any) => {
    setSelectedJob(job);
    setEditJobOpen(true);
  };

  const handleDeleteJob = (job: any) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteJob = () => {
    if (selectedJob) {
      setActiveJobs(activeJobs.filter(job => job.id !== selectedJob.id));
      toast({
        title: 'Job deleted',
        description: 'The job posting has been removed.',
      });
    }
    setDeleteDialogOpen(false);
    setSelectedJob(null);
  };

  const handleViewCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setCandidateDetailsOpen(true);
  };

  const handleContactCandidate = (candidateId: string) => {
    toast({
      title: 'Message sent',
      description: 'Your message has been sent to the candidate.',
    });
    setCandidateDetailsOpen(false);
  };

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Employer Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your job postings and track applications
            </p>
          </div>
          <Button 
            onClick={() => setCreateJobOpen(true)}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {employerStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Management */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatedSection delay={0.3}>
            <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">Active Jobs</TabsTrigger>
                <TabsTrigger value="create">Create Job</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                <Card>
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
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold">{job.title}</h3>
                              <div className="flex space-x-4 text-sm text-muted-foreground">
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
                            <div className="flex items-center space-x-2">
                              <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
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
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job Posting
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Job Performance Analytics</span>
                    </CardTitle>
                    <CardDescription>Insights into your job postings performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeJobs.map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg"
                        >
                          <h4 className="font-semibold mb-3">{job.title}</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Application Rate</p>
                              <p className="font-bold">{((job.applications / job.views) * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Daily Views</p>
                              <p className="font-bold">{Math.round(job.views / 7)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Applications</p>
                              <p className="font-bold">{job.applications}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Views</p>
                              <p className="font-bold">{job.views}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </AnimatedSection>
        </div>

        {/* Recent Applications */}
        <AnimatedSection delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest candidates who applied</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{application.candidateName}</h4>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {application.match}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{application.position}</p>
                      <p className="text-xs text-muted-foreground">Applied {application.applied}</p>
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewCandidate(application)}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleContactCandidate(application.id)}
                        >
                          Contact
                        </Button>
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
      />

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