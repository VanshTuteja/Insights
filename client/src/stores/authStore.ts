import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'jobseeker' | 'employer' | 'admin';
  avatar?: string;
  resumeUrl?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  jobTitle?: string;
  company?: string;
  companySize?: string;
  industry?: string;
  experience?: string;
  education?: string;
  skills: string[];
  preferences: {
    preferredRoles: string[];
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
  savedJobs: string[];
  appliedJobs: Array<{
    jobId: string;
    appliedAt: string;
    status: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  }>;
  isVerified: boolean;
  lastLoginAt?: string;
  profileCompleted?: boolean;
  missingProfileFields?: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: 'jobseeker' | 'employer') => Promise<void>;
  verifyEmailOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string, purpose?: 'verify-email' | 'reset-password') => Promise<void>;
  sendPasswordResetOTP: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  me: () => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  getProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/auth/login', { email, password });
          const { user, token } = response.data.data;
          
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ user, token, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          const code = error.response?.data?.data?.code;
          const status = error.response?.status;
          const err: any = new Error(errorMessage);
          if (code) err.code = code;
          if (status) err.status = status;
          throw err;
        }
      },

      signup: async (name: string, email: string, password: string, role: 'jobseeker' | 'employer' = 'jobseeker') => {
        set({ isLoading: true, error: null });
        try {
          await axios.post('/auth/signup', { name, email, password, role });
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Signup failed';
          set({ error: errorMessage, isLoading: false });
          const err: any = new Error(errorMessage);
          const code = error.response?.data?.data?.code;
          const status = error.response?.status;
          if (code) err.code = code;
          if (status) err.status = status;
          throw err;
        }
      },

      verifyEmailOTP: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/auth/verify-otp', { email, otp });
          const { user, token } = response.data.data;

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'OTP verification failed';
          set({ error: errorMessage, isLoading: false });
          const err: any = new Error(errorMessage);
          err.status = error.response?.status;
          throw err;
        }
      },

      resendOTP: async (email: string, purpose: 'verify-email' | 'reset-password' = 'verify-email') => {
        set({ isLoading: true, error: null });
        try {
          await axios.post('/auth/resend-otp', { email, purpose });
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to resend code';
          set({ error: errorMessage, isLoading: false });
          const err: any = new Error(errorMessage);
          err.status = error.response?.status;
          err.retryAfterSeconds = error.response?.data?.data?.retryAfterSeconds;
          throw err;
        }
      },

      sendPasswordResetOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post('/auth/forgot-password', { email });
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to send reset code';
          set({ error: errorMessage, isLoading: false });
          const err: any = new Error(errorMessage);
          err.status = error.response?.status;
          err.retryAfterSeconds = error.response?.data?.data?.retryAfterSeconds;
          throw err;
        }
      },

      resetPassword: async (email: string, otp: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post('/auth/reset-password', { email, otp, newPassword });
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Password reset failed';
          set({ error: errorMessage, isLoading: false });
          const err: any = new Error(errorMessage);
          err.status = error.response?.status;
          throw err;
        }
      },

      me: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get('/auth/me');
          const user = response.data.data;
          set({ user, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch user';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        // Remove token from axios headers
        delete axios.defaults.headers.common['Authorization'];
        set({ user: null, token: null, error: null });
      },

      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put('/auth/profile', userData);
          const updatedUser = response.data.data;
          
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      getProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get('/auth/profile');
          const user = response.data.data;
          
          set({ user, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
      onRehydrateStorage: () => (state) => {
        // Set token in axios headers when rehydrating
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
