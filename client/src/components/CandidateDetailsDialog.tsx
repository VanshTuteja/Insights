import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { downloadResumeFile, openResumeFile } from '@/lib/resume';
import { toast } from '@/hooks/use-toast';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Download,
  ExternalLink,
  User
} from 'lucide-react';

interface Candidate {
  id: string;
  candidateId?: string;
  jobId?: string;
  applicationId?: string;
  candidateName: string;
  position: string;
  applied: string;
  match: number;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  avatar?: string;
  resumeUrl?: string;
  bio?: string;
}

interface CandidateDetailsDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContact: (candidateId: string) => void;
  onScheduleInterview?: (candidateId: string, jobId?: string, applicationId?: string) => void;
}

const CandidateDetailsDialog: React.FC<CandidateDetailsDialogProps> = ({
  candidate,
  open,
  onOpenChange,
  onScheduleInterview,
}) => {
  if (!candidate) return null;

  const handleResumeView = async () => {
    if (!candidate.candidateId) return;
    try {
      await openResumeFile(candidate.candidateId);
    } catch (error: any) {
      toast({
        title: 'Could not open resume',
        description: error.message || 'Please try downloading the resume instead.',
        variant: 'destructive',
      });
    }
  };

  const handleResumeDownload = async () => {
    if (!candidate.candidateId) return;
    try {
      await downloadResumeFile(candidate.candidateId, candidate.candidateName);
    } catch (error: any) {
      toast({
        title: 'Could not download resume',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={candidate.avatar} />
              <AvatarFallback>{candidate.candidateName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold">{candidate.candidateName}</DialogTitle>
              <DialogDescription className="text-lg">
                Applied for {candidate.position}
              </DialogDescription>
              <div className="flex items-center space-x-2 mt-2">
                {/* <Badge variant="outline" className="text-green-600 border-green-600">
                  {candidate.match}% match
                </Badge> */}
                <Badge variant="secondary">{candidate.applied}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{candidate.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{candidate.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{candidate.location || 'Not provided'}</span>
            </div>
          </div>

          <Separator />

          {/* Professional Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Professional Summary</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {candidate.bio || 'No summary provided by this applicant yet.'}
            </p>
          </div>

          <Separator />

          {/* Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Experience</span>
              </h3>
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="font-medium">{candidate.experience || 'Experience not provided'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Education</span>
              </h3>
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="font-medium">{candidate.education || 'Education not provided'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(candidate.skills || []).map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                </motion.div>
              ))}
            </div>
            {(!candidate.skills || candidate.skills.length === 0) && (
              <p className="text-sm text-muted-foreground">No skills listed.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            {/* <Button 
              onClick={() => onContact(candidate.id)}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Candidate
            </Button> */}
            <Button
              variant="outline"
              size="lg"
              disabled={!candidate.resumeUrl}
              onClick={() => void handleResumeView()}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Resume
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={!candidate.resumeUrl}
              onClick={() => void handleResumeDownload()}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Resume (PDF)
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onScheduleInterview?.(candidate.candidateId ?? candidate.id, candidate.jobId, candidate.applicationId)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailsDialog;
