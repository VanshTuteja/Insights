import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimatedSection from '@/components/AnimatedSection';
import { toast } from '@/hooks/use-toast';
import {
  FileText,
  Building2,
  Calendar,
  Video,
  Phone,
  MapPin,
  ExternalLink,
  Clock,
} from 'lucide-react';
import axios from 'axios';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  Applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Under Review': { label: 'Under Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  Shortlisted: { label: 'Shortlisted', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  'Interview Scheduled': { label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  Rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  Hired: { label: 'Hired', color: 'bg-green-100 text-green-800 border-green-200' },
};

const Applications: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/applications/candidate');
        setList(res.data?.data || []);
      } catch (err: any) {
        toast({
          title: 'Failed to load applications',
          description: err.response?.data?.message || 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const jobTitle = (app: any) => app.jobId?.title ?? 'Job';
  const company = (app: any) => app.jobId?.company ?? 'Company';
  const appliedDate = (app: any) =>
    app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—';
  const interviewDate = (app: any) =>
    app.interviewDate ? new Date(app.interviewDate).toLocaleString() : null;
  const statusConfig = (status: string) => STATUS_CONFIG[status] || { label: status, color: 'bg-muted text-muted-foreground' };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Track status of your job applications and interviews
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="space-y-4">
          {list.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Apply to jobs from the Find Jobs page and they will appear here with their status.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = '/jobs'}>
                  Find Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {list.map((app: any, index: number) => {
                const config = statusConfig(app.status);
                const interviewDt = interviewDate(app);
                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-lg">{jobTitle(app)}</h3>
                              <Badge className={`${config.color} border`}>{config.label}</Badge>
                            </div>
                            <p className="text-primary font-medium flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {company(app)}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Applied {appliedDate(app)}
                              </span>
                              {interviewDt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Interview: {interviewDt}
                                </span>
                              )}
                            </div>
                            {app.meetingLink && (
                              <div className="flex items-center gap-2 mt-2">
                                {app.interviewType === 'video' && <Video className="h-4 w-4" />}
                                {app.interviewType === 'phone' && <Phone className="h-4 w-4" />}
                                {app.interviewType === 'in-person' && <MapPin className="h-4 w-4" />}
                                <a
                                  href={app.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                  Meeting link <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Applications;
