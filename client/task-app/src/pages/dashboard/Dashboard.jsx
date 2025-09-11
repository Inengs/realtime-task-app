import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext"; // ✅

export default function DashboardPage() {
    const { user, loading } = useAuth(); // ✅ grab auth state
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (!user) return; // only fetch if logged in

        // Fetch projects + tasks
        api.get("/projects")
            .then(res => setProjects(res.data.projects))
            .catch(err => console.error("Failed to fetch projects:", err));

        api.get("/tasks")
            .then(res => setTasks(res.data.tasks))
            .catch(err => console.error("Failed to fetch tasks:", err));

        // --------------------
        // WebSocket: Projects
        // --------------------
        const projectSocket = new WebSocket("ws://localhost:8080/ws/projects");
        projectSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "project_created") {
                setProjects(prev => [...prev, message.data]);
            }
            if (message.type === "project_updated") {
                setProjects(prev => prev.map(p => (p.id === message.data.id ? message.data : p)));
            }
            if (message.type === "project_deleted") {
                setProjects(prev => prev.filter(p => p.id !== message.data.id));
            }
        };

        // ----------------
        // WebSocket: Tasks
        // ----------------
        const taskSocket = new WebSocket("ws://localhost:8080/ws/tasks");
        taskSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "task_created") {
                setTasks(prev => [...prev, message.data]);
            }
            if (message.type === "task_updated") {
                setTasks(prev => prev.map(t => (t.id === message.data.id ? message.data : t)));
            }
            if (message.type === "task_deleted") {
                setTasks(prev => prev.filter(t => t.id !== message.data.id));
            }
        };

        return () => {
            projectSocket.close();
            taskSocket.close();
        };
    }, [user]); // ✅ refetch sockets when user changes

    // Handle loading state
    if (loading) return <p>Loading...</p>;

    // Handle unauthenticated users
    if (!user) return <p>You must log in to view the dashboard.</p>;

    return (
        <div>
            <h2>Projects</h2>
            <ul>
                {projects.map((p) => (
                    <li key={p.id}>{p.name}</li>
                ))}
            </ul>

            <h2 className="mt-6">Tasks</h2>
            <ul>
                {tasks.map((t) => (
                    <li key={t.id}>
                        {t.title} — <i>{t.status}</i>
                    </li>
                ))}
            </ul>
        </div>
    );
}
