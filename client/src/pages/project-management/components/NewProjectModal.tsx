import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { createProject } from "../../../api/projects";

interface NewProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function NewProjectModal({ onClose, onCreated }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createProject({ name: name.trim(), description: description.trim() });
      onCreated();
    } catch (err) {
      const data = axios.isAxiosError(err) ? err.response?.data : null;
      setError(data?.error ?? data?.errors?.join(", ") ?? "Could not create the project");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 space-y-4 bg-white shadow-xl rounded-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="new-project-title" className="text-lg font-semibold text-gray-900">
            New project
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label htmlFor="project-name" className="block mb-1 text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="project-name"
            autoFocus
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Product Launch 2026"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="project-description" className="block mb-1 text-sm font-medium text-gray-700">
            Description <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="project-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
}