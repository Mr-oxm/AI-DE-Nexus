"use client";

import Link from "next/link";
import { BookOpen, Terminal, Database, Code, Zap, ArrowUpRight, GraduationCap, Github } from "lucide-react";

const tools = [
  {
    title: "DE Documentation",
    description: "Comprehensive docs on SQL, Data Modeling, Spark, Orchestration, Pipelines, File Formats, and Streaming.",
    icon: GraduationCap,
    href: "/docs",
    label: "Read docs",
    accent: "#3b82f6",
  },
  {
    title: "DE Commands Cheatsheet",
    description: "Essential Linux and Windows terminal commands tailored for Data Engineers.",
    icon: Terminal,
    href: "/commands",
    label: "View commands",
    accent: "#10b981",
  },
  {
    title: "Pandas Cheatsheet",
    description: "Key Python Pandas snippets for grouping, transforming, cleaning, and visualizing data.",
    icon: Database,
    href: "/pandas",
    label: "Open cheatsheet",
    accent: "#f59e0b",
  },
  {
    title: "DE Core Exercises",
    description: "Interview-focused questions covering data pipelines, warehouses, lakes, and SQL.",
    icon: Code,
    href: "/exercises/de",
    label: "Start practicing",
    accent: "#8b5cf6",
  },
  {
    title: "Python Exercises",
    description: "Practice fundamental Python concepts, data structures, loops, and OOP.",
    icon: Code,
    href: "/exercises/python",
    label: "Start practicing",
    accent: "#06b6d4",
  },
  {
    title: "Pandas Exercises",
    description: "Hands-on Pandas practice with a real dataset — cleaning, grouping, windows.",
    icon: Database,
    href: "/exercises/pandas",
    label: "Start practicing",
    accent: "#f97316",
  },
  {
    title: "PySpark Exercises",
    description: "Interview-ready PySpark questions on RDDs, DataFrames, performance, and streaming.",
    icon: Zap,
    href: "/exercises/spark",
    label: "Start practicing",
    accent: "#ef4444",
  },
];

export default function HomePage() {
  return (
    <div className="px-6 md:px-10 py-12 max-w-5xl mx-auto space-y-14 animate-in fade-in slide-in-from-bottom-2 duration-400">

      {/* Hero */}
      <div className="space-y-4 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          by Omar Emara
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-zinc-50 tracking-tight leading-tight">
          The AI/DE Nexus
        </h1>

        <p className="text-base text-zinc-500 max-w-2xl leading-relaxed">
          A centralized, structured knowledge base for Data Engineering, Machine Learning, and programming concepts — notes, cheatsheets, and exercises in one place.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Link
            href="https://github.com/Mr-oxm"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            <Github size={16} />
            <span>GitHub Profile</span>
          </Link>
        </div>
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
                {/* Top accent */}
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${tool.accent}60, transparent)` }}
                />

                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border transition-colors duration-200"
                  style={{
                    backgroundColor: `${tool.accent}12`,
                    borderColor: `${tool.accent}25`,
                  }}
                >
                  <Icon size={17} style={{ color: tool.accent }} />
                </div>

                {/* Content */}
                <h2 className="text-sm font-semibold text-zinc-200 mb-1.5 group-hover:text-zinc-50 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-xs text-zinc-600 leading-relaxed flex-1 mb-4">
                  {tool.description}
                </p>

                {/* CTA */}
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
