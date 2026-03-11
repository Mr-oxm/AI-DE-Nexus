import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Data Quality, Lineage & Governance",
subtitle: "What separates good data engineers from great ones — building trustworthy data that the whole company can rely on.",
accent: "#8b5cf6",
blocks: [
                { type: "h2", text: "Why This Matters More Than Ever" },
                { type: "p", text: "As you mature as a data engineer, writing correct code is the baseline expectation. What elevates you to senior level is understanding the long-term impact of the data systems you build: How does the business trust the data? Who is accountable when a metric is wrong? What happens when a pipeline is deleted — does anyone know which dashboards break? These questions belong to the domain of Data Governance." },
                { type: "p", text: "With the explosion of AI and machine learning, the stakes are even higher. AI systems make decisions — credit approvals, medical diagnoses, hiring recommendations — based on data. If that data is wrong, biased, or untracked, the consequences can be severe and legally actionable. Data governance is now a business-critical and legal requirement in many industries." },

                { type: "h2", text: "The Real Cost of Bad Data" },
                { type: "p", text: "Bad data is invisible until it's catastrophic. A pipeline can run successfully — green checkmarks everywhere — and still produce completely wrong numbers. The count of rows was correct; the transformation logic had a subtle bug. Dashboards showed a 15% revenue growth that didn't exist. The sales team celebrated. The discrepancy was discovered three weeks later during a finance audit." },
                { type: "p", text: "The cost of bad data is measured in three ways. Direct cost: business decisions made on false data (hiring, inventory, pricing). Reputational cost: when analysts discover your data is unreliable, they stop using it — and the entire data team loses credibility. It takes months to rebuild trust in a data platform. Recovery cost: going back through months of pipeline history to find when the bug was introduced, reprocessing everything, and notifying everyone whose reports were affected." },
                { type: "p", text: "Studies estimate that bad data costs organizations an average of $12.9 million per year (Gartner, 2021). For a data engineer, preventing this is as much your job as building fast pipelines. A pipeline that's fast but wrong is worse than no pipeline at all — it actively misleads the business." },
                { type: "p", text: "As you mature as a data engineer, writing correct code is the baseline expectation. What elevates you to senior level is understanding the long-term impact of the data systems you build: How does the business trust the data? Who is accountable when a metric is wrong? What happens when a pipeline is deleted — does anyone know which dashboards break? These questions belong to the domain of Data Governance." },
                { type: "p", text: "With the explosion of AI and machine learning, the stakes are even higher. AI systems make decisions — credit approvals, medical diagnoses, hiring recommendations — based on data. If that data is wrong, biased, or untracked, the consequences can be severe and legally actionable. Data governance is now a business-critical and legal requirement in many industries." },
                { type: "callout", variant: "important", text: "In interviews for senior DE roles, expect questions about your experience with data quality implementation, how you handle bad data in production, what data lineage tools you've used, and your opinions on governance in your organization. Have specific answers ready." },

                { type: "h2", text: "Data Quality vs Data Governance — The Distinction" },
                { type: "p", text: "These terms are often confused. Data Quality is operational — it's the day-to-day act of checking that your data meets standards: no nulls in required fields, no duplicates, values in expected ranges. It's something you implement in code, in the pipeline, measured by automated checks." },
                { type: "p", text: "Data Governance is strategic — it's the organizational framework that defines what quality means, who owns each dataset, what policies apply to sensitive data, how long data is retained, who can access what, and what happens when something goes wrong. Governance is the system. Quality is one output of that system." },
                { type: "p", text: "An analogy: if data is food, quality control is the kitchen inspector who checks that food is cooked to the right temperature. Governance is the entire food safety framework — laws, labeling requirements, supply chain traceability, recall procedures. You need both." },

                { type: "h2", text: "Data Quality — The Foundation" },
                { type: "p", text: "Data quality is multi-dimensional — there's no single check that tells you 'the data is good'. You need to test several properties simultaneously. Think of it like checking a product before shipping: is the item present (completeness)? Is it the right item (validity)? Is there only one (uniqueness)? Does it work (consistency)? Has it not expired (timeliness)?" },
                { type: "p", text: "The place in the pipeline where you check quality matters enormously. Checking at the end (after the Gold layer) means bad data has already flowed through your entire system. Checking at ingestion (Bronze layer) catches bad source data immediately. The medallion architecture is partly about this — each layer has a defined quality guarantee, and failing records are quarantined at the earliest possible stage rather than being silently passed through." },
                { type: "p", text: "Data quality is the degree to which data is accurate, complete, consistent, and fit for its intended purpose. Bad data quality is the silent killer of analytics teams — dashboards show wrong numbers, ML models produce bad predictions, and business decisions are made on false information." },
                {
                    type: "table", headers: ["Dimension", "Definition", "Example Issue", "Detection"], rows: [
                        ["Completeness", "Required fields are populated", "orders.customer_id is NULL in 5% of rows", "COUNT(field IS NULL) = 0"],
                        ["Uniqueness", "No duplicate records", "order_id appears twice due to pipeline retry", "COUNT(*) = COUNT(DISTINCT order_id)"],
                        ["Validity", "Values fall within expected domain", "amount = -500 or age = 999", "amount > 0 AND amount < 1,000,000"],
                        ["Consistency", "Related fields agree logically", "shipped_date < order_date — impossible", "shipped_date >= order_date"],
                        ["Timeliness", "Data is fresh enough for its use case", "Dashboard showing yesterday's data as today's", "MAX(event_date) >= CURRENT_DATE - 1"],
                        ["Referential Integrity", "FK values reference valid parent records", "order.customer_id not found in customers table", "LEFT JOIN + filter WHERE customers.id IS NULL"],
                        ["Volume", "Record count within expected range", "Pipeline loaded 0 rows silently", "COUNT BETWEEN expected_min AND expected_max"],
                    ]
                },

                { type: "h2", text: "Implementing Data Quality — Great Expectations" },
                { type: "p", text: "Great Expectations (GX) is the most widely used open-source Python library for data quality testing. You define 'expectations' (assertions about your data) in Python, run them against DataFrames or database tables, and get detailed HTML reports showing what passed and failed." },
                {
                    type: "code", lang: "python", code: `import great_expectations as gx
from great_expectations.dataset import PandasDataset
import pandas as pd

# Convert your DataFrame to a GX Dataset
df = pd.read_parquet('s3://bucket/silver/orders/2025-03-08/')
gx_df = PandasDataset(df)

# ─── Define expectations ───

# Completeness
gx_df.expect_column_values_to_not_be_null('order_id')
gx_df.expect_column_values_to_not_be_null('customer_id')
gx_df.expect_column_values_to_not_be_null('amount')

# Uniqueness
gx_df.expect_column_values_to_be_unique('order_id')

# Validity — value ranges
gx_df.expect_column_values_to_be_between('amount', min_value=0.01, max_value=1_000_000)
gx_df.expect_column_values_to_be_between('quantity', min_value=1, max_value=1000)

# Categorical values
gx_df.expect_column_values_to_be_in_set('status',
    ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']
)

# Data types
gx_df.expect_column_values_to_be_of_type('order_id', 'str')
gx_df.expect_column_values_to_be_of_type('amount', 'float')

# Volume check — at least 1000 rows, not more than 10M
gx_df.expect_table_row_count_to_be_between(min_value=1000, max_value=10_000_000)

# Column pattern match (e.g., order_ids must match ORD-XXXXXXXX)
gx_df.expect_column_values_to_match_regex('order_id', r'^ORD-[0-9]{8}$')

# Referential integrity (joined check)
valid_customer_ids = set(pd.read_parquet('s3://bucket/silver/customers/')['customer_id'])
gx_df.expect_column_values_to_be_in_set('customer_id', valid_customer_ids)

# ─── Run validation and get results ───
results = gx_df.validate()
if not results['success']:
    print("QUALITY CHECKS FAILED:")
    for r in results['results']:
        if not r['success']:
            print(f"  FAIL: {r['expectation_config']['expectation_type']} "
                  f"on column '{r['expectation_config']['kwargs'].get('column')}'")
    raise ValueError("Data quality validation failed — pipeline stopped!")

print(f"All {len(results['results'])} quality checks passed.")` },

                { type: "h3", text: "Soda — SQL-Native Quality Checks" },
                { type: "p", text: "Soda is a newer DQ tool that runs checks directly as SQL against your warehouse. Instead of loading data into Python, you write YAML configurations and Soda generates and runs the SQL. This is often faster for large datasets that already live in a warehouse." },
                {
                    type: "code", lang: "yaml", code: `# soda/checks/orders.yaml — declarative quality rules

checks for orders:
  # Completeness
  - missing_count(order_id) = 0:
      name: "No null order_ids"
  - missing_count(customer_id) = 0:
      name: "No null customer_ids"

  # Uniqueness
  - duplicate_count(order_id) = 0:
      name: "No duplicate orders"

  # Volume
  - row_count between 1000 and 10000000:
      name: "Row count in expected range"

  # Value validity
  - invalid_count(amount) = 0:
      valid min: 0
      valid max: 1000000
      name: "Amounts within valid range"

  # Status categorical check
  - invalid_count(status) = 0:
      valid values: [pending, confirmed, shipped, delivered, cancelled, refunded]
      name: "All statuses are valid values"

  # Freshness — data shouldn't be more than 2 days old
  - freshness(order_date) < 2d:
      name: "Orders fresher than 2 days"` },
                {
                    type: "code", lang: "bash", code: `# Run Soda checks (connects directly to Redshift, BigQuery, Snowflake, etc.)
soda scan -d my_warehouse -c soda_config.yaml soda/checks/orders.yaml

# Output:
# Soda | 5 checks in 3 check files
# Soda | All 5 checks passed!
# OR:
# FAIL | [duplicate_count(order_id) = 0] Actual duplicate_count(order_id): 47
# FAIL | [freshness(order_date) < 2d] Actual freshness: 3d10h45m` },

                { type: "h2", text: "Building a Quality-First Pipeline" },
                { type: "p", text: "Quality checks should be integrated at every stage of the pipeline — not bolted on as an afterthought. The quarantine pattern ensures bad data is captured and preserved for investigation, while good data flows cleanly to downstream consumers." },
                {
                    type: "code", lang: "python", code: `from pyspark.sql import DataFrame
from pyspark.sql.functions import current_timestamp, lit, when, col
from dataclasses import dataclass
from typing import List, Callable
import logging

@dataclass
class Check:
    name: str
    condition: str    # SQL WHERE clause — rows matching this are VALID
    severity: str     # 'critical' (stop pipeline) or 'warning' (log and continue)
    message: str

def apply_quality_checks(
    df: DataFrame,
    checks: List[Check],
    quarantine_path: str,
    pipeline_name: str
) -> DataFrame:
    """
    Split DataFrame into valid and invalid (quarantined) rows.
    Returns only the valid rows. Critical failures stop the pipeline.
    """
    df_valid = df
    df_quarantine = None
    has_critical_failure = False

    for check in checks:
        # Rows that PASS the check
        df_pass = df_valid.filter(check.condition)
        # Rows that FAIL the check
        df_fail = df_valid.filter(f"NOT ({check.condition})")

        fail_count = df_fail.count()

        if fail_count > 0:
            logging.warning(f"FAIL [{check.severity}] {check.name}: {fail_count} rows — {check.message}")

            # Tag failed rows with rejection reason + metadata
            df_fail_tagged = df_fail \
                .withColumn("_rejection_check", lit(check.name)) \
                .withColumn("_rejection_msg", lit(check.message)) \
                .withColumn("_rejected_at", current_timestamp()) \
                .withColumn("_pipeline", lit(pipeline_name))

            # Accumulate to quarantine
            df_quarantine = df_fail_tagged if df_quarantine is None \
                else df_quarantine.union(df_fail_tagged)

            # Only valid rows continue through the pipeline
            df_valid = df_pass

            if check.severity == 'critical':
                has_critical_failure = True
        else:
            logging.info(f"PASS {check.name}")

    # Write rejected rows to quarantine zone for investigation
    if df_quarantine:
        df_quarantine.write.mode("append").parquet(quarantine_path)
        logging.warning(f"Quarantined {df_quarantine.count()} rows to {quarantine_path}")

    if has_critical_failure:
        raise Exception(f"Critical quality failure in {pipeline_name}. Pipeline halted.")

    return df_valid

# Usage
checks = [
    Check("no_null_order_ids",   "order_id IS NOT NULL",          "critical", "Missing order_id"),
    Check("no_null_customers",   "customer_id IS NOT NULL",        "critical", "Missing customer_id"),
    Check("positive_amounts",    "amount > 0",                     "critical", "Non-positive amount"),
    Check("valid_status",        "status IN ('pending','shipped','delivered','refunded')", "warning", "Unknown status"),
    Check("date_not_future",     "order_date <= CURRENT_DATE",     "warning",  "Future-dated order"),
]

df_clean = apply_quality_checks(df_raw, checks, "s3://bucket/quarantine/orders/", "daily_orders")` },

                { type: "h2", text: "Data Lineage — Knowing Where Data Comes From" },
                { type: "p", text: "Lineage is the ability to answer: 'Where did this number come from?' Imagine a CFO looks at the daily revenue dashboard and sees an unexpected spike. She asks the data team: 'Is this real revenue or a data issue?' Without lineage, answering this question requires a detective hunt through pipelines, transformation scripts, and source tables — potentially taking days." },
                { type: "p", text: "With lineage, you have a map. You can trace: this 'Daily Revenue' metric comes from the fct_orders Gold table → which was built from silver_orders and silver_customers → silver_orders came from bronze_orders which was loaded from MySQL today at 2AM → and the MySQL load touched 1.2M rows. The data path is explicit, documented, and queryable. The investigation takes minutes, not days." },
                { type: "p", text: "Lineage has a second superpower: impact analysis. When the source team wants to rename a column in MySQL's orders table, without lineage you just hope nothing breaks. With lineage, you can instantly answer: 'If we rename orders.total to orders.amount, these 12 downstream tables and these 8 dashboards will break.' You can plan the migration proactively instead of reacting to fires." },
                { type: "p", text: "Data lineage is the ability to track data as it flows and transforms from source to destination. It answers: 'This dashboard metric is wrong — which pipeline produced it? Which source table did it come from? What transformations were applied?' Without lineage, debugging data issues is archaeology." },
                {
                    type: "code", lang: "text", code: `Example lineage graph for 'Daily Revenue by Country' metric:

Source Systems
──────────────
  MySQL: orders table
  PostgreSQL: customers table
  Salesforce API: exchange_rates endpoint

Ingestion Layer
──────────────
  MySQL → Fivetran → S3 raw_orders/ (daily, 2AM)
  PostgreSQL → Debezium CDC → Kafka → S3 raw_customers/ (real-time)
  Salesforce → Python Lambda → S3 raw_exchange_rates/ (daily, 1AM)

Transformation Layer
──────────────
  raw_orders → Spark ETL → S3 silver_orders/ (cleaned, validated)
  raw_customers → dbt model stg_customers → silver_customers/
  raw_exchange_rates → dbt model stg_fx_rates → silver_fx_rates/
  silver_orders + silver_customers + silver_fx_rates → dbt model fct_orders → gold_orders/

Serving Layer
──────────────
  gold_orders → Redshift: fct_orders table
  fct_orders → Tableau: "Daily Revenue by Country" dashboard

Lineage insight: If MySQL orders table schema changes, it affects:
  raw_orders → silver_orders → fct_orders → Dashboard
  (You know EXACTLY what breaks before it breaks!)` },

                { type: "h3", text: "dbt Lineage — Built-in for SQL Transformations" },
                { type: "p", text: "dbt automatically generates a lineage DAG from your {{ ref() }} calls. Every time you reference another model, dbt records the dependency — and uses it to build documentation, detect circular dependencies, and run tests in the correct order." },
                {
                    type: "code", lang: "sql", code: `-- models/marts/fct_orders.sql
-- dbt knows this depends on stg_orders, stg_customers, dim_exchange_rates
-- because of the {{ ref() }} calls

SELECT
    o.order_id,
    c.customer_name,
    c.country,
    o.amount * fx.rate AS amount_usd
FROM {{ ref('stg_orders') }} o                   -- dependency #1
JOIN {{ ref('stg_customers') }} c ON o.customer_id = c.customer_id  -- #2
JOIN {{ ref('dim_exchange_rates') }} fx           -- dependency #3
    ON o.currency = fx.currency AND o.order_date = fx.rate_date` },
                {
                    type: "code", lang: "bash", code: `# Generate and serve dbt docs (includes full lineage graph UI)
dbt docs generate
dbt docs serve   # → localhost:8080 → Lineage tab shows interactive DAG

# View column-level lineage (which source column maps to which output column)
dbt parse
# → generates manifest.json containing full graph + column-level lineage` },

                { type: "h3", text: "Apache Atlas & OpenLineage — Warehouse-Level Lineage" },
                { type: "p", text: "For lineage beyond dbt (cross-system, including Spark jobs, Airflow, Kafka), OpenLineage is the emerging open standard. It captures lineage events from Spark, Airflow, and dbt and sends them to a central backend (Marquez is the most popular open-source OpenLineage server)." },
                {
                    type: "code", lang: "python", code: `# OpenLineage integration in Airflow
# Add to airflow.cfg or environment:
# OPENLINEAGE_URL = http://marquez:5000
# OPENLINEAGE_NAMESPACE = production

# Airflow automatically emits START/COMPLETE events for each task
# containing: inputs (source tables), outputs (target tables), run metadata

# In your Spark job (to emit lineage):
from openlineage.client import OpenLineageClient
from openlineage.client.run import RunEvent, RunState, Run, Job, Dataset

client = OpenLineageClient.from_environment()

# Emit START event
client.emit(RunEvent(
    eventType=RunState.START,
    eventTime="2025-03-08T10:00:00Z",
    run=Run(run_id, {}),
    job=Job("spark_cluster", "orders_transform"),
    inputs=[Dataset("s3", "s3://bucket/bronze/orders/")],
    outputs=[Dataset("s3", "s3://bucket/silver/orders/")]
))` },

                { type: "h2", text: "Data Governance — The Big Picture Framework" },
                { type: "p", text: "Governance answers the questions that no individual pipeline can answer on its own: 'Who owns this dataset?' (so there's someone to call when it breaks). 'What does this column mean?' (so analysts don't misinterpret it). 'Can I share this data with our partner?' (so you don't accidentally leak customer PII). 'How long must we retain this data?' (so you comply with regulations). 'What happens when a data breach occurs?' (so you have a process, not a panic)." },
                { type: "p", text: "Governance is often treated as a documentation exercise — write down who owns what. But in practice, governance is engineered. It's enforced through access controls (you literally cannot access sensitive data without the right role). It's automated through quality checks (bad data is automatically quarantined). It's tracked through catalog tools that assign every table a steward and a quality score. The best governance systems make the right behavior the path of least resistance." },
                { type: "p", text: "Data governance is the collection of processes, policies, roles, and standards that ensure data is managed as a trustworthy business asset. It's the 'operating system' for how data is handled — from who can access it, to how long it's retained, to what happens when it's wrong." },
                {
                    type: "table", headers: ["Pillar", "Definition", "Practical Implementation"], rows: [
                        ["Data Catalog", "Central inventory of all datasets — where they are, what they contain, who owns them", "Apache Atlas, DataHub, AWS Glue Catalog, Google Dataplex, Alation"],
                        ["Data Classification", "Tag data by sensitivity (PII, financial, public, confidential)", "Schema-level tags in catalog; column-level tags in dbt; drives access control"],
                        ["Access Control", "Who can read/write which data?", "Role-based access via IAM, column-level security in Redshift/BigQuery, row-level security"],
                        ["Data Retention", "How long is data kept, when is it deleted?", "S3 lifecycle policies, Cassandra TTL, BigQuery table expiration, GDPR compliance"],
                        ["Data Stewardship", "Who is the business owner of each dataset?", "Each table in catalog has an assigned steward accountable for quality and definition"],
                        ["Change Management", "How are schema changes communicated?", "dbt schema.yml + PR review, breaking change alerts, consumer notification process"],
                        ["Incident Management", "What happens when data is wrong?", "Severity classification, root cause analysis process, SLA for fixes, communication plan"],
                    ]
                },

                { type: "h3", text: "Data Catalog — DataHub Example" },
                { type: "p", text: "A data catalog is a searchable inventory of all data assets in the organization. Engineers and analysts can find datasets, understand their schema, see lineage, check quality scores, and identify the owner — all without Slack-messaging someone." },
                {
                    type: "code", lang: "python", code: `# DataHub Python SDK — document a table in the catalog
from datahub.emitter.rest_emitter import DatahubRestEmitter
from datahub.metadata.schema_classes import *

emitter = DatahubRestEmitter("http://datahub:8080")

# Create a dataset metadata entity for a table
dataset_properties = DatasetPropertiesClass(
    description="Daily order fact table — one row per order line item. "
                "Updated daily at 7AM UTC. Source: MySQL orders + Salesforce exchange rates.",
    customProperties={
        "owner": "data-engineering@company.com",
        "sla": "07:00 UTC daily",
        "data_classification": "internal",
        "dbt_model": "fct_orders",
    }
)

# Add schema information
schema_metadata = SchemaMetadataClass(
    schemaName="fct_orders",
    platform="urn:li:dataPlatform:redshift",
    fields=[
        SchemaFieldClass(
            fieldPath="order_id",
            type=SchemaFieldDataTypeClass(type=StringTypeClass()),
            description="Unique identifier — sourced from MySQL orders.id",
            nativeDataType="VARCHAR(50)",
        ),
        SchemaFieldClass(
            fieldPath="amount_usd",
            type=SchemaFieldDataTypeClass(type=NumberTypeClass()),
            description="Order total converted to USD using daily FX rates",
            nativeDataType="DECIMAL(12,4)",
        ),
    ]
)

emitter.emit_mce(dataset_properties)   # publish to DataHub catalog` },

                { type: "h2", text: "PII Management and Compliance (GDPR / CCPA)" },
                { type: "p", text: "Personally Identifiable Information (PII) is any data that can identify an individual — names, emails, phone numbers, IP addresses, device IDs. GDPR (EU) and CCPA (California) impose legal requirements on how PII is stored, accessed, and deleted. Data engineers are directly responsible for implementing technical controls." },
                {
                    type: "code", lang: "python", code: `# ─── Column-level encryption for PII ───
from cryptography.fernet import Fernet
import hashlib

# One master key (stored in AWS Secrets Manager, not hardcoded)
fernet = Fernet(get_secret('pii_encryption_key'))

def encrypt_pii(value: str) -> str:
    """Encrypt sensitive field before storing."""
    return fernet.encrypt(value.encode()).decode()

def decrypt_pii(encrypted: str) -> str:
    """Decrypt — only authorized services with the key can do this."""
    return fernet.decrypt(encrypted.encode()).decode()

def hash_for_joining(value: str) -> str:
    """
    One-way hash for joining without exposing PII.
    Analytics can count unique users by hashed_id without knowing emails.
    """
    return hashlib.sha256(value.lower().strip().encode()).hexdigest()

# ─── Apply to pipeline ───
df_clean = df_raw \
    .withColumn("email_encrypted", udf(encrypt_pii, StringType())(col("email"))) \
    .withColumn("email_hash", udf(hash_for_joining, StringType())(col("email"))) \
    .drop("email")   # never store raw PII in data lake

# ─── Right to be Forgotten (GDPR Article 17) ───
# When user requests deletion, find and delete all their records
def delete_user_data(user_id: str, tables: list):
    """
    GDPR right-to-erasure implementation.
    Physically deletes all records associated with user_id.
    """
    for table_path in tables:
        # Delta Lake makes this possible without full table rewrite
        delta_table = DeltaTable.forPath(spark, table_path)
        delta_table.delete(condition=f"user_id = '{user_id}'")
        print(f"Deleted user {user_id} from {table_path}")` },

                { type: "h2", text: "Data Quality Monitoring in Production" },
                { type: "p", text: "Running checks once at pipeline time isn't enough. Data quality needs continuous monitoring — automated alerts when metrics deviate from expected patterns, even if the pipeline ran successfully." },
                {
                    type: "code", lang: "python", code: `# ─── Automated anomaly detection for quality monitoring ───
from scipy import stats
import numpy as np

def detect_volume_anomaly(
    table_name: str,
    todays_count: int,
    historical_counts: list,
    z_threshold: float = 3.0
) -> bool:
    """
    Detect if today's row count is statistically unusual vs recent history.
    Uses Z-score — how many standard deviations from the mean?
    """
    mean = np.mean(historical_counts)
    std = np.std(historical_counts)

    if std == 0:
        return False  # All historical values identical — no anomaly detection possible

    z_score = abs((todays_count - mean) / std)

    if z_score > z_threshold:
        print(f"ANOMALY: {table_name} has {todays_count} rows today "
              f"(mean={mean:.0f}, std={std:.0f}, z={z_score:.1f})")
        send_alert(f"Volume anomaly on {table_name}: {todays_count} rows (z={z_score:.1f})")
        return True

    print(f"OK: {table_name} {todays_count} rows (z={z_score:.1f})")
    return False

# Run daily after pipeline completes
historical = fetch_last_30_days_counts('fct_orders')
detect_volume_anomaly('fct_orders', todays_count=950_000, historical_counts=historical)

# ─── Track quality metrics over time (build your own DQ dashboard) ───
def log_quality_metric(table: str, metric: str, value: float, passed: bool):
    spark.createDataFrame([{
        'table_name': table,
        'metric_name': metric,
        'metric_value': value,
        'passed': passed,
        'measured_at': datetime.utcnow().isoformat(),
        'pipeline_run_id': run_id
    }]).write.mode("append").parquet("s3://bucket/audit/quality_metrics/")` },

                { type: "h2", text: "Interview Q&A" },
                {
                    type: "table", headers: ["Question", "Strong Answer"], rows: [
                        ["How have you implemented data quality in a past project?", "Describe concretely: 'In our Spark pipeline I implemented 12 quality checks using a custom QualityCheck class — completeness, uniqueness, validity, and referential integrity — that ran after every bronze→silver transformation. Failures were logged to a quality_audit table in Redshift, quarantined to a separate S3 prefix, and sent Slack alerts. Critical checks (null PKs, duplicate keys) stopped the pipeline; warnings continued with flagging.'"],
                        ["What tools have you used for data quality?", "Know Great Expectations and Soda at minimum. Great Expectations: Python-based, integrates with Spark/pandas, generates HTML data docs reports. Soda: YAML-based, runs as SQL against warehouse, integrates with Airflow natively. Also mention dbt tests (not_null, unique, accepted_values, relationships) as the zero-config option for warehouse tables."],
                        ["What is data lineage and why does it matter?", "Lineage is the complete map of data's journey — source systems → ingestion → transformations → serving layer. It matters because: (1) debugging — when a metric is wrong, trace exactly which pipeline and source caused it; (2) impact analysis — before changing a source table's schema, know exactly what downstream tables and dashboards break; (3) compliance — prove to auditors exactly how regulated data was transformed."],
                        ["What is a data catalog and how have you used it?", "A data catalog is a searchable directory of all data assets — tables, columns, pipelines, owners, quality scores, lineage. Tools: DataHub (LinkedIn, open-source), Apache Atlas, AWS Glue Catalog, Alation (commercial). Practical use: new analyst needs data about orders — searches catalog → finds fct_orders → sees schema, owner, freshness, example queries — without messaging the DE team."],
                        ["How do you handle GDPR right-to-erasure requests?", "Technical implementation: never store raw PII in the data lake — encrypt or hash at ingestion. Use hashed identifiers (SHA-256 of email) for analytics joins. For erasure: Delta Lake, Iceberg, or BigQuery DML DELETE make row-level deletion possible without full table rewrite. Maintain a deletion log with timestamp. Test that deletion cascades to all tables containing the user's data."],
                        ["What makes a data engineer senior-level in terms of governance?", "Senior DEs don't just build pipelines that work — they build pipelines that remain trustworthy over time. This means: data quality checks at every layer, lineage documentation, escalation paths when data is wrong, PII handling by design (not as an afterthought), data catalog entries for every table you own, schema change communication processes, and quarterly data quality metrics reviewed with stakeholders."],
                    ]
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
