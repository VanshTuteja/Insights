// User Types
export interface User {
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
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferences {
  jobTypes: string[];
  salaryRange: number[];
  locations: string[];
  industries: string[];
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  jobAlerts: boolean;
  messages: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  showSalary: boolean;
  showContact: boolean;
}

// Job Types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  tags: string[];
  description: string;
  requirements?: string;
  benefits?: string;
  postedTime: string;
  employerId: string;
  applications?: number;
  views?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Application Types
export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  appliedAt: Date;
  coverLetter?: string;
  resume?: string;
}

// Interview Types
export interface Interview {
  id: string;
  jobId: string;
  candidateId: string;
  interviewerId: string;
  scheduledAt: Date;
  duration: number;
  type: 'phone' | 'video' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  location?: string;
}

// Theme Types
export type Theme = 'classic-light' | 'classic-dark' | 'ocean' | 'sunset' | 'forest';

export interface ThemeConfig {
  name: Theme;
  label: string;
  primary: string;
  secondary: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
}

export interface ProfileForm {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  jobTitle?: string;
  company?: string;
  experience?: string;
  education?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'job' | 'interview' | 'message' | 'system';
  read: boolean;
  createdAt: Date;
  data?: any;
}