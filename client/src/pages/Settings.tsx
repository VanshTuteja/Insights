import React from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/stores/authStore';
import { Bell, Globe, Lock, Settings2, ShieldCheck } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const isEmployer = user?.role === 'employer';

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
              <Settings2 className="mr-2 h-3.5 w-3.5" />
              Account Settings
            </Badge>
            <Badge variant="outline">{isEmployer ? 'Employer' : 'Job Seeker'}</Badge>
          </div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage notification preferences, account safety, and the core platform settings for your profile.
          </p>
        </div>
      </AnimatedSection>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AnimatedSection delay={0.08}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want platform updates to reach you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                ['Job recommendations', 'Receive curated role suggestions based on your profile.'],
                ['Application updates', 'Get notified when an application status changes.'],
                ['Interview reminders', 'Stay updated on interview schedules and reminders.'],
                ['Email alerts', 'Receive important updates in your inbox.'],
              ].map(([title, description]) => (
                <div key={title} className="flex items-center justify-between rounded-2xl border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.12}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Account Overview
              </CardTitle>
              <CardDescription>Quick summary of your current account setup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
                <p className="mt-2 font-medium">{user?.email}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Profile type</p>
                <p className="mt-2 font-medium capitalize">{user?.role}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-2 font-medium">Active</p>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnimatedSection delay={0.16}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Keep your account protected.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input id="current-password" type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm new password" />
              </div>
              <Button className="w-full">Update password</Button>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Preferences
              </CardTitle>
              <CardDescription>Control language and account-level experience settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border p-4">
                <p className="font-medium">Language</p>
                <p className="mt-1 text-sm text-muted-foreground">English</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="font-medium">Time zone</p>
                <p className="mt-1 text-sm text-muted-foreground">Asia/Calcutta</p>
              </div>
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="font-medium text-destructive">Deactivate account</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If you no longer want to use the platform, contact support before removing your account permanently.
                </p>
                <Button variant="destructive" className="mt-4">Deactivate account</Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Settings;
