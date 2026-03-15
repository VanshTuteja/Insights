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
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, Key } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const { sendPasswordResetOTP, resetPassword, isLoading } = useAuthStore();

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: '', password: '', confirmPassword: '' },
  });

  const onSendOTP = async (data: z.infer<typeof emailSchema>) => {
    try {
      await sendPasswordResetOTP(data.email);
      setEmail(data.email);
      setStep('reset');
      toast({
        title: 'OTP Sent',
        description: 'Please check your email for the password reset code.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Send OTP',
        description: error.message || 'Failed to send reset code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onResetPassword = async (data: z.infer<typeof resetSchema>) => {
    try {
      await resetPassword(email, data.otp, data.password);
      onOpenChange(false);
      setStep('email');
      emailForm.reset();
      resetForm.reset();
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully. Please login with your new password.',
      });
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('email');
    emailForm.reset();
    resetForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {step === 'email' ? 'Forgot Password' : 'Reset Password'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'email' 
              ? 'Enter your email address to receive a password reset code'
              : 'Enter the code sent to your email and your new password'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(onSendOTP)} className="space-y-4">
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-primary/10 rounded-full"
              >
                <Mail className="h-8 w-8 text-primary" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  {...emailForm.register('email')}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary shadow-premium"
            >
              {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Send Reset Code
            </Button>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="p-4 bg-primary/10 rounded-full"
              >
                <Key className="h-8 w-8 text-primary" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-otp">Verification Code</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-otp"
                  placeholder="Enter 6-digit code"
                  className="pl-10"
                  maxLength={6}
                  {...resetForm.register('otp')}
                />
              </div>
              {resetForm.formState.errors.otp && (
                <p className="text-sm text-destructive">{resetForm.formState.errors.otp.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  className="pl-10"
                  {...resetForm.register('password')}
                />
              </div>
              {resetForm.formState.errors.password && (
                <p className="text-sm text-destructive">{resetForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  className="pl-10"
                  {...resetForm.register('confirmPassword')}
                />
              </div>
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{resetForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-primary to-secondary shadow-premium"
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Reset Password
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;