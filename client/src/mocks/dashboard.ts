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


// ─── Section 3: Trend chart data ───
// Tasks completed per day over the last 14 days
export interface TrendPoint {
  date: string;   // ISO date
  completed: number;
}

export const taskTrend: TrendPoint[] = [
  { date: "2025-05-04", completed: 4 },
  { date: "2025-05-05", completed: 6 },
  { date: "2025-05-06", completed: 5 },
  { date: "2025-05-07", completed: 8 },
  { date: "2025-05-08", completed: 7 },
  { date: "2025-05-09", completed: 10 },
  { date: "2025-05-10", completed: 9 },
  { date: "2025-05-11", completed: 12 },
  { date: "2025-05-12", completed: 11 },
  { date: "2025-05-13", completed: 14 },
  { date: "2025-05-14", completed: 13 },
  { date: "2025-05-15", completed: 16 },
  { date: "2025-05-16", completed: 18 },
  { date: "2025-05-17", completed: 24 },
];

// ─── Section 3: Upcoming tasks ───
// Different from recentTasks — these are sorted by due date, soonest first
export interface UpcomingTask {
  id: number;
  title: string;
  dueIn: string;       // human-readable: "in 2 days", "tomorrow", "today"
  priority: "low" | "medium" | "high";
  project: string;     // project name
}

export const upcomingTasks: UpcomingTask[] = [
  {
    id: 101,
    title: "Design new landing page",
    dueIn: "today",
    priority: "high",
    project: "Website Redesign",
  },
  {
    id: 102,
    title: "User onboarding flow",
    dueIn: "tomorrow",
    priority: "medium",
    project: "Mobile App",
  },
  {
    id: 103,
    title: "Market research",
    dueIn: "in 2 days",
    priority: "low",
    project: "Marketing Campaign",
  },
  {
    id: 104,
    title: "Create style guide",
    dueIn: "in 3 days",
    priority: "medium",
    project: "Website Redesign",
  },
];

// ─── Section 3: Team activity feed ───
export interface ActivityItem {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  action: "completed" | "commented" | "assigned" | "created";
  target: string;        // what they acted on (task title, etc.)
  timestamp: string;     // human-readable: "5m ago", "2h ago"
}

export const teamActivity: ActivityItem[] = [
  {
    id: 1,
    user: { name: "Sarah", avatar: "https://i.pravatar.cc/40?img=1" },
    action: "completed",
    target: "Design new landing page",
    timestamp: "5m ago",
  },
  {
    id: 2,
    user: { name: "Mike", avatar: "https://i.pravatar.cc/40?img=2" },
    action: "commented",
    target: "Fix authentication bug on mobile",
    timestamp: "32m ago",
  },
  {
    id: 3,
    user: { name: "Amara", avatar: "https://i.pravatar.cc/40?img=3" },
    action: "assigned",
    target: "Write API documentation",
    timestamp: "1h ago",
  },
  {
    id: 4,
    user: { name: "James", avatar: "https://i.pravatar.cc/40?img=4" },
    action: "created",
    target: "Set up CI/CD pipeline",
    timestamp: "3h ago",
  },
  {
    id: 5,
    user: { name: "Lisa", avatar: "https://i.pravatar.cc/40?img=5" },
    action: "completed",
    target: "Update user onboarding flow",
    timestamp: "5h ago",
  },
];