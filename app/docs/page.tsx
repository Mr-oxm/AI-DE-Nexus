import Link from "next/link";
import {
    GraduationCap, Brain, ArrowUpRight,
} from "lucide-react";

const hubs = [
    {
        href: "/docs/de",
        label: "DE Documentation",
        tag: "11 topics",
        accent: "#3b82f6",
        icon: GraduationCap,
        description:
            "SQL, Spark, Kafka, Airflow, data modeling, cloud, and everything you need to crack DE interviews and build real pipelines.",
        cta: "Browse DE docs",
    },
    {
        href: "/docs/ml",
        label: "ML Documentation",
        tag: "22 topics",
        accent: "#a78bfa",
        icon: Brain,
        description:
            "Mathematical foundations, classical algorithms, and practical ML intuitions — from linear algebra to neural networks.",
        cta: "Browse ML docs",
    },
];

const quickLinks = [
    { href: "/docs/de/sql", label: "SQL Patterns", color: "#3b82f6" },
    { href: "/docs/de/spark", label: "Apache Spark", color: "#f59e0b" },
    { href: "/docs/de/streaming", label: "Streaming & Kafka", color: "#ef4444" },
    { href: "/docs/ml/stats-probability", label: "Statistics", color: "#38bdf8" },
    { href: "/docs/ml/linear-algebra", label: "Linear Algebra", color: "#c084fc" },
    { href: "/docs/ml/neural-networks", label: "Neural Networks", color: "#f59e0b" },
    { href: "/docs/de/modeling", label: "Data Modeling", color: "#8b5cf6" },
    { href: "/docs/ml/calculus", label: "Calculus & Optim.", color: "#f43f5e" },
];

export default function DocsIndexPage() {
    return (
        <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">

            {/* Header */}
            <div className="mb-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-2">
                    Documentation
                </p>
                <h1 className="text-3xl font-bold text-zinc-50 tracking-tight mb-3">
                    Knowledge Base
                </h1>
                <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
                    A structured, theory-first reference covering Data Engineering and Machine Learning
                    — built for learning, revision, and interview prep.
                </p>
            </div>

            <div className="border-t border-zinc-800 mb-10" />

            {/* Hub Cards */}
            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">Sections</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hubs.map((hub) => {
                        const Icon = hub.icon;
                        return (
                            <Link
                                key={hub.href}
                                href={hub.href}
                                className="group flex flex-col p-5 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 relative overflow-hidden"
                            >
                                {/* Top accent line on hover */}
                                <div
                                    className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ background: `linear-gradient(90deg, transparent, ${hub.accent}60, transparent)` }}
                                />

                                {/* Icon */}
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border transition-colors duration-200"
                                    style={{
                                        backgroundColor: `${hub.accent}12`,
                                        borderColor: `${hub.accent}25`,
                                    }}
                                >
                                    <Icon size={17} style={{ color: hub.accent }} />
                                </div>

                                {/* Content */}
                                <h2 className="text-sm font-semibold text-zinc-200 mb-1.5 group-hover:text-zinc-50 transition-colors">
                                    {hub.label}
                                </h2>
                                <p className="text-xs text-zinc-600 leading-relaxed flex-1 mb-4">
                                    {hub.description}
                                </p>

                                {/* CTA */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                        {hub.cta}
                                        <ArrowUpRight
                                            size={13}
                                            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        />
                                    </div>
                                    <span className="text-[10px] text-zinc-700">{hub.tag}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Quick Links */}
            <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
                    Quick Jump
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {quickLinks.map((ql) => (
                        <Link
                            key={ql.href}
                            href={ql.href}
                            className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-150"
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: ql.color }}
                            />
                            <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
                                {ql.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
