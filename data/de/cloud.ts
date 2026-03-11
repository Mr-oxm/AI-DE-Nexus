import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Cloud Technologies",
subtitle: "AWS, GCP, and Azure for data engineers — the services that matter, how they connect, and how to pass the cloud round in interviews.",
accent: "#f59e0b",
blocks: [
                { type: "h2", text: "Why Cloud Is Now Non-Negotiable" },
                { type: "p", text: "A few years ago, knowing cloud was a nice bonus. Today it's a baseline requirement. Most enterprises are actively migrating on-premise infrastructure to cloud — and even companies that stay hybrid use cloud storage and compute for their data platforms. Every modern data stack runs on one of three clouds: AWS, GCP, or Azure." },
                { type: "p", text: "The good news: you don't need to know every cloud service (there are hundreds). For data engineering, there's a focused set of services per cloud provider. Master those, understand how they connect, and you're well ahead of most candidates." },
                { type: "callout", variant: "tip", text: "You can learn and experiment for FREE. AWS Free Tier and GCP Free Tier both give you enough compute and storage to run real DE projects. Create accounts, build pipelines, and reference your hand-on experience in interviews — this is far more valuable than theoretical knowledge." },

                { type: "h2", text: "What Is Cloud Computing? (The Mental Model)" },
                { type: "p", text: "Before the cloud, every company had to buy physical servers, put them in a room, hire people to maintain them, and plan years in advance how much capacity they'd need. The problem: you over-provision (waste money) or under-provision (crash during traffic spikes). Cloud computing flips this model entirely." },
                { type: "p", text: "Cloud providers (AWS, GCP, Azure) own massive data centers around the world — thousands of servers. They rent you access to those resources by the hour, second, or even per request. You get exactly as much compute and storage as you need, when you need it, scaled automatically. You pay only for what you use, like a utility bill." },
                { type: "p", text: "As a data engineer, this means: you can spin up a 100-node Spark cluster for 3 hours to process a massive dataset, pay ~$150, then delete the cluster. Previously that would have required purchasing $500,000 worth of hardware that sat idle 23 hours a day." },
                { type: "callout", variant: "info", text: "The three delivery models you'll hear: IaaS (Infrastructure as a Service) = raw virtual machines, you manage the software. PaaS (Platform as a Service) = managed runtime like Glue or EMR, you write the code. SaaS (Software as a Service) = full application like BigQuery or Snowflake, you just query. Most data engineering uses PaaS and SaaS." },

                { type: "h2", text: "The Core DE Stack — Per Cloud Provider" },
                {
                    type: "table", headers: ["Category", "AWS", "GCP", "Azure"], rows: [
                        ["Object Storage", "S3 (Simple Storage Service)", "Cloud Storage (GCS)", "Azure Data Lake Storage Gen2 (ADLS)"],
                        ["Data Warehouse", "Redshift", "BigQuery", "Synapse Analytics"],
                        ["Managed Spark", "EMR (Elastic MapReduce)", "Dataproc", "Azure Databricks / HDInsight"],
                        ["Serverless ETL", "AWS Glue", "Dataflow (Apache Beam)", "Azure Data Factory"],
                        ["Stream Processing", "Kinesis", "Pub/Sub + Dataflow", "Azure Event Hubs"],
                        ["Orchestration", "Step Functions / MWAA (Managed Airflow)", "Cloud Composer (Managed Airflow)", "Azure Managed Airflow / Data Factory"],
                        ["Metadata / Catalog", "AWS Glue Data Catalog", "Dataplex / Data Catalog", "Azure Purview"],
                        ["Functions (Serverless)", "Lambda", "Cloud Functions", "Azure Functions"],
                        ["IAM / Security", "IAM (Identity and Access Management)", "IAM + Service Accounts", "Azure Active Directory + RBAC"],
                        ["Secrets Management", "AWS Secrets Manager / SSM Parameter Store", "Secret Manager", "Azure Key Vault"],
                        ["Container Runtime", "ECS / EKS (Kubernetes)", "GKE (Google Kubernetes Engine)", "AKS (Azure Kubernetes Service)"],
                    ]
                },

                { type: "h2", text: "AWS — The Most Common Cloud in DE Interviews" },
                { type: "p", text: "AWS is the market leader and appears most frequently in interviews. The AWS data engineering stack is built around S3 as the central storage hub, with a constellation of compute and processing services surrounding it." },

                { type: "h3", text: "S3 — The Foundation of Every AWS Data Platform" },
                { type: "p", text: "S3 (Simple Storage Service) is object storage — think of it as a massively scalable filesystem where you store files of any type (Parquet, CSV, JSON, Avro, Delta, images, logs). Every AWS data pipeline starts and ends with S3. It's the data lake." },
                {
                    type: "code", lang: "text", code: `S3 Key Concepts:

Bucket: The top-level container (like a filesystem root)
  s3://company-data-lake/

Prefix (pseudo-folder): Grouped by / in the key name
  s3://company-data-lake/raw/orders/year=2025/month=03/day=08/

Object: A single file stored at a key
  s3://company-data-lake/raw/orders/year=2025/month=03/day=08/part-001.parquet

S3 Storage Classes (cost vs access trade-off):
┌──────────────────────────┬──────────────┬────────────┬──────────────────────────┐
│ Class                    │ Cost/GB/mo   │ Latency    │ Use Case                 │
├──────────────────────────┼──────────────┼────────────┼──────────────────────────┤
│ Standard                 │ $0.023       │ ms         │ Active data lake files   │
│ Intelligent-Tiering      │ Variable     │ ms         │ Unknown access patterns  │
│ Standard-IA              │ $0.0125      │ ms         │ Infrequent access data   │
│ Glacier Instant          │ $0.004       │ ms         │ Archives, <quarterly     │
│ Glacier Flexible         │ $0.0036      │ minutes    │ Cold archives            │
│ Glacier Deep Archive     │ $0.00099     │ hours      │ 7+ year compliance holds │
└──────────────────────────┴──────────────┴────────────┴──────────────────────────┘` },
                {
                    type: "code", lang: "python", code: `import boto3
from botocore.exceptions import ClientError

s3 = boto3.client('s3', region_name='us-east-1')

# ─── List objects in a prefix ───
response = s3.list_objects_v2(
    Bucket='company-data-lake',
    Prefix='raw/orders/year=2025/',
    MaxKeys=1000
)
for obj in response.get('Contents', []):
    print(f"{obj['Key']} - {obj['Size'] / 1024 / 1024:.1f} MB")

# ─── Upload a file ───
s3.upload_file(
    Filename='local_output.parquet',
    Bucket='company-data-lake',
    Key='silver/orders/2025-03-08/output.parquet',
    ExtraArgs={'StorageClass': 'STANDARD'}
)

# ─── Read directly with pandas / PySpark ───
import pandas as pd
df = pd.read_parquet('s3://company-data-lake/silver/orders/2025-03-08/')

# PySpark reads S3 natively (with s3a:// prefix for Hadoop)
df_spark = spark.read.parquet('s3a://company-data-lake/silver/orders/')

# ─── S3 lifecycle rule (move to Glacier after 90 days) ───
s3.put_bucket_lifecycle_configuration(
    Bucket='company-data-lake',
    LifecycleConfiguration={
        'Rules': [{
            'ID': 'archive-raw-after-90-days',
            'Status': 'Enabled',
            'Filter': {'Prefix': 'raw/'},
            'Transitions': [{'Days': 90, 'StorageClass': 'GLACIER'}]
        }]
    }
)` },

                { type: "h3", text: "AWS Glue — Serverless ETL + Data Catalog" },
                { type: "p", text: "Before Glue existed, to run a Spark job you had to: provision an EMR cluster (choose machine types, count, configure Hadoop), SSH in, copy your code, submit the job, wait, then manually terminate the cluster so you're not charged for idle time. Glue removes all of that operational burden." },
                { type: "p", text: "Think of it this way: you write a Python/Spark script, upload it to S3, click 'run' in Glue, and AWS figures out how many machines to use, starts them, runs your code, then shuts them down. You're billed only for the seconds your job was running. This is the serverless promise applied to data processing." },
                { type: "p", text: "The Glue Data Catalog is a separate but equally important component. Imagine you have 500 Parquet files across 200 S3 folders. Without a catalog, Spark needs to scan all those files to understand what tables exist and what their columns are. The catalog is like a phone directory for your data — it stores 'table orders lives at s3://my-bucket/silver/orders/, has columns: order_id STRING, amount DECIMAL, date DATE'. Spark reads the catalog instead of scanning files, making query startup near-instant." },
                { type: "p", text: "AWS Glue is a fully managed ETL service. It has two distinct parts: the ETL engine (runs PySpark or Python shell jobs on managed infrastructure — no cluster to manage) and the Glue Data Catalog (a central metadata repository that acts as a Hive-compatible metastore for all your S3 tables)." },
                {
                    type: "code", lang: "text", code: `AWS Glue Architecture:

S3 (raw data)
    │
    ▼
Glue Crawler
(discovers schema, creates table definitions in Glue Catalog)
    │
    ▼
Glue Data Catalog ← Athena queries this, Spark reads this, Redshift Spectrum uses this
(table: raw_orders, columns: id int, amount decimal, date timestamp)
    │
    ▼
Glue ETL Job (PySpark on managed cluster)
    │
    ▼
S3 (processed output)

Key advantages of Glue:
• No cluster to spin up/down — serverless (pay per DPU-second)
• Glue Catalog = central metadata shared across AWS services
• Built-in support for bookmarks (incremental ETL)
• Native connectors to RDS, Redshift, DynamoDB, JDBC` },
                {
                    type: "code", lang: "python", code: `# AWS Glue ETL Job script (runs on managed Spark)
import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

args = getResolvedOptions(sys.argv, ['JOB_NAME', 'source_path', 'dest_path'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Read from Glue Catalog (metadata + S3 data)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="raw_db",
    table_name="raw_orders",
    transformation_ctx="datasource"
)

# Convert to Spark DataFrame for standard transformations
df = datasource.toDF()
df_clean = df.filter("amount > 0").dropDuplicates(["order_id"])

# Write back through Glue (with bookmarks for incremental loads)
glueContext.write_dynamic_frame.from_options(
    frame=DynamicFrame.fromDF(df_clean, glueContext, "clean_frame"),
    connection_type="s3",
    connection_options={"path": args['dest_path'], "partitionKeys": ["year", "month"]},
    format="parquet"
)

job.commit()` },

                { type: "h3", text: "Amazon Redshift — Cloud Data Warehouse" },
                { type: "p", text: "Redshift is AWS's managed columnar data warehouse. It runs on dedicated nodes (not serverless by default), uses PostgreSQL-compatible SQL, and is optimized for OLAP queries over large datasets. Redshift Spectrum extends it to query S3 data directly without loading it in." },
                {
                    type: "code", lang: "sql", code: `-- Redshift-specific concepts

-- Distribution style: how rows are spread across nodes
CREATE TABLE orders (
    order_id    VARCHAR(50),
    customer_id VARCHAR(50),
    amount      DECIMAL(12,4),
    order_date  DATE
)
DISTSTYLE KEY                           -- distribute by a column
DISTKEY (customer_id)                   -- all same customer_id → same node (join optimized)
SORTKEY (order_date);                   -- sort on disk by date (range scan optimized)

-- COPY: bulk load from S3 (much faster than INSERT)
COPY orders
FROM 's3://company-data-lake/silver/orders/'
IAM_ROLE 'arn:aws:iam::123456789:role/RedshiftS3Role'
FORMAT AS PARQUET;

-- Redshift Spectrum: query S3 data directly (no loading!)
-- First: create external schema pointing to Glue Catalog
CREATE EXTERNAL SCHEMA spectrum
FROM DATA CATALOG
DATABASE 'raw_db'
IAM_ROLE 'arn:aws:iam::123456789:role/RedshiftS3Role';

-- Now query S3 Parquet files as if they're Redshift tables
SELECT c.country, SUM(o.amount)
FROM spectrum.raw_orders o          -- data stays in S3
JOIN customers c ON o.customer_id = c.id
GROUP BY c.country;` },

                { type: "h3", text: "Amazon EMR — Managed Spark / Hadoop" },
                { type: "p", text: "EMR (Elastic MapReduce) is the managed cluster service for running Spark, Hadoop, Hive, Presto, and other big data frameworks. Unlike Glue (serverless), EMR gives you full control over cluster size, configuration, and software versions." },
                {
                    type: "code", lang: "bash", code: `# Create an EMR cluster via CLI
aws emr create-cluster \
  --name "Daily ETL Cluster" \
  --release-label emr-6.10.0 \
  --applications Name=Spark Name=Hadoop \
  --instance-groups \
    InstanceGroupType=MASTER,InstanceCount=1,InstanceType=m5.xlarge \
    InstanceGroupType=CORE,InstanceCount=5,InstanceType=m5.2xlarge \
  --use-default-roles \
  --ec2-attributes KeyName=my-key,SubnetId=subnet-abc123 \
  --log-uri s3://my-logs/emr/ \
  --auto-terminate   # terminate after all steps complete

# Submit a Spark step to the cluster
aws emr add-steps --cluster-id j-ABC123 --steps \
  Type=Spark,Name="Daily Transform",\
  ActionOnFailure=CONTINUE,\
  Args=[--deploy-mode,cluster,\
        --conf,spark.executor.memory=8g,\
        s3://code/transform_orders.py,\
        --date,2025-03-08]

# EMR Serverless (newest) — no cluster management at all
aws emr-serverless start-job-run \
  --application-id app-123 \
  --execution-role-arn arn:aws:iam::123:role/EMRServerlessRole \
  --job-driver '{
    "sparkSubmit": {
      "entryPoint": "s3://code/transform.py",
      "sparkSubmitParameters": "--conf spark.executor.memory=8g"
    }
  }'` },

                { type: "h3", text: "Amazon Kinesis — Streaming Ingestion" },
                { type: "p", text: "Kinesis is AWS's managed real-time streaming service, similar to Kafka but fully managed. Kinesis Data Streams is the raw stream (like Kafka topics). Kinesis Data Firehose is the delivery service (batch-writes stream data to S3, Redshift, Splunk automatically)." },
                {
                    type: "code", lang: "python", code: `import boto3
import json
from datetime import datetime

kinesis = boto3.client('kinesis', region_name='us-east-1')

# ─── Produce: send event to Kinesis Data Streams ───
response = kinesis.put_record(
    StreamName='order-events',
    Data=json.dumps({
        'order_id': 'ORD-001',
        'user_id': 'USR-123',
        'amount': 250.00,
        'timestamp': datetime.utcnow().isoformat()
    }).encode('utf-8'),
    PartitionKey='USR-123'   # maps user to a shard (like Kafka partition key)
)

# ─── Kinesis Data Firehose — auto-delivers to S3 ───
# Configure via console/CloudFormation:
# Source: Kinesis Data Stream 'order-events'
# Destination: S3 s3://data-lake/streaming/orders/
# Buffer: 5MB or 300 seconds (whichever comes first)
# Format: Parquet (converts JSON on the fly)
# Partitioning: year/month/day/hour from timestamp field

# No consumer code needed — Firehose handles the delivery loop` },

                { type: "h3", text: "AWS Lambda — Serverless Functions for Lightweight Transforms" },
                { type: "p", text: "Lambda is AWS's serverless function runtime. You write a Python (or other language) function, deploy it, and AWS runs it on demand — no servers to manage. For DE, Lambda is great for lightweight, event-driven tasks: trigger on S3 file arrival, call an API, validate a schema, send notifications." },
                {
                    type: "code", lang: "python", code: `import boto3
import json

def lambda_handler(event, context):
    """
    Triggered automatically when a file lands in S3.
    Validates format and starts a Glue ETL job.
    """
    # Parse the S3 event trigger
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        size_bytes = record['s3']['object']['size']

        print(f"New file: s3://{bucket}/{key} ({size_bytes} bytes)")

        # Validate: only process Parquet files in expected prefix
        if not key.startswith('raw/orders/') or not key.endswith('.parquet'):
            print(f"Skipping unexpected file: {key}")
            continue

        # Trigger downstream Glue ETL job
        glue = boto3.client('glue')
        glue.start_job_run(
            JobName='orders-silver-transform',
            Arguments={
                '--source_key': key,
                '--source_bucket': bucket,
            }
        )
        print(f"Started Glue job for {key}")

    return {'statusCode': 200, 'body': 'OK'}

# Lambda limitations — know for interviews:
# • Max runtime: 15 minutes
# • Max memory: 10GB
# • Max deployment package: 250MB (use Lambda Layers for big deps)
# • Not suited for: Spark jobs, large data processing, long-running tasks` },

                { type: "h3", text: "AWS IAM — Identity and Access Management" },
                { type: "p", text: "IAM is the permission system of AWS. Think of it like a building's key card system. Each person (user) and each machine (service like Lambda, Glue) gets a unique identity. Roles define what doors that identity can open. A Lambda function without a role is like a contractor with no key card — they can't access anything." },
                { type: "p", text: "The 'principle of least privilege' is the golden rule: give each identity only the exact permissions it needs, nothing more. A Glue job that reads from S3 and writes to Redshift should have ONLY those two permissions — not permission to delete S3 buckets, create EC2 instances, or access other services. Over-permissioned roles are a security risk and happen surprisingly often." },
                { type: "p", text: "IAM has three key building blocks: Policies (JSON documents defining allowed actions), Roles (collections of policies that can be assumed by services — a Glue job assumes a role at runtime), and Trust Relationships (which defines what entity is allowed to assume a role — you tell AWS 'only the Glue service is allowed to assume this role')." },
                { type: "p", text: "IAM controls who (users, services, applications) can do what (read S3, run Glue, create Redshift tables) on which resources. This is the security backbone. Wrong IAM setup = security breach or broken pipelines. Every DE needs to understand it." },
                {
                    type: "code", lang: "json", code: `// IAM Policy example: Glue job can read S3, write to specific prefix
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadRawData",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::company-data-lake",
        "arn:aws:s3:::company-data-lake/raw/*"
      ]
    },
    {
      "Sid": "WriteSilverData",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::company-data-lake/silver/*"
    },
    {
      "Sid": "GlueCatalogAccess",
      "Effect": "Allow",
      "Action": [
        "glue:GetDatabase", "glue:GetTable",
        "glue:CreateTable", "glue:UpdateTable"
      ],
      "Resource": "*"
    }
  ]
}

// Key IAM concepts:
// Role: set of permissions assumed by a service (Glue, EMR, Lambda)
// Policy: JSON document defining what actions are allowed/denied
// Principal of least privilege: grant ONLY the permissions needed, nothing more
// Trust relationship: defines WHO can assume a role (which AWS service/account)` },

                { type: "h2", text: "GCP — Google's Data Platform" },
                { type: "p", text: "Google invented much of the technology that the big data industry is built on. Google File System (GFS) became Hadoop HDFS. Google's MapReduce paper became Hadoop MapReduce. Google Dremel became BigQuery. Bigtable became HBase and later Cassandra. If you understand the history, you understand why GCP's tools often feel more elegant — they're designed by the engineers who invented the field." },
                { type: "p", text: "The key philosophical difference between GCP and AWS: GCP pushes you toward fewer, more powerful services. BigQuery does the job of Redshift + Athena + Glue Catalog combined. Pub/Sub handles what Kafka and SQS do. Dataflow handles both batch and streaming in one engine (Apache Beam). Fewer moving parts = less operational complexity." },
                { type: "p", text: "GCP is widely used in data-heavy companies, especially those that adopted Google's tools early (YouTube, Spotify, Twitter historically). BigQuery is the crown jewel — the most developer-friendly and cost-effective serverless warehouse for SQL analytics." },

                { type: "h3", text: "BigQuery — The Serverless Analytics Engine" },
                { type: "p", text: "BigQuery's architecture is radically different from traditional databases. In a normal database (or Redshift), the compute (CPU doing the work) and storage (disk holding the data) are on the same machines. If you need more compute, you add more machines — but they come with more storage you didn't need." },
                { type: "p", text: "BigQuery separates compute and storage completely. Your data sits in Google's Colossus distributed file system (essentially infinitely scalable). When you run a query, BigQuery spins up thousands of workers from a shared compute pool — instantly, without provisioning — processes your data in parallel, returns results, and releases the workers. You never see servers. You never configure clusters. You never pay for idle time." },
                { type: "p", text: "The pricing model (charging per byte scanned, not per machine-hour) changes how you think about query design. A query that does SELECT * FROM a 1TB table costs ~$5. The same query with a WHERE date = '2025-03-08' on a partitioned table might cost $0.05 (scanning only 1 day of data). This is why partitioning and clustering matter so much in BigQuery specifically." },
                {
                    type: "code", lang: "sql", code: `-- BigQuery-specific features

-- Partitioned table (by ingestion date or column)
-- In BigQuery, tables are referenced as: project.dataset.table
CREATE TABLE myproject.mydataset.orders
PARTITION BY DATE(order_date)
CLUSTER BY country, product_category         -- cluster = sort by in partition
OPTIONS (
  partition_expiration_days = 365,           -- auto-delete old partitions
  require_partition_filter = TRUE            -- queries MUST filter on date (cost control)
)
AS SELECT * FROM myproject.raw_dataset.raw_orders;

-- Cost control: estimate before running (BigQuery charges per byte scanned)
-- Use the query validator to see bytes: ~$5 per TB scanned

-- BigQuery ML: run ML directly in SQL (no Python needed for basic models)
CREATE OR REPLACE MODEL myproject.mydataset.churn_model
OPTIONS (model_type = 'logistic_reg', label_cols = ['churned'])
AS
SELECT age, tenure_months, monthly_spend, churned
FROM myproject.mydataset.customer_features;

-- Predict with the trained model
SELECT * FROM ML.PREDICT(MODEL myproject.mydataset.churn_model,
    (SELECT age, tenure_months, monthly_spend FROM myproject.mydataset.new_customers)
);

-- External tables: query GCS files directly (like Redshift Spectrum)
CREATE EXTERNAL TABLE myproject.mydataset.raw_clicks
OPTIONS (
  format = 'PARQUET',
  uris = ['gs://data-lake/raw/clicks/*.parquet']  -- query lives in GCS, not BQ storage
);` },

                { type: "h3", text: "Cloud Pub/Sub — GCP's Kafka Equivalent" },
                { type: "p", text: "Cloud Pub/Sub is Google's fully managed messaging service. Producers publish messages to topics, consumers subscribe. Unlike Kafka, you don't manage brokers or partitions — Pub/Sub auto-scales. The typical GCP streaming stack: App → Pub/Sub → Cloud Dataflow → BigQuery." },
                {
                    type: "code", lang: "python", code: `from google.cloud import pubsub_v1
import json

# ── Publisher (Producer) ──
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path('my-project', 'order-events')

def publish_order(order: dict):
    data = json.dumps(order).encode('utf-8')
    future = publisher.publish(
        topic_path,
        data=data,
        order_id=order['order_id'],  # message attributes for filtering
        country=order['country']
    )
    print(f"Published: {future.result()}")

# ── Subscriber (Consumer) ──
subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path('my-project', 'order-events-sub')

def callback(message):
    data = json.loads(message.data.decode('utf-8'))
    print(f"Received: {data}")
    # Process the message...
    message.ack()  # acknowledge to prevent redelivery

with subscriber:
    streaming_pull_future = subscriber.subscribe(subscription_path, callback)
    streaming_pull_future.result()  # block forever, processing messages` },

                { type: "h2", text: "Azure — Microsoft's Enterprise Cloud" },
                { type: "p", text: "Azure is the dominant cloud in enterprises already using Microsoft products (Office 365, SQL Server, Active Directory). Azure Synapse Analytics is Microsoft's integrated analytics platform — combining a data warehouse, Spark compute, and pipeline orchestration in one service." },
                {
                    type: "code", lang: "text", code: `Azure Data Engineering Stack:

ADLS Gen2 (storage)          ← The data lake (similar to S3, but HDFS-compatible)
    │
    ▼
Azure Data Factory (ADF)      ← No-code ETL pipeline builder + orchestration
    │
    ▼
Azure Databricks               ← Managed Spark (Databricks runs here natively)
    │
    ▼
Azure Synapse Analytics        ← Integrated: Dedicated SQL Pool + Serverless SQL + Spark
    │
    ▼
Power BI                       ← Microsoft BI tool (natural choice in Azure ecosystem)

Key Azure concepts:
• Resource Group: logical container for related Azure resources
• Managed Identity: equivalent to AWS IAM Role (service-to-service auth without secrets)
• Service Principal: app-level identity for pipelines/automation
• RBAC: Role-Based Access Control (Storage Blob Data Reader, Contributor, etc.)` },

                { type: "h2", text: "Common Cloud Architecture Patterns" },
                { type: "h3", text: "Pattern 1: Modern Data Lake (AWS)" },
                {
                    type: "code", lang: "text", code: `Sources → Ingestion → Bronze → Silver → Gold → Serving
─────────────────────────────────────────────────────
RDS/MySQL    Fivetran    S3/raw     S3/clean   S3/agg    Redshift/Athena
Kafka        Kinesis     (Parquet)  (Delta)    (Delta)   BI Dashboard
APIs         Lambda                                      ML Models
                    ↕
             Glue Catalog (metadata for all S3 tables)
                    ↕
             Airflow on MWAA (orchestration)` },
                { type: "h3", text: "Pattern 2: BigQuery-Centric (GCP)" },
                {
                    type: "code", lang: "text", code: `Sources → Pub/Sub → Dataflow → BigQuery → Looker Studio
─────────────────────────────────────────────────────────
App events   (streaming)  (Apache     (warehouse  (BI layer)
MySQL        GCS          Beam ETL)   + ML)
APIs         (batch)

dbt Cloud runs transformations within BigQuery (SQL transforms, no Spark needed)
BigQuery is so powerful that many GCP shops skip S3-style data lake entirely` },

                { type: "h2", text: "Cloud Costs — The Interview Differentiator" },
                { type: "p", text: "Senior DE interviews often include cost optimization questions. Knowing approximate costs and optimization strategies demonstrates production experience." },
                {
                    type: "table", headers: ["Service", "Cost Model", "Key Optimization"], rows: [
                        ["S3", "$0.023/GB/month stored + $0.0004/GET request", "Use lifecycle policies to Glacier for cold data; avoid small files (fewer, larger files = fewer GETs)"],
                        ["Glue ETL", "$0.44/DPU-hour (1 DPU = ~4 vCPU, 16GB)", "Right-size DPU count; use job bookmarks to avoid re-processing; use G.1X workers for memory-intensive work"],
                        ["Redshift", "$0.25-3.86/node/hour (dedicated)", "Use SORTKEY + DISTKEY correctly; VACUUM & ANALYZE regularly; use Redshift Serverless for variable workloads"],
                        ["BigQuery", "$5/TB scanned in queries", "Partition + cluster tables; use preview before running; require partition filters; materialize common queries"],
                        ["EMR", "From $0.015/hr + EC2 instance cost", "Use Spot instances for workers (70-90% cheaper); use EMR Serverless to avoid idle time; rightsize executors"],
                        ["Lambda", "$0.20/million requests + $0.0000166667/GB-sec", "Keep functions small; avoid Lambda for Spark — use Glue/EMR instead"],
                    ]
                },

                { type: "h2", text: "Interview Q&A" },
                {
                    type: "table", headers: ["Question", "Strong Answer"], rows: [
                        ["S3 vs EBS vs EFS — when to use each?", "S3 for data lake storage (object storage, massively scalable, any size file, accessed via HTTP API). EBS for block storage attached to a single EC2 instance (like a hard disk — used for OS, databases). EFS for shared file system accessed by multiple EC2 instances simultaneously. For DE: almost always S3."],
                        ["What is the Glue Data Catalog?", "A centralized metadata repository that stores table schemas, column types, partition information, and location of data in S3. It's Hive-compatible, so Spark, Athena, Redshift Spectrum, and EMR can all query S3 data using the same table definitions stored in the catalog."],
                        ["How do you secure data in S3?", "Bucket policies (resource-based, applies to all requests to the bucket), IAM policies (identity-based, what roles/users can do), bucket encryption (server-side with KMS keys), block public access settings, VPC endpoint (keeps traffic inside AWS network), access logging for audit trails, and MFA delete for critical buckets."],
                        ["BigQuery vs Redshift — key differences?", "BigQuery is fully serverless (no cluster management, pay per query), geographically distributed, and scales automatically. Redshift is provisioned clusters (you choose node types/count), requires VACUUM/ANALYZE maintenance, better for consistent high-concurrency workloads. BigQuery is better on operational simplicity; Redshift better for predictable costs at consistent load."],
                        ["What is IAM and why does a Glue job need a role?", "IAM controls AWS resource permissions. A Glue job runs as a service, not as a human user — it needs an IAM Role that defines what AWS resources it can access (read S3, write to Redshift, read Glue Catalog). Without a role, the job has no permissions. The principle of least privilege means granting only the exact permissions needed."],
                    ]
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
