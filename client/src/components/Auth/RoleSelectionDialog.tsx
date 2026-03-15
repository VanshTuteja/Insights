import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { User, Building, MapPin, Briefcase, GraduationCap, Phone } from 'lucide-react';

const profileSchema = z.object({
  role: z.enum(['jobseeker', 'employer']).refine(Boolean, {message: 'Please select a role'}),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(2, 'Location is required'),
  // Job Seeker fields
  experience: z.string().optional(),
  skills: z.string().optional(),
  education: z.string().optional(),
  // Employer fields
  company: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  jobTitle: z.string().optional(),
});

interface RoleSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signupData: any;
  onCompleted: () => void;
}

const RoleSelectionDialog: React.FC<RoleSelectionDialogProps> = ({
  open,
  onOpenChange,
  signupData,
  onCompleted,
}) => {
  const [selectedRole, setSelectedRole] = useState<'jobseeker' | 'employer' | null>(null);
  const { updateProfile, isLoading } = useAuthStore();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: signupData?.role ?? undefined,
      phone: '',
      location: '',
      experience: '',
      skills: '',
      education: '',
      company: '',
      companySize: '',
      industry: '',
      jobTitle: '',
    },
  });

  const watchedRole = form.watch('role');

  React.useEffect(() => {
    setSelectedRole(watchedRole);
  }, [watchedRole]);

  // When signupData.role arrives later, sync it into the form (e.g. after OTP)
  React.useEffect(() => {
    if (signupData?.role) {
      form.setValue('role', signupData.role);
    }
  }, [signupData?.role, form]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      const completeData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
      };

      await updateProfile(completeData);
      onCompleted();
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to complete signup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const roleOptions = [
    {
      value: 'jobseeker',
      title: 'Job Seeker',
      description: 'Looking for job opportunities',
      icon: User,
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      value: 'employer',
      title: 'Employer',
      description: 'Hiring talented professionals',
      icon: Building,
      gradient: 'from-green-500 to-teal-600',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto glass">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-center">
            Tell us about yourself to personalize your experience
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-4">
            <Label>I am a *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleOptions.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedRole === option.value
                        ? 'ring-2 ring-primary shadow-premium'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => form.setValue('role', option.value as any)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-4`}>
                        <option.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  className="pl-10"
                  {...form.register('phone')}
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter your location"
                  className="pl-10"
                  {...form.register('location')}
                />
              </div>
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Role-specific fields */}
          {selectedRole === 'jobseeker' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Job Seeker Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select onValueChange={(value) => form.setValue('experience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (5-10 years)</SelectItem>
                    <SelectItem value="expert">Expert Level (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g. React, TypeScript, Node.js"
                  {...form.register('skills')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="education"
                    placeholder="Tell us about your educational background"
                    className="pl-10"
                    rows={3}
                    {...form.register('education')}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {selectedRole === 'employer' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Employer Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      placeholder="Enter company name"
                      className="pl-10"
                      {...form.register('company')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Your Job Title</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="jobTitle"
                      placeholder="e.g. HR Manager, CEO"
                      className="pl-10"
                      {...form.register('jobTitle')}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select onValueChange={(value) => form.setValue('companySize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select onValueChange={(value) => form.setValue('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !selectedRole}
            className="w-full bg-gradient-to-r from-primary to-secondary shadow-premium"
          >
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Complete Registration
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionDialog;