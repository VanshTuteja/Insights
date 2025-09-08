import { create } from 'zustand';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  description: string;
  postedTime: string;
}

interface JobState {
  jobs: Job[];
  savedJobs: string[];
  isLoading: boolean;
  fetchJobs: () => Promise<void>;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  applyToJob: (jobId: string) => Promise<void>;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  savedJobs: [],
  isLoading: false,

  fetchJobs: async () => {
    set({ isLoading: true });
    try {
      // API call to backend
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const jobs = await response.json();
        set({ jobs, isLoading: false });
      } else {
        throw new Error('Failed to fetch jobs');
      }
    } catch (error) {
      // Fallback to mock data
      const mockJobs = [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          salary: '$120k - $160k',
          type: 'Full-time',
          tags: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
          description: 'We are looking for an experienced frontend developer to join our growing team and help build the next generation of web applications.',
          postedTime: '2 hours ago',
        },
        // Add more mock jobs...
      ];
      set({ jobs: mockJobs, isLoading: false });
    }
  },

  saveJob: async (jobId: string) => {
    try {
      // API call to backend
      await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      
      const { savedJobs } = get();
      set({ savedJobs: [...savedJobs, jobId] });
    } catch (error) {
      // Fallback for demo
      const { savedJobs } = get();
      set({ savedJobs: [...savedJobs, jobId] });
    }
  },

  unsaveJob: async (jobId: string) => {
    try {
      // API call to backend
      await fetch('/api/jobs/unsave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      
      const { savedJobs } = get();
      set({ savedJobs: savedJobs.filter(id => id !== jobId) });
    } catch (error) {
      // Fallback for demo
      const { savedJobs } = get();
      set({ savedJobs: savedJobs.filter(id => id !== jobId) });
    }
  },

  applyToJob: async (jobId: string) => {
    try {
      // API call to backend
      await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
    } catch (error) {
      console.error('Failed to apply to job:', error);
    }
  },
}));