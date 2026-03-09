"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Code2, Database, Layers, Zap, GitBranch, AlignLeft, FileText, Radio,
    Cloud, Server, ShieldCheck
} from "lucide-react";


const docSections = [
    { title: "SQL for Data Engineering", slug: "sql", icon: Code2, color: "#3b82f6" },
    { title: "Data Fundamentals", slug: "fundamentals", icon: Database, color: "#10b981" },
    { title: "Data Modeling", slug: "modeling", icon: Layers, color: "#8b5cf6" },
    { title: "Apache Spark", slug: "spark", icon: Zap, color: "#f59e0b" },
    { title: "Orchestration & Airflow", slug: "orchestration", icon: GitBranch, color: "#06b6d4" },
    { title: "Pipeline Design", slug: "pipelines", icon: AlignLeft, color: "#f97316" },
    { title: "File Formats", slug: "file-formats", icon: FileText, color: "#a855f7" },
    { title: "Streaming & Kafka", slug: "streaming", icon: Radio, color: "#ef4444" },
    { title: "Cloud Technologies", slug: "cloud", icon: Cloud, color: "#f59e0b" },
    { title: "NoSQL Databases", slug: "nosql", icon: Server, color: "#10b981" },
    { title: "Data Governance", slug: "governance", icon: ShieldCheck, color: "#8b5cf6" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen">

            {/* Docs sidebar */}
            <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-zinc-800/60 sticky top-0 h-screen overflow-y-auto">
                <div className="px-4 py-5 border-b border-zinc-800/60">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Documentation</p>
                    <p className="text-sm font-semibold text-zinc-200 mt-1">DE Knowledge Base</p>
                </div>
                <nav className="px-3 py-4 space-y-0.5 flex-1">
                    {docSections.map((sec) => {
                        const isActive = pathname === `/docs/${sec.slug}`;
                        const Icon = sec.icon;
                        return (
                            <Link
                                key={sec.slug}
                                href={`/docs/${sec.slug}`}
                                className={`
                                    flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium
                                    transition-all duration-150
                                    ${isActive
                                        ? "bg-zinc-800 text-zinc-100"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                                    }
                                `}
                            >
                                <Icon
                                    size={13}
                                    style={{ color: isActive ? sec.color : undefined }}
                                    className={isActive ? "" : "text-zinc-700"}
                                />
                                {sec.title}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
