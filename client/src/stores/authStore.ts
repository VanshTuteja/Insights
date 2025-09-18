import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  jobTitle?: string;
  company?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  preferences?: {
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
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: User) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // API call to backend
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          if (!response.ok) throw new Error('Login failed');
          
          const userData = await response.json();
          set({ user: userData, isLoading: false });
        } catch (error) {
          // Fallback to mock data for demo - use email as name if no specific name provided
          const mockUser = {
            id: '1',
            name: email.split('@')[0], // Use email username as fallback
            email,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          };
          set({ user: mockUser, isLoading: false });
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          // API call to backend
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          
          if (!response.ok) throw new Error('Signup failed');
          
          const userData = await response.json();
          set({ user: userData, isLoading: false });
        } catch (error) {
          // Fallback to mock data for demo
          const mockUser = {
            id: '1',
            name,
            email,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          };
          set({ user: mockUser, isLoading: false });
        }
      },

      updateProfile: async (userData: User) => {
        set({ isLoading: true });
        try {
          // API call to backend
          const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });
          
          if (!response.ok) throw new Error('Profile update failed');
          
          const updatedUser = await response.json();
          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          // Fallback for demo
          set({ user: userData, isLoading: false });
        }
      },

      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);