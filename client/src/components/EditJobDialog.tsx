import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Save } from 'lucide-react';
import axios from 'axios';

const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(1, 'Location is required'),
  salary: z.string().min(1, 'Salary range is required'),
  type: z.string().min(1, 'Job type is required'),
});

interface Job {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  location?: string;
  salary?: string;
  type?: string;
  applications: number;
  views: number;
  posted: string;
  status: string;
}

interface EditJobDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobUpdated: (job: Job) => void;
}

const EditJobDialog: React.FC<EditJobDialogProps> = ({
  job,
  open,
  onOpenChange,
  onJobUpdated,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      location: job?.location || '',
      salary: job?.salary || '',
      type: job?.type || '',
    },
  });

  React.useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        description: job.description || '',
        location: job.location || '',
        salary: job.salary || '',
        type: job.type || '',
      });
    }
  }, [job, form]);

  const onSubmit = async (data: z.infer<typeof jobSchema>) => {
    if (!job) return;
    
    setIsLoading(true);
    
    try {
      const jobId = job._id || job.id;
      const response = await axios.put(`/jobs/update/${jobId}`, data);
      const updatedJob = response.data?.data || { ...job, ...data };
      onJobUpdated(updatedJob);
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Job Posting</DialogTitle>
          <DialogDescription>
            Update the details for your job posting
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Job Title *</Label>
            <Input
              id="edit-title"
              placeholder="e.g. Senior Frontend Developer"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                placeholder="e.g. San Francisco, CA"
                {...form.register('location')}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-salary">Salary Range *</Label>
              <Input
                id="edit-salary"
                placeholder="e.g. $120k - $160k"
                {...form.register('salary')}
              />
              {form.formState.errors.salary && (
                <p className="text-sm text-destructive">{form.formState.errors.salary.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Job Type *</Label>
            <Select onValueChange={(value) => form.setValue('type', value)} defaultValue={job.type}>
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Job Description *</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe the role and responsibilities..."
              rows={4}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Job
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobDialog;