import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { isProfileComplete } from '@/lib/profileCompletion';
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
import Settings from './components/Settings';
import Profile from './pages/Profile';
import HelpSupport from './pages/HelpSupport';
import Applications from './pages/Applications';

const AppRoutes: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <LandingPage />;
  }

  const isJobSeeker = user.role === 'jobseeker';
  const isEmployer = user.role === 'employer';
  const profileComplete = isProfileComplete(user);
  const allowIncompleteRoute = ['/profile', '/help', '/settings'].includes(location.pathname);

  if (!profileComplete && !allowIncompleteRoute) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            !profileComplete ? (
              <Navigate to="/profile" replace />
            ) : isEmployer ? (
              <Navigate to="/employer" replace />
            ) : (
              <Dashboard />
            )
          }
        />

        {/* Job seeker routes */}
        <Route
          path="jobs"
          element={isJobSeeker ? <Jobs /> : <Navigate to={isEmployer ? '/employer' : '/'} replace />}
        />
        <Route
          path="saved"
          element={isJobSeeker ? <SavedJobs /> : <Navigate to={isEmployer ? '/employer' : '/'} replace />}
        />
        <Route
          path="applications"
          element={isJobSeeker ? <Applications /> : <Navigate to={isEmployer ? '/employer' : '/'} replace />}
        />
        <Route
          path="interviews"
          element={isJobSeeker ? <Interviews /> : <Navigate to={isEmployer ? '/employer' : '/'} replace />}
        />
        <Route
          path="resume"
          element={isJobSeeker ? <ResumeBuilder /> : <Navigate to={isEmployer ? '/employer' : '/'} replace />}
        />
        <Route
          path="interview"
          element={isJobSeeker ? <InterviewPrep /> : <Navigate to={isEmployer ? '/employer' : '/'} replace />}
        />
        <Route
          path="insights"
          element={isJobSeeker || isEmployer ? <Insights /> : <Navigate to="/" replace />}
        />

        {/* Employer routes */}
        <Route
          path="employer"
          element={isEmployer ? <EmployerDashboard /> : <Navigate to="/" replace />}
        />
        {/* <Route path="messaging" element={<Messaging />} /> */}
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<HelpSupport />} />
      </Route>
    </Routes>
  );
};

function App() {
  // Initialize theme on app start
  React.useEffect(() => {
    const { theme } = useThemeStore.getState();
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <Router >
      <AppRoutes />
    </Router>
  );
}

export default App;
