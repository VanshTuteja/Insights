import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { getMissingProfileFields, isProfileComplete } from '@/lib/profileCompletion';
import { cn, resolveAssetUrl } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import {
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Plus,
  Save,
  Shield,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react';

type ProfilePreferences = {
  jobTypes: string[];
  salaryRange: number[];
  locations: string[];
  industries: string[];
  notifications: {
    email: boolean;
    push: boolean;
    jobAlerts: boolean;
    messages: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showSalary: boolean;
    showContact: boolean;
  };
};

type ProfileFormValues = {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  website: string;
  jobTitle: string;
  company: string;
  companySize: string;
  industry: string;
  experience: string;
  education: string;
};

const emptyPreferences: ProfilePreferences = {
  jobTypes: [],
  salaryRange: [30000, 150000],
  locations: [],
  industries: [],
  notifications: {
    email: true,
    push: true,
    jobAlerts: true,
    messages: true,
  },
  privacy: {
    profileVisible: true,
    showSalary: false,
    showContact: true,
  },
};

const fieldLabels: Record<string, string> = {
  name: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  bio: 'Professional Summary',
  jobTitle: 'Job Title',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  resumeUrl: 'Resume',
  company: 'Company',
  companySize: 'Company Size',
  industry: 'Industry',
};

const skillSuggestions = [
  'React',
  'TypeScript',
  'Node.js',
  'JavaScript',
  'Python',
  'Java',
  'MongoDB',
  'SQL',
  'AWS',
  'Docker',
  'Leadership',
  'Communication',
];

const buildSchema = (isJobSeeker: boolean) =>
  z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      phone: z.string().min(10, 'Phone number must be at least 10 digits'),
      location: z.string().min(2, 'Location is required'),
      bio: z.string().min(20, 'Professional summary must be at least 20 characters'),
      website: z.string().url('Enter a valid website URL').or(z.literal('')),
      jobTitle: z.string().min(2, 'Job title is required'),
      company: z.string(),
      companySize: z.string(),
      industry: z.string(),
      experience: z.string(),
      education: z.string(),
    })
    .superRefine((data, ctx) => {
      if (isJobSeeker) {
        if (!data.experience.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['experience'], message: 'Experience is required' });
        }
        if (!data.education.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['education'], message: 'Education is required' });
        }
      } else {
        if (!data.company.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['company'], message: 'Company name is required' });
        }
        if (!data.companySize.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['companySize'], message: 'Company size is required' });
        }
        if (!data.industry.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['industry'], message: 'Industry is required' });
        }
      }
    });

