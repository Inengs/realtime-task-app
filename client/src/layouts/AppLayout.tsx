// client/src/layouts/AppLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed sidebar on the left (w-64 = 256px) */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div className="md:ml-64">
        {/* Sticky header at top */}
        <Header />

        {/* Page content goes here (rendered by the routed child) */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}