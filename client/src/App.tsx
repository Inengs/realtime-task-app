import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/dashboard/Dashboard";
import LoginRegister from "./pages/login register/LoginRegister";
import EmailVerificationPage from "./pages/email-verification/EmailVerification";
import NotificationsPage from "./pages/notifications/Notifications";
import ProfilePage from "./pages/profile/Profile";
import ProjectsPage from "./pages/project-management/ProjectsPage";
import TaskPage from "./pages/task-creation/TaskForm";
import WelcomePage from "./pages/welcome page/Welcome";
import ProjectPage from "./pages/project-management/ProjectPage";

// Protected Route Wrapper
// Protected Route Wrapper — now returns Outlet, not children
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;  // ← renders the child route (AppLayout, which then renders the page)
}

// Public Route (redirects to dashboard if already logged in)
function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
function App() {
  return (
    <Routes>
      {/* Public routes */}
      
      <Route element={<PublicRoute />}>
      <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginRegister />} />
      </Route>
      <Route path="/verify-email" element={<EmailVerificationPage />} />

      {/* Protected routes — auth check + layout + page */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/messages" element={<div className="p-8">Messages page coming soon</div>} />
          <Route path="/settings" element={<div className="p-8">Settings page coming soon</div>} />
          <Route path="/calendar" element={<div className="p-8">Calendar page coming soon</div>} />
          <Route path="/performance" element={<div className="p-8">Performance page coming soon</div>} />
          <Route path="/help" element={<div className="p-8">Help Center coming soon</div>} />
          <Route path="/members" element={<div className="p-8">Members page coming soon</div>} />
          <Route path="/teams" element={<div className="p-8">Teams page coming soon</div>} />
          <Route path="/activity" element={<div className="p-8">Activity Log coming soon</div>} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
