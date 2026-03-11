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

import { DocsSidebar } from "@/app/components/DocsSidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <DocsSidebar
                basePath="/docs/de"
                title="DE Knowledge Base"
                groups={[{ items: docSections }]}
            />
            {/* Content */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
