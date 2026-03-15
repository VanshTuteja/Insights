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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import OTPDialog from './OTPDialog';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { isProfileComplete } from '@/lib/profileCompletion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['jobseeker', 'employer']),
});

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<any>(null);
  
  const { login, signup, resendOTP, isLoading, clearError } = useAuthStore();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', role: 'jobseeker' as const },
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      clearError();
      await login(data.email, data.password);
      const loggedInUser = useAuthStore.getState().user;
      onOpenChange(false);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      if (!isProfileComplete(loggedInUser)) {
        navigate('/profile');
      } else if (loggedInUser?.role === 'employer') {
        navigate('/employer');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        // Proactively resend OTP for login attempts on unverified accounts
        try {
          await resendOTP(data.email, 'verify-email');
          setPendingSignupData({
            name: '',
            email: data.email,
            password: data.password,
          });
          setOtpDialogOpen(true);
          toast({
            title: 'Verify Your Email',
            description: 'Please verify your email. We have sent you a new verification code.',
          });
        } catch (resendError: any) {
          toast({
            title: 'Verification Required',
            description:
              resendError.message ||
              'Please verify your email first. Failed to resend verification code.',
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onSignup = async (data: z.infer<typeof signupSchema>) => {
    try {
      clearError();
      setPendingSignupData(data);
      await signup(data.name, data.email, data.password, data.role);
      setOtpDialogOpen(true);
      toast({
        title: 'OTP Sent',
        description: 'Please check your email for the verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOTPVerified = () => {
    setOtpDialogOpen(false);
    onOpenChange(false);
    toast({
      title: 'Account Created!',
      description: 'Verify your details to complete your profile before using the platform.',
    });
    navigate('/profile');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md glass">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to JobFinder AI
            </DialogTitle>
            <DialogDescription className="text-center">
              Join thousands of professionals finding their dream jobs
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...loginForm.register('email')}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      {...loginForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Forgot Password?
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-secondary shadow-premium"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      placeholder="Enter your full name"
                      className="pl-10"
                      {...signupForm.register('name')}
                    />
                  </div>
                  {signupForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{signupForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...signupForm.register('email')}
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      className="pl-10 pr-10"
                      {...signupForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>I want to use JobFinder AI as *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => signupForm.setValue('role', 'jobseeker')}
                      className={`text-left rounded-lg border p-4 transition-all ${
                        signupForm.watch('role') === 'jobseeker'
                          ? 'border-primary bg-primary/5 shadow-premium'
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <p className="text-sm font-semibold">Candidate / Job Seeker</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Find jobs, apply, build resume, and prepare for interviews.
                      </p>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => signupForm.setValue('role', 'employer')}
                      className={`text-left rounded-lg border p-4 transition-all ${
                        signupForm.watch('role') === 'employer'
                          ? 'border-primary bg-primary/5 shadow-premium'
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <p className="text-sm font-semibold">Employer / Recruiter</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Post jobs, view applicants, and schedule interviews.
                      </p>
                    </motion.button>
                  </div>
                  {signupForm.formState.errors.role && (
                    <p className="text-sm text-destructive">{signupForm.formState.errors.role.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-secondary shadow-premium"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <OTPDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        email={pendingSignupData?.email}
        onVerified={handleOTPVerified}
      />

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </>
  );
};

export default AuthDialog;