const Profile: React.FC = () => {
  const { user, getProfile, updateProfile } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [preferences, setPreferences] = useState<ProfilePreferences>(emptyPreferences);

  const isJobSeeker = user?.role === 'jobseeker';
  const schema = useMemo(() => buildSchema(Boolean(isJobSeeker)), [isJobSeeker]);
  const missingFields = user?.missingProfileFields?.length
    ? user.missingProfileFields
    : getMissingProfileFields(user);
  const profileComplete = isProfileComplete(user);
  const totalRequiredFields = isJobSeeker ? 10 : 9;
  const completionPercent = Math.max(0, Math.round(((totalRequiredFields - missingFields.length) / totalRequiredFields) * 100));
  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.22), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.16), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.94) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.12), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.18), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.72) 52%, hsl(var(--background)) 100%)',
  };
  const heroClass = cn(
    'rounded-3xl border px-6 py-8 shadow-premium-lg backdrop-blur-xl',
    darkTheme ? 'border-primary/20 bg-card/80 text-card-foreground' : 'border-primary/10 bg-card/90 text-card-foreground',
  );
  const mainCardClass = cn(
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95',
  );
  const softPanelClass = cn(
    'rounded-2xl border p-4',
    darkTheme ? 'border-border/70 bg-background/55 text-foreground/80' : 'border-border bg-muted/60 text-foreground/80',
  );
  const pillClass = cn(
    'inline-flex items-center gap-2 rounded-full px-3 py-1',
    darkTheme ? 'bg-white/8 text-foreground/80' : 'bg-background/70 text-foreground/80',
  );
  const sectionTitleClass = 'font-medium text-foreground';
  const avatarUrl = resolveAssetUrl(avatarPreview || user?.avatar);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      website: '',
      jobTitle: '',
      company: '',
      companySize: '',
      industry: '',
      experience: '',
      education: '',
    },
  });

  useEffect(() => {
    void getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (!user) return;

    form.reset({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      website: user.website || '',
      jobTitle: user.jobTitle || '',
      company: user.company || '',
      companySize: user.companySize || '',
      industry: user.industry || '',
      experience: user.experience || '',
      education: user.education || '',
    });

    setSkills(Array.isArray(user.skills) ? user.skills : []);
    setPreferences((prev) => ({
      ...prev,
      ...(user.preferences || {}),
    }));
  }, [form, user]);

  const resumeViewUrl =
    user?.resumeUrl &&
    resolveAssetUrl(user.resumeUrl);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarUploading(true);
    try {
      const response = await axios.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const avatarUrl = response.data?.data?.avatar;
      if (avatarUrl) {
        setAvatarPreview(avatarUrl);
        await getProfile();
      }
      toast({
        title: 'Profile photo uploaded',
        description: 'Your profile photo has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Photo upload failed',
        description: error.response?.data?.message || error.response?.data?.error || 'Could not upload your profile photo.',
        variant: 'destructive',
      });
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      toast({
        title: 'Resume not selected',
        description: 'Choose a PDF or Word file first.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    setResumeUploading(true);
    try {
      await axios.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await getProfile();
      setResumeFile(null);
      toast({
        title: 'Resume uploaded',
        description: 'Your resume is now attached to your profile.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || error.response?.data?.error || 'Could not upload resume.',
        variant: 'destructive',
      });
    } finally {
      setResumeUploading(false);
    }
  };

  const addSkill = (skillValue?: string) => {
    const value = (skillValue ?? newSkill).trim();
    if (!value || skills.includes(value)) return;
    setSkills((prev) => [...prev, value]);
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      await updateProfile({
        ...data,
        website: data.website.trim(),
        company: data.company.trim(),
        companySize: data.companySize.trim(),
        industry: data.industry.trim(),
        experience: data.experience.trim(),
        education: data.education.trim(),
        avatar: avatarPreview || user?.avatar,
        skills,
        preferences,
      });

      await getProfile();

      toast({
        title: 'Profile saved',
        description: profileComplete
          ? 'Your profile has been updated successfully.'
          : 'Your progress has been saved. Complete the remaining fields to continue.',
      });
    } catch (error: any) {
      toast({
        title: 'Could not save profile',
        description:
          error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          error.message ||
          'Please review the form and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8" style={pageShellStyle}>
      <AnimatedSection>
        <div className={heroClass}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className={cn('text-2xl', darkTheme ? 'bg-primary/20 text-primary-foreground' : 'bg-primary/10 text-foreground')}>
                    {user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90"
                >
                  {avatarUploading ? <LoadingSpinner size="sm" /> : <Camera className="h-4 w-4" />}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Professional Profile</p>
                  <h1 className="text-3xl font-semibold">{user?.name || 'Your profile'}</h1>
                  <p className="mt-1 text-muted-foreground">
                    {user?.jobTitle || (isJobSeeker ? 'Job Seeker' : 'Employer')} {user?.company ? `at ${user.company}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <span className={pillClass}>
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </span>
                  {user?.location && (
                    <span className={pillClass}>
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </span>
                  )}
                  <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm', darkTheme ? 'bg-primary/18 text-primary-foreground' : 'bg-primary/10 text-primary')}>
                    <Sparkles className="h-4 w-4" />
                    {isJobSeeker ? 'Candidate account' : 'Employer account'}
                  </span>
                </div>
              </div>
            </div>

            <div className={cn('w-full max-w-sm space-y-3 rounded-2xl p-5 backdrop-blur', darkTheme ? 'bg-background/55' : 'bg-background/80')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion status</p>
                  <p className="text-2xl font-semibold">{completionPercent}%</p>
                </div>
                {profileComplete ? (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary">Ready</Badge>
                ) : (
                  <Badge variant="secondary" className={cn(darkTheme ? 'bg-primary/18 text-primary-foreground hover:bg-primary/18' : 'bg-primary/12 text-primary hover:bg-primary/12')}>
                    Action needed
                  </Badge>
                )}
              </div>
              <Progress value={completionPercent} className={cn(darkTheme ? 'bg-background/60' : 'bg-background/70')} />
              <p className="text-sm text-muted-foreground">
                Complete the remaining required fields to unlock all platform features.
              </p>
              <p className="text-xs text-muted-foreground">
                Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <AnimatedSection delay={0.05}>
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Profile checklist
                </CardTitle>
                <CardDescription>
                  These items must be completed before you can use the rest of the portal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {missingFields.length === 0 ? (
                  <div className={cn('rounded-2xl px-4 py-3 text-sm', darkTheme ? 'bg-primary/14 text-primary-foreground' : 'bg-primary/10 text-primary')}>
                    Your profile is complete and ready to use.
                  </div>
                ) : (
                  missingFields.map((field) => (
                    <div
                      key={field}
                      className={cn('flex items-center justify-between rounded-xl border px-3 py-2', darkTheme ? 'border-border/70 bg-background/45' : 'border-border bg-background/80')}
                    >
                      <span className="text-sm font-medium text-foreground">{fieldLabels[field] || field}</span>
                      <Badge variant="outline" className={cn(darkTheme ? 'border-primary/30 text-primary-foreground' : 'border-primary/30 text-primary')}>
                        Pending
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isJobSeeker ? <FileText className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                  {isJobSeeker ? 'Resume' : 'Company snapshot'}
                </CardTitle>
                <CardDescription>
                  {isJobSeeker
                    ? 'Upload a resume so employers can review your profile.'
                    : 'Keep your employer details polished and trustworthy.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isJobSeeker ? (
                  <>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                    />
                    <Button
                      type="button"
                      onClick={handleResumeUpload}
                      disabled={resumeUploading || !resumeFile}
                      className="w-full"
                    >
                      {resumeUploading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Uploading
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload resume
                        </>
                      )}
                    </Button>
                    {resumeViewUrl ? (
                      <a
                        href={resumeViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex text-sm font-medium text-primary underline"
                      >
                        View current resume
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
                    )}
                  </>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className={softPanelClass}>
                      <p className={sectionTitleClass}>Company</p>
                      <p>{user?.company || 'Add your company name in the form.'}</p>
                    </div>
                    <div className={softPanelClass}>
                      <p className={sectionTitleClass}>Industry</p>
                      <p>{user?.industry || 'Select your industry to complete the profile.'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.12}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal information
                </CardTitle>
                <CardDescription>Present yourself the way recruiters and candidates expect on a modern job portal.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register('email')} />
                  {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...form.register('phone')} />
                  {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...form.register('location')} />
                  {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">{isJobSeeker ? 'Current / Target Job Title' : 'Your Role'}</Label>
                  <Input id="jobTitle" {...form.register('jobTitle')} />
                  {form.formState.errors.jobTitle && <p className="text-sm text-destructive">{form.formState.errors.jobTitle.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website / Portfolio</Label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="website" className="pl-9" placeholder="https://your-portfolio.com" {...form.register('website')} />
                  </div>
                  {form.formState.errors.website && <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Professional Summary</Label>
                  <Textarea
                    id="bio"
                    rows={5}
                    placeholder={isJobSeeker ? 'Write a concise summary of your experience, skills, and career goals.' : 'Describe your company, hiring focus, and what candidates can expect.'}
                    {...form.register('bio')}
                  />
                  {form.formState.errors.bio && <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {isJobSeeker ? 'Career details' : 'Company details'}
                </CardTitle>
                <CardDescription>
                  {isJobSeeker
                    ? 'Show your background clearly so employers understand your fit.'
                    : 'Build trust with complete company and recruiter information.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                {isJobSeeker ? (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="experience">Experience</Label>
                      <Textarea
                        id="experience"
                        rows={4}
                        placeholder="Summarize your work experience, achievements, and responsibilities."
                        {...form.register('experience')}
                      />
                      {form.formState.errors.experience && <p className="text-sm text-destructive">{form.formState.errors.experience.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="education">Education</Label>
                      <Textarea
                        id="education"
                        rows={3}
                        placeholder="Add your degree, institution, certifications, or training."
                        {...form.register('education')}
                      />
                      {form.formState.errors.education && <p className="text-sm text-destructive">{form.formState.errors.education.message}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" {...form.register('company')} />
                      {form.formState.errors.company && <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select
                        value={form.watch('companySize')}
                        onValueChange={(value) => form.setValue('companySize', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                      >
                        <SelectTrigger id="companySize">
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
                      {form.formState.errors.companySize && <p className="text-sm text-destructive">{form.formState.errors.companySize.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={form.watch('industry')}
                        onValueChange={(value) => form.setValue('industry', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                      >
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.industry && <p className="text-sm text-destructive">{form.formState.errors.industry.message}</p>}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Skills and focus areas
                </CardTitle>
                <CardDescription>Add the capabilities that should appear on your profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={newSkill}
                    onChange={(event) => setNewSkill(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Add a skill"
                  />
                  <Button type="button" onClick={() => addSkill()} className="sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add skill
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.filter((skill) => !skills.includes(skill)).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className={cn(
                        'cursor-pointer px-3 py-1 transition-colors',
                        darkTheme ? 'border-border/70 hover:border-primary hover:bg-primary/15 hover:text-primary-foreground' : 'border-border hover:border-primary hover:bg-primary hover:text-primary-foreground',
                      )}
                      onClick={() => addSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className={cn('rounded-2xl border border-dashed p-4', darkTheme ? 'border-border/70 bg-background/35' : 'border-border bg-background/70')}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className={sectionTitleClass}>Selected skills</p>
                    <Badge variant="secondary">{skills.length}</Badge>
                  </div>
                  {skills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Add at least one skill to strengthen your profile.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-2 px-3 py-1">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="rounded-full hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* <Card className={mainCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Preferences and privacy
                </CardTitle>
                <CardDescription>Fine-tune visibility and platform behavior.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Preferred job types</Label>
                  <div className="flex flex-wrap gap-2">
                    {['full-time', 'part-time', 'contract', 'remote', 'hybrid'].map((type) => {
                      const active = preferences.jobTypes.includes(type);
                      return (
                        <Badge
                          key={type}
                          variant={active ? 'default' : 'outline'}
                          className="cursor-pointer px-3 py-1"
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              jobTypes: active
                                ? prev.jobTypes.filter((item) => item !== type)
                                : [...prev.jobTypes, type],
                            }))
                          }
                        >
                          {type}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>
                    Salary range: ${preferences.salaryRange[0].toLocaleString()} - ${preferences.salaryRange[1].toLocaleString()}
                  </Label>
                  <Slider
                    value={preferences.salaryRange}
                    onValueChange={(value: number[]) => setPreferences((prev) => ({ ...prev, salaryRange: value }))}
                    min={30000}
                    max={300000}
                    step={5000}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-2xl border p-4">
                    <div>
                      <p className="font-medium">Profile visibility</p>
                      <p className="text-sm text-muted-foreground">Allow others to discover your profile.</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.profileVisible}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences((prev) => ({
                          ...prev,
                          privacy: { ...prev.privacy, profileVisible: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border p-4">
                    <div>
                      <p className="font-medium">Show contact details</p>
                      <p className="text-sm text-muted-foreground">Let recruiters reach out directly.</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.showContact}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences((prev) => ({
                          ...prev,
                          privacy: { ...prev.privacy, showContact: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border p-4">
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-sm text-muted-foreground">Receive application and job updates.</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border p-4">
                    <div>
                      <p className="font-medium">Job alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified about matching roles.</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.jobAlerts}
                      onCheckedChange={(checked: boolean) =>
                        setPreferences((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, jobAlerts: checked },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card> */}

            <div className="sticky bottom-4 z-10">
              <div className={cn('rounded-2xl border p-4 shadow-lg backdrop-blur', darkTheme ? 'border-primary/15 bg-card/88' : 'border-border/80 bg-background/95')}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Save your profile progress</p>
                    <p className="text-sm text-muted-foreground">
                      You can save now and continue editing. Access stays locked until all required fields are complete.
                    </p>
                  </div>
                  <Button type="submit" disabled={isSaving} className="min-w-40">
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Profile;
