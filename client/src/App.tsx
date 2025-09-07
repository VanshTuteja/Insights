import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/pages/Dashboard';
import Jobs from '@/pages/Jobs';
import SavedJobs from '@/pages/SavedJobs';
import Interviews from '@/pages/Interviews';
import ResumeBuilder from '@/pages/ResumeBuilder';
import InterviewPrep from '@/pages/InterviewPrep';
import Insights from '@/pages/Insights';
import EmployerDashboard from '@/pages/EmployerDashboard';
import Messaging from '@/pages/Messaging';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  // if (!user) {
  //   return <LandingPage />;
  // }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="saved" element={<SavedJobs />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="resume" element={<ResumeBuilder />} />
        <Route path="interview" element={<InterviewPrep />} />
        <Route path="insights" element={<Insights />} />
        <Route path="employer" element={<EmployerDashboard />} />
        <Route path="messaging" element={<Messaging />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;