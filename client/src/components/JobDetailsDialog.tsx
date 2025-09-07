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
import { MapPin, DollarSign, Clock, Building, Users, Star, Briefcase } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  description: string;
  postedTime: string;
}

interface JobDetailsDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
}

const JobDetailsDialog: React.FC<JobDetailsDialogProps> = ({
  job,
  open,
  onOpenChange,
  onApply,
  onSave,
}) => {
  if (!job) return null;

  const jobDetails = {
    requirements: [
      '5+ years of experience in frontend development',
      'Strong proficiency in React and TypeScript',
      'Experience with modern CSS frameworks',
      'Knowledge of state management libraries',
      'Excellent problem-solving skills',
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health insurance',
      'Flexible working hours and remote options',
      'Professional development budget',
      'Modern office with great amenities',
    ],
    companyInfo: {
      size: '500-1000 employees',
      founded: '2015',
      industry: 'Technology',
      rating: 4.5,
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
          <DialogDescription className="text-lg text-primary font-medium">
            {job.company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{job.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{job.salary}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{job.postedTime}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Badge variant="secondary">{tag}</Badge>
              </motion.div>
            ))}
          </div>

          <Separator />

          {/* Job Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Description</h3>
            <p className="text-muted-foreground leading-relaxed">{job.description}</p>
            <p className="text-muted-foreground leading-relaxed">
              We are seeking a talented and experienced professional to join our dynamic team. 
              This role offers an excellent opportunity to work on cutting-edge projects and 
              contribute to innovative solutions that impact millions of users worldwide.
            </p>
          </div>

          <Separator />

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Requirements</h3>
            <ul className="space-y-2">
              {jobDetails.requirements.map((requirement, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-2"
                >
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{requirement}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Benefits & Perks</h3>
            <ul className="space-y-2">
              {jobDetails.benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About the Company</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-accent/10 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{jobDetails.companyInfo.size}</p>
                <p className="text-xs text-muted-foreground">Company Size</p>
              </div>
              <div className="text-center p-3 bg-accent/10 rounded-lg">
                <Building className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{jobDetails.companyInfo.founded}</p>
                <p className="text-xs text-muted-foreground">Founded</p>
              </div>
              <div className="text-center p-3 bg-accent/10 rounded-lg">
                <Briefcase className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{jobDetails.companyInfo.industry}</p>
                <p className="text-xs text-muted-foreground">Industry</p>
              </div>
              <div className="text-center p-3 bg-accent/10 rounded-lg">
                <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{jobDetails.companyInfo.rating}/5</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <Button 
              onClick={() => onApply(job.id)}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
              size="lg"
            >
              Apply Now
            </Button>
            <Button 
              onClick={() => onSave(job.id)}
              variant="outline"
              size="lg"
            >
              Save Job
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsDialog;