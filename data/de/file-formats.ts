import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "File Formats",
subtitle: "Parquet, Avro, ORC, Delta Lake — internals, performance trade-offs, schema evolution, compression, and production decisions.",
accent: "#a855f7",
blocks: [
                { type: "h2", text: "Why File Formats Are a Core DE Skill" },
                { type: "p", text: "File formats are the packaging of your data. The same 1 billion rows of sales data stored as CSV, Avro, Parquet, or Delta Lake will have wildly different file sizes (10x), query speeds (100x), and capabilities (schema evolution, ACID transactions). Choosing the wrong format breaks pipelines, wastes money, and slows every query." },
                { type: "p", text: "Every major architecture decision involves a format choice: what format does Kafka write events in? What format do we store in the data lake? What do we load into the warehouse with? How do we handle schema changes? Knowing the trade-offs deeply separates junior from senior engineers." },

                { type: "h2", text: "Row-Based vs Columnar Storage — The Fundamental Difference" },
                { type: "p", text: "This is the most important file format concept. How data is physically arranged on disk determines what operations are fast versus slow." },
                {
                    type: "code", lang: "text", code: `Dataset: 1 million employees
Columns: id (int), name (string), department (string), salary (decimal), hire_date (date)

ROW-BASED LAYOUT (CSV, Avro, traditional RDBMS):
Disk block 1: [1, Ali,   IT,      8500,  2022-01-15]
              [2, Mona,  HR,      7200,  2021-06-30]
              [3, John,  IT,      9100,  2023-03-01]
              ...

Fast for:  INSERT/UPDATE/DELETE single rows (entire row in one read)
Slow for:  SELECT SUM(salary) — must read ALL columns to get just salary!

COLUMNAR LAYOUT (Parquet, ORC, BigQuery, Snowflake internals):
Disk block 1 (id):         [1, 2, 3, 4, 5, 6, 7, 8, 9, 10...]
Disk block 2 (name):       [Ali, Mona, John, Sara, ...]
Disk block 3 (department): [IT, HR, IT, Finance, IT, HR, ...]
Disk block 4 (salary):     [8500, 7200, 9100, 8800, ...]  ← ONLY READ THIS
Disk block 5 (hire_date):  [2022-01-15, 2021-06-30, ...]

Fast for:  SELECT SUM(salary) — reads ONLY salary block (1/5 of the data!)
Also fast: Compression is MUCH better (same-type values compress extremely well)
Slow for:  Single row INSERT (need to update every column's separate block)` },
                {
                    type: "table", headers: ["Aspect", "Row-Based", "Columnar"], rows: [
                        ["Read pattern", "Read entire rows (good for OLTP)", "Read only selected columns (good for OLAP)"],
                        ["Insert/Update speed", "Fast (one block update)", "Slow (many blocks to update)"],
                        ["Aggregation speed", "Slow (reads unnecessary columns)", "Fast (reads only needed column)"],
                        ["Compression", "Moderate (mixed types per block)", "Excellent (same types cluster together)"],
                        ["Typical formats", "CSV, JSON, Avro, MySQL/PostgreSQL", "Parquet, ORC, BigQuery, Snowflake"],
                        ["Best workload", "Transactional OLTP", "Analytical OLAP"],
                    ]
                },

                { type: "h2", text: "CSV — Universal But Limited" },
                { type: "p", text: "CSV (Comma-Separated Values) is the most universal data exchange format — every tool, every programming language, every spreadsheet application can read and write CSV. But it was designed for simplicity, not performance, schema safety, or scale. At millions of rows, its limitations become serious problems." },
                {
                    type: "code", lang: "text", code: `CSV File Example:
id,user_name,country,amount,signup_date
1,Ali Ahmed,Egypt,8500.00,2022-01-15
2,"Mona, Jr.",USA,7200.00,2021-06-30      ← comma IN a value requires quoting
3,John O'Brien,UK,,2023-03-01             ← empty amount = null? zero? error?

Problems visible immediately:
1. Comma in value 'Mona, Jr.' requires quoting → parsing errors if not handled
2. Empty value '' — is it null? zero? empty string? Ambiguous.
3. Date '2022-01-15' stored as string — type must be inferred or hardcoded
4. No data types — Spark reads everything as StringType then guesses` },
                {
                    type: "comparison",
                    left: {
                        label: "CSV Limitations", items: [
                            "No schema — type inference required (slow + error-prone)",
                            "Type ambiguity — integers look like strings",
                            "No compression — raw text is large",
                            "No column pruning — reading one column reads everything",
                            "Special character handling is error-prone",
                            "No support for nested data (arrays, maps)",
                            "Schema changes break downstream silently",
                        ]
                    },
                    right: {
                        label: "When CSV Is Correct", items: [
                            "Small data exports for humans to inspect",
                            "Sharing data with non-technical stakeholders (Excel)",
                            "Source system exports you have no control over",
                            "One-time data migrations (< 10M rows)",
                            "Config and lookup files",
                            "Debugging — you can open CSV in a text editor",
                            "First landing before converting to Parquet",
                        ]
                    }
                },
                {
                    type: "code", lang: "python", code: `# Best practice: convert CSV to Parquet immediately after landing
import pyspark.sql.functions as F

# Read CSV with explicit schema (fast + safe)
from pyspark.sql.types import *
schema = StructType([
    StructField("id", IntegerType(), False),
    StructField("user_name", StringType(), True),
    StructField("country", StringType(), True),
    StructField("amount", DoubleType(), True),
    StructField("signup_date", DateType(), True),
])

df = spark.read.schema(schema).csv("raw_landing.csv", header=True)

# ❌ Avoid: inferSchema reads the file TWICE (once to guess types, once to read)
df_bad = spark.read.csv("raw.csv", header=True, inferSchema=True)

# Convert to Parquet immediately (all future processing will be faster)
df.write.mode("overwrite").parquet("s3://bucket/silver/users/")` },

                { type: "h2", text: "JSON — Flexible but Expensive" },
                { type: "p", text: "JSON (JavaScript Object Notation) is the universal format for web APIs. Every REST API returns JSON. It supports nested structures (objects inside objects), arrays, and mixed types. But it's row-based text with repeated field names for every record — very inefficient for large scale storage." },
                {
                    type: "code", lang: "json", code: `// JSON format example (each record includes field names → repetition)
{"user_id": "U001", "name": "Ali", "amount": 8500, "tags": ["python", "sql"]}
{"user_id": "U002", "name": "Mona", "amount": 7200, "tags": ["airflow"]}

// Problem: "user_id", "name", "amount", "tags" repeated for EVERY record
// For 100M records → that's 100M copies of "user_id" = wasteful

// JSON also supports nested structures (schema-on-read):
{
  "user_id": "U001",
  "profile": {             ← nested object
    "name": "Ali",
    "country": "Egypt"
  },
  "orders": [             ← array of objects
    {"id": 1001, "amount": 200},
    {"id": 1002, "amount": 300}
  ]
}` },
                {
                    type: "code", lang: "python", code: `# Reading nested JSON in Spark
df = spark.read.json("events/")

# Flatten nested structure
from pyspark.sql.functions import col, explode

df_flat = (df
    .select(
        col("user_id"),
        col("profile.name").alias("name"),
        col("profile.country").alias("country"),
        explode(col("orders")).alias("order")  # one row per order
    )
    .select("user_id", "name", "country",
            col("order.id").alias("order_id"),
            col("order.amount").alias("amount"))
)` },

                { type: "h2", text: "Avro — The Streaming Standard" },
                { type: "p", text: "Avro is Apache's binary, row-based format. It was specifically designed for data exchange in streaming pipelines. Its killer feature is schema evolution — producer and consumer can have different (but compatible) schema versions, enabling independent deployment of services." },
                { type: "h3", text: "Avro Internal Structure" },
                {
                    type: "code", lang: "text", code: `Avro File (binary):
┌────────────────────────────────────────────────────┐
│ MAGIC BYTES: "Obj\x01"  (identifies this as Avro)   │
│ FILE METADATA:                                     │
│   - Schema (JSON definition, embedded in file)    │
│   - Codec (compression: null/snappy/deflate)      │
│   - Sync marker (for splitting large files)       │
├────────────────────────────────────────────────────┤
│ DATA BLOCK 1:                                      │
│   Row: [user_id=U001] [amount=8500] [country=EG] │
│   Row: [user_id=U002] [amount=7200] [country=US] │
│   ... (compressed together as a block)            │
│   Sync marker                                      │
├────────────────────────────────────────────────────┤
│ DATA BLOCK 2:                                      │
│   Row: ...                                         │
│   Sync marker                                      │
└────────────────────────────────────────────────────┘

Key: schema IS embedded in the file — no external schema required for reading` },
                { type: "h3", text: "Avro Schema Definition" },
                {
                    type: "code", lang: "json", code: `{
  "type": "record",
  "name": "OrderEvent",
  "namespace": "com.company.events",
  "doc": "Represents a user placing an order",
  "fields": [
    {
      "name": "order_id",
      "type": "string",
      "doc": "Unique order identifier"
    },
    {
      "name": "user_id",
      "type": "string"
    },
    {
      "name": "amount",
      "type": "double"
    },
    {
      "name": "currency",
      "type": {"type": "enum", "name": "Currency", "symbols": ["USD", "EUR", "EGP"]}
    },
    {
      "name": "items",
      "type": {
        "type": "array",
        "items": {
          "type": "record",
          "name": "OrderItem",
          "fields": [
            {"name": "product_id", "type": "string"},
            {"name": "quantity", "type": "int"},
            {"name": "price", "type": "double"}
          ]
        }
      }
    },
    {
      "name": "coupon_code",
      "type": ["null", "string"],  ← union type: null OR string
      "default": null              ← optional field (null by default)
    }
  ]
}` },
                { type: "h3", text: "Schema Evolution — Why This Is Avro's Superpower" },
                { type: "p", text: "In a streaming system, the producer (writes to Kafka) and consumer (reads from Kafka) may be updated independently. Schema evolution lets them have different schema versions and still work correctly." },
                {
                    type: "table", headers: ["Change Type", "Avro Support", "Rule"], rows: [
                        ["Add a new field", "✓ Backward compatible", "New field must have a default value"],
                        ["Remove a field", "✓ Forward compatible", "Removed field must have had a default value"],
                        ["Change field name", "Via aliases only", "Add alias of old name to new field definition"],
                        ["Change field type", "❌ Not compatible", "Breaking change — requires new schema version"],
                        ["Change data type int→long", "✓ OK (widening)", "int promotes to long safely"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `# Avro with Schema Registry (Confluent Kafka pattern)
from confluent_kafka.avro import AvroProducer, AvroConsumer
from confluent_kafka import avro

# Producer schema (v1)
schema_str_v1 = """
{
  "type": "record", "name": "User",
  "fields": [
    {"name": "user_id", "type": "string"},
    {"name": "email",   "type": "string"}
  ]
}
"""

# Producer schema (v2) — adds 'phone' with default → backward compatible
schema_str_v2 = """
{
  "type": "record", "name": "User",
  "fields": [
    {"name": "user_id", "type": "string"},
    {"name": "email",   "type": "string"},
    {"name": "phone",   "type": ["null", "string"], "default": null}
  ]
}
"""
# Consumer using v1 reads v2 messages: phone field is simply ignored (backward compat)
# Consumer using v2 reads v1 messages: phone field gets null default (forward compat)

# PySpark reading Avro
from pyspark.sql import SparkSession
spark = SparkSession.builder \
    .config("spark.jars.packages", "org.apache.spark:spark-avro_2.12:3.3.0") \
    .getOrCreate()

df = spark.read.format("avro").load("s3://bucket/bronze/events/")
df.write.format("avro").mode("overwrite").save("output_avro/")` },

                { type: "h2", text: "Parquet — The Data Lake Standard" },
                { type: "p", text: "Apache Parquet is the most widely used file format for data lakes and analytics. It was specifically designed for analytical workloads and Hadoop/Spark ecosystems. It's columnar, binary, compressed, self-describing (schema embedded), and supports statistics-based data skipping." },
                { type: "h3", text: "Parquet Internal Structure — In Detail" },
                {
                    type: "code", lang: "text", code: `Parquet File Layout:

┌─────────────────────────────────────────────────────────┐
│                    PARQUET FILE                         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ROW GROUP 1 (~128MB default)                     │  │
│  │                                                  │  │
│  │  Column Chunk: 'id'                              │  │
│  │  ├── Page 1: [1,2,3,...,1000] compressed        │  │
│  │  └── Page 2: [1001,...,2000] compressed         │  │
│  │                                                  │  │
│  │  Column Chunk: 'country'                         │  │
│  │  ├── Page 1: [Egypt,Egypt,USA,Egypt...] RLE+Dict│  │
│  │  │          Dictionary: {0='Egypt', 1='USA'...} │  │
│  │  │          Values:     [0,0,1,0,0,0,1,...]     │  │
│  │  └── Statistics: min='Egypt', max='USA'          │  │
│  │                                                  │  │
│  │  Column Chunk: 'salary'                          │  │
│  │  ├── Values: [8500,7200,9100,...] delta-encoded  │  │
│  │  └── Statistics: min=5000, max=15000, count=2000│  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ROW GROUP 2 (~128MB)                             │  │
│  │  [similar structure for rows 2001-4000...]       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  FILE FOOTER (metadata):                               │
│  - Schema definition (column names, types)             │
│  - Row group locations (offsets in file)               │
│  - Column statistics (min/max per row group)           │
│  - Total row count                                     │
└─────────────────────────────────────────────────────────┘` },
                { type: "h3", text: "Column Pruning — Reading Only What You Need" },
                { type: "p", text: "Since each column is stored separately in Parquet, Spark can request only the specific columns in your SELECT clause. The column chunks for unselected columns are never read from disk." },
                {
                    type: "code", lang: "python", code: `# Table: employees with 50 columns
# You need only 2 for your query

# ❌ SELECT * — reads all 50 column chunks from disk
df = spark.read.parquet("employees/").select("*")

# ✅ SELECT only 2 columns — reads 2/50 = 4% of the data
df = spark.read.parquet("employees/").select("employee_id", "salary")

# This is why Parquet is 10-25x faster than CSV for column-selective queries!
# CSV: reads entire file (all columns) regardless of SELECT
# Parquet: reads only requested column chunks

# Real-world example: 500-column ML feature table
# Your model only needs 20 features:
features = spark.read.parquet("feature_store/") \
    .select(all_feature_columns)  # reads only those 20 column files
# Parquet reads 20/500 = 4% of disk I/O that CSV would require` },
                { type: "h3", text: "Predicate Pushdown — Skipping Entire Row Groups" },
                { type: "p", text: "Parquet stores min/max statistics for each column in each row group. Before reading actual data, Spark checks these statistics to determine if a row group could possibly contain rows matching your WHERE filter. If not, the entire row group (1-128MB) is skipped." },
                {
                    type: "code", lang: "python", code: `# Query: WHERE salary > 10000

# Parquet statistics per row group:
# Row Group 1: salary min=5000, max=9500  → MAX < 10000 → SKIP this group!
# Row Group 2: salary min=8000, max=15000 → MIGHT have matches → READ
# Row Group 3: salary min=3000, max=8000  → MAX < 10000 → SKIP this group!

# Result: Only row group 2 is read → 1/3 of the data!

# COMBINED with partitioning (most powerful):
# Table partitioned by country
# Query: WHERE country = 'Egypt' AND salary > 10000

# Step 1 (partition pruning): only country=Egypt folder is read
# Step 2 (predicate pushdown): within that folder, skip row groups with max_salary < 10000
# Step 3 (column pruning): only read the 'salary' column chunk

# Together: might read < 1% of the original data!

# To verify Spark is using it:
df.explain(True)
# Look for: "PushedFilters: [IsNotNull(salary), GreaterThan(salary, 10000)]"
# This confirms predicate was pushed into the Parquet reader` },
                { type: "h3", text: "Compression Algorithms" },
                {
                    type: "table", headers: ["Algorithm", "Compression", "Speed", "CPU Usage", "Best For"], rows: [
                        ["Snappy", "Good (~3x)", "Very fast", "Low", "Default for most Spark jobs — balanced"],
                        ["GZIP/Deflate", "Excellent (~5x)", "Slow", "High", "When storage cost matters more than speed"],
                        ["ZSTD", "Excellent (~5x)", "Fast", "Medium", "Modern default — great compression at good speed"],
                        ["LZ4", "Good (~3x)", "Very fast", "Very low", "Real-time streaming, low-latency requirements"],
                        ["Brotli", "Best (~8x)", "Very slow", "Very high", "Cold storage, rarely accessed archives"],
                        ["Uncompressed", "None (1x)", "Fastest", "None", "Development/debugging only"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `# Set compression for Parquet writes
df.write.parquet("output/", compression="snappy")    # fast + decent compression
df.write.parquet("output/", compression="zstd")      # better compression, fast
df.write.parquet("output/", compression="gzip")      # best compression, slower

# Global config
spark.conf.set("spark.sql.parquet.compression.codec", "zstd")

# Which to choose?
# Time-sensitive pipelines, frequently accessed: snappy or lz4
# Cold storage, rarely accessed: gzip or brotli
# Modern default choice: zstd (best ratio/speed balance)` },

                { type: "h2", text: "ORC — The Hive Ecosystem Champion" },
                { type: "p", text: "ORC (Optimized Row Columnar) is similar to Parquet but with tighter integration with the Hive ecosystem. It includes bloom filters (probabilistic data structure for faster skip decisions) and stronger compression with Zlib by default." },
                {
                    type: "code", lang: "text", code: `ORC File Layout:

File
├── Stripe 1 (~256MB default)
│   ├── Index section:
│   │   ├── Row index: min/max/count per 10,000 rows
│   │   └── Bloom filter: probabilistic 'is this value here?' check
│   ├── Data section: compressed column data
│   └── Footer: column statistics for this stripe
├── Stripe 2 ...
│
└── File Footer:
    ├── Schema
    ├── Stripe locations
    └── User metadata

Key ORC vs Parquet differences:
• ORC default compression: ZLIB (better ratio, slower than Parquet's Snappy)
• ORC bloom filters: faster skipping for high-cardinality string equality queries
• ORC row indexes: finer-grained skipping within stripe
• ORC typed file format: better optimization for HIVE` },
                {
                    type: "code", lang: "python", code: `# ORC in PySpark
df = spark.read.orc("data.orc")
df.write.mode("overwrite").orc("output/")

# ORC with bloom filter — great for joins on high-cardinality keys
df.write \
    .option("orc.bloom.filter.columns", "user_id,product_id") \
    .orc("output_orc/")

# ORC with Hive (SQL)
spark.sql("""
    CREATE TABLE sales_orc
    STORED AS ORC
    TBLPROPERTIES ('orc.compress'='SNAPPY')
    AS SELECT * FROM sales_parquet
""")` },

                { type: "h2", text: "Delta Lake — Adding ACID to the Data Lake" },
                { type: "p", text: "Delta Lake is an open-source storage layer that sits on top of regular Parquet files stored in object storage (S3, ADLS, GCS). It adds ACID transactions, time travel, schema enforcement, and efficient upserts — features that object storage doesn't natively provide." },
                {
                    type: "code", lang: "text", code: `Delta Lake folder structure:
s3://bucket/delta/sales/
├── _delta_log/               ← The transaction log
│   ├── 00000000000000000000.json  (initial table creation)
│   ├── 00000000000000000001.json  (first write: added 100 files)
│   ├── 00000000000000000002.json  (update: removed 5 old files, added 5 new)
│   └── 00000000000000000003.json  (delete: removed 2 files)
│
├── part-00001.parquet        ← actual data (Parquet underneath)
├── part-00002.parquet
└── ...

The _delta_log records every change atomically.
To READ current state: read the log, find which files are "active"
To TIME TRAVEL: read the log up to a specific timestamp` },
                {
                    type: "code", lang: "python", code: `from delta.tables import DeltaTable
from pyspark.sql.functions import col

# ─── Writing Delta ───
df.write \
    .format("delta") \
    .mode("overwrite") \
    .partitionBy("date") \
    .save("s3://bucket/delta/sales/")

# ─── Reading Delta ───
df = spark.read.format("delta").load("s3://bucket/delta/sales/")

# ─── MERGE (upsert) — update existing + insert new ───
target = DeltaTable.forPath(spark, "s3://bucket/delta/customers/")
target.alias("t").merge(
    source_df.alias("s"),
    "t.customer_id = s.customer_id"
).whenMatchedUpdate(set={
    "email": "s.email",
    "updated_at": "s.updated_at"
}).whenNotMatchedInsert(values={
    "customer_id": "s.customer_id",
    "email": "s.email",
    "created_at": "s.created_at"
}).execute()

# ─── Time travel ───
# Query data as of a specific timestamp
df_yesterday = spark.read \
    .format("delta") \
    .option("timestampAsOf", "2025-03-07") \
    .load("s3://bucket/delta/sales/")

# Restore to previous version
DeltaTable.forPath(spark, "s3://bucket/delta/sales/").restoreToVersion(3)

# ─── Schema evolution ───
# Add 'phone' column to existing Delta table
df_with_phone.write \
    .format("delta") \
    .mode("append") \
    .option("mergeSchema", "true") \
    .save("s3://bucket/delta/customers/")

# ─── VACUUM — clean up old files ───
DeltaTable.forPath(spark, "s3://bucket/delta/sales/").vacuum(retentionHours=168)` },

                { type: "h2", text: "Apache Iceberg — The Open Table Format Standard" },
                { type: "p", text: "Apache Iceberg is an alternative open table format (like Delta Lake) that's gaining rapidly in adoption. It supports ACID transactions, time travel, schema evolution, partition evolution (change partitioning without rewriting all data), and concurrent writes from multiple engines." },
                {
                    type: "table", headers: ["Feature", "Delta Lake", "Apache Iceberg", "Apache Hudi"], rows: [
                        ["Engine support", "Spark primary, growing", "Spark, Flink, Trino, Dremio, Athena", "Spark primary"],
                        ["Time travel", "✓", "✓", "✓"],
                        ["Partition evolution", "✗ (must rewrite)", "✓ (change without rewrite!)", "✗"],
                        ["ACID", "✓", "✓", "✓"],
                        ["Streaming upserts (CDC)", "Good", "Good", "Excellent (designed for this)"],
                        ["Ecosystem", "Databricks-driven", "Vendor-neutral, Apache", "LinkedIn/Uber-driven, Apache"],
                        ["Best for", "Databricks users", "Multi-engine, cloud-native", "Near-real-time CDC pipelines"],
                    ]
                },

                { type: "h2", text: "Complete Format Decision Guide" },
                {
                    type: "table", headers: ["Use Case", "Best Format", "Why"], rows: [
                        ["Kafka event stream", "Avro", "Schema registry, compact binary, schema evolution for independent service deployment"],
                        ["Data lake analytics layer", "Parquet (Delta/Iceberg)", "Columnar, compressed, predicate pushdown, now with ACID via open table formats"],
                        ["Hive-heavy warehouse", "ORC", "Best Hive integration, bloom filters, ZLIB compression"],
                        ["ML feature store (wide, many columns)", "Parquet", "Column pruning massively reduces I/O when reading 20/500 features"],
                        ["Cold archive, rarely queried", "Parquet + Brotli", "Maximum compression ratio, acceptable since rarely accessed"],
                        ["Schema changes frequently", "Avro (streaming) or Delta/Iceberg (lake)", "Avro: backward/forward compat; Delta/Iceberg: schema evolution + migration"],
                        ["ACID upserts required", "Delta Lake or Apache Iceberg", "Only open table formats provide ACID on top of object storage"],
                        ["Human export / business stakeholder", "CSV", "Readable in Excel, universal tool compatibility"],
                        ["Streaming aggregations result storage", "Parquet", "Write once from streaming job, read many times by BI tools"],
                    ]
                },
                { type: "callout", variant: "important", text: "The modern standard for data lakes: land events as Avro in Kafka → write to Bronze as Parquet → store Silver/Gold as Delta Lake (ACID, schema evolution, time travel). This stack costs less, performs better, and is more reliable than anything available 5 years ago." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
