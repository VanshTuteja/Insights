import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Clock, IndianRupee, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatSalaryDisplay } from '@/lib/currency';

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

interface JobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  onViewDetails?: (job: Job) => void;
  isSaved?: boolean;
  isApplying?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onSave, onApply, onViewDetails, isSaved = false, isApplying = false }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-[320px] w-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-card to-card/50 border-0 shadow-md flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1 min-w-0 pr-2">
              <CardTitle className="text-lg font-semibold line-clamp-1">{job.title}</CardTitle>
              <CardDescription className="text-base font-medium text-primary truncate">
                {job.company}
              </CardDescription>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSave?.(job.id)}
              className={`transition-colors ${
                isSaved 
                  ? 'text-primary hover:text-primary/80' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 fill-current" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </motion.button>
          </div>
          
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <IndianRupee className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{formatSalaryDisplay(job.salary)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{job.postedTime}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {job.tags.slice(0, 3).map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Badge variant="secondary" className="text-xs truncate max-w-[120px]">
                  {tag}
                </Badge>
              </motion.div>
            ))}
            {job.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{job.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex space-x-2 pt-2 mt-auto">
            <Button 
              onClick={() => onApply?.(job.id)}
              className="flex-1 bg-primary hover:opacity-90 transition-opacity"
              size="sm"
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails?.(job)}
              className="whitespace-nowrap"
            >
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JobCard;
