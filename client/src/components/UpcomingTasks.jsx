// UpcomingTasks.jsx
export default function UpcomingTasks({
    tasks,
    taskFilter,
    setTaskFilter,
    searchQuery,
    setSearchQuery,
}) {
    return (
        <section className="mt-6">
            <h3 className="text-lg font-semibold">Upcoming Tasks</h3>

            {/* Filters */}
            <div className="flex gap-2 my-2">
                <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="border px-2 py-1 rounded"
                >
                    <option value="All">All</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="border px-2 py-1 rounded flex-1"
                />
            </div>

            {/* Task List */}
            <ul className="list-disc ml-5">
                {tasks.map((t) => (
                    <li key={t.id}>
                        {t.title} — <i>{t.status}</i>
                    </li>
                ))}
            </ul>
        </section>
    );
}
