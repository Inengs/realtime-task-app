import logo from "../../assets/images/logo-2.svg";
import { NavLink } from "react-router-dom";
import ReminderCard from "./ReminderCard";
import { mainMenu, teamMenu, type RouteConfig } from "../../config/routes";

function Section({ title, items }: { title: string; items: RouteConfig[] }) {
  return (
    <div>
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 overflow-y-auto border-r border-gray-100 bg-white p-4 md:flex">
      <div className="flex items-center gap-2 px-2">
        <img src={logo} alt="" className="h-10 w-auto" />
        <span className="text-xl font-bold tracking-tight text-emerald-600">TaskFlow</span>
      </div>

      <Section title="Main Menu" items={mainMenu} />
      <Section title="Team" items={teamMenu} />

      <div className="mt-auto">
        <ReminderCard
          reminders={[
            {
              id: 1,
              kind: "meeting",
              urgency: "soon",
              title: "Weekly standup",
              detail: "Starts in 5 minutes",
              when: "in 5 min",
              actionLabel: "Join now",
            },
            {
              id: 2,
              kind: "task",
              title: "Finish landing page copy",
              detail: "Due by 12:00 pm today",
              when: "by 12:00 pm",
              actionLabel: "Open task",
            },
            {
              id: 3,
              kind: "onboarding",
              title: "Onboard Amara to the team",
              detail: "Needs to be done by 2:00 pm",
              when: "by 2:00 pm",
              actionLabel: "Start onboarding",
            },
          ]}
        />
      </div>
    </aside>
  );
}