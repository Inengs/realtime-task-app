// src/layouts/AppLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import "./AppLayout.css"; // optional for styling

function AppLayout() {
  return (
    <div>
      {/* Tabs / Navigation Bar */}
      <nav className="tab-nav">
        <NavLink to="/dashboard" className="tab-link">
          Dashboard
        </NavLink>
        <NavLink to="/projects" className="tab-link">
          Projects
        </NavLink>
        <NavLink to="/tasks" className="tab-link">
          Tasks
        </NavLink>
        <NavLink to="/notifications" className="tab-link">
          Notifications
        </NavLink>
        <NavLink to="/profile" className="tab-link">
          Profile
        </NavLink>
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
