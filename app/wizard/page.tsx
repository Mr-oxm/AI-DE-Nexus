"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Wand2, FileCode2, Dumbbell, BookOpen, Database, Plus } from "lucide-react";

export default function WizardIndexPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/wizard");
    }
  }, [mounted, status, router]);

  if (status === "loading" || !mounted) {
    return (
      <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="px-6 md:px-10 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="mb-10 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Creator Studio</p>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-zinc-50 tracking-tight">
          <Wand2 className="text-emerald-500" /> Content Wizards
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
          Create doc hubs, add topics, create exercise sets, and more. Sign in to create content.
        </p>
      </div>

      <div className="border-t border-zinc-800 mb-8" />

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-3">Docs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/wizard/doc-hub"
              className="group flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-blue-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">Create Doc Hub</p>
                  <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Create a new documentation hub (e.g. ML, DE). Then add topics to it.
                </p>
              </div>
            </Link>

            <Link
              href="/wizard/doc"
              className="group flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FileCode2 size={18} className="text-blue-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">Add Doc Topic</p>
                  <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Choose a doc hub and add a new topic with blocks, code, tables, and more.
                </p>
              </div>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-3">Exercises</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/wizard/exercise-hub"
              className="group flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-emerald-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">Create Exercise Hub</p>
                  <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Create a new exercise set. Then add Q&A exercises to it.
                </p>
              </div>
            </Link>

            <Link
              href="/wizard/exercise"
              className="group flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Dumbbell size={18} className="text-emerald-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">Add Exercises</p>
                  <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Choose an exercise hub and add Q&A exercises. Export or save to DB.
                </p>
              </div>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-3">Cheatsheets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/wizard/cheatsheet-hub"
              className="group flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-amber-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">Create Cheatsheet Hub</p>
                  <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Create a new cheatsheet hub. Then add sections with snippets.
                </p>
              </div>
            </Link>
            <Link
              href="/wizard/cheatsheet"
              className="group flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Database size={18} className="text-amber-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">Add Cheatsheet Sections</p>
                  <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Choose a hub and paste JSON. Sections with labels and code snippets.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
