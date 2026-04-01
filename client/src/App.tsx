import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { isProfileComplete } from '@/lib/profileCompletion';
import LoadingSpinner from '@/components/LoadingSpinner';

const Layout = lazy(() => import('@/components/Layout/Layout'));
const LandingPage = lazy(() => import('@/components/LandingPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Jobs = lazy(() => import('@/pages/Jobs'));
const SavedJobs = lazy(() => import('@/pages/SavedJobs'));
const Interviews = lazy(() => import('@/pages/Interviews'));
const ResumeBuilder = lazy(() => import('@/pages/ResumeBuilder'));
const InterviewPrep = lazy(() => import('@/pages/InterviewPrep'));
const Insights = lazy(() => import('@/pages/Insights'));
const HelpSupport = lazy(() => import('@/pages/HelpSupport'));
const Settings = lazy(() => import('@/pages/Settings'));
const EmployerDashboard = lazy(() => import('@/pages/EmployerDashboard'));
const EmployerInterviews = lazy(() => import('@/pages/EmployerInterviews'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminInsights = lazy(() => import('@/pages/AdminInsights'));
const Profile = lazy(() => import('@/pages/Profile'));
const Applications = lazy(() => import('@/pages/Applications'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

const AppRoutes: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <LandingPage />
      </Suspense>
    );
  }

  const isJobSeeker = user.role === 'jobseeker';
  const isEmployer = user.role === 'employer';
  const isAdmin = user.role === 'admin';
  const profileComplete = isProfileComplete(user);
  const allowIncompleteRoute = ['/profile', '/admin', '/admin/insights'].includes(location.pathname);

  if (!isAdmin && !profileComplete && !allowIncompleteRoute) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : !profileComplete ? (
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
        <Route
          path="settings"
          element={isJobSeeker || isEmployer ? <Settings /> : <Navigate to="/" replace />}
        />
        <Route
          path="help"
          element={isJobSeeker || isEmployer ? <HelpSupport /> : <Navigate to="/" replace />}
        />

        {/* Employer routes */}
        <Route
          path="employer"
          element={isEmployer ? <EmployerDashboard /> : <Navigate to="/" replace />}
        />
        <Route
          path="admin"
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />}
        />
        <Route
          path="admin/insights"
          element={isAdmin ? <AdminInsights /> : <Navigate to="/" replace />}
        />
        <Route
          path="employer/interviews"
          element={isEmployer ? <EmployerInterviews /> : <Navigate to="/" replace />}
        />
        {/* <Route path="messaging" element={<Messaging />} /> */}
        <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Suspense>
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
