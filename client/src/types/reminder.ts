export type Reminder = {
  id: number | string;
  kind: "meeting" | "task" | "onboarding";
  urgency?: "later" | "soon" | "overdue";
  title: string;
  detail: string;
  when: string; // short chip text, e.g. "in 5 min"
  actionLabel: string;
};