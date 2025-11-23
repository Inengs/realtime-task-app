// NewTaskModal.jsx
import { useState } from "react";
import api from "../services/api";

export default function NewTaskModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/tasks", { title, status });
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-xl border border-green-200"
      >
        <h3 className="text-2xl font-bold text-green-700 mb-4">New Task</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="border border-green-300 w-full px-4 py-2 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-green-300 w-full px-4 py-2 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition duration-200 ease-in-out"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
