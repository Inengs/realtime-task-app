import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/dashboard/Dashboard";
import LoginRegister from "./pages/login register/LoginRegister";
import EmailVerificationPage from "./pages/email-verification/EmailVerification";
import NotificationsPage from "./pages/notifications/Notifications";
import ProfilePage from "./pages/profile/Profile";
import ProjectManagementPage from "./pages/project-management/ProjectManagement";
import TaskPage from "./pages/task-creation/TaskForm";
import WelcomePage from "./pages/welcome page/Welcome";

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Public Route (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<WelcomePage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginRegister />
          </PublicRoute>
        }
      />
      <Route path="/verify-email" element={<EmailVerificationPage />} />

      {/* Protected routes with AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/projects" element={<ProjectManagementPage />} />
        <Route path="/tasks" element={<TaskPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
