// NewProjectModal.jsx
import { useState } from "react";
import api from "../api";

export default function NewProjectModal({ onClose, onCreated }) {
    const [name, setName] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post("/projects", { name });
        onCreated();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl border border-green-200">
                <h3 className="text-2xl font-bold text-green-700 mb-4">New Project</h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Project name"
                    className="border border-green-300 w-full px-4 py-2 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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
