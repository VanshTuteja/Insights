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
import { Loader2, MapPin, DollarSign, Clock } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type?: string;
  tags: string[];
  description: string;
  postedTime: string;
  raw?: {
    requirements?: string;
    benefits?: string;
  };
}

interface JobDetailsDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  isApplying?: boolean;
}

const JobDetailsDialog: React.FC<JobDetailsDialogProps> = ({
  job,
  open,
  onOpenChange,
  onApply,
  onSave,
  isApplying = false,
}) => {
  if (!job) return null;

  const requirements = job.raw?.requirements?.trim();
  const benefits = job.raw?.benefits?.trim();
  const requirementsList = requirements
    ? requirements.split(/\n+/).filter((line) => line.trim())
    : [];
  const benefitsList = benefits ? benefits.split(/\n+/).filter((line) => line.trim()) : [];

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

          {job.tags && job.tags.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <motion.div
                    key={String(tag) + index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge variant="secondary">{tag}</Badge>
                  </motion.div>
                ))}
              </div>
              <Separator />
            </>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {requirementsList.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <ul className="space-y-2">
                  {requirementsList.map((line, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start space-x-2"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{line.trim()}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {benefitsList.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Benefits & Perks</h3>
                <ul className="space-y-2">
                  {benefitsList.map((line, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start space-x-2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{line.trim()}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {(!requirementsList.length && requirements) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{requirements}</p>
              </div>
            </>
          )}

          {(!benefitsList.length && benefits) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Benefits & Perks</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{benefits}</p>
              </div>
            </>
          )}

          <div className="flex space-x-4 pt-6">
            <Button
              onClick={() => onApply(String(job.id))}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
              size="lg"
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply Now'
              )}
            </Button>
            <Button onClick={() => onSave(String(job.id))} variant="outline" size="lg">
              Save Job
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsDialog;
