import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/dashboard/Dashboard";
import LoginRegister from "./pages/login register/LoginRegister";
import EmailVerificationPage from "./pages/email-verification/Emailverification";
import NotificationsPage from "./pages/notifications/Notifications";
import ProfilePage from "./pages/profile/Profile";
import ProjectManagementPage from "./pages/project-management/ProjectManagement";
import TaskPage from "./pages/task-creation/TaskForm";
import WelcomePage from "./pages/Welcome/welcome";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginRegister />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />

      {/* Tab-based layout for logged-in users */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/projects" element={<ProjectManagementPage />} />
        <Route path="/tasks" element={<TaskPage />} />
      </Route>
    </Routes>
  );
}

export default App;
