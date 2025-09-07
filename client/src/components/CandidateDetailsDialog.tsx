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
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Star,
  Download,
  MessageCircle,
  User
} from 'lucide-react';

interface Candidate {
  id: string;
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
}

interface CandidateDetailsDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContact: (candidateId: string) => void;
}

const CandidateDetailsDialog: React.FC<CandidateDetailsDialogProps> = ({
  candidate,
  open,
  onOpenChange,
  onContact,
}) => {
  if (!candidate) return null;

  const candidateDetails = {
    email: candidate.email || 'sarah.johnson@email.com',
    phone: candidate.phone || '+1 (555) 123-4567',
    location: candidate.location || 'San Francisco, CA',
    experience: candidate.experience || '5+ years in Frontend Development',
    education: candidate.education || 'BS Computer Science, Stanford University',
    skills: candidate.skills || ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
    avatar: candidate.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    summary: 'Experienced software developer with a passion for creating user-centric applications. Strong background in modern web technologies and agile development practices.',
    projects: [
      { name: 'E-commerce Platform', tech: 'React, Node.js, MongoDB' },
      { name: 'Task Management App', tech: 'TypeScript, Express, PostgreSQL' },
      { name: 'Real-time Chat Application', tech: 'Socket.io, React, Redis' },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={candidateDetails.avatar} />
              <AvatarFallback>{candidate.candidateName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold">{candidate.candidateName}</DialogTitle>
              <DialogDescription className="text-lg">
                Applied for {candidate.position}
              </DialogDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {candidate.match}% match
                </Badge>
                <Badge variant="secondary">{candidate.applied}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{candidateDetails.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{candidateDetails.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{candidateDetails.location}</span>
            </div>
          </div>

          <Separator />

          {/* Professional Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Professional Summary</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">{candidateDetails.summary}</p>
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
                <p className="font-medium">{candidateDetails.experience}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Specialized in building scalable web applications and leading development teams.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Education</span>
              </h3>
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="font-medium">{candidateDetails.education}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Graduated Magna Cum Laude with focus on Software Engineering.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidateDetails.skills.map((skill, index) => (
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
          </div>

          <Separator />

          {/* Recent Projects */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Projects</h3>
            <div className="space-y-3">
              {candidateDetails.projects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium">{project.name}</h4>
                  <p className="text-sm text-muted-foreground">{project.tech}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <Button 
              onClick={() => onContact(candidate.id)}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Candidate
            </Button>
            <Button variant="outline" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Resume
            </Button>
            <Button variant="outline" size="lg">
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