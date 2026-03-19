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
import { toast } from '@/hooks/use-toast';

const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(1, 'Location is required'),
  salary: z.string().min(1, 'Salary range is required'),
  type: z.string().min(1, 'Job type is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  benefits: z.string().min(1, 'Benefits are required'),
  skills: z.string().optional(),
});

interface Job {
  id?: string;
  _id?: string;
  title: string;
  company?: string;
  description?: string;
  location?: string;
  salary?: string;
  type?: string;
  requirements?: string;
  benefits?: string;
  tags?: string[];
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
      company: job?.company || '',
      description: job?.description || '',
      location: job?.location || '',
      salary: job?.salary || '',
      type: job?.type || '',
      requirements: job?.requirements || '',
      benefits: job?.benefits || '',
      skills: (job?.tags || []).join(', '),
    },
  });

  React.useEffect(() => {
    if (!job) return;

    form.reset({
      title: job.title,
      company: job.company || '',
      description: job.description || '',
      location: job.location || '',
      salary: job.salary || '',
      type: job.type || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      skills: (job.tags || []).join(', '),
    });
  }, [job, form]);

  const onSubmit = async (data: z.infer<typeof jobSchema>) => {
    if (!job) return;

    setIsLoading(true);

    try {
      const jobId = job._id || job.id;
      const payload = {
        title: data.title,
        company: data.company,
        description: data.description,
        location: data.location,
        salary: data.salary,
        type: data.type,
        requirements: data.requirements,
        benefits: data.benefits,
        tags: data.skills
          ? data.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
          : [],
      };

      const response = await axios.put(`/jobs/update/${jobId}`, payload);
      const updatedJob = response.data?.data || { ...job, ...payload };
      onJobUpdated(updatedJob);
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Failed to update job',
        description: error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Please review the form and try again.',
        variant: 'destructive',
      });
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Job Title *</Label>
              <Input id="edit-title" placeholder="e.g. Senior Frontend Developer" {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-company">Company Name *</Label>
              <Input id="edit-company" placeholder="e.g. TechCorp Inc." {...form.register('company')} />
              {form.formState.errors.company && (
                <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input id="edit-location" placeholder="e.g. Bengaluru or Remote" {...form.register('location')} />
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-salary">Salary Range *</Label>
              <Input id="edit-salary" placeholder="e.g. Rs 12 LPA - Rs 18 LPA" {...form.register('salary')} />
              {form.formState.errors.salary && (
                <p className="text-sm text-destructive">{form.formState.errors.salary.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Job Type *</Label>
            <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}>
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
            <Textarea id="edit-description" placeholder="Describe the role and responsibilities..." rows={4} {...form.register('description')} />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-skills">Skills Required</Label>
            <Input id="edit-skills" placeholder="e.g. React, TypeScript, Node.js" {...form.register('skills')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-requirements">Requirements *</Label>
            <Textarea id="edit-requirements" placeholder="List the required skills, experience, and qualifications..." rows={3} {...form.register('requirements')} />
            {form.formState.errors.requirements && (
              <p className="text-sm text-destructive">{form.formState.errors.requirements.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-benefits">Benefits & Perks *</Label>
            <Textarea id="edit-benefits" placeholder="Describe the benefits, perks, and company culture..." rows={3} {...form.register('benefits')} />
            {form.formState.errors.benefits && (
              <p className="text-sm text-destructive">{form.formState.errors.benefits.message}</p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-primary to-secondary">
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
