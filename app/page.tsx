"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookOpen, Database, Code, ArrowUpRight } from "lucide-react";

const tools = [
  {
    title: "Docs Hub",
    description: "Browse documentation hubs — DE, ML, and more. Each hub contains topic pages you can explore.",
    icon: BookOpen,
    href: "/docs",
    label: "Browse docs",
    accent: "#3b82f6",
  },
  {
    title: "Exercise Hub",
    description: "Q&A style practice sets for interviews and learning — DE Core, Python, Pandas, PySpark, and more.",
    icon: Code,
    href: "/exercises",
    label: "Start practicing",
    accent: "#10b981",
  },
  {
    title: "Cheatsheets Hub",
    description: "Quick reference cheatsheets — Pandas snippets, DE commands, and code at a glance.",
    icon: Database,
    href: "/cheatsheets",
    label: "View cheatsheets",
    accent: "#f59e0b",
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="px-6 md:px-10 py-12 max-w-5xl mx-auto space-y-14 animate-in fade-in slide-in-from-bottom-2 duration-400">

      {/* Hero */}
      <div className="space-y-4 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          by Omar Emara
        </div>

        {status === "loading" ? null : session?.user ? (
          <p className="text-xl md:text-2xl font-semibold tracking-tight">
            <span className="text-zinc-500">Welcome back, </span>
            <span className="text-emerald-400">{session.user.name ?? session.user.email ?? "you"}</span>
          </p>
        ) : null}

        <h1 className="text-4xl md:text-5xl font-bold text-zinc-50 tracking-tight leading-tight">
          The AI/DE Nexus
        </h1>

        <p className="text-base text-zinc-500 max-w-2xl leading-relaxed">
          A centralized, structured knowledge base for Data Engineering, Machine Learning, and programming concepts — notes, cheatsheets, and exercises in one place.
        </p>

        {!session?.user && status !== "loading" && (
          <div className="pt-2">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Grid */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-5">Resources</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group flex flex-col p-5 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 relative overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${tool.accent}60, transparent)` }}
                />
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border transition-colors duration-200"
                  style={{
                    backgroundColor: `${tool.accent}12`,
                    borderColor: `${tool.accent}25`,
                  }}
                >
                  <Icon size={17} style={{ color: tool.accent }} />
                </div>
                <h2 className="text-sm font-semibold text-zinc-200 mb-1.5 group-hover:text-zinc-50 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-xs text-zinc-600 leading-relaxed flex-1 mb-4">
                  {tool.description}
                </p>
                <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  {tool.label}
                  <ArrowUpRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
