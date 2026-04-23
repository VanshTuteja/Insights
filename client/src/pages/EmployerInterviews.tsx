import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, Building2, Calendar, CheckCircle2, Clock, ExternalLink, Loader2, MapPin, PencilLine, Phone, RefreshCw, Video, XCircle } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';

type InterviewCardItem = {
  id: string;
  candidateName: string;
  candidateEmail: string;
  company: string;
  jobTitle: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'rescheduled' | 'completed' | 'cancelled';
  type: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  location?: string;
  notes?: string;
};

type EditForm = {
  date: string;
  time: string;
  duration: string;
  type: 'video' | 'phone' | 'onsite';
  meetingLink: string;
  notes: string;
};

const EmployerInterviews: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const [interviews, setInterviews] = useState<InterviewCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<'save' | 'reschedule' | 'cancel' | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<InterviewCardItem | null>(null);
  const [form, setForm] = useState<EditForm>({
    date: '',
    time: '',
    duration: '60',
    type: 'video',
    meetingLink: '',
    notes: '',
  });
  const dateInputRef = React.useRef<HTMLInputElement | null>(null);
  const timeInputRef = React.useRef<HTMLInputElement | null>(null);

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

  const loadInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/interviews/employer');
      const items = response.data?.data || [];
      setInterviews(
        items.map((item: any) => ({
          id: item._id,
          candidateName: item.candidateId?.name || 'Candidate',
          candidateEmail: item.candidateId?.email || 'No email available',
          company: item.jobId?.company || 'Company',
          jobTitle: item.jobId?.title || 'Interview',
          scheduledAt: item.scheduledAt,
          duration: item.duration || 60,
          status: item.status || 'scheduled',
          type: item.type || 'video',
          meetingLink: item.meetingLink,
          location: item.location || item.jobId?.location,
          notes: item.notes,
        })),
      );
    } catch (error: any) {
      toast({
        title: 'Failed to load scheduled interviews',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInterviews();
  }, [loadInterviews]);

  const normalizeStatus = (status: string) =>
    ['scheduled', 'rescheduled'].includes(status) ? 'upcoming' : status;

  const grouped = useMemo(() => ({
    upcoming: interviews.filter((item) => normalizeStatus(item.status) === 'upcoming'),
    completed: interviews.filter((item) => normalizeStatus(item.status) === 'completed'),
    cancelled: interviews.filter((item) => normalizeStatus(item.status) === 'cancelled'),
  }), [interviews]);

  const stats = [
    { label: 'Upcoming', value: grouped.upcoming.length, icon: AlertCircle },
    { label: 'Completed', value: grouped.completed.length, icon: CheckCircle2 },
    { label: 'Cancelled', value: grouped.cancelled.length, icon: XCircle },
  ];

  const getStatusClasses = (status: string) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'completed') return 'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    if (normalized === 'cancelled') return 'border-red-200 bg-red-500/10 text-red-700 dark:text-red-300';
    return 'border-amber-200 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  };

  const getTypeIcon = (type: InterviewCardItem['type']) => {
    if (type === 'phone') return <Phone className="h-4 w-4" />;
    if (type === 'in-person') return <MapPin className="h-4 w-4" />;
    return <Video className="h-4 w-4" />;
  };

  const openEdit = (interview: InterviewCardItem) => {
    const scheduledAt = new Date(interview.scheduledAt);
    setSelectedInterview(interview);
    setForm({
      date: scheduledAt.toISOString().slice(0, 10),
      time: scheduledAt.toTimeString().slice(0, 5),
      duration: String(interview.duration || 60),
      type: interview.type === 'in-person' ? 'onsite' : interview.type,
      meetingLink: interview.meetingLink || interview.location || '',
      notes: interview.notes || '',
    });
    setEditOpen(true);
  };

  const handleUpdateInterview = async (mode: 'save' | 'reschedule' | 'cancel') => {
    if (!selectedInterview) return;

    if (mode !== 'cancel' && (!form.date || !form.time)) {
      toast({
        title: 'Missing details',
        description: 'Please select a valid date and time.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActiveAction(mode);
      const payload: Record<string, unknown> = {};

      if (mode === 'cancel') {
        payload.status = 'cancelled';
      } else {
        payload.date = form.date;
        payload.time = form.time;
        payload.duration = Number(form.duration) || 60;
        payload.type = form.type;
        payload.meetingLink = form.meetingLink.trim();
        payload.notes = form.notes.trim();
        if (mode === 'reschedule') {
          payload.status = 'rescheduled';
        }
      }

      await axios.patch(`/interviews/${selectedInterview.id}`, payload);
      toast({
        title: mode === 'cancel' ? 'Interview cancelled' : mode === 'reschedule' ? 'Interview rescheduled' : 'Interview updated',
        description: 'The job seeker has been notified about this change.',
      });
      setEditOpen(false);
      setSelectedInterview(null);
      await loadInterviews();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActiveAction(null);
    }
  };

  const renderCards = (items: InterviewCardItem[], emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <Card className={cardClass}>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {items.map((interview, index) => {
          const scheduledAt = new Date(interview.scheduledAt);
          const normalizedStatus = normalizeStatus(interview.status);

          return (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cardClass}>
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{interview.company}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{interview.jobTitle}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {interview.candidateName} • {interview.candidateEmail}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('capitalize', getStatusClasses(interview.status))}>
                      {normalizedStatus}
                    </Badge>
                  </div>

                  <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="h-4 w-4 text-primary" /> */}
                      <span>{scheduledAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-2 capitalize">
                      {getTypeIcon(interview.type)}
                      <span>{interview.type === 'in-person' ? 'In-person' : interview.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate">{interview.location || 'Location shared in invite'}</span>
                    </div>
                  </div>

                  {interview.notes ? (
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                      {interview.notes}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-2">
                    {interview.meetingLink && normalizedStatus === 'upcoming' ? (
                      <Button asChild variant="outline">
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Open meeting link
                        </a>
                      </Button>
                    ) : null}
                    {normalizedStatus === 'upcoming' ? (
                      <Button onClick={() => openEdit(interview)}>
                        <PencilLine className="h-4 w-4" />
                        Manage interview
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6" style={pageShellStyle}>
      <AnimatedSection>
        <div className={heroClass}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Interview Tracker</p>
              <h1 className="text-3xl font-semibold">Scheduled interviews</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Track every candidate conversation in one place and keep updates aligned with your active theme.
              </p>
              <p className="text-xs text-muted-foreground">
                Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
              </p>
            </div>
            <Button variant="outline" className={cn(darkTheme ? 'border-primary/20 bg-background/40' : 'border-border bg-background/80')} onClick={() => void loadInterviews()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className={cardClass}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('rounded-2xl p-3', darkTheme ? 'bg-primary/18' : 'bg-primary/10')}>
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              {renderCards(grouped.upcoming, 'Upcoming interviews will appear here after you schedule them.')}
            </TabsContent>
            <TabsContent value="completed">
              {renderCards(grouped.completed, 'Completed interviews have not been recorded yet.')}
            </TabsContent>
            <TabsContent value="cancelled">
              {renderCards(grouped.cancelled, 'Cancelled interviews will show here for easy tracking.')}
            </TabsContent>
          </Tabs>
        )}
      </AnimatedSection>

      <Dialog open={editOpen} onOpenChange={(open) => !activeAction && setEditOpen(open)}>
        <DialogContent className="max-w-xl" showCloseButton={!activeAction}>
          <DialogHeader>
            <DialogTitle>Manage interview</DialogTitle>
            <DialogDescription>
              Edit interview details, reschedule it, or cancel it. The job seeker will be notified after each update.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <Input
                  ref={dateInputRef}
                  type="date"
                  value={form.date}
                  disabled={Boolean(activeAction)}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    const input = dateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                    input?.showPicker?.();
                    input?.focus();
                  }}
                  disabled={Boolean(activeAction)}
                  aria-label="Open calendar"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                </button>
              </div>
              <div className="relative">
                <Input
                  ref={timeInputRef}
                  type="time"
                  value={form.time}
                  disabled={Boolean(activeAction)}
                  onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    const input = timeInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                    input?.showPicker?.();
                    input?.focus();
                  }}
                  disabled={Boolean(activeAction)}
                  aria-label="Open time picker"
                >
                   <Clock className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as EditForm['type'] }))} disabled={Boolean(activeAction)}>
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
                value={form.duration}
                disabled={Boolean(activeAction)}
                onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="Duration in minutes"
              />
            </div>
            <Input
              type="text"
              value={form.meetingLink}
              disabled={Boolean(activeAction)}
              onChange={(e) => setForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
              placeholder={form.type === 'onsite' ? 'Office address or meeting location' : form.type === 'phone' ? 'Phone number or call details' : 'Meeting link'}
            />
            <Textarea value={form.notes} disabled={Boolean(activeAction)} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes for the candidate" />
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            <Button variant="destructive" disabled={Boolean(activeAction)} onClick={() => void handleUpdateInterview('cancel')}>
              {activeAction === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Cancel interview
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" disabled={Boolean(activeAction)} onClick={() => setEditOpen(false)}>
                Close
              </Button>
              <Button variant="outline" disabled={Boolean(activeAction)} onClick={() => void handleUpdateInterview('save')}>
                {activeAction === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update details
              </Button>
              <Button disabled={Boolean(activeAction)} onClick={() => void handleUpdateInterview('reschedule')}>
                {activeAction === 'reschedule' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Reschedule
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerInterviews;
