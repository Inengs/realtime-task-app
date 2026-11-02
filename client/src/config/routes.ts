export interface RouteConfig {
  path: string;
  label: string;
  title: string;
  description: string;
  icon: string;
  section: "main" | "team" | "account";
}

export const routes: RouteConfig[] = [
  // ─── Main Menu — the actual work ───
  {
    path: "/dashboard",
    label: "Dashboard",
    title: "Dashboard",
    description: "Get a bird's-eye view of your tasks, projects, and team activity",
    icon: "home",
    section: "main",
  },
  {
    path: "/projects",
    label: "Projects",
    title: "Projects",
    description: "Plan, track, and manage all your team's projects in one place",
    icon: "folder",
    section: "main",
  },
  {
    path: "/tasks",
    label: "Tasks",
    title: "Tasks",
    description: "Track and organize all your team's tasks in one place",
    icon: "check-square",
    section: "main",
  },
  {
    path: "/calendar",
    label: "Calendar",
    title: "Calendar",
    description: "Schedule and visualize upcoming deadlines and milestones",
    icon: "calendar",
    section: "main",
  },
  {
    path: "/performance",
    label: "Performance",
    title: "Performance",
    description: "Monitor team productivity and individual progress over time",
    icon: "bar-chart-2",
    section: "main",
  },
  {
    path: "/help",
    label: "Help Center",
    title: "Help Center",
    description: "Find answers, guides, and contact support for TaskFlow",
    icon: "help-circle",
    section: "main",
  },

  // ─── Team — collaboration & people ───
  {
    path: "/members",
    label: "Members",
    title: "Members",
    description: "Manage who's in your workspace and what they can access",
    icon: "users",
    section: "team",
  },
  {
    path: "/teams",
    label: "Teams",
    title: "Teams",
    description: "Organize members into teams and assign project ownership",
    icon: "users",
    section: "team",
  },
  {
    path: "/activity",
    label: "Activity Log",
    title: "Activity Log",
    description: "See every change across your workspace in real time",
    icon: "activity",
    section: "team",
  },

  // ─── Account — header-only routes (not in sidebar) ───
  {
    path: "/settings",
    label: "Settings",
    title: "Settings",
    description: "Manage your account preferences and configuration",
    icon: "settings",
    section: "account",
  },
  {
    path: "/messages",
    label: "Messages",
    title: "Messages",
    description: "View and manage your conversations with team members",
    icon: "message-square",
    section: "account",
  },
  {
    path: "/notifications",
    label: "Notifications",
    title: "Notifications",
    description: "Stay updated on activity across your projects and tasks",
    icon: "bell",
    section: "account",
  },
];

export const mainMenu = routes.filter((r) => r.section === "main");
export const teamMenu = routes.filter((r) => r.section === "team");