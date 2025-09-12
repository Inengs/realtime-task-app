// DashboardPage.jsx
import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import ActiveProjects from "../../components/ActiveProjects";
import UpcomingTasks from "../../components/UpcomingTasks";
import NewProjectModal from "../../components/NewProjectModal";
import NewTaskModal from "../../components/NewTaskModal";
import Header from "../../components/Header"; // ✅ import new Header

export default function DashboardPage() {
    const { user, loading } = useAuth();

    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [taskFilter, setTaskFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTasks = useMemo(() => {
        return tasks
            .filter((t) => taskFilter === "All" || t.status === taskFilter)
            .filter((t) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [tasks, taskFilter, searchQuery]);

    // 🔹 Fetchers
    const fetchProjects = async () => {
        try {
            const res = await api.get("/projects");
            setProjects(res.data.projects);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await api.get("/tasks");
            setTasks(res.data.tasks);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications?unread=true");
            setNotifications(res.data.notifications);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    // 🔹 WebSocket listeners
    useEffect(() => {
        if (!user) return;

        fetchProjects();
        fetchTasks();
        fetchNotifications();

        const projectSocket = new WebSocket("ws://localhost:8080/ws/projects");
        const taskSocket = new WebSocket("ws://localhost:8080/ws/tasks");
        const notifSocket = new WebSocket("ws://localhost:8080/ws/notifications");

        projectSocket.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === "project_created")
                setProjects((prev) => [...prev, msg.data]);
            if (msg.type === "project_updated")
                setProjects((prev) =>
                    prev.map((p) => (p.id === msg.data.id ? msg.data : p))
                );
            if (msg.type === "project_deleted")
                setProjects((prev) => prev.filter((p) => p.id !== msg.data.id));
        };

        taskSocket.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === "task_created")
                setTasks((prev) => [...prev, msg.data]);
            if (msg.type === "task_updated")
                setTasks((prev) =>
                    prev.map((t) => (t.id === msg.data.id ? msg.data : t))
                );
            if (msg.type === "task_deleted")
                setTasks((prev) => prev.filter((t) => t.id !== msg.data.id));
        };

        notifSocket.onmessage = () => {
            fetchNotifications();
        };

        return () => {
            projectSocket.close();
            taskSocket.close();
            notifSocket.close();
        };
    }, [user]);

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>You must log in to view the dashboard.</p>;

    return (
        <div className="pt-20 px-4"> {/* pt-20 = padding for fixed header */}
            {/* ✅ Use Header component */}
            <Header
                unreadCount={notifications.length}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
                user={user}
            />

            <div className="flex justify-end mt-4 gap-2">
                <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    + New Project
                </button>
                <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                >
                    + New Task
                </button>
            </div>

            <ActiveProjects projects={projects} />

            <UpcomingTasks
                tasks={filteredTasks}
                taskFilter={taskFilter}
                setTaskFilter={setTaskFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {showNewProjectModal && (
                <NewProjectModal
                    onClose={() => setShowNewProjectModal(false)}
                    onCreated={fetchProjects}
                />
            )}
            {showNewTaskModal && (
                <NewTaskModal
                    onClose={() => setShowNewTaskModal(false)}
                    onCreated={fetchTasks}
                />
            )}
        </div>
    );
}