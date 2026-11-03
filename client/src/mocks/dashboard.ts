// Mock data for the dashboard. Later, swap these for real API calls
// by replacing `import { stats } from "../mocks/dashboard"` with
// `const stats = await getStats()` inside a custom hook.

export interface StatItem {
  id: "total" | "in-progress" | "completed" | "overdue";
  label: string;
  value: number;
  delta: number;       // percentage change vs last period
  trend: "up" | "down"; // direction of change
  icon: "list" | "loader" | "check-circle" | "alert-circle";
}

export const stats: StatItem[] = [
  {
    id: "total",
    label: "Total Tasks",
    value: 32,
    delta: 12,
    trend: "up",
    icon: "list",
  },
  {
    id: "in-progress",
    label: "In Progress",
    value: 14,
    delta: 8,
    trend: "up",
    icon: "loader",
  },
  {
    id: "completed",
    label: "Completed",
    value: 18,
    delta: 24,
    trend: "up",
    icon: "check-circle",
  },
  {
    id: "overdue",
    label: "Overdue",
    value: 3,
    delta: 5,
    trend: "down",
    icon: "alert-circle",
  },
];


export interface TaskItem {
  id: number;
  title: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  dueDate: string;        // ISO date
  assignee: {
    name: string;
    avatar: string;
  };
}

export const recentTasks: TaskItem[] = [
  {
    id: 1,
    title: "Design new landing page",
    priority: "high",
    status: "in-progress",
    dueDate: "2025-05-24",
    assignee: { name: "Sarah", avatar: "https://i.pravatar.cc/40?img=1" },
  },
  {
    id: 2,
    title: "Fix authentication bug on mobile",
    priority: "high",
    status: "todo",
    dueDate: "2025-05-22",
    assignee: { name: "Mike", avatar: "https://i.pravatar.cc/40?img=2" },
  },
  {
    id: 3,
    title: "Write API documentation",
    priority: "medium",
    status: "in-progress",
    dueDate: "2025-05-28",
    assignee: { name: "Amara", avatar: "https://i.pravatar.cc/40?img=3" },
  },
  {
    id: 4,
    title: "Set up CI/CD pipeline",
    priority: "medium",
    status: "completed",
    dueDate: "2025-05-20",
    assignee: { name: "James", avatar: "https://i.pravatar.cc/40?img=4" },
  },
  {
    id: 5,
    title: "Update user onboarding flow",
    priority: "low",
    status: "todo",
    dueDate: "2025-06-02",
    assignee: { name: "Lisa", avatar: "https://i.pravatar.cc/40?img=5" },
  },
];

// Used by ProgressRing
export const progress = {
  completed: 18,
  total: 32,
  // percentage calculated as (completed / total) * 100
};