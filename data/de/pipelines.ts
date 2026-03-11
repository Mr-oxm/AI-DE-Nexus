import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Pipeline Design",
subtitle: "End-to-end data pipeline architecture — from ingestion patterns to production fault tolerance and data quality.",
accent: "#f97316",
blocks: [
                { type: "h2", text: "What Is a Data Pipeline?" },
                { type: "p", text: "A data pipeline is an automated system that moves data from where it's generated (source) to where it's needed (destination), applying transformations along the way. Every time you see a dashboard update, a machine learning model make a prediction, or a recommendation system suggest a product, there's a data pipeline running behind it." },
                { type: "p", text: "Think of a pipeline like a water treatment system. Raw water (untreated source data) enters, goes through multiple processing stages (filtration, purification, testing), and exits as clean drinking water (analytics-ready data). Each stage has a specific purpose, and failure at any stage needs to be detected and handled." },

                { type: "h2", text: "The 5 Stages of a Data Pipeline" },
                {
                    type: "code", lang: "text", code: `Complete data pipeline:

[Sources]          [Ingestion]        [Processing]       [Storage]          [Serving]
──────────         ───────────        ────────────        ─────────          ─────────
MySQL (orders) →   Fivetran/          Spark ETL    →      Bronze (raw) →     Dashboards
PostgreSQL →       Airbyte/           dbt models   →      Silver (clean) →   ML Model
Kafka (events) →   Kafka Connect/     Data Quality →      Gold (agg)         APIs
APIs →             Custom Python      Deduplication                          Reports
S3 uploads →       PySpark                                                   Other systems` },
                {
                    type: "table", headers: ["Stage", "Purpose", "Key Tools", "Key Questions"], rows: [
                        ["Ingestion", "Move raw data from source to landing zone", "Fivetran, Airbyte, Kafka Connect, custom Python", "Batch or streaming? How often? Full or incremental?"],
                        ["Processing", "Clean, transform, and enrich data", "Spark, dbt, pandas, SQL", "Business logic? Joins needed? Aggregation level?"],
                        ["Storage", "Persist processed data durably", "S3, Delta Lake, BigQuery, Snowflake", "Format? Partitioning? Access patterns?"],
                        ["Serving", "Expose data to consumers", "SQL endpoints, REST APIs, export jobs", "Who needs what? Latency? Query patterns?"],
                        ["Orchestration", "Schedule, monitor, and recover", "Airflow, Prefect, Dagster", "Dependencies? Retries? Alerting?"],
                    ]
                },

                { type: "h2", text: "Batch vs Streaming Ingestion" },
                { type: "p", text: "The first major design decision for every pipeline. Batch processes data in periodic chunks (hourly, daily). Streaming processes data continuously as events arrive. The right choice depends entirely on the latency requirement — how old can the data be when it reaches the destination?" },
                {
                    type: "comparison",
                    left: {
                        label: "Batch Ingestion", items: [
                            "Runs on a schedule (hourly, daily, weekly)",
                            "Processes all data accumulated since last run",
                            "Simple: read file → transform → write",
                            "Higher latency (data is hours or days old)",
                            "Cheaper to operate (compute only during run)",
                            "Easy to re-run if something fails",
                            "Great for: reports, DWH population, ML training data",
                            "Tools: Spark, pandas, SQL COPY, dbt run",
                        ]
                    },
                    right: {
                        label: "Streaming Ingestion", items: [
                            "Runs continuously 24/7",
                            "Processes events within seconds of generation",
                            "Complex: state management, exactly-once, ordering",
                            "Low latency (data is seconds old)",
                            "More expensive (always-on compute)",
                            "Restart requires checkpoint management",
                            "Great for: fraud detection, live dashboards, IoT",
                            "Tools: Kafka, Spark Streaming, Flink, Kinesis",
                        ]
                    }
                },
                { type: "callout", variant: "tip", text: "Interview insight: Most companies use BOTH patterns. They stream events into a data lake in real time (Kafka → S3 via Kafka Connect) and then run batch Spark jobs to clean and aggregate the micro-batched files hourly. This is called the Lambda Architecture." },

                { type: "h2", text: "Ingestion Patterns in Practice" },
                { type: "h3", text: "Full Load" },
                { type: "p", text: "Load the entire source table every time. Simple but expensive at scale. Only use for small tables or when source doesn't have a reliable change-detection column." },
                {
                    type: "code", lang: "python", code: `# Full load: truncate destination and reload all source data
# Use when: source table is small (<1M rows) OR no way to detect changes

def full_load(source_table: str, dest_path: str):
    df = spark.read.jdbc(
        url=jdbc_url,
        table=source_table,
        properties=jdbc_props
    )

    df.write.mode("overwrite").parquet(dest_path)

    print(f"Full load complete: {df.count()} rows")

# Problems with full load:
# - Source table has 500M rows → takes hours every run
# - Unnecessary re-processing of unchanged data
# - Creates load on source database` },

                { type: "h3", text: "Incremental Load (Timestamp-Based)" },
                { type: "p", text: "Load only records that changed since the last run, using the updated_at timestamp. Much more efficient for large tables." },
                {
                    type: "code", lang: "python", code: `from datetime import datetime, timedelta
import duckdb

def incremental_load(
    source_table: str,
    dest_path: str,
    watermark_table: str,
    pipeline_name: str
):
    # Step 1: Get last successful load timestamp
    watermark = duckdb.execute(f"""
        SELECT MAX(loaded_at)
        FROM {watermark_table}
        WHERE pipeline = '{pipeline_name}'
        AND status = 'success'
    """).fetchone()[0]

    # Default to 7 days ago if first run
    if watermark is None:
        watermark = datetime.utcnow() - timedelta(days=7)

    print(f"Loading changes since: {watermark}")

    # Step 2: Load only changed records
    df_new = spark.read.jdbc(
        url=jdbc_url,
        table=source_table,
        predicates=[f"updated_at > '{watermark}'"],
        numPartitions=10,             # parallel JDBC reads
        properties=jdbc_props
    )

    row_count = df_new.count()
    print(f"Found {row_count} new/changed records")

    if row_count == 0:
        print("No changes — skipping write")
        log_watermark(watermark_table, pipeline_name, 'success', 0)
        return

    # Step 3: Append new records (or merge if updates exist)
    df_new.write.mode("append").parquet(dest_path)

    # Step 4: Log watermark for next run
    log_watermark(watermark_table, pipeline_name, 'success', row_count)

# Limitation: requires updated_at column on source table
# Limitation: hard deletes not captured (use CDC for that)` },

                { type: "h3", text: "Change Data Capture (CDC)" },
                { type: "p", text: "CDC reads the database's write-ahead log (WAL) or binlog to capture every INSERT, UPDATE, and DELETE in real time — including hard deletes. This is the most complete and least intrusive ingestion pattern." },
                {
                    type: "code", lang: "text", code: `CDC with Debezium (most popular CDC tool):

Source Database               Debezium               Kafka Topics
──────────────────            ─────────────────      ─────────────────────
PostgreSQL WAL       →        Debezium               → db.orders (INSERTs)
(Write-Ahead Log)    capture  Connector              → db.orders (UPDATEs)
binlog, redo log              (Source Connector)     → db.orders (DELETEs)

Each message in Kafka contains:
{
  "op": "u",           ← operation: i=insert, u=update, d=delete, r=read (snapshot)
  "before": {          ← previous state (null for inserts)
    "id": 101,
    "status": "pending"
  },
  "after": {           ← new state (null for deletes)
    "id": 101,
    "status": "shipped",
    "updated_at": "2025-03-08T10:30:00Z"
  },
  "ts_ms": 1741427400000  ← exact timestamp from source DB log
}

Advantages:
✓ Captures hard deletes (that timestamp-based misses)
✓ Zero load on source database (reads from binlog, not table)
✓ Sub-second latency (near real-time change propagation)
✓ Complete change history (every intermediate state captured)

Disadvantages:
✗ Requires database-level permissions (REPLICATION role)
✗ More complex infrastructure (Debezium, Kafka Connect, Schema Registry)
✗ Schema changes can break CDC connector (needs careful management)` },

                { type: "h2", text: "The Medallion Architecture" },
                { type: "p", text: "The Medallion Architecture (Bronze → Silver → Gold) is the most widely adopted data lake organization pattern. It was popularized by Databricks and is now the standard approach for organizing data in a cloud data lake." },
                {
                    type: "code", lang: "text", code: `Medallion Architecture:

SOURCE SYSTEMS                 DATA LAKE                          SERVING
──────────────                 ──────────────────────────────     ─────────────
App databases      →  BRONZE  →  SILVER  →  GOLD            →   BI Dashboards
Kafka streams          (raw)     (clean)    (aggregated)        ML Models
APIs                                                             Business Reports
Partner files

BRONZE (Raw Zone):
• Exact copy of source data — no transformations
• Stored as-is: JSON, CSV, Avro exactly as received
• Append-only — never deleted (immutable audit log)
• Full history: every version of every record
• Example: raw_orders_20250308.json with typos and duplicates intact

SILVER (Cleaned Zone):
• Standardized data types (dates parsed, amounts as decimals)
• Deduplication (one row per natural key)
• Null handling (required fields validated, optional fields coalesced)
• Standardized formats (country codes, phone numbers, emails)
• Schema enforced (rejects invalid data)
• Example: orders_cleaned table: valid, deduplicated order records

GOLD (Aggregated/Business Zone):
• Business logic applied (metrics, KPIs, aggregations)
• Joined with dimensions (customer name, product category)
• Denormalized for analytical performance
• Tables ready for direct dashboard consumption
• Example: daily_revenue_by_country, customer_lifetime_value, product_performance` },

                { type: "h3", text: "Bronze Layer — Raw Preservation" },
                {
                    type: "code", lang: "python", code: `def ingest_to_bronze(source: str, date: str, raw_data) -> str:
    """
    Land raw data to bronze — NEVER transform, just store.
    Always store original + metadata.
    """
    bronze_path = f"s3://datalake/bronze/{source}/year=2025/month=03/day=08/"

    # Preserve original data exactly
    raw_df = spark.createDataFrame(raw_data)
    raw_df \
        .withColumn("_bronze_ingested_at", current_timestamp()) \
        .withColumn("_bronze_source", lit(source)) \
        .withColumn("_bronze_batch_id", lit(str(uuid.uuid4()))) \
        .write \
        .mode("append") \
        .parquet(bronze_path)

    return bronze_path

# Bronze principles:
# 1. Append-only: never delete or modify bronze data
# 2. Add metadata: ingestion timestamp, source, batch ID
# 3. Store original format when possible
# 4. Partition by ingestion date (for efficient cleanup and discovery)
# 5. Retain for 90+ days (or indefinitely for compliance)` },

                { type: "h3", text: "Silver Layer — Data Quality and Standardization" },
                {
                    type: "code", lang: "python", code: `from pyspark.sql.functions import *
from pyspark.sql.window import Window

def transform_to_silver(bronze_path: str, silver_path: str, run_date: str):
    """
    Transform bronze → silver:
    - Parse types
    - Deduplicate
    - Validate required fields
    - Standardize formats
    - Reject invalid records
    """
    df_raw = spark.read.parquet(bronze_path)

    # ─── 1. Parse types ───
    df_typed = df_raw \
        .withColumn("order_date", to_date(col("order_date"), "yyyy-MM-dd")) \
        .withColumn("amount", col("amount").cast("decimal(10,2)")) \
        .withColumn("customer_id", trim(upper(col("customer_id")))) \
        .withColumn("country_code", trim(upper(col("country_code"))))

    # ─── 2. Deduplication: keep latest version per order ───
    window = Window.partitionBy("order_id").orderBy(col("_bronze_ingested_at").desc())
    df_deduped = df_typed \
        .withColumn("rn", row_number().over(window)) \
        .filter(col("rn") == 1) \
        .drop("rn")

    # ─── 3. Separate valid from invalid records ───
    df_valid = df_deduped.filter(
        col("order_id").isNotNull() &
        col("customer_id").isNotNull() &
        col("amount").isNotNull() &
        (col("amount") > 0) &
        col("order_date").isNotNull()
    )

    df_invalid = df_deduped.filter(
        col("order_id").isNull() |
        col("customer_id").isNull() |
        col("amount").isNull() |
        (col("amount") <= 0) |
        col("order_date").isNull()
    ).withColumn("rejection_reason",
        when(col("order_id").isNull(), "null_order_id")
        .when(col("amount") <= 0, "non_positive_amount")
        .otherwise("other")
    )

    # Write valid records to silver
    df_valid.write.mode("overwrite").partitionBy("order_date").parquet(silver_path)

    # Write rejected records to quarantine zone (for investigation)
    df_invalid.write.mode("append").parquet(f"s3://datalake/quarantine/orders/{run_date}/")

    print(f"Valid: {df_valid.count()}, Invalid: {df_invalid.count()}")` },

                { type: "h3", text: "Gold Layer — Business-Ready Aggregations" },
                {
                    type: "code", lang: "python", code: `def build_gold_daily_revenue(silver_orders: str, silver_customers: str, gold_path: str):
    """
    Build daily_revenue_by_country gold table:
    - Join orders + customers
    - Aggregate by date + country
    - Add derived KPIs
    """
    df_orders = spark.read.parquet(silver_orders)
    df_customers = spark.read.parquet(silver_customers)

    df_enriched = df_orders.join(
        broadcast(df_customers.select("customer_id", "country", "tier")),
        "customer_id"
    )

    df_gold = df_enriched \
        .groupBy("order_date", "country", "tier") \
        .agg(
            count("order_id").alias("total_orders"),
            sum("amount").alias("gross_revenue"),
            avg("amount").alias("avg_order_value"),
            countDistinct("customer_id").alias("unique_customers"),
            sum(when(col("is_new_customer"), 1).otherwise(0)).alias("new_customers")
        ) \
        .withColumn("revenue_per_customer",
                    round(col("gross_revenue") / col("unique_customers"), 2))

    df_gold.write \
        .format("delta") \
        .mode("overwrite") \
        .partitionBy("order_date", "country") \
        .save(gold_path)` },

                { type: "h2", text: "Partitioning Strategy" },
                { type: "p", text: "Partitioning physically organizes your files on disk into subdirectories by column value. When queries filter on the partition column, entire directories are skipped — they're never read. This is the most impactful performance optimization for large tables." },
                {
                    type: "code", lang: "python", code: `# ─── Bad partitioning: too many small files ───
# Partitioning by high-cardinality column = thousands of directories
df.write.partitionBy("user_id").parquet("output/")
# → 1M user_ids = 1M directories = 1M tiny files = slow

# ─── Good partitioning: date-based (most common pattern) ───
df.write.partitionBy("year", "month", "day").parquet("s3://bucket/orders/")
# → s3://bucket/orders/year=2025/month=03/day=08/part-000.parquet
# → Query WHERE day=2025-03-08 only reads one folder!

# ─── Multi-column partitioning ───
df.write.partitionBy("country", "year", "month").parquet("output/")
# → output/country=Egypt/year=2025/month=03/
# → Query WHERE country=Egypt reads only Egypt folders!

# ─── How Spark uses partition pruning ───
df = spark.read.parquet("s3://bucket/orders/")
df.filter(col("year") == 2025).filter(col("country") == "Egypt").show()
# Spark reads ONLY: s3://bucket/orders/year=2025/country=Egypt/
# Everything else: not touched

# ─── Sizing partitions correctly ───
# Target: ~128-512MB per partition file (good for Spark reads)
# Too small (< 32MB): too many files, slow listing, metadata overhead
# Too large (> 1GB): slow for single tasks, hard to parallelize

# Check file sizes after write:
# aws s3 ls s3://bucket/orders/year=2025/month=03/day=08/ --recursive --human-readable` },

                { type: "h2", text: "dbt — The Transformation Layer Standard" },
                { type: "p", text: "dbt (data build tool) is the most important tool in the modern data stack for the transformation (T) stage of ELT. It lets you write pure SQL SELECT statements, and dbt handles everything else: dependency management, testing, documentation, and version control." },
                {
                    type: "code", lang: "sql", code: `-- models/staging/stg_orders.sql
-- Reference other models with {{ ref() }} — dbt handles the dependency graph
-- This model depends on raw_orders (already in the warehouse)

SELECT
    id AS order_id,
    TRIM(UPPER(customer_id)) AS customer_id,
    CAST(amount AS DECIMAL(10,2)) AS amount,
    CAST(order_date AS DATE) AS order_date,
    LOWER(TRIM(status)) AS status,
    created_at

FROM {{ source('raw', 'orders') }}       -- reference raw source table
WHERE id IS NOT NULL
  AND amount > 0` },
                {
                    type: "code", lang: "sql", code: `-- models/marts/fct_orders.sql
-- Final fact table — depends on staging models

WITH orders AS (
    SELECT * FROM {{ ref('stg_orders') }}         -- depends on stg_orders
),

customers AS (
    SELECT * FROM {{ ref('stg_customers') }}       -- depends on stg_customers
),

products AS (
    SELECT * FROM {{ ref('stg_products') }}

),

final AS (
    SELECT
        o.order_id,
        o.order_date,
        c.customer_name,
        c.country,
        c.customer_tier,
        p.product_name,
        p.category,
        o.amount,
        o.amount * fx.rate AS amount_usd
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id
    LEFT JOIN products p ON o.product_id = p.product_id
    LEFT JOIN {{ ref('dim_exchange_rates') }} fx
        ON o.currency = fx.currency AND o.order_date = fx.rate_date
)

SELECT * FROM final` },
                {
                    type: "code", lang: "yaml", code: `# models/marts/schema.yml — dbt tests and documentation

version: 2

models:
  - name: fct_orders
    description: "Order fact table — one row per order line item. Primary grain."

    columns:
      - name: order_id
        description: "Unique order identifier from source system"
        tests:
          - not_null             # fail if any NULL in this column
          - unique              # fail if any duplicates

      - name: amount
        description: "Order amount in original currency"
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 1000000

      - name: status
        tests:
          - accepted_values:     # fail if any value not in this list
              values: ['pending', 'completed', 'refunded', 'cancelled']

      - name: customer_id
        tests:
          - not_null
          - relationships:       # referential integrity check
              to: ref('stg_customers')
              field: customer_id` },
                {
                    type: "code", lang: "bash", code: `# dbt commands
dbt run                    # run all models (build all tables/views)
dbt run --select fct_orders # run only specific model
dbt test                   # run all data tests
dbt docs generate          # build documentation website
dbt docs serve             # serve docs at localhost:8080

# Incremental models (only process new/changed data)
# Add this config to model file:
# {{ config(materialized='incremental', unique_key='order_id') }}
# On first run: builds full table
# On subsequent runs: only merges new records` },

                { type: "h2", text: "Data Quality Framework" },
                { type: "p", text: "Data quality issues are the #1 cause of trust erosion between engineering and analytics teams. Systematically implementing quality checks at every pipeline layer prevents bad data from silently corrupting downstream metrics." },
                {
                    type: "table", headers: ["Quality Dimension", "Definition", "Check Example", "Consequence If Broken"], rows: [
                        ["Completeness", "Required fields are not null", "orders.customer_id IS NOT NULL", "Joins fail; metrics exclude records silently"],
                        ["Uniqueness", "No duplicate records", "COUNT(order_id) = COUNT(DISTINCT order_id)", "Double-counting in aggregate metrics"],
                        ["Validity", "Values within expected domain", "amount BETWEEN 0 AND 1,000,000", "Outliers skew averages; impossible metrics"],
                        ["Consistency", "Related fields are logically consistent", "end_date >= start_date; shipped_date >= order_date", "Negative durations; logical impossibilities"],
                        ["Timeliness", "Data arrives within expected window", "MAX(order_date) >= CURRENT_DATE - 1", "Dashboard shows yesterday's stale data as today's"],
                        ["Referential Integrity", "Foreign keys reference valid parent records", "All order.customer_id exists in customer_dim", "Orphaned records; broken joins in analytics"],
                        ["Volume", "Row count within expected range", "COUNT > 0; COUNT between X and Y", "Empty table after failed load goes unnoticed"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `from great_expectations import get_context
from dataclasses import dataclass
from typing import List
import logging

@dataclass
class QualityCheck:
    name: str
    query: str
    expected: str   # 'zero_rows', 'positive_count', 'equals_X'
    severity: str   # 'critical', 'warning'

def run_quality_checks(df, checks: List[QualityCheck], pipeline_name: str):
    """
    Run a battery of data quality checks.
    Critical failures → raise exception → pipeline stops
    Warnings → log and continue
    """
    results = []
    has_critical_failure = False

    for check in checks:
        result_df = spark.sql(check.query)
        value = result_df.collect()[0][0]

        passed = False
        if check.expected == 'zero_rows' and value == 0:
            passed = True
        elif check.expected == 'positive_count' and value > 0:
            passed = True

        status = '✓ PASS' if passed else '✗ FAIL'
        logging.info(f"{status} | {check.name} | value={value}")
        results.append({'check': check.name, 'passed': passed, 'value': value})

        if not passed and check.severity == 'critical':
            has_critical_failure = True

    # Save check results to audit table
    spark.createDataFrame(results) \
        .withColumn("pipeline", lit(pipeline_name)) \
        .withColumn("checked_at", current_timestamp()) \
        .write.mode("append").parquet("s3://audit/quality_checks/")

    if has_critical_failure:
        raise Exception(f"Critical quality check(s) failed for {pipeline_name}!")

# Example usage
checks = [
    QualityCheck("no_null_order_ids",
                 "SELECT COUNT(*) FROM orders WHERE order_id IS NULL",
                 "zero_rows", "critical"),
    QualityCheck("no_duplicates",
                 "SELECT COUNT(*)-COUNT(DISTINCT order_id) FROM orders",
                 "zero_rows", "critical"),
    QualityCheck("positive_amounts",
                 "SELECT COUNT(*) FROM orders WHERE amount <= 0",
                 "zero_rows", "warning"),
    QualityCheck("fresh_data",
                 "SELECT DATEDIFF(CURRENT_DATE, MAX(order_date)) FROM orders",
                 "zero_rows", "critical"),  # max date = today
    QualityCheck("volume_reasonable",
                 "SELECT CASE WHEN COUNT(*) BETWEEN 10000 AND 5000000 THEN 0 ELSE 1 END FROM orders",
                 "zero_rows", "warning"),
]

run_quality_checks(df_orders, checks, "daily_orders_pipeline")` },

                { type: "h2", text: "Fault Tolerance Patterns" },
                { type: "p", text: "Production pipelines fail. Networks timeout, cloud services have outages, data files get corrupted. Fault tolerance design is about ensuring pipelines fail gracefully, recover automatically, and never produce incorrect results." },
                {
                    type: "table", headers: ["Pattern", "What It Does", "Implementation"], rows: [
                        ["Idempotent writes", "Running same pipeline twice → same result as running once (no duplicates)", "Overwrite or MERGE instead of APPEND; use order_id as key"],
                        ["Checkpoint/watermark", "Pipeline records last successful position; resumes from there on restart", "Airflow: log watermark to DB; Spark Streaming: checkpointLocation"],
                        ["Atomic writes", "Write fully succeeds or fully fails — no partial states", "Write to temp path → rename to final; rely on Delta ACID"],
                        ["Dead Letter Queue", "Failed/invalid records sent to quarantine instead of crashing pipeline", "separate 'failed' partition or dead_letter_topic in Kafka"],
                        ["Circuit breaker", "If downstream system (DB, API) is down, stop hitting it and alert", "Retry N times → stop and alert instead of infinite retry loop"],
                        ["Backpressure", "Slow consumers signal producers to slow down (prevents OOM)", "Kafka: consumer lag monitoring; Spark: rate limiting via maxOffsetsPerTrigger"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `# ─── Atomic write pattern ───
def atomic_write(df, final_path: str, temp_path: str):
    """
    Ensure destination is either fully updated or not changed at all.
    No reader sees partial data.
    """
    # Write to temp location first
    df.write.mode("overwrite").parquet(temp_path)

    # Only after successful write: atomically rename/move
    s3.move_directory(temp_path, final_path)  # atomic at POSIX level

# ─── Idempotent write: MERGE instead of INSERT ───
def idempotent_write(df_new: DataFrame, table_path: str, unique_key: str):
    """Safe re-runnable write — no duplicates if run twice."""
    try:
        target = DeltaTable.forPath(spark, table_path)
        target.alias("t").merge(
            df_new.alias("s"),
            f"t.{unique_key} = s.{unique_key}"
        ).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()
    except Exception as e:
        if "is not a Delta table" in str(e):
            # First run: create the table
            df_new.write.format("delta").save(table_path)
        else:
            raise

# ─── Dead Letter Queue pattern ───
def process_with_dlq(df: DataFrame, process_fn, dlq_path: str):
    """Process records; bad ones go to quarantine instead of crashing."""
    good_records = []
    bad_records = []

    for row in df.collect():
        try:
            processed = process_fn(row.asDict())
            good_records.append(processed)
        except Exception as e:
            bad_records.append({**row.asDict(), "_error": str(e)})

    if good_records:
        spark.createDataFrame(good_records).write.mode("append").parquet("output/")
    if bad_records:
        spark.createDataFrame(bad_records).write.mode("append").parquet(dlq_path)

    print(f"Success: {len(good_records)}, Failed (DLQ): {len(bad_records)}")` },

                { type: "h2", text: "System Design Framework for Interviews" },
                { type: "p", text: "When asked to design a data pipeline in an interview, use this structured framework to demonstrate senior-level thinking. Don't jump to implementation — clarify requirements first." },
                {
                    type: "list", items: [
                        "1. Clarify requirements: source systems? Volume (rows/day)? Velocity (events/sec)? Latency target? Who are the consumers? What queries need to work?",
                        "2. Estimate scale: 1M orders/day × 500 bytes = 500MB/day = ~180GB/year. Fits in one Spark executor? Needs a cluster? Storage tier?",
                        "3. Define the ingestion layer: batch or streaming? Full load or incremental? CDC needed for deletes?",
                        "4. Design the transformation: Bronze → Silver → Gold? What business logic? What grain? What joins?",
                        "5. Choose storage: warehouse vs lake? Partitioning strategy? File format? Row count per file?",
                        "6. Plan for data quality: what checks? Where in the pipeline? What happens on failure?",
                        "7. Plan for fault tolerance: idempotent writes? Checkpoints? Dead letter queues? Alerting?",
                        "8. Orchestration: scheduling, dependencies, retries, monitoring",
                    ]
                },
                {
                    type: "code", lang: "text", code: `Interview Example: Design a clickstream analytics pipeline

Q: Design a pipeline to track user clicks on an e-commerce site,
   available for analytics within 1 hour.

1. REQUIREMENTS:
   - Source: web frontend → 10M clicks/day = ~115 clicks/second
   - Latency: 1 hour (batch acceptable)
   - Consumers: BI dashboard (Tableau), data science team
   - Questions: clicks by page, bounce rate, funnel analysis, user sessions

2. VOLUME:
   - 10M clicks/day × 200 bytes = 2GB/day = ~700GB/year
   - Manageable with Spark, no need for exotic infrastructure

3. INGESTION:
   - Frontend → Kafka topic 'click-events' (handles spikes gracefully)
   - Kafka → S3 Bronze via Kafka Connect (writes Parquet every 10 min)

4. TRANSFORMATION (hourly Airflow DAG):
   - Bronze → Silver: deduplicate session_id+event_id, parse timestamps,
                      validate url/user_agent, standardize country codes
   - Silver → Gold: aggregate by hour+page, compute session boundaries,
                    join with user_dim for demographics

5. STORAGE:
   - Bronze: s3://data/bronze/clicks/year=2025/month=03/day=08/hour=10/
   - Silver: Delta Lake (schema enforcement + ACID)
   - Gold: Snowflake (direct BI tool queries)

6. DATA QUALITY:
   - Min/max click count per hour (volume check)
   - No infinite sessions (duration < 4 hours)
   - Valid user_ids reference user table

7. FAULT TOLERANCE:
   - Kafka retains 7 days (can replay)
   - Idempotent bronze write (partition by hour, overwrite mode)
   - Spark checkpoints for Silver transform
   - dbt tests for Gold layer

8. ORCHESTRATION:
   - Airflow DAG: hourly at :05 (5 min after hour to collect late events)
   - Retry: 3x with 2 min delay
   - SLA alert: if not done by :45, alert on-call` },

                { type: "h2", text: "Interview Q&A" },
                {
                    type: "table", headers: ["Question", "Strong Answer"], rows: [
                        ["Batch vs streaming — when do you use each?", "Streaming when latency < 1 minute (fraud detection, live dashboards, IoT alerts). Batch when hourly or daily freshness is acceptable and cost matters (most reporting, ML training, data warehousing). The majority of data engineering workloads are batch — streaming adds significant complexity."],
                        ["What is the Medallion Architecture's main benefit?", "Raw data (Bronze) is always preserved for replay and audit. Clean data (Silver) is used by data scientists who need validated, normalized data. Aggregated business metrics (Gold) are used by analysts and dashboards without needing to write complex SQL. Each layer has a clear purpose and clear quality guarantee."],
                        ["How do you make a pipeline idempotent?", "Use MERGE/upsert (not INSERT) with natural key. Overwrite partitions rather than appending (static partitions prevent double-counting). Include the pipeline run_id in output so duplicates can be identified. Store watermarks so reruns start from the same point."],
                        ["How do you handle schema changes in pipelines?", "Fail loudly on unexpected schema changes (schema validation at ingestion). For additive changes (new columns): Delta Lake and Iceberg handle gracefully with mergeSchema=true. For breaking changes (type changes, drops): create new pipeline version, backfill, deprecate old. dbt tests catch unexpected column type drift in transformation layer."],
                        ["What metrics do you monitor for a production pipeline?", "Pipeline SLA (did it finish within expected time?), row counts at each stage (no unexpected drops), data freshness (max(date) = today or recent), error rates (rejects, DLQ size), data quality check pass rates, and Kafka consumer lag for streaming pipelines."],
                    ]
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
