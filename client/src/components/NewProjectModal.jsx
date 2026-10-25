// NewProjectModal.jsx
import { useState } from "react";
import api from "../services/api";

export default function NewProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/projects/", {
        name,
        description: description || "",
      });
      onCreated();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0] ||
        "Failed to create project";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-2xl border border-emerald-100 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-bold text-emerald-700">New Project</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm">
            {error}
          </div>
        )}

        {/* Project name */}
        <label className="block mb-3">
          <span className="block text-xs font-medium text-gray-600 mb-1.5">
            Project name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile App v2"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm transition"
          />
        </label>

        {/* Description */}
        <label className="block mb-5">
          <span className="block text-xs font-medium text-gray-600 mb-1.5">
            Description <span className="text-gray-400">(optional)</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this project about?"
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm resize-none transition"
          />
        </label>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition text-sm font-semibold shadow-md shadow-emerald-200 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save Project"}
          </button>
        </div>
      </form>
    </div>
  );
}