// src/App.jsx or src/pages/TaskPage.jsx
import { useState, useEffect } from "react";
import Header from "../components/Header";
import NewTaskModal from "../components/NewTaskModal";
import UpcomingTasks from "../components/UpcomingTasks";
import api from "../api";

function TaskPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState({ name: "John Doe" }); // Mock user
    const [taskFilter, setTaskFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch tasks on mount
    useEffect(() => {
        const fetchTasks = async () => {
            const response = await api.get("/tasks");
            setTasks(response.data);
        };
        fetchTasks();
    }, []);

    // Handle new task creation
    const handleTaskCreated = async () => {
        const response = await api.get("/tasks");
        setTasks(response.data);
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-16">
            {/* Header */}
            <Header
                unreadCount={unreadCount}
                onSearchChange={setSearchQuery}
                user={user}
                searchQuery={searchQuery}
            />

            {/* Main Content */}
            <main className="container mx-auto p-4">
                {/* Task Statistics */}
                <section className="bg-white p-4 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-2">Task Statistics</h2>
                    <div className="mb-4">
                        <p>Last 7 Days View</p>
                        <div className="flex items-center">
                            <span className="text-3xl font-bold text-green-600">75%</span>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                                <div
                                    className="bg-green-600 h-2.5 rounded-full"
                                    style={{ width: "75%" }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <p>Tasks completed this week: 15</p>
                    <div className="flex items-center mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-blue-600 h-4 rounded-full"
                                style={{ width: "60%" }}
                            ></div>
                        </div>
                        <button className="ml-2 text-blue-500 underline">UPGRADE PLAN</button>
                    </div>
                    <p className="mt-2">Top tasks: Design, Code, Client feedback</p>
                </section>

                {/* Add Task Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Add New Task
                </button>

                {/* Upcoming Tasks */}
                <UpcomingTasks
                    tasks={tasks}
                    taskFilter={taskFilter}
                    setTaskFilter={setTaskFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* New Task Modal */}
                {isModalOpen && (
                    <NewTaskModal
                        onClose={() => setIsModalOpen(false)}
                        onCreated={handleTaskCreated}
                    />
                )}
            </main>
        </div>
    );
}

export default TaskPage;