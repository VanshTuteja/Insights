import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import { Bell, LogOut, Palette, Save, Shield, Trash2, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SettingsForm = {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  bio: string;
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

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout, getProfile } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const themes = useThemeStore((state) => state.themes);
  const setTheme = useThemeStore((state) => state.setTheme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<SettingsForm>({
    name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    bio: '',
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
  });

  useEffect(() => {
    void getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      website: user.website || '',
      bio: user.bio || '',
      notifications: {
        email: user.preferences?.notifications?.email ?? true,
        push: user.preferences?.notifications?.push ?? true,
        jobAlerts: user.preferences?.notifications?.jobAlerts ?? true,
        messages: user.preferences?.notifications?.messages ?? true,
      },
      privacy: {
        profileVisible: user.preferences?.privacy?.profileVisible ?? true,
        showSalary: user.preferences?.privacy?.showSalary ?? false,
        showContact: user.preferences?.privacy?.showContact ?? true,
      },
    });
  }, [user]);

  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.22), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.16), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.94) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.12), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.18), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.72) 52%, hsl(var(--background)) 100%)',
  };
  const heroClass = cn(
    'rounded-3xl border px-6 py-6 shadow-premium-lg backdrop-blur-xl',
    darkTheme ? 'border-primary/20 bg-card/80' : 'border-primary/10 bg-card/90',
  );
  const cardClass = cn(
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95',
  );

  const updateNested = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
        bio: form.bio.trim(),
        preferences: {
          preferredRoles: user?.preferences?.preferredRoles || [],
          jobTypes: user?.preferences?.jobTypes || [],
          salaryRange: user?.preferences?.salaryRange || [50000, 150000],
          locations: user?.preferences?.locations || [],
          industries: user?.preferences?.industries || [],
          notifications: form.notifications,
          privacy: form.privacy,
        },
      });
      await getProfile();
      toast({
        title: 'Settings updated',
        description: 'Your preferences and account details have been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Could not save settings',
        description: error.message || 'Please review your changes and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await axios.delete('/auth/account');
      logout();
      toast({
        title: 'Account deleted',
        description: 'Your account has been removed successfully.',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.message || 'Could not delete your account right now.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8" style={pageShellStyle}>
      <AnimatedSection>
        <div className={heroClass}>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manage your account details, privacy, notifications, and appearance from one place.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Active theme: <span className="font-medium text-foreground">{themePreview.label}</span>
          </p>
        </div>
      </AnimatedSection>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <AnimatedSection delay={0.05}>
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-primary" />
                  Account Details
                </CardTitle>
                <CardDescription>Keep your account information accurate and up to date.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Full Name</Label>
                  <Input id="settings-name" value={form.name} onChange={(event) => updateNested('name', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input id="settings-email" type="email" value={form.email} onChange={(event) => updateNested('email', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-phone">Phone</Label>
                  <Input id="settings-phone" value={form.phone} onChange={(event) => updateNested('phone', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-location">Location</Label>
                  <Input id="settings-location" value={form.location} onChange={(event) => updateNested('location', event.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="settings-website">Website</Label>
                  <Input id="settings-website" value={form.website} onChange={(event) => updateNested('website', event.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="settings-bio">Bio</Label>
                  <Textarea id="settings-bio" rows={4} value={form.bio} onChange={(event) => updateNested('bio', event.target.value)} />
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>Choose which alerts you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {[
                  ['email', 'Email notifications', 'Receive updates by email'],
                  ['push', 'Push notifications', 'Get in-app push alerts'],
                  ['jobAlerts', 'Job alerts', 'Be notified about matching jobs'],
                  ['messages', 'Messages', 'Get notified when messages arrive'],
                ].map(([key, title, desc]) => (
                  <div key={key} className="flex items-center justify-between rounded-2xl border p-4">
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={form.notifications[key as keyof SettingsForm['notifications']]}
                      onCheckedChange={(checked) =>
                        updateNested('notifications', {
                          ...form.notifications,
                          [key]: checked,
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        <div className="space-y-6">
          <AnimatedSection delay={0.15}>
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy
                </CardTitle>
                <CardDescription>Control what others can see on your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ['profileVisible', 'Profile visible', 'Allow other users to discover your profile'],
                  ['showContact', 'Show contact details', 'Let employers or candidates contact you directly'],
                  ['showSalary', 'Show salary preferences', 'Display salary-related expectations where supported'],
                ].map(([key, title, desc]) => (
                  <div key={key} className="flex items-center justify-between rounded-2xl border p-4">
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={form.privacy[key as keyof SettingsForm['privacy']]}
                      onCheckedChange={(checked) =>
                        updateNested('privacy', {
                          ...form.privacy,
                          [key]: checked,
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription>Pick the theme that should drive the whole app UI.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.name}
                    type="button"
                    onClick={() => setTheme(themeOption.name)}
                    className={cn(
                      'rounded-2xl border p-4 text-left transition-all',
                      theme === themeOption.name
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border bg-background/70 hover:border-primary/40',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{themeOption.label}</p>
                      {theme === themeOption.name && <Badge className="bg-primary text-primary-foreground">Active</Badge>}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{themeOption.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.25}>
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Quick account-level actions when you need them.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
                <Button variant="destructive" className="w-full justify-start" disabled={isDeleting} onClick={handleDeleteAccount}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting account...' : 'Delete account'}
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>

      <div className="sticky bottom-4 z-10">
        <div className={cn('rounded-2xl border p-4 shadow-lg backdrop-blur', darkTheme ? 'border-primary/15 bg-card/88' : 'border-border/80 bg-background/95')}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Save your settings after changing privacy, notifications, or account details.</p>
            <Button onClick={handleSave} disabled={isSaving} className="min-w-40">
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
