import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedSection from '@/components/AnimatedSection';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const Interviews: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const response = await axios.get('/interviews/candidate');
        const items = response.data?.data || [];
        const mapped = items.map((iv: any) => {
          const job = iv.jobId;
          const interviewer = iv.interviewerId;
          const scheduled = new Date(iv.scheduledAt);
          const durationMinutes = iv.duration || 60;

          const typeLabel =
            iv.type === 'video'
              ? 'Video Call'
              : iv.type === 'phone'
              ? 'Phone Call'
              : 'In-person';

          return {
            id: iv._id,
            company: job?.company || 'Company',
            position: job?.title || 'Interview',
            interviewer: interviewer?.name || 'Interviewer',
            interviewerRole: interviewer?.jobTitle || '',
            date: scheduled.toISOString(),
            time: scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: `${durationMinutes} minutes`,
            type: typeLabel,
            status: ['scheduled', 'rescheduled'].includes(iv.status) ? 'upcoming' : iv.status,
            location: iv.location || iv.meetingLink || job?.location || '',
            notes: iv.notes,
            avatar: interviewer?.avatar,
            meetingLink: iv.meetingLink,
          };
        });
        setInterviews(mapped);
      } catch (error: any) {
        toast({
          title: 'Failed to load interviews',
          description: error.response?.data?.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (user) {
      void loadInterviews();
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadInterviews();
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadInterviews();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const upcomingInterviews = interviews.filter(interview => interview.status === 'upcoming');
  const completedInterviews = interviews.filter(interview => interview.status === 'completed');
  const cancelledInterviews = interviews.filter(interview => interview.status === 'cancelled');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video Call':
        return <Video className="h-4 w-4" />;
      case 'Phone Call':
        return <Phone className="h-4 w-4" />;
      case 'In-person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const handleCancel = async (interviewId: string) => {
    try {
      await axios.patch(`/interviews/${interviewId}`, { status: 'cancelled' });
      setInterviews(interviews.map(interview =>
        interview.id === interviewId
          ? { ...interview, status: 'cancelled' }
          : interview
      ));
      toast({
        title: 'Interview cancelled',
        description: 'The interview has been cancelled successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to cancel',
        description: err.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const InterviewCard = ({ interview, showActions = true }: { interview: any, showActions?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-6 border rounded-lg hover:shadow-md transition-all bg-gradient-to-br from-card to-card/50"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={interview.avatar} />
            <AvatarFallback>{interview.interviewer[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{interview.position}</h3>
            <p className="text-primary font-medium">{interview.company}</p>
            <p className="text-sm text-muted-foreground">
              with {interview.interviewer} • {interview.interviewerRole}
            </p>
          </div>
        </div>
        <Badge className={`${getStatusColor(interview.status)} border`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(interview.status)}
            <span className="capitalize">{interview.status}</span>
          </div>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(interview.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{interview.time} ({interview.duration})</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          {getTypeIcon(interview.type)}
          <span>{interview.type}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{interview.location}</span>
        </div>
      </div>

      {interview.notes && (
        <div className="mb-4 p-3 bg-accent/10 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Notes:</strong> {interview.notes}
          </p>
        </div>
      )}

      {interview.feedback && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Feedback:</strong> {interview.feedback}
          </p>
        </div>
      )}

      {showActions && interview.status === 'upcoming' && (
        <div className="flex flex-wrap gap-2">
          {interview.meetingLink ? (
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-secondary"
              asChild
            >
              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                Join Interview
              </a>
            </Button>
          ) : (
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary" disabled>
              Join Interview
            </Button>
          )}
          {/* <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleReschedule(interview.id)}
          >
            Reschedule
          </Button> */}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleCancel(interview.id)}
          >
            Cancel
          </Button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Interviews
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your interview schedule
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{upcomingInterviews.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedInterviews.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Upcoming ({upcomingInterviews.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Completed ({completedInterviews.length})</span>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Cancelled ({cancelledInterviews.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingInterviews.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming interviews</h3>
                <p className="text-muted-foreground">Your scheduled interviews will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedInterviews.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No completed interviews</h3>
                <p className="text-muted-foreground">Completed interviews will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledInterviews.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cancelledInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No cancelled interviews</h3>
                <p className="text-muted-foreground">Cancelled interviews will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </AnimatedSection>
    </div>
  );
};

export default Interviews;
