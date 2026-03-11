import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Apache Spark",
subtitle: "Distributed computing at scale — architecture, lazy evaluation, optimization, and production patterns for big data processing.",
accent: "#f59e0b",
blocks: [
                { type: "h2", text: "What Problem Does Spark Solve?" },
                { type: "p", text: "Imagine you have 500 billion rows of sales data. A single computer with 64GB RAM and 16 cores cannot fit or process this in any reasonable time — it would take days or crash. Apache Spark solves this by distributing the data and computation across a cluster of many machines, each doing a piece of the work simultaneously." },
                { type: "p", text: "Before Spark, there was Hadoop MapReduce. MapReduce was slow because every intermediate result was written to disk (HDFS). Spark solved this by keeping data in memory between operations — making it typically 10-100x faster than MapReduce for iterative computations like machine learning." },
                { type: "callout", variant: "info", text: "Mental model: Spark is like a factory assembly line across many buildings. The Driver is the factory manager who breaks the job into tasks. Executors are the workers in each building doing the actual work. Each piece of raw material (partition) flows through the line simultaneously." },

                { type: "h2", text: "Spark Architecture — Every Component Explained" },
                { type: "p", text: "When you submit a Spark job, a specific set of processes spin up across your cluster. Understanding what each process does helps you diagnose performance issues and configure jobs correctly." },
                {
                    type: "code", lang: "text", code: `Spark Cluster Architecture:

┌─────────────────────────────────────────────────────────┐
│                     YOUR MACHINE                        │
│  ┌──────────────────────────────────────┐               │
│  │  DRIVER PROGRAM                      │               │
│  │  ─────────────────────────────────── │               │
│  │  • Runs your main() / Python script  │               │
│  │  • Creates SparkContext/SparkSession  │               │
│  │  • Builds execution plan (DAG)       │               │
│  │  • Schedules tasks to executors      │               │
│  │  • Collects results back             │               │
│  └──────────┬───────────────────────────┘               │
└─────────────│───────────────────────────────────────────┘
              │ (communicates via RPC)
              ▼
┌─────────────────────────────────────────────────────────┐
│                 CLUSTER MANAGER                         │
│  (YARN / Kubernetes / Mesos / Spark Standalone)        │
│  • Allocates executors to the driver request           │
│  • Manages cluster resources                           │
└──────┬────────────────────────────┬────────────────────┘
       │                            │
       ▼                            ▼
┌─────────────┐              ┌─────────────┐
│  EXECUTOR 1  │              │  EXECUTOR 2  │
│ ──────────── │              │ ──────────── │
│  • Node 1   │              │  • Node 2   │
│  • 8 cores  │              │  • 8 cores  │
│  • 32GB RAM │              │  • 32GB RAM │
│  Task 1 ✓   │              │  Task 3 ✓   │
│  Task 2 ✓   │              │  Task 4 ✓   │
└─────────────┘              └─────────────┘` },
                {
                    type: "table", headers: ["Component", "What It Does", "Key Config", "Common Issue"], rows: [
                        ["Driver", "Orchestrates the job — builds plan, schedules tasks, collects results", "spark.driver.memory (default: 1g)", "OOM if collect() returns huge data"],
                        ["Executor", "Does the actual data processing on partitions", "spark.executor.memory, spark.executor.cores", "OOM if partition too large"],
                        ["SparkContext", "Entry point for low-level Spark operations (RDD API)", "One per application", "Old API — use SparkSession instead"],
                        ["SparkSession", "Modern unified entry point (SQL + DataFrame + Dataset)", "spark = SparkSession.builder.getOrCreate()", "Thread-safe, recommended for all jobs"],
                        ["Task", "Smallest unit of work — processes one partition", "One task per executor core per stage", "Too many small tasks = scheduling overhead"],
                        ["Stage", "Group of tasks that can run in parallel without data movement", "Bounded by shuffle operations", "Many stages = many shuffles = slow job"],
                    ]
                },

                { type: "h2", text: "Resilient Distributed Datasets (RDDs)" },
                { type: "p", text: "RDD is Spark's original low-level abstraction. An RDD is an immutable, distributed collection of objects. 'Resilient' means if a partition is lost (machine crashes), Spark can recompute it from the lineage (the recipe of operations that created it). 'Distributed' means the data is split across many machines." },
                { type: "callout", variant: "warning", text: "RDDs are Spark's low-level API and should rarely be used today. DataFrames and Datasets are much better — they use the Catalyst optimizer and Tungsten execution engine, making them automatically 5-10x faster than hand-written RDD code." },
                {
                    type: "code", lang: "python", code: `# RDD example (low-level, avoid in modern code)
sc = spark.sparkContext
rdd = sc.parallelize([1, 2, 3, 4, 5])
doubled = rdd.map(lambda x: x * 2)
result = doubled.filter(lambda x: x > 4).collect()  # [6, 8, 10]

# Same in DataFrame (preferred — 10x faster due to Catalyst optimizer)
df = spark.range(1, 6).toDF("value")
result = df.withColumn("doubled", col("value") * 2).filter(col("doubled") > 4)
result.show()` },

                { type: "h2", text: "DataFrames — The Modern Spark API" },
                { type: "p", text: "A DataFrame is Spark's equivalent of a SQL table or a Pandas DataFrame — a distributed, column-labeled dataset with a defined schema. DataFrames are the primary API for modern Spark workloads. They can be queried with SQL or with the DataFrame DSL (a chained method API)." },
                {
                    type: "code", lang: "python", code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, count, avg, round, when, lit
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DoubleType

# Create SparkSession
spark = SparkSession.builder \
    .appName("MyJob") \
    .config("spark.sql.shuffle.partitions", "200") \
    .getOrCreate()

# ─── Reading data ───
df_parquet = spark.read.parquet("s3://bucket/sales/")
df_csv = spark.read.csv("data.csv", header=True, inferSchema=True)
df_json = spark.read.json("events/")
df_delta = spark.read.format("delta").load("s3://bucket/delta/table/")

# Define schema explicitly (fast — no schema inference)
schema = StructType([
    StructField("user_id", StringType(), nullable=False),
    StructField("amount", DoubleType(), nullable=True),
    StructField("date", StringType(), nullable=True),
])
df = spark.read.schema(schema).csv("orders.csv", header=True)

# ─── Inspecting data ───
df.show(10)           # print first 10 rows
df.printSchema()      # print column names and types
df.count()            # total row count (triggers execution)
df.describe().show()  # count, mean, std, min, max per column
df.dtypes             # list of (column_name, type) tuples` },

                { type: "h2", text: "Lazy Evaluation — Why Spark Doesn't Execute Immediately" },
                { type: "p", text: "This is Spark's most important design principle. When you call .filter(), .select(), .groupBy(), nothing actually happens yet. Spark just records your intention. Only when you call an action (like .show(), .count(), .write()) does Spark execute everything, but in an optimized way." },
                { type: "p", text: "This is powerful because Spark can look at the entire chain of operations and optimize them before running. It can reorder operations, push filters earlier, eliminate redundant steps, and combine multiple operations into one pass." },
                {
                    type: "code", lang: "python", code: `# ─── These are ALL lazy (nothing runs) ───
df = spark.read.parquet("s3://bucket/huge_table/")  # lazy: file not read yet
df_filtered = df.filter(col("country") == "Egypt")   # lazy: no filtering yet
df_selected = df_filtered.select("user_id", "amount")  # lazy: no projection yet
df_grouped = df_selected.groupBy("user_id").sum("amount")  # lazy: no computation

# ─── These are ACTIONS (they actually run Spark jobs) ───
df_grouped.show()   # ACTION: now Spark executes everything above, ONCE, optimized
df_grouped.count()  # ACTION: another job (re-executes chain unless cached)
df_grouped.write.parquet("output/")  # ACTION: triggers another job

# ─── Optimization Spark applies lazily ───
# Your code reads → filter → select → groupBy
# Spark's actual execution plan might be:
# Read only 'user_id' and 'amount' columns from Parquet (column pruning)
# Skip row groups where country ≠ Egypt (predicate pushdown)
# groupBy in one pass
# Result: reads maybe 5% of the data you asked it to read!

# Check the execution plan
df_grouped.explain(True)  # shows logical + physical plan` },

                { type: "h2", text: "Transformations vs Actions — Complete Reference" },
                {
                    type: "comparison",
                    left: {
                        label: "Transformations (lazy)", items: [
                            "filter() / where() — row filtering",
                            "select() / selectExpr() — column selection",
                            "withColumn() — add/modify column",
                            "drop() — remove column",
                            "groupBy() — grouping (no execution yet)",
                            "orderBy() / sort() — ordering",
                            "join() — combine dataframes",
                            "union() / unionByName() — stack rows",
                            "distinct() — deduplicate rows",
                            "repartition() / coalesce() — change partitions",
                            "cache() / persist() — mark for caching on next action",
                            "withWatermark() — streaming watermark",
                        ]
                    },
                    right: {
                        label: "Actions (trigger execution)", items: [
                            "show(n) — print n rows",
                            "count() — return row count",
                            "collect() — bring ALL rows to driver (dangerous!)",
                            "first() / head() — get first row",
                            "take(n) — get first n rows",
                            "toPandas() — convert to Pandas (drive memory!)",
                            "write.parquet() — write to Parquet",
                            "write.csv() — write to CSV",
                            "write.format().save() — write any format",
                            "saveAsTable() — write to Hive/Delta table",
                            "foreach() — apply function to each row",
                        ]
                    }
                },

                { type: "h2", text: "Spark SQL — Querying DataFrames with SQL" },
                { type: "p", text: "You can query any Spark DataFrame using standard SQL syntax by registering it as a temporary view. This is extremely useful when your team knows SQL but not PySpark, or when complex SQL logic is cleaner than the DataFrame API." },
                {
                    type: "code", lang: "python", code: `# Register DataFrame as a temp view
df.createOrReplaceTempView("orders")
df_customers.createOrReplaceTempView("customers")

# Now use SQL directly
result = spark.sql("""
    SELECT
        c.name,
        COUNT(o.id) AS order_count,
        SUM(o.amount) AS total_spent,
        ROW_NUMBER() OVER (ORDER BY SUM(o.amount) DESC) AS spending_rank
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.name
    HAVING SUM(o.amount) > 1000
    ORDER BY total_spent DESC
    LIMIT 100
""")

result.show()

# Mix SQL and DataFrame operations freely
recent_orders = spark.sql("SELECT * FROM orders WHERE order_date >= '2025-01-01'")
summary = recent_orders.groupBy("country").agg(sum("amount").alias("total"))
summary.show()` },

                { type: "h2", text: "Partitions — The Unit of Parallelism" },
                { type: "p", text: "A partition is a chunk of data that one Spark task processes. If you have 200 partitions, up to 200 tasks can run in parallel simultaneously. Partitions are fundamental to understanding Spark performance — too few means underutilizing the cluster, too many means too much scheduling overhead." },
                {
                    type: "code", lang: "python", code: `# Check current partition count
df.rdd.getNumPartitions()   # e.g., 12

# ─── repartition() — full shuffle, creates balanced N partitions ───
# Use BEFORE operations that require balancing (joins, aggregations)
df_balanced = df.repartition(200)              # just set count
df_by_key = df.repartition(200, "user_id")    # by count AND column (collocates same keys)

# ─── coalesce() — NO shuffle, just merges existing partitions ───
# Use AFTER operations to reduce small output files
df_small = df.coalesce(1)     # merge into one file (good for small output)
df_fewer = df.coalesce(10)    # reduce from 200 → 10 partitions

# When to use which:
# repartition(n) → when current partitions are unbalanced or too few
# repartition(n, col) → before window functions / joins partitioned by col
# coalesce(n) → at the end, to reduce output file count

# ─── How many partitions is right? ───
# Rule of thumb: ~2-3 partitions per CPU core available
# For 50-node cluster with 8 cores each: 50 * 8 * 2 = 800 partitions
# Default shuffle partitions: 200 (spark.sql.shuffle.partitions)
# Override: spark.conf.set("spark.sql.shuffle.partitions", "400")` },

                { type: "h2", text: "Shuffle — The Most Expensive Operation" },
                { type: "p", text: "A shuffle is forced reorganization of data across all executors. Imagine your data is split across 100 machines, and you do a groupBy('country'). All rows for 'Egypt' — regardless of which machine they're on — need to move to the same executors to be grouped together. This requires network I/O, disk spills, and serialization." },
                {
                    type: "code", lang: "text", code: `Why shuffle is expensive:
Executor 1: [Egypt row, USA row, Germany row]
Executor 2: [Egypt row, Japan row, USA row]
Executor 3: [Germany row, Japan row, Egypt row]

After groupBy("country") shuffle:
Executor 1 handles: [Egypt, Egypt, Egypt] ← all Egypt rows moved here
Executor 2 handles: [USA, USA]
Executor 3 handles: [Germany, Germany, Japan, Japan]

This requires:
1. Serialize data (convert objects to bytes for network)
2. Send bytes over network to correct executor
3. Deserialize received bytes
4. Possibly spill to disk if executor memory full
5. Sort within partitions

Network I/O → milliseconds per GB
Disk spill → 10x slower than memory
This is why shuffle-heavy jobs are slow.` },
                {
                    type: "table", headers: ["Operation", "Causes Shuffle?", "Why / How to Minimize"], rows: [
                        ["filter()", "No", "Each partition filters independently — no data movement needed"],
                        ["select()", "No", "Pure projection — each partition processes its own data"],
                        ["groupBy().agg()", "Yes — wide shuffle", "All rows with same key must move to same executor"],
                        ["join()", "Yes — unless broadcast", "Both tables need to be colocated by join key"],
                        ["distinct()", "Yes", "Must find all duplicates across entire dataset"],
                        ["orderBy()", "Yes — global sort", "Full sort across all data requires one shuffle at minimum"],
                        ["sort() (within partition)", "No", "Sorts within each partition — no data movement"],
                        ["repartition()", "Yes — always full shuffle", "Explicitly redistributes all data"],
                        ["coalesce()", "No", "Merges partitions locally — no network transfer"],
                    ]
                },

                { type: "h2", text: "Broadcast Join — Eliminating Shuffle Entirely" },
                { type: "p", text: "In a regular join, both tables need to be shuffled by the join key so matching rows end up on the same executor. This is slow for large tables. But if one table is small (fits in executor memory), you can broadcast a copy of the small table to EVERY executor — then each executor can join locally without any shuffle." },
                {
                    type: "code", lang: "python", code: `from pyspark.sql.functions import broadcast

# Regular join: both tables shuffled → slow for big tables
result = large_sales.join(products_dim, "product_id")

# Broadcast join: products_dim copied to all executors → NO shuffle for sales
result = large_sales.join(broadcast(products_dim), "product_id")

# Automatic broadcast:
# Spark auto-broadcasts tables smaller than spark.sql.autoBroadcastJoinThreshold
# Default: 10MB. Increase for bigger dimensions:
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", str(100 * 1024 * 1024))  # 100MB

# Check if Spark is using broadcast in your query:
result.explain()  # look for 'BroadcastHashJoin' vs 'SortMergeJoin' in output

# When NOT to broadcast:
# - Both tables are large (no choice but shuffle)
# - Broadcasting fills executor memory (causes OOM)
# Rule: typically safe to broadcast anything under 100-200MB` },

                { type: "h2", text: "Data Skew — The Invisible Performance Killer" },
                { type: "p", text: "Data skew happens when data is distributed unevenly across partitions. One partition (and therefore one executor) ends up with 90% of the data while others have nothing. The job can't finish until this one slow partition completes — making the entire job as slow as the slowest partition." },
                {
                    type: "code", lang: "text", code: `Skewed groupBy("user_id"):

Partition 1: user_id=999       → 500,000,000 rows  ← takes 45 minutes
Partition 2: user_id=1024      → 200 rows           ← takes 0.01 seconds
Partition 3: user_id=888       → 350 rows           ← takes 0.01 seconds
...

Job completion time: 45 minutes (waiting for partition 1)
The other 99 executors sit idle for 44 minutes and 59 seconds!` },
                {
                    type: "code", lang: "python", code: `# ─── Detecting skew ───
# Look for "task took too long" or one slow stage in Spark UI
# Or check:
df.groupBy("user_id").count().sort(col("count").desc()).show(10)
# If one user_id has 1B rows and others have 100 → skew!

# ─── Fix 1: Salting — distribute skewed key across N buckets ───
from pyspark.sql.functions import floor, rand, concat, lit, split

# Add random prefix 0-9 to skewed key
df_salted = df.withColumn(
    "salted_key",
    concat(floor(rand() * 10).cast("string"), lit("_"), col("user_id"))
)

# GroupBy salted key
df_partial = df_salted.groupBy("salted_key").sum("amount")

# De-salt: aggregate partial results back
from pyspark.sql.functions import split
df_final = (df_partial
    .withColumn("user_id", split(col("salted_key"), "_")[1])
    .groupBy("user_id")
    .sum("sum(amount)")  # sum of sums = total
)

# ─── Fix 2: Broadcast join when one side is a small skewed table ───
# If 'products' table has a hot product_id with millions of rows,
# broadcast the other side to avoid shuffling the big table

# ─── Fix 3: Filter out the skewed key, process separately ───
df_hot = df.filter(col("user_id") == "999")     # handle hot user separately
df_rest = df.filter(col("user_id") != "999")    # process rest normally
df_hot_agg = df_hot.groupBy("user_id").sum("amount")
df_rest_agg = df_rest.groupBy("user_id").sum("amount")
df_combined = df_hot_agg.union(df_rest_agg)` },

                { type: "h2", text: "Caching and Persistence" },
                { type: "p", text: "By default, every action re-executes the entire chain of transformations from scratch. If you use the same DataFrame in multiple actions, caching stores the results in memory after the first action so subsequent ones are instant." },
                {
                    type: "code", lang: "python", code: `from pyspark import StorageLevel

# cache() = persist in memory (deserialized) — fastest access
df_popular = spark.read.parquet("sales/").filter(col("year") == 2025)
df_popular.cache()   # mark for caching (still lazy)

# First action: computes AND stores in cache
count = df_popular.count()             # data loaded + cached
summary = df_popular.groupBy("country").sum("amount").show()  # reads from cache ✓

# Remove from cache when no longer needed
df_popular.unpersist()

# StorageLevel options (trade-offs):
df.persist(StorageLevel.MEMORY_ONLY)           # fastest, needs most RAM
df.persist(StorageLevel.MEMORY_AND_DISK)       # spills to disk if RAM full (default for persist())
df.persist(StorageLevel.DISK_ONLY)             # saves RAM, slower access
df.persist(StorageLevel.MEMORY_ONLY_SER)       # compressed memory (less RAM, slower CPU)
df.persist(StorageLevel.MEMORY_AND_DISK_2)     # 2 replicas (fault tolerant)

# When to cache:
# ✓ DataFrame used in 2+ actions in your script
# ✓ DataFrame computed via expensive operations (many joins/aggregations)
# ✗ DataFrame used only once (caching wastes RAM)
# ✗ DataFrame is huge and RAM is limited (cache will spill to disk anyway)` },

                { type: "h2", text: "Window Functions in Spark" },
                {
                    type: "code", lang: "python", code: `from pyspark.sql.window import Window
from pyspark.sql.functions import (
    row_number, rank, dense_rank, ntile,
    lag, lead, sum, avg, min, max,
    first, last
)

# ─── Define window specifications ───
# Partition by key, order by date descending
w_user_time = Window.partitionBy("user_id").orderBy(col("event_time").desc())

# Partition by category (no ordering needed for simple aggregates)
w_category = Window.partitionBy("category")

# ─── Ranking functions ───
df_ranked = df.withColumn("rn", row_number().over(w_user_time)) \
              .withColumn("rnk", rank().over(w_user_time)) \
              .withColumn("dense", dense_rank().over(w_user_time))

# Get latest event per user
df_latest = df_ranked.filter(col("rn") == 1)

# ─── Aggregation windows ───
df_stats = df.withColumn(
    "category_avg_revenue", avg("revenue").over(w_category)
).withColumn(
    "category_max_revenue", max("revenue").over(w_category)
).withColumn(
    "revenue_vs_avg",
    round(col("revenue") / avg("revenue").over(w_category), 2)
)

# ─── LAG/LEAD for time series ───
w_time = Window.partitionBy("product_id").orderBy("sale_date")
df_trends = df.withColumn(
    "prev_revenue", lag("revenue", 1).over(w_time)
).withColumn(
    "next_revenue", lead("revenue", 1).over(w_time)
).withColumn(
    "growth",
    round((col("revenue") - lag("revenue", 1).over(w_time)) * 100 /
          lag("revenue", 1).over(w_time), 2)
)

# ─── Running totals with frame specification ───
w_cumulative = Window.partitionBy("user_id") \
    .orderBy("event_time") \
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

df_running = df.withColumn("cumulative_spend", sum("amount").over(w_cumulative))` },

                { type: "h2", text: "Reading and Writing Data" },
                {
                    type: "code", lang: "python", code: `# ─── Writing with options ───
# Parquet (recommended for analytics)
df.write \
    .mode("overwrite")              # overwrite | append | ignore | errorIfExists
    .partitionBy("year", "month")   # create folder structure
    .option("compression", "snappy")
    .parquet("s3://bucket/sales/")

# Delta Lake (with ACID transactions)
df.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .partitionBy("date") \
    .save("s3://bucket/delta/sales/")

# CSV (for human-readable output, small data only)
df.write \
    .mode("overwrite") \
    .option("header", "true") \
    .option("compression", "none") \
    .csv("output/report.csv")

# ─── Controlling output file count ───
# Problem: 200 partitions → 200 small output files (bad for downstream reads)
# Solution: coalesce before writing
df.coalesce(1).write.parquet("output/")    # one file (small data only)
df.coalesce(10).write.parquet("output/")   # 10 files

# Alternatively: repartition for even splits
df.repartition(20, "country").write.partitionBy("country").parquet("output/")
# → even distribution by country, manageable file count` },

                { type: "h2", text: "spark-submit — Running Production Jobs" },
                {
                    type: "code", lang: "bash", code: `# Submit a PySpark job to YARN cluster
spark-submit \
  --master yarn \
  --deploy-mode cluster \
  --name "Daily Sales ETL" \
  --num-executors 50 \
  --executor-memory 8g \
  --executor-cores 4 \
  --driver-memory 4g \
  --conf spark.sql.shuffle.partitions=400 \
  --conf spark.sql.broadcastTimeout=600 \
  --conf spark.network.timeout=800 \
  --py-files utils.py,transforms.py \
  daily_etl.py \
  --date 2025-01-15 \
  --env production

# Key configs explained:
# --num-executors: how many worker processes
# --executor-memory: RAM per executor (for data processing)
# --executor-cores: CPU cores per executor (for parallel tasks)
# --driver-memory: RAM for the driver (for collect(), show(), etc.)
# shuffle.partitions: number of post-shuffle partitions
# broadcastTimeout: max time to wait for broadcast (increase for slow S3)` },

                { type: "h2", text: "Performance Optimization Checklist" },
                {
                    type: "list", items: [
                        "Filter early: .filter() before .join() reduces the amount of data being joined",
                        "Project early: .select() only needed columns enables Parquet column pruning",
                        "Broadcast small dimensions: any dim table < 100-200MB should be broadcast",
                        "Repartition before wide operations: .repartition('key') before window/join on that key",
                        "Coalesce at the end: reduce output file count but avoid re-shuffle",
                        "Cache reused DataFrames: if a DataFrame is used 2+ times in your script",
                        "Avoid Python UDFs: they serialize data out of JVM, break optimization, run slowly. Use Spark SQL built-ins or pandas_udf instead",
                        "Set shuffle.partitions correctly: 200 (default) is too high for small data, too low for very large datasets",
                        "Avoid collect() on large data: this brings all data to driver — crashes for big datasets",
                        "Use explain() to verify your plan: check for unexpected CartesianJoin, SortMergeJoin when BroadcastHashJoin expected, etc.",
                    ]
                },
                {
                    type: "code", lang: "python", code: `# ─── Common anti-pattern: Python UDF ───
from pyspark.sql.functions import udf
from pyspark.sql.types import StringType

# ❌ SLOW: Python UDF — breaks JVM optimization, row-by-row processing
@udf(returnType=StringType())
def classify_salary(salary):
    if salary > 9000: return "High"
    elif salary > 7000: return "Mid"
    else: return "Low"

df.withColumn("band", classify_salary(col("salary")))

# ✅ FAST: Use native Spark SQL functions
from pyspark.sql.functions import when
df.withColumn("band",
    when(col("salary") > 9000, "High")
    .when(col("salary") > 7000, "Mid")
    .otherwise("Low")
)  # stays within JVM, vectorized, 10-100x faster` },

                { type: "h2", text: "Interview Q&A" },
                {
                    type: "table", headers: ["Question", "Strong Answer"], rows: [
                        ["Why is your Spark job slow?", "Check for: too much shuffle (groupBy, join without broadcast), data skew (one partition 100x larger than others), bad partition count (too few = underutilized cluster, too many = scheduling overhead), small files problem, Python UDFs bypassing JVM optimization."],
                        ["What's the difference between repartition and coalesce?", "Repartition triggers a full shuffle and creates N balanced partitions — use before operations that require even data distribution. Coalesce merges existing partitions locally (no shuffle) — use after processing to reduce output file count."],
                        ["When do you use a broadcast join?", "When one side of the join is small enough to fit in executor memory (typically < 100-200MB). The entire small table is copied to every executor, eliminating the shuffle on the large table and making the join an in-memory local lookup."],
                        ["What is lazy evaluation and why is it beneficial?", "Spark records transformations without executing them. When an action is called, Spark optimizes the entire plan at once — pushing filters before joins, combining steps, eliminating unnecessary operations. Users get optimization without having to manually think about it."],
                        ["What causes OOM in Spark?", "Partition too large for executor memory (increase executor.memory or add more partitions), collect() on huge data (brings all data to driver), skewed join or groupBy, cache() on data that doesn't fit in cluster memory, too many broadcast joins on large tables."],
                    ]
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
