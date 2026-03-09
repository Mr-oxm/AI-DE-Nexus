import { Code2, Database, Layers, Zap, GitBranch, AlignLeft, FileText, Radio, ArrowRight, Cloud, ShieldCheck, Server } from "lucide-react";
import Link from "next/link";

const sections = [
    {
        title: "SQL for Data Engineering",
        slug: "sql",
        icon: Code2,
        color: "#3b82f6",
        desc: "Window functions, CTEs, joins, deduplication, and query optimization patterns used daily by data engineers.",
    },
    {
        title: "Data Fundamentals",
        slug: "fundamentals",
        icon: Database,
        color: "#10b981",
        desc: "OLTP vs OLAP, data warehouses, data lakes, ACID properties, normalization, and schema design.",
    },
    {
        title: "Data Modeling",
        slug: "modeling",
        icon: Layers,
        color: "#8b5cf6",
        desc: "Star vs snowflake schema, fact and dimension tables, SCD types, surrogate keys, and design interviews.",
    },
    {
        title: "Apache Spark",
        slug: "spark",
        icon: Zap,
        color: "#f59e0b",
        desc: "RDDs, DataFrames, partitioning, bucketing, shuffle, DAG, broadcast joins, and performance optimization.",
    },
    {
        title: "Orchestration & Airflow",
        slug: "orchestration",
        icon: GitBranch,
        color: "#06b6d4",
        desc: "DAGs, tasks, operators, scheduling, retries, dynamic DAGs, and running Spark jobs with Airflow.",
    },
    {
        title: "Pipeline Design",
        slug: "pipelines",
        icon: AlignLeft,
        color: "#f97316",
        desc: "End-to-end pipeline architecture, ingestion, batch vs streaming, fault tolerance, scalability, and data quality.",
    },
    {
        title: "File Formats",
        slug: "file-formats",
        icon: FileText,
        color: "#a855f7",
        desc: "Parquet, Avro, ORC, CSV — internal structure, predicate pushdown, schema evolution, and when to use each.",
    },
    {
        title: "Streaming & Kafka",
        slug: "streaming",
        icon: Radio,
        color: "#ef4444",
        desc: "Kafka architecture, topics, partitions, consumer groups, exactly-once semantics, and Spark Structured Streaming.",
    },
    {
        title: "Cloud Technologies",
        slug: "cloud",
        icon: Cloud,
        color: "#f59e0b",
        desc: "AWS (S3, Glue, EMR, Kinesis, Lambda, IAM, Redshift), GCP (BigQuery, Pub/Sub, Dataflow), and Azure for data engineers.",
    },
    {
        title: "NoSQL Databases",
        slug: "nosql",
        icon: Server,
        color: "#10b981",
        desc: "Document, key-value, wide-column, graph databases — MongoDB, Redis, Cassandra, DynamoDB — trade-offs and pipeline patterns.",
    },
    {
        title: "Data Quality, Lineage & Governance",
        slug: "governance",
        icon: ShieldCheck,
        color: "#8b5cf6",
        desc: "Great Expectations, Soda, data catalogs, lineage tracking, PII management, GDPR compliance, and what separates senior DEs.",
    },
];

export default function DocsIndexPage() {
    return (
        <div className="px-6 md:px-10 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="mb-10 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Documentation</p>
                <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">DE Knowledge Base</h1>
                <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
                    A comprehensive, structured reference for Data Engineering — distilled from deep learning sessions, covering every topic interviewed at top companies.
                </p>
            </div>

            <div className="border-t border-zinc-800 mb-8" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.map((sec) => {
                    const Icon = sec.icon;
                    return (
                        <Link
                            key={sec.slug}
                            href={`/docs/${sec.slug}`}
                            className="group flex gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                style={{ backgroundColor: `${sec.color}15`, border: `1px solid ${sec.color}25` }}
                            >
                                <Icon size={15} style={{ color: sec.color }} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">{sec.title}</p>
                                    <ArrowRight size={12} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                                </div>
                                <p className="text-xs text-zinc-600 leading-relaxed">{sec.desc}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
