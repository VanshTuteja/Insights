import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Camera, 
  Plus, 
  X, 
  Save, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase,
  GraduationCap,
  Award,
  Settings,
  Bell,
  Shield,
  Palette
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
});

const Profile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js', 'Python']);
  const [newSkill, setNewSkill] = useState('');
  const [preferences, setPreferences] = useState({
    jobTypes: ['full-time', 'remote'],
    salaryRange: [80000, 150000],
    locations: ['San Francisco', 'Remote'],
    industries: ['Technology', 'Startups'],
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
    }
  });
  
  const { user, updateProfile } = useAuthStore();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      website: user?.website || '',
      jobTitle: user?.jobTitle || '',
      company: user?.company || '',
      experience: user?.experience || '',
      education: user?.education || '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        jobTitle: user.jobTitle || '',
        company: user.company || '',
        experience: user.experience || '',
        education: user.education || '',
      });
      if (user.skills) setSkills(user.skills);
      if (user.preferences) setPreferences({ ...preferences, ...user.preferences });
    }
  }, [user, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      toast({
        title: 'Skill added',
        description: `${newSkill.trim()} has been added to your skills.`,
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
    toast({
      title: 'Skill removed',
      description: `${skillToRemove} has been removed from your skills.`,
    });
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedUser = {
        ...user!,
        ...data,
        avatar: avatarPreview || user?.avatar,
        skills,
        preferences,
      };
      
      updateProfile(updatedUser);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const skillSuggestions = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Vue.js', 'Angular',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'MongoDB',
    'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'Machine Learning', 'Data Science', 'UI/UX Design',
    'Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication'
  ];

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your profile information, skills, and job preferences
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Skills</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={avatarPreview || user?.avatar} />
                        <AvatarFallback className="text-4xl">{user?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 p-3 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                      >
                        <Camera className="h-5 w-5 text-white" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground">Click the camera icon to change your photo</p>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        {...form.register('name')}
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...form.register('email')}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter your phone number"
                        {...form.register('phone')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Enter your location"
                        {...form.register('location')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g. Senior Frontend Developer"
                        {...form.register('jobTitle')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Current Company</Label>
                      <Input
                        id="company"
                        placeholder="Enter your current company"
                        {...form.register('company')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://your-website.com"
                      {...form.register('website')}
                    />
                    {form.formState.errors.website && (
                      <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      rows={4}
                      {...form.register('bio')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience</Label>
                    <Textarea
                      id="experience"
                      placeholder="Describe your work experience..."
                      rows={3}
                      {...form.register('experience')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Textarea
                      id="education"
                      placeholder="Describe your educational background..."
                      rows={3}
                      {...form.register('education')}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
                <CardDescription>Add your technical and professional skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1"
                    />
                    <Button onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Suggested Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {skillSuggestions.filter(skill => !skills.includes(skill)).slice(0, 10).map((skill) => (
                        <Badge 
                          key={skill}
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => {
                            setSkills([...skills, skill]);
                            toast({
                              title: 'Skill added',
                              description: `${skill} has been added to your skills.`,
                            });
                          }}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Your Skills ({skills.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <motion.div
                          key={skill}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          layout
                        >
                          <Badge 
                            variant="secondary" 
                            className="cursor-pointer group hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => removeSkill(skill)}
                          >
                            {skill}
                            <X className="h-3 w-3 ml-1 group-hover:text-destructive-foreground" />
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Preferences</CardTitle>
                  <CardDescription>Set your job search preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Preferred Job Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {['full-time', 'part-time', 'contract', 'remote', 'hybrid'].map((type) => (
                        <Badge
                          key={type}
                          variant={preferences.jobTypes.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newJobTypes = preferences.jobTypes.includes(type)
                              ? preferences.jobTypes.filter(t => t !== type)
                              : [...preferences.jobTypes, type];
                            setPreferences({ ...preferences, jobTypes: newJobTypes });
                          }}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Salary Range: ${preferences.salaryRange[0].toLocaleString()} - ${preferences.salaryRange[1].toLocaleString()}</Label>
                    <Slider
                      value={preferences.salaryRange}
                      onValueChange={(value: any) => setPreferences({ ...preferences, salaryRange: value })}
                      max={300000}
                      min={30000}
                      step={5000}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Industries</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Technology', 'Healthcare', 'Finance', 'Education', 'Startups', 'Enterprise'].map((industry) => (
                        <Badge
                          key={industry}
                          variant={preferences.industries.includes(industry) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newIndustries = preferences.industries.includes(industry)
                              ? preferences.industries.filter(i => i !== industry)
                              : [...preferences.industries, industry];
                            setPreferences({ ...preferences, industries: newIndustries });
                          }}
                        >
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.email}
                        onCheckedChange={(checked: any) => 
                          setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, email: checked }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.push}
                        onCheckedChange={(checked: any) => 
                          setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, push: checked }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Job Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about new job matches</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.jobAlerts}
                        onCheckedChange={(checked: any) => 
                          setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, jobAlerts: checked }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Messages</Label>
                        <p className="text-sm text-muted-foreground">Notifications for new messages</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.messages}
                        onCheckedChange={(checked: any) => 
                          setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, messages: checked }
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Make your profile visible to employers</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.profileVisible}
                      onCheckedChange={(checked: any) => 
                        setPreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, profileVisible: checked }
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Salary Expectations</Label>
                      <p className="text-sm text-muted-foreground">Display your salary range to employers</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.showSalary}
                      onCheckedChange={(checked: any) => 
                        setPreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, showSalary: checked }
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Contact Information</Label>
                      <p className="text-sm text-muted-foreground">Allow employers to see your contact details</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.showContact}
                      onCheckedChange={(checked: any) => 
                        setPreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, showContact: checked }
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AnimatedSection>
    </div>
  );
};

export default Profile;