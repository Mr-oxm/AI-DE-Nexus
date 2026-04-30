"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DocHubWizardPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState("#3b82f6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/docs/hubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), accent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create");
        setLoading(false);
        return;
      }
      router.push(`/docs/${data._id}`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-10">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="mb-8">
        <Link href="/wizard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm mb-4">
          <ArrowLeft size={16} /> Back to Creator Studio
        </Link>
        <h1 className="text-2xl font-bold text-zinc-50">Create Doc Hub</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Create a new documentation hub (e.g. &quot;ML Documentation&quot;). Then add topics to it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. ML Documentation"
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this doc hub"
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-10 h-10 p-1 bg-zinc-900 rounded border border-zinc-800 cursor-pointer"
            />
            <input
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Doc Hub"}
        </button>
      </form>
      </div>
    </div>
  );
}
