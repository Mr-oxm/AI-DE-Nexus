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

import { DocsHome } from "@/app/components/DocsHome";

export default function DocsIndexPage() {
    return (
        <DocsHome
            title="DE Knowledge Base"
            description="A comprehensive, structured reference for Data Engineering — distilled from deep learning sessions, covering every topic interviewed at top companies."
            basePath="/docs/de"
            groups={[{ items: sections }]}
        />
    );
}
