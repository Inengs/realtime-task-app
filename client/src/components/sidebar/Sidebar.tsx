import logo from "../../assets/images/logo-2.svg"
import { NavLink } from "react-router-dom"
import ReminderCard from "./ReminderCard"
import { mainMenu, teamMenu, type RouteConfig } from "../../config/routes"   

// const MainMenu = [
//     {to: "/dashboard", icon: "home", label: "Dashboard"},
//     {to: "/projects", icon: "folder", label: "Projects"},
//     {to: "/tasks", icon: "check-square", label: "Tasks"},
//     {to: "/calendar", icon: "calendar", label: "Calendar"},
//     {to: "/performance", icon: "bar-chart-2", label: "Performance"},
//     {to: "help", icon: "help-circle", label: "Help Center"},
// ]

// const TeamMenu = [
//     {to: "/employees", icon: "users", label: "Employees"},
//     {to: "/teams", icon: "users", label: "Teams"},
//     {to: "/recruitment", icon: "user-plus", label: "Recruitment and Hiring"},
//     {to: "/invoices", icon: "file-text", label: "Invoices and Billing"},
// ]

function Section({ title, items }: { title: string, items: RouteConfig[]; }) {
    return (
        <div>
            <p>
                {title}
            </p>

            <nav>
                {items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                                isActive ? "bg-emerald-100 text-emerald-600" : "text-gray-600 hover:bg-gray-100"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>

    )
}

export default function Sidebar() {

    return (
        <aside className="fixed bg-white left-0 flex flex-col h-screen w-20">
            <div className="flex items-center">
                <img src={logo} alt="logo" className="w-12 h-12 mx-auto my-4" />
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
    )
}