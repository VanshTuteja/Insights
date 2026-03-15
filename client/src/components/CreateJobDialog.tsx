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
import { Plus } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
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

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated: (job: any) => void;
}

const CreateJobDialog: React.FC<CreateJobDialogProps> = ({
  open,
  onOpenChange,
  onJobCreated,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { user } = useAuthStore();

  const form = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      company: user?.company || '',
      description: '',
      location: '',
      salary: '',
      type: '',
      requirements: '',
      benefits: '',
      skills: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof jobSchema>) => {
    setIsLoading(true);
    try {
      const tags = data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: data.title,
        company: data.company,
        description: data.description,
        location: data.location,
        salary: data.salary,
        type: data.type,
        requirements: data.requirements,
        benefits: data.benefits,
        tags,
      };

      const response = await axios.post('/jobs/create', payload);
      const job = response.data?.data;

      onJobCreated(job || payload);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Could not create job',
        description: error.response?.data?.message || 'Please complete your profile and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create New Job Posting
          </DialogTitle>
          <DialogDescription>
            Fill out the details to post a new job opening
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Senior Frontend Developer"
                {...form.register('title')}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                placeholder="e.g. TechCorp Inc."
                {...form.register('company')}
              />
              {form.formState.errors.company && (
                <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA or Remote"
                {...form.register('location')}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range *</Label>
              <Input
                id="salary"
                placeholder="e.g. $120k - $160k"
                {...form.register('salary')}
              />
              {form.formState.errors.salary && (
                <p className="text-sm text-destructive">{form.formState.errors.salary.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Select onValueChange={(value) => form.setValue('type', value)}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={4}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills Required (comma-separated)</Label>
            <Input
              id="skills"
              placeholder="e.g. React, TypeScript, Node.js"
              {...form.register('skills')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements *</Label>
            <Textarea
              id="requirements"
              placeholder="List the required skills, experience, and qualifications..."
              rows={3}
              {...form.register('requirements')}
            />
            {form.formState.errors.requirements && (
              <p className="text-sm text-destructive">{form.formState.errors.requirements.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits & Perks *</Label>
            <Textarea
              id="benefits"
              placeholder="Describe the benefits, perks, and company culture..."
              rows={3}
              {...form.register('benefits')}
            />
            {form.formState.errors.benefits && (
              <p className="text-sm text-destructive">{form.formState.errors.benefits.message}</p>
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
