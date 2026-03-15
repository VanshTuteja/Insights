import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Mail, RefreshCw } from 'lucide-react';

interface OTPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
  onVerified: () => void;
}

const OTPDialog: React.FC<OTPDialogProps> = ({ open, onOpenChange, email, onVerified }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [expiryTimeLeft, setExpiryTimeLeft] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyEmailOTP, resendOTP, isLoading } = useAuthStore();

  useEffect(() => {
    if (open) {
      setExpiryTimeLeft(300);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setExpiryTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the complete 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await verifyEmailOTP(email!, otpCode);
      onVerified();
      toast({
        title: 'Email Verified',
        description: 'Your email has been successfully verified.',
      });
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(email!, 'verify-email');
      setOtp(['', '', '', '', '', '']);
      setExpiryTimeLeft(300);
      setResendCooldown(60);
      toast({
        title: 'OTP Resent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Resend',
        description: error.message || 'Failed to resend OTP. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Verify Your Email
          </DialogTitle>
          <DialogDescription className="text-center">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-4 bg-primary/10 rounded-full"
            >
              <Mail className="h-8 w-8 text-primary" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-bold border-2 focus:border-primary"
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Expires in: <span className="font-mono font-bold text-primary">{formatTime(expiryTimeLeft)}</span>
              </p>
            </div>

            <Button
              onClick={handleVerify}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-primary to-secondary shadow-premium"
            >
              {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Verify Email
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleResendOTP}
                disabled={isLoading || resendCooldown > 0}
                className="text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPDialog;