export interface RouteConfig {
  path: string;
  label: string;        // sidebar label
  title: string;        // header title (can differ from label)
  description: string; // header subtitle
  icon: string;
  section: "main" | "team";
}

export const routes: RouteConfig[] = [
  // Main Menu
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

  // Team
  {
    path: "/employees",
    label: "Employees",
    title: "Employees",
    description: "Manage your team members, roles, and responsibilities",
    icon: "users",
    section: "team",
  },
  {
    path: "/teams",
    label: "Teams",
    title: "Teams",
    description: "Organize employees into teams and assign project ownership",
    icon: "users",
    section: "team",
  },
  {
    path: "/recruitment",
    label: "Recruitment and Hiring",
    title: "Recruitment & Hiring",
    description: "Track candidates, interviews, and hiring pipelines",
    icon: "user-plus",
    section: "team",
  },
  {
    path: "/invoices",
    label: "Invoices and Billing",
    title: "Invoices & Billing",
    description: "View, generate, and manage client invoices and payments",
    icon: "file-text",
    section: "team",
  },
];

export const mainMenu = routes.filter((r) => r.section === "main");
export const teamMenu = routes.filter((r) => r.section === "team");