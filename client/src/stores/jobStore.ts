import { create } from 'zustand';
import axios from 'axios';

interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  tags: string[];
  requirements: string;
  benefits: string;
  employerId: {
    _id: string;
    name: string;
    company: string;
  };
  applications: Array<{
    userId: string;
    appliedAt: string;
    status: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  }>;
  views: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isExternal?: boolean;
  source?: string;
  applyUrl?: string;
}

interface JobFilters {
  search?: string;
  location?: string;
  type?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  tags?: string[];
  page?: number;
  limit?: number;
}

interface JobState {
  jobs: Job[];
  savedJobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  // Actions
  fetchJobs: (filters?: JobFilters, append?: boolean) => Promise<void>;
  fetchJobById: (id: string) => Promise<void>;
  createJob: (jobData: Partial<Job>) => Promise<void>;
  updateJob: (id: string, jobData: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  applyToJob: (id: string, applicationData?: { coverLetter?: string; resume?: string }) => Promise<void>;
  saveJob: (id: string) => Promise<void>;
  fetchSavedJobs: () => Promise<void>;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  savedJobs: [],
  currentJob: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  fetchJobs: async (filters?: JobFilters, append = false) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.salary) params.append('salary', filters.salary);
      if (filters?.salaryMin) params.append('salaryMin', filters.salaryMin.toString());
      if (filters?.salaryMax) params.append('salaryMax', filters.salaryMax.toString());
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(`/jobs?${params.toString()}`);
      const { jobs, pagination } = response.data.data;
      
      set((state) => ({ 
        jobs: append ? [...state.jobs, ...jobs] : jobs, 
        pagination, 
        isLoading: false 
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch jobs';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchJobById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/jobs/${id}`);
      const job = response.data.data;
      
      set({ currentJob: job, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch job';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createJob: async (jobData: Partial<Job>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/jobs', jobData);
      const newJob = response.data.data;
      
      set(state => ({ 
        jobs: [newJob, ...state.jobs], 
        isLoading: false 
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create job';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateJob: async (id: string, jobData: Partial<Job>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/jobs/${id}`, jobData);
      const updatedJob = response.data.data;
      
      set(state => ({
        jobs: state.jobs.map(job => job._id === id ? updatedJob : job),
        currentJob: state.currentJob?._id === id ? updatedJob : state.currentJob,
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update job';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteJob: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/jobs/${id}`);
      
      set(state => ({
        jobs: state.jobs.filter(job => job._id !== id),
        currentJob: state.currentJob?._id === id ? null : state.currentJob,
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete job';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  applyToJob: async (id: string, applicationData?: { coverLetter?: string; resume?: string }) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`/jobs/${id}/apply`, applicationData);
      
      // Update the job in the store to reflect the application
      set(state => ({
        jobs: state.jobs.map(job => 
          job._id === id 
            ? { ...job, applications: [...job.applications, { userId: 'current-user', appliedAt: new Date().toISOString(), status: 'pending' as const }] }
            : job
        ),
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to apply to job';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  saveJob: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`/jobs/${id}/save`);
      
      // Refresh saved jobs
      await get().fetchSavedJobs();
      
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save job';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  fetchSavedJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/jobs/saved/list');
      const savedJobs = response.data.data;
      
      set({ savedJobs, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch saved jobs';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
