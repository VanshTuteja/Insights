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
import { useAuthStore } from '@/stores/authStore';
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
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
    `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${user.resumeUrl}`;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
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
        description: error.response?.data?.message || 'Could not upload resume.',
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
    <div className="space-y-8">
      <AnimatedSection>
        <div className="rounded-3xl border bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94))] px-6 py-8 text-white shadow-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white/15 shadow-lg">
                  <AvatarImage src={avatarPreview || user?.avatar} />
                  <AvatarFallback className="bg-white/10 text-2xl text-white">
                    {user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg transition hover:bg-amber-300"
                >
                  <Camera className="h-4 w-4" />
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
                  <p className="text-sm uppercase tracking-[0.2em] text-white/60">Professional Profile</p>
                  <h1 className="text-3xl font-semibold">{user?.name || 'Your profile'}</h1>
                  <p className="mt-1 text-white/75">
                    {user?.jobTitle || (isJobSeeker ? 'Job Seeker' : 'Employer')} {user?.company ? `at ${user.company}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-white/80">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </span>
                  {user?.location && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">
                    <Sparkles className="h-4 w-4" />
                    {isJobSeeker ? 'Candidate account' : 'Employer account'}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-3 rounded-2xl bg-white/8 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Completion status</p>
                  <p className="text-2xl font-semibold">{completionPercent}%</p>
                </div>
                {profileComplete ? (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Ready</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-300 text-slate-900 hover:bg-amber-300">
                    Action needed
                  </Badge>
                )}
              </div>
              <Progress value={completionPercent} className="bg-white/15" />
              <p className="text-sm text-white/70">
                Complete the remaining required fields to unlock all platform features.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <AnimatedSection delay={0.05}>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Profile checklist
                </CardTitle>
                <CardDescription>
                  These items must be completed before you can use the rest of the portal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {missingFields.length === 0 ? (
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Your profile is complete and ready to use.
                  </div>
                ) : (
                  missingFields.map((field) => (
                    <div
                      key={field}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-slate-700">{fieldLabels[field] || field}</span>
                      <Badge variant="outline" className="border-amber-300 text-amber-700">
                        Pending
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className="border-slate-200 shadow-sm">
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
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="font-medium text-slate-900">Company</p>
                      <p>{user?.company || 'Add your company name in the form.'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="font-medium text-slate-900">Industry</p>
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
            <Card className="border-slate-200 shadow-sm">
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

            <Card className="border-slate-200 shadow-sm">
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
                        onValueChange={(value) => form.setValue('companySize', value, { shouldValidate: true })}
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
                        onValueChange={(value) => form.setValue('industry', value, { shouldValidate: true })}
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

            <Card className="border-slate-200 shadow-sm">
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
                      className="cursor-pointer border-slate-300 px-3 py-1 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                      onClick={() => addSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-slate-900">Selected skills</p>
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

            <Card className="border-slate-200 shadow-sm">
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
            </Card>

            <div className="sticky bottom-4 z-10">
              <div className="rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">Save your profile progress</p>
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
