export const tagColors = {
  "SETUP":        "#00C9A7",
  "READ/WRITE":   "#F9C80E",
  "DATAFRAME":    "#FF6B35",
  "FILTER":       "#845EC2",
  "AGGREGATION":  "#00B4D8",
  "JOINS":        "#FF6B6B",
  "WINDOW":       "#C77DFF",
  "CLEANING":     "#52B788",
  "SCHEMA":       "#4CC9F0",
  "PERFORMANCE":  "#F77F00",
  "STREAMING":    "#F72585",
  "SQL":          "#3A86FF",
};
export const exercises = [

  // ── SETUP ──────────────────────────────────────────────────────────────────
  {
    id: 1, tag: "SETUP",
    q: "Create a SparkSession — the entry point for all Spark operations.",
    a: "from pyspark.sql import SparkSession\n\nspark = SparkSession.builder \\\n    .appName('MyPipeline') \\\n    .master('local[*]') \\\n    .getOrCreate()\n\n# local[*] = use all CPU cores on local machine\n# In a cluster, remove .master() — Spark picks it up from the environment\n\n# Check version\nprint(spark.version)"
  },
  {
    id: 2, tag: "SETUP",
    q: "Create a SparkSession with custom config: 4GB driver memory, 8GB executor memory, and enable Hive support.",
    a: "from pyspark.sql import SparkSession\n\nspark = SparkSession.builder \\\n    .appName('HeavyJob') \\\n    .config('spark.driver.memory', '4g') \\\n    .config('spark.executor.memory', '8g') \\\n    .config('spark.sql.shuffle.partitions', '200') \\\n    .enableHiveSupport() \\\n    .getOrCreate()\n\n# spark.sql.shuffle.partitions: controls parallelism after joins/groupBys\n# Default is 200 — tune based on data size\n# Rule of thumb: 1 partition per 100-200MB of data after shuffle"
  },
  {
    id: 3, tag: "SETUP",
    q: "Create a small DataFrame manually from a list of tuples — useful for testing.",
    a: "from pyspark.sql import Row\n\n# From list of tuples + column names\ndata = [\n    (1001, 'Alice',  'Electronics', 899.99),\n    (1002, 'Bob',    'Furniture',   249.50),\n    (1003, 'Carlos', 'Electronics', 59.99),\n    (1004, 'Alice',  'Stationery',  4.99),\n]\ncolumns = ['order_id', 'customer', 'category', 'revenue']\n\ndf = spark.createDataFrame(data, columns)\ndf.show()\n\n# From list of Row objects (more explicit)\nrows = [Row(order_id=1, name='Alice', revenue=900.0)]\ndf2 = spark.createDataFrame(rows)"
  },

  // ── READ / WRITE ────────────────────────────────────────────────────────────
  {
    id: 4, tag: "READ/WRITE",
    q: "Read a Parquet file from S3, a CSV with a header, and a JSON file.",
    a: "# Read Parquet (preferred format for analytics)\ndf = spark.read.parquet('s3://my-bucket/orders/')\n\n# Read CSV with header and inferred schema\ndf = spark.read \\\n    .option('header', 'true') \\\n    .option('inferSchema', 'true') \\\n    .csv('s3://my-bucket/orders.csv')\n\n# Read JSON (each line is one JSON object)\ndf = spark.read.json('s3://my-bucket/events/')\n\n# Read multiple files with wildcard\ndf = spark.read.parquet('s3://my-bucket/orders/year=2023/month=*/')\n\n# Read a specific partition\ndf = spark.read.parquet('s3://my-bucket/orders/year=2023/month=06/')"
  },
  {
    id: 5, tag: "READ/WRITE",
    q: "Write a DataFrame to Parquet with Snappy compression, partitioned by year and month.",
    a: "df.write \\\n    .mode('overwrite') \\\n    .partitionBy('year', 'month') \\\n    .option('compression', 'snappy') \\\n    .parquet('s3://my-bucket/output/orders/')\n\n# Write modes:\n#   overwrite  - replace existing data\n#   append     - add to existing data\n#   ignore     - do nothing if data exists\n#   error      - throw error if data exists (default)\n\n# Write single CSV file (coalesce first to avoid many small files)\ndf.coalesce(1) \\\n    .write \\\n    .mode('overwrite') \\\n    .option('header', 'true') \\\n    .csv('s3://my-bucket/output/report/')"
  },
  {
    id: 6, tag: "READ/WRITE",
    q: "Read a JDBC source (PostgreSQL table) into a Spark DataFrame.",
    a: "df = spark.read \\\n    .format('jdbc') \\\n    .option('url', 'jdbc:postgresql://host:5432/mydb') \\\n    .option('dbtable', 'public.orders') \\\n    .option('user', 'myuser') \\\n    .option('password', 'mypassword') \\\n    .option('driver', 'org.postgresql.Driver') \\\n    .load()\n\n# Parallel read using numPartitions + partitionColumn\ndf = spark.read \\\n    .format('jdbc') \\\n    .option('url', 'jdbc:postgresql://host:5432/mydb') \\\n    .option('dbtable', 'public.orders') \\\n    .option('user', 'myuser') \\\n    .option('password', 'mypassword') \\\n    .option('numPartitions', '10') \\\n    .option('partitionColumn', 'order_id') \\\n    .option('lowerBound', '1') \\\n    .option('upperBound', '1000000') \\\n    .load()\n\n# numPartitions splits the table into 10 parallel reads\n# Each partition reads a chunk of order_id range"
  },
  {
    id: 7, tag: "READ/WRITE",
    q: "Write a DataFrame to a Delta Lake table — overwrite one specific partition only.",
    a: "# Write entire table\ndf.write \\\n    .format('delta') \\\n    .mode('overwrite') \\\n    .save('s3://my-bucket/delta/orders/')\n\n# Overwrite a SPECIFIC partition only (very important for idempotency!)\ndf.write \\\n    .format('delta') \\\n    .mode('overwrite') \\\n    .option('replaceWhere', \"order_date = '2024-01-15'\") \\\n    .save('s3://my-bucket/delta/orders/')\n\n# This only replaces rows where order_date = '2024-01-15'\n# All other partitions are untouched\n# Re-running this is safe (idempotent)\n\n# Write as a named Delta table (registered in Hive metastore)\ndf.write \\\n    .format('delta') \\\n    .mode('overwrite') \\\n    .saveAsTable('orders')"
  },

  // ── DATAFRAME BASICS ───────────────────────────────────────────────────────
  {
    id: 8, tag: "DATAFRAME",
    q: "Inspect a DataFrame: show rows, print schema, count rows, describe statistics.",
    a: "df.show()             # first 20 rows (truncates long strings)\ndf.show(50, False)    # 50 rows, no truncation\ndf.printSchema()      # column names and types as a tree\ndf.dtypes             # list of (column_name, type) tuples\ndf.columns            # list of column names\ndf.count()            # total row count (triggers execution)\ndf.describe().show()  # count, mean, stddev, min, max for numeric cols\n\n# Quick summary for non-numeric too\ndf.summary().show()\n\n# See the execution plan (like EXPLAIN in SQL)\ndf.explain()          # short plan\ndf.explain(True)      # full plan with all stages"
  },
  {
    id: 9, tag: "DATAFRAME",
    q: "Select specific columns, rename a column, and drop a column.",
    a: "from pyspark.sql.functions import col\n\n# Select columns\ndf.select('order_id', 'customer', 'revenue')\ndf.select(col('order_id'), col('revenue') * 1.1)  # with expression\n\n# Rename a column\ndf.withColumnRenamed('old_name', 'new_name')\n\n# Rename multiple at once\ndf.toDF('id', 'name', 'cat', 'rev')  # rename all columns by position\n\n# Drop a column\ndf.drop('unwanted_column')\ndf.drop('col1', 'col2', 'col3')  # drop multiple\n\n# Add a new column\ndf.withColumn('revenue_usd', col('revenue') * 0.85)\n\n# Select + alias\ndf.select(\n    col('order_id'),\n    col('revenue').alias('total_revenue'),\n    (col('quantity') * col('unit_price')).alias('gross')\n)"
  },
  {
    id: 10, tag: "DATAFRAME",
    q: "Add a new column using withColumn — with a constant value, a calculation, and a conditional.",
    a: "from pyspark.sql.functions import col, lit, when\n\n# Constant value\ndf = df.withColumn('currency', lit('USD'))\ndf = df.withColumn('is_processed', lit(True))\n\n# Calculation\ndf = df.withColumn('revenue', col('quantity') * col('unit_price') * (1 - col('discount')))\n\n# Conditional (like IF/CASE WHEN)\ndf = df.withColumn('tier',\n    when(col('revenue') >= 1000, 'high')\n    .when(col('revenue') >= 500,  'medium')\n    .otherwise('low')\n)\n\n# Conditional with null handling\ndf = df.withColumn('label',\n    when(col('status').isNull(), 'unknown')\n    .when(col('status') == 'completed', 'done')\n    .otherwise(col('status'))\n)"
  },
  {
    id: 11, tag: "DATAFRAME",
    q: "Remove duplicate rows — all duplicates, and duplicates based on specific columns.",
    a: "# Drop ALL duplicate rows (all columns must match)\ndf = df.dropDuplicates()\n\n# Drop duplicates based on specific columns\n# (keeps the first occurrence)\ndf = df.dropDuplicates(['order_id'])\ndf = df.dropDuplicates(['customer', 'order_date'])\n\n# Count duplicates before dropping\ntotal = df.count()\nunique = df.dropDuplicates(['order_id']).count()\nprint(f'Duplicates: {total - unique}')\n\n# Keep the LATEST row per order_id (not just first)\nfrom pyspark.sql.window import Window\nfrom pyspark.sql.functions import row_number\n\nw = Window.partitionBy('order_id').orderBy(col('updated_at').desc())\ndf = df.withColumn('rn', row_number().over(w)) \\\n       .filter(col('rn') == 1) \\\n       .drop('rn')"
  },

  // ── FILTER ─────────────────────────────────────────────────────────────────
  {
    id: 12, tag: "FILTER",
    q: "Filter rows using various conditions: equality, range, null check, isin, startsWith.",
    a: "from pyspark.sql.functions import col\n\n# Equality\ndf.filter(col('status') == 'completed')\ndf.filter(col('status') != 'cancelled')\n\n# Range\ndf.filter(col('revenue') > 500)\ndf.filter((col('revenue') >= 100) & (col('revenue') <= 1000))\n\n# Multiple conditions\ndf.filter(\n    (col('status') == 'completed') &\n    (col('country') == 'USA') &\n    (col('revenue') > 200)\n)\n\n# OR condition\ndf.filter((col('country') == 'USA') | (col('country') == 'UK'))\n\n# isin — equivalent to SQL IN\ndf.filter(col('country').isin('USA', 'UK', 'Germany'))\ndf.filter(~col('status').isin('cancelled', 'pending'))  # NOT IN\n\n# Null checks\ndf.filter(col('ship_date').isNull())\ndf.filter(col('ship_date').isNotNull())\n\n# String operations\ndf.filter(col('email').endswith('@gmail.com'))\ndf.filter(col('name').startswith('A'))\ndf.filter(col('product').contains('Laptop'))\ndf.filter(col('email').like('%@gmail%'))  # SQL LIKE"
  },
  {
    id: 13, tag: "FILTER",
    q: "Filter rows by date range after parsing a string column as a date.",
    a: "from pyspark.sql.functions import col, to_date, to_timestamp\n\n# Convert string to date\ndf = df.withColumn('order_date', to_date(col('order_date'), 'yyyy-MM-dd'))\n\n# Convert string to timestamp\ndf = df.withColumn('created_at', to_timestamp(col('created_at'), 'yyyy-MM-dd HH:mm:ss'))\n\n# Filter by date range\ndf.filter(\n    (col('order_date') >= '2023-01-01') &\n    (col('order_date') <  '2023-07-01')\n)\n\n# Filter for a specific month\nfrom pyspark.sql.functions import year, month\ndf.filter((year(col('order_date')) == 2023) & (month(col('order_date')) == 6))\n\n# Filter for last 30 days\nfrom pyspark.sql.functions import current_date, datediff\ndf.filter(datediff(current_date(), col('order_date')) <= 30)"
  },

  // ── AGGREGATION ────────────────────────────────────────────────────────────
  {
    id: 14, tag: "AGGREGATION",
    q: "Group by a column and compute multiple aggregations at once.",
    a: "from pyspark.sql.functions import sum, avg, count, min, max, countDistinct\n\n# Single aggregation\ndf.groupBy('country').agg(sum('revenue').alias('total_revenue'))\n\n# Multiple aggregations in one call\ndf.groupBy('country', 'category').agg(\n    sum('revenue').alias('total_revenue'),\n    avg('revenue').alias('avg_revenue'),\n    count('order_id').alias('order_count'),\n    countDistinct('customer').alias('unique_customers'),\n    min('revenue').alias('min_order'),\n    max('revenue').alias('max_order')\n).orderBy(col('total_revenue').desc())\n\n# Shorthand (less flexible, can't alias)\ndf.groupBy('category').sum('revenue')\ndf.groupBy('category').mean('revenue')"
  },
  {
    id: 15, tag: "AGGREGATION",
    q: "Compute a global aggregation (no group by) — total revenue, row count, distinct customers.",
    a: "from pyspark.sql.functions import sum, count, countDistinct, avg, max\n\n# Single stat\ntotal = df.agg(sum('revenue')).collect()[0][0]\n\n# Multiple global stats\ndf.agg(\n    count('*').alias('total_rows'),\n    sum('revenue').alias('total_revenue'),\n    avg('revenue').alias('avg_revenue'),\n    countDistinct('customer').alias('unique_customers'),\n    max('order_date').alias('latest_order')\n).show()\n\n# Quick count\ndf.count()\n\n# Count non-null values in a column\nfrom pyspark.sql.functions import count\ndf.agg(count('rating').alias('non_null_ratings')).show()\n# count(col) counts non-NULLs; count('*') counts all rows"
  },
  {
    id: 16, tag: "AGGREGATION",
    q: "Pivot a DataFrame — turn row values into columns (e.g., status values become column headers).",
    a: "# Pivot: turn 'status' row values into columns, sum revenue for each\ndf.groupBy('country') \\\n    .pivot('status', ['completed', 'pending', 'cancelled']) \\\n    .agg(sum('revenue').alias('revenue')) \\\n    .fillna(0) \\\n    .show()\n\n# Result shape:\n# | country | completed | pending | cancelled |\n# | USA     | 12000.0   | 500.0   | 200.0     |\n# | UK      | 8000.0    | 100.0   | 0.0       |\n\n# Without specifying values (Spark auto-detects but slower)\ndf.groupBy('country') \\\n    .pivot('status') \\\n    .agg(sum('revenue')) \\\n    .show()\n\n# Always specify pivot values when possible — avoids an extra scan to find distinct values"
  },

  // ── JOINS ──────────────────────────────────────────────────────────────────
  {
    id: 17, tag: "JOINS",
    q: "Join two DataFrames — inner, left, and anti join.",
    a: "# Inner join (only matching rows from both)\nresult = orders.join(customers, on='customer_id', how='inner')\n\n# Left join (all orders, NULL for unmatched customers)\nresult = orders.join(customers, on='customer_id', how='left')\n\n# Right join\nresult = orders.join(customers, on='customer_id', how='right')\n\n# Full outer join\nresult = orders.join(customers, on='customer_id', how='full')\n\n# Anti join — orders with NO matching customer (find orphan records)\northan_orders = orders.join(customers, on='customer_id', how='left_anti')\n\n# Semi join — orders that DO have a matching customer (filter, but don't add columns)\nmatched = orders.join(customers, on='customer_id', how='left_semi')\n\n# Join on different column names\nresult = orders.join(\n    customers,\n    orders['cust_id'] == customers['id'],\n    how='left'\n)\n\n# Join on multiple columns\nresult = df1.join(df2, on=['customer_id', 'date'], how='inner')"
  },
  {
    id: 18, tag: "JOINS",
    q: "Use a broadcast join to avoid shuffling a small lookup table across the cluster.",
    a: "from pyspark.sql.functions import broadcast\n\n# Normal join (both tables shuffled)\nresult = big_orders.join(customers, on='customer_id')\n# Both DataFrames reshuffled across network — expensive if big_orders is huge\n\n# Broadcast join (small table sent to every worker — no shuffle of big table)\nresult = big_orders.join(broadcast(customers), on='customer_id')\n# customers is small (e.g., 10,000 rows) — Spark sends it to ALL workers\n# big_orders stays in place — no network shuffle\n# Can be 10-100x faster for large left tables\n\n# Auto-broadcast threshold (Spark auto-broadcasts tables under this size)\nspark.conf.set('spark.sql.autoBroadcastJoinThreshold', 10 * 1024 * 1024)  # 10MB\n\n# Disable auto-broadcast\nspark.conf.set('spark.sql.autoBroadcastJoinThreshold', -1)\n\n# Check in explain plan — look for 'BroadcastHashJoin'\nresult.explain()"
  },

  // ── WINDOW FUNCTIONS ───────────────────────────────────────────────────────
  {
    id: 19, tag: "WINDOW",
    q: "Use ROW_NUMBER to get the most recent order per customer.",
    a: "from pyspark.sql.window import Window\nfrom pyspark.sql.functions import row_number, col\n\n# Define window: per customer, ordered by date descending\nw = Window.partitionBy('customer_id').orderBy(col('order_date').desc())\n\n# Assign row number within each customer group\ndf = df.withColumn('rn', row_number().over(w))\n\n# Keep only the most recent order per customer\nlatest = df.filter(col('rn') == 1).drop('rn')\nlatest.show()\n\n# RANK vs ROW_NUMBER vs DENSE_RANK:\n# row_number(): always unique — 1,2,3,4 (ties broken arbitrarily)\n# rank():       ties get same number, next skips — 1,1,3,4\n# dense_rank(): ties get same number, no skip — 1,1,2,3"
  },
  {
    id: 20, tag: "WINDOW",
    q: "Compute a running total and a 7-day rolling average of revenue.",
    a: "from pyspark.sql.window import Window\nfrom pyspark.sql.functions import sum, avg, col\n\n# Sort by date first\ndf = df.orderBy('order_date')\n\n# Running total (cumulative sum)\nw_running = Window.orderBy('order_date').rowsBetween(Window.unboundedPreceding, 0)\ndf = df.withColumn('running_total', sum('revenue').over(w_running))\n\n# 7-row rolling average (previous 6 rows + current row)\nw_rolling = Window.orderBy('order_date').rowsBetween(-6, 0)\ndf = df.withColumn('rolling_avg_7', avg('revenue').over(w_rolling))\n\n# Rolling within a partition (per customer)\nw_per_customer = Window \\\n    .partitionBy('customer_id') \\\n    .orderBy('order_date') \\\n    .rowsBetween(-6, 0)\ndf = df.withColumn('customer_rolling_7', avg('revenue').over(w_per_customer))\n\ndf.select('order_date', 'revenue', 'running_total', 'rolling_avg_7').show()"
  },
  {
    id: 21, tag: "WINDOW",
    q: "Use LAG and LEAD to compare each row with the previous and next row.",
    a: "from pyspark.sql.window import Window\nfrom pyspark.sql.functions import lag, lead, col\n\nw = Window.orderBy('order_date')\n\n# Previous row value\ndf = df.withColumn('prev_revenue', lag('revenue', 1).over(w))\n\n# Next row value\ndf = df.withColumn('next_revenue', lead('revenue', 1).over(w))\n\n# Change from previous row\ndf = df.withColumn('revenue_change', col('revenue') - col('prev_revenue'))\n\n# % change from previous row\ndf = df.withColumn('pct_change',\n    (col('revenue') - col('prev_revenue')) / col('prev_revenue') * 100\n)\n\n# Default value for the first row (no previous row)\ndf = df.withColumn('prev_revenue', lag('revenue', 1, 0.0).over(w))\n# 0.0 is returned instead of NULL for the first row\n\ndf.select('order_date', 'revenue', 'prev_revenue', 'pct_change').show()"
  },

  // ── CLEANING ───────────────────────────────────────────────────────────────
  {
    id: 22, tag: "CLEANING",
    q: "Handle null values — count them, drop rows with nulls, fill them in.",
    a: "from pyspark.sql.functions import col, isnan, when, count\n\n# Count nulls per column\ndf.select([\n    count(when(col(c).isNull(), c)).alias(c)\n    for c in df.columns\n]).show()\n\n# Drop rows where ANY column is null\ndf.dropna()\n\n# Drop rows where SPECIFIC columns are null\ndf.dropna(subset=['order_id', 'revenue'])\n\n# Drop rows where ALL columns are null (truly empty rows)\ndf.dropna(how='all')\n\n# Fill nulls with a constant\ndf.fillna(0)                           # fill all numeric nulls with 0\ndf.fillna({'revenue': 0, 'rating': 3.0, 'status': 'unknown'})\n\n# Fill with column mean\nfrom pyspark.sql.functions import mean\nmean_rev = df.agg(mean('revenue')).collect()[0][0]\ndf = df.fillna({'revenue': mean_rev})\n\n# Replace null with a conditional expression\ndf.withColumn('status', when(col('status').isNull(), 'pending').otherwise(col('status')))"
  },
  {
    id: 23, tag: "CLEANING",
    q: "Clean and transform string columns — trim whitespace, change case, split, replace.",
    a: "from pyspark.sql.functions import col, trim, lower, upper, split, regexp_replace\n\n# Trim whitespace\ndf = df.withColumn('name', trim(col('name')))\n\n# Case\ndf = df.withColumn('status', lower(col('status')))\ndf = df.withColumn('country_code', upper(col('country_code')))\n\n# Replace characters\ndf = df.withColumn('phone', regexp_replace(col('phone'), '[^0-9]', ''))  # keep only digits\ndf = df.withColumn('name', regexp_replace(col('name'), '  ', ' '))       # double space to single\n\n# Split a string into an array\ndf = df.withColumn('name_parts', split(col('full_name'), ' '))\n\n# Extract first/last name from array\nfrom pyspark.sql.functions import element_at\ndf = df.withColumn('first_name', element_at(col('name_parts'), 1))\ndf = df.withColumn('last_name',  element_at(col('name_parts'), -1))\n\n# Pad a string (e.g., order IDs to fixed width)\nfrom pyspark.sql.functions import lpad\ndf = df.withColumn('order_id_padded', lpad(col('order_id').cast('string'), 6, '0'))\n# '42' -> '000042'"
  },
  {
    id: 24, tag: "CLEANING",
    q: "Cast column types and handle type conversion errors gracefully.",
    a: "from pyspark.sql.functions import col, to_date, to_timestamp\n\n# Simple cast\ndf = df.withColumn('revenue', col('revenue').cast('double'))\ndf = df.withColumn('quantity', col('quantity').cast('integer'))\ndf = df.withColumn('is_active', col('is_active').cast('boolean'))\ndf = df.withColumn('order_id', col('order_id').cast('string'))\n\n# Cast to date / timestamp\ndf = df.withColumn('order_date', to_date(col('order_date'), 'yyyy-MM-dd'))\ndf = df.withColumn('created_at', to_timestamp(col('created_at'), 'yyyy-MM-dd HH:mm:ss'))\n\n# Safe cast (invalid values become NULL instead of crashing)\n# In Spark, .cast() is already safe — bad values become NULL\ndf = df.withColumn('amount', col('amount_str').cast('double'))\n# '123.45' -> 123.45\n# 'abc'    -> null  (no exception thrown)\n\n# Detect and filter out bad casts\ndf_bad  = df.filter(col('amount').isNull() & col('amount_str').isNotNull())\ndf_good = df.filter(col('amount').isNotNull())\nprint('Bad rows:', df_bad.count())"
  },
  {
    id: 25, tag: "CLEANING",
    q: "Use UDF (User Defined Function) to apply custom Python logic to a column.",
    a: "from pyspark.sql.functions import udf, col\nfrom pyspark.sql.types import StringType, DoubleType\n\n# Define a Python function\ndef clean_email(email):\n    if email is None:\n        return None\n    return email.strip().lower()\n\n# Register as UDF with return type\nclean_email_udf = udf(clean_email, StringType())\n\n# Apply to column\ndf = df.withColumn('email', clean_email_udf(col('email')))\n\n# UDF with multiple args\ndef calc_margin(revenue, cost):\n    if revenue is None or cost is None or revenue == 0:\n        return None\n    return round((revenue - cost) / revenue * 100, 2)\n\nmargin_udf = udf(calc_margin, DoubleType())\ndf = df.withColumn('margin_pct', margin_udf(col('revenue'), col('cost')))\n\n# IMPORTANT: UDFs are slow — they serialize data to Python and back\n# Always prefer built-in Spark functions (col, when, regexp_replace, etc.)\n# Use UDFs only when there is no native Spark equivalent\n\n# Pandas UDF (vectorized — much faster than regular UDF)\nfrom pyspark.sql.functions import pandas_udf\nimport pandas as pd\n\n@pandas_udf(DoubleType())\ndef fast_discount(revenue: pd.Series, discount: pd.Series) -> pd.Series:\n    return revenue * (1 - discount)\n\ndf = df.withColumn('net_revenue', fast_discount(col('revenue'), col('discount')))"
  },

  // ── SCHEMA ─────────────────────────────────────────────────────────────────
  {
    id: 26, tag: "SCHEMA",
    q: "Define an explicit schema using StructType instead of inferring it.",
    a: "from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType, DateType, BooleanType\n\nschema = StructType([\n    StructField('order_id',     IntegerType(), nullable=False),\n    StructField('customer_id',  StringType(),  nullable=False),\n    StructField('customer_name',StringType(),  nullable=True),\n    StructField('revenue',      DoubleType(),  nullable=True),\n    StructField('quantity',     IntegerType(), nullable=True),\n    StructField('order_date',   DateType(),    nullable=True),\n    StructField('is_completed', BooleanType(), nullable=True),\n])\n\n# Read with explicit schema (no inferSchema scan = faster)\ndf = spark.read \\\n    .option('header', 'true') \\\n    .schema(schema) \\\n    .csv('s3://bucket/orders.csv')\n\n# Benefits of explicit schema:\n# 1. Faster reads (no extra pass to infer)\n# 2. Catches schema mismatches early\n# 3. Correct types guaranteed (inferSchema might guess wrong)\n# 4. Critical in production pipelines"
  },
  {
    id: 27, tag: "SCHEMA",
    q: "Flatten a nested/struct column and explode an array column.",
    a: "from pyspark.sql.functions import col, explode, explode_outer\n\n# Sample nested schema:\n# customer: { id: string, name: string, address: { city: string, country: string } }\n\n# Access nested field with dot notation\ndf.select(\n    col('order_id'),\n    col('customer.id').alias('customer_id'),\n    col('customer.name').alias('customer_name'),\n    col('customer.address.city').alias('city'),\n    col('customer.address.country').alias('country')\n)\n\n# Flatten all struct fields with star expansion\ndf.select('order_id', 'customer.*')\n\n# EXPLODE: array column -> one row per array element\n# tags: ['Electronics', 'Sale', 'Featured'] -> 3 rows\ndf_exploded = df.withColumn('tag', explode(col('tags')))\n# Each row is duplicated for each tag\n\n# explode_outer: keeps rows even if array is empty or null\ndf_exploded = df.withColumn('tag', explode_outer(col('tags')))\n# Empty arrays -> 1 row with tag = NULL (explode would drop these)\n\n# Explode a map column\ndf.select('id', explode(col('attributes'))).show()\n# produces 'key' and 'value' columns"
  },

  // ── PERFORMANCE ────────────────────────────────────────────────────────────
  {
    id: 28, tag: "PERFORMANCE",
    q: "Repartition and coalesce a DataFrame — when to use each.",
    a: "# REPARTITION — full shuffle, use to INCREASE or REBALANCE partitions\ndf = df.repartition(200)                  # 200 evenly-sized partitions\ndf = df.repartition(200, 'country')       # partition by column (good for joins later)\ndf = df.repartition('order_date', 'country')  # multi-column partition key\n\n# COALESCE — no shuffle, use to REDUCE partitions cheaply\ndf = df.coalesce(10)    # merge to 10 partitions (data moves minimally)\ndf = df.coalesce(1)     # single partition — useful before writing one file\n\n# When to repartition:\n# - Before a join on a specific key (avoids shuffle during join)\n# - Data is heavily skewed (one partition >> others)\n# - Too few partitions — cluster is underutilized\n\n# When to coalesce:\n# - Before writing output to reduce number of output files\n# - After heavy filtering reduced data size dramatically\n\n# Check current partition count\nprint(df.rdd.getNumPartitions())\n\n# Check partition sizes (approximate)\ndf.groupBy(spark_partition_id()).count().show()\n# from pyspark.sql.functions import spark_partition_id"
  },
  {
    id: 29, tag: "PERFORMANCE",
    q: "Cache a DataFrame and unpersist it when done.",
    a: "from pyspark.storagelevel import StorageLevel\n\n# Cache in memory (default = MEMORY_AND_DISK)\ndf.cache()                                               # shorthand\ndf.persist()                                             # same as cache()\ndf.persist(StorageLevel.MEMORY_AND_DISK)                 # explicit\ndf.persist(StorageLevel.MEMORY_ONLY)                     # evicted if memory full (recomputed)\ndf.persist(StorageLevel.DISK_ONLY)                       # always on disk, slow but safe\ndf.persist(StorageLevel.MEMORY_AND_DISK_SER)             # serialized (less memory, slower)\n\n# IMPORTANT: caching is lazy too!\n# df.cache() does NOT cache yet — it marks the DataFrame\n# The first action triggers the cache\ndf.cache()\ndf.count()  # <-- this executes AND caches the DataFrame\n\n# After this, df.show(), df.filter().count() etc. read from cache\n\n# Always unpersist when done — frees memory for other operations\ndf.unpersist()\n\n# When to cache:\n# - DataFrame is used 2+ times in same job\n# - Expensive computation (heavy join, many transforms)\n# - Iterative ML training loops\n\n# When NOT to cache:\n# - Used only once\n# - Larger than available cluster memory (causes thrashing)"
  },
  {
    id: 30, tag: "PERFORMANCE",
    q: "Use explain() to read the physical execution plan and spot inefficiencies.",
    a: "# Short plan (just physical)\ndf.explain()\n\n# Full plan: parsed -> analyzed -> optimized -> physical\ndf.explain(True)\n\n# Formatted (Spark 3.0+, easier to read)\ndf.explain('formatted')\ndf.explain('cost')      # with cost statistics\ndf.explain('codegen')   # generated JVM code\n\n# What to look for:\n\n# GOOD:\n# BroadcastHashJoin   -> small table broadcast, no shuffle\n# Project [col1, col2] -> column pruning (only needed cols read)\n# Filter pushed down  -> filter applied before reading data\n\n# BAD:\n# SortMergeJoin       -> full shuffle of both sides (expensive)\n# Exchange (shuffle)  -> data moved across network\n# Scan reading 200 columns when you only need 5\n\n# Practical example:\nresult = big_df.join(small_df, 'id').filter(col('status') == 'active').select('id', 'name')\nresult.explain('formatted')\n# Look for: did Spark push the filter before the join?\n# Did it broadcast small_df?\n# Did it prune columns before the join?"
  },
  {
    id: 31, tag: "PERFORMANCE",
    q: "Handle data skew — detect it and fix it with salting.",
    a: "from pyspark.sql.functions import col, concat, lit, floor, rand\n\n# DETECT SKEW: check partition sizes\nfrom pyspark.sql.functions import spark_partition_id\ndf.groupBy(spark_partition_id().alias('partition_id')) \\\n  .count() \\\n  .orderBy(col('count').desc()) \\\n  .show(20)\n# If one partition has 10x more rows than others -> skew\n\n# DETECT SKEW: check value distribution of join key\ndf.groupBy('country').count().orderBy(col('count').desc()).show(10)\n# If USA has 80% of rows and others have <1% -> joining on country will skew\n\n# FIX: SALTING (for skewed joins)\n# Step 1: Add a random salt to the skewed key\nSALT_BUCKETS = 10\nbig_df = big_df.withColumn(\n    'salted_key',\n    concat(col('country'), lit('_'), (floor(rand() * SALT_BUCKETS)).cast('string'))\n)\n\n# Step 2: Explode the small table to match all salt values\nfrom pyspark.sql.functions import array, explode\nsmall_df = small_df.withColumn('salt', array([lit(i) for i in range(SALT_BUCKETS)]))\nsmall_df = small_df.withColumn('salt', explode(col('salt')))\nsmall_df = small_df.withColumn(\n    'salted_key',\n    concat(col('country'), lit('_'), col('salt').cast('string'))\n)\n\n# Step 3: Join on salted key\nresult = big_df.join(small_df, on='salted_key')"
  },

  // ── SQL IN SPARK ───────────────────────────────────────────────────────────
  {
    id: 32, tag: "SQL",
    q: "Register a DataFrame as a temporary view and query it with Spark SQL.",
    a: "# Register as a temporary view (available in this SparkSession only)\ndf.createOrReplaceTempView('orders')\n\n# Now query with full SQL\nresult = spark.sql(\"\"\"\n    SELECT\n        country,\n        category,\n        SUM(revenue) AS total_revenue,\n        COUNT(*)     AS order_count\n    FROM orders\n    WHERE status = 'completed'\n    GROUP BY country, category\n    ORDER BY total_revenue DESC\n\"\"\")\nresult.show()\n\n# Global temp view (available across SparkSessions)\ndf.createOrReplaceGlobalTempView('orders_global')\nspark.sql('SELECT * FROM global_temp.orders_global').show()\n\n# Mix DataFrame API and SQL freely\ncompleted = df.filter(col('status') == 'completed')\ncompleted.createOrReplaceTempView('completed_orders')\n\nspark.sql(\"\"\"\n    SELECT customer, SUM(revenue) as total\n    FROM completed_orders\n    GROUP BY customer\n\"\"\").show()"
  },
  {
    id: 33, tag: "SQL",
    q: "Use Spark SQL window functions directly in a SQL query registered as a view.",
    a: "df.createOrReplaceTempView('orders')\n\n# Rank customers by revenue within each country\nresult = spark.sql(\"\"\"\n    WITH ranked AS (\n        SELECT\n            customer,\n            country,\n            SUM(revenue)    AS total_revenue,\n            RANK()     OVER (PARTITION BY country ORDER BY SUM(revenue) DESC) AS rnk,\n            ROW_NUMBER()OVER (PARTITION BY country ORDER BY SUM(revenue) DESC) AS row_num,\n            DENSE_RANK()OVER (PARTITION BY country ORDER BY SUM(revenue) DESC) AS dense_rnk\n        FROM orders\n        GROUP BY customer, country\n    )\n    SELECT *\n    FROM ranked\n    WHERE rnk <= 3\n    ORDER BY country, rnk\n\"\"\")\nresult.show()\n\n# Running total with SQL\nspark.sql(\"\"\"\n    SELECT\n        order_date,\n        revenue,\n        SUM(revenue) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total\n    FROM orders\n    ORDER BY order_date\n\"\"\").show()"
  },

  // ── STREAMING ──────────────────────────────────────────────────────────────
  {
    id: 34, tag: "STREAMING",
    q: "Set up a basic Spark Structured Streaming job reading from Kafka.",
    a: "from pyspark.sql.functions import col, from_json\nfrom pyspark.sql.types import StructType, StringType, DoubleType\n\n# Read stream from Kafka\nraw_stream = spark.readStream \\\n    .format('kafka') \\\n    .option('kafka.bootstrap.servers', 'broker1:9092,broker2:9092') \\\n    .option('subscribe', 'orders-topic') \\\n    .option('startingOffsets', 'latest') \\\n    .load()\n\n# Kafka gives you: key, value (binary), topic, partition, offset, timestamp\n# Decode value from binary to string\nstring_stream = raw_stream.selectExpr('CAST(value AS STRING) AS json_str')\n\n# Define schema of the JSON payload\nschema = StructType() \\\n    .add('order_id', StringType()) \\\n    .add('customer', StringType()) \\\n    .add('revenue', DoubleType())\n\n# Parse JSON string into struct\nparsed = string_stream.withColumn('data', from_json(col('json_str'), schema)) \\\n                       .select('data.*')\n\n# Write stream to console (for development)\nquery = parsed.writeStream \\\n    .format('console') \\\n    .outputMode('append') \\\n    .start()\n\nquery.awaitTermination()"
  },
  {
    id: 35, tag: "STREAMING",
    q: "Apply a watermark and compute windowed aggregations on a stream.",
    a: "from pyspark.sql.functions import window, col, sum, count, to_timestamp\n\n# Assume 'event_time' column exists as timestamp\nstream = parsed.withColumn('event_time', to_timestamp(col('event_time')))\n\n# Apply watermark: tolerate up to 10 minutes of late data\nwatermarked = stream.withWatermark('event_time', '10 minutes')\n\n# Tumbling window: count orders per 5-minute window\nresult = watermarked \\\n    .groupBy(\n        window(col('event_time'), '5 minutes'),  # window column\n        col('country')\n    ) \\\n    .agg(\n        count('order_id').alias('order_count'),\n        sum('revenue').alias('total_revenue')\n    )\n\n# Output modes:\n# append:  only emit NEW final results (after watermark passes window)\n# update:  emit updated results as new data arrives (for aggregations)\n# complete: emit entire result table each time (only for small result sets)\n\nquery = result.writeStream \\\n    .format('console') \\\n    .outputMode('update') \\\n    .option('truncate', False) \\\n    .start()\n\nquery.awaitTermination()"
  },

  // ── MORE DATAFRAME / MISC ───────────────────────────────────────────────────
  {
    id: 36, tag: "DATAFRAME",
    q: "Union two DataFrames (stack rows) and handle different column orders.",
    a: "# UNION — rows must match by POSITION (column order matters)\ncombined = df1.union(df2)\n\n# UNION BY NAME — safer, matches columns by name not position\ncombined = df1.unionByName(df2)\n\n# Handle missing columns (Spark 3.1+)\ncombined = df1.unionByName(df2, allowMissingColumns=True)\n# Missing columns in either df get filled with NULL\n\n# Equivalent to SQL UNION ALL (keeps duplicates)\n# To deduplicate after union:\ncombined = df1.union(df2).distinct()\n\n# Practical: stack this month and last month\nimport_jan = spark.read.parquet('s3://bucket/orders/month=01/')\nimport_feb = spark.read.parquet('s3://bucket/orders/month=02/')\nall_orders = import_jan.unionByName(import_feb)\nprint(all_orders.count())"
  },
  {
    id: 37, tag: "DATAFRAME",
    q: "Sort a DataFrame by multiple columns, handle nulls in sort order.",
    a: "from pyspark.sql.functions import col, asc, desc, asc_nulls_last, desc_nulls_last\n\n# Simple sort\ndf.orderBy('revenue')                        # ascending (default)\ndf.orderBy(col('revenue').desc())            # descending\ndf.sort(col('revenue').desc())               # sort() is alias for orderBy()\n\n# Multiple columns\ndf.orderBy(\n    col('country').asc(),\n    col('revenue').desc()\n)\n\n# Handle nulls in sort (nulls first or last)\ndf.orderBy(col('revenue').desc_nulls_last())  # nulls at bottom\ndf.orderBy(col('revenue').asc_nulls_last())   # ascending, nulls at bottom\n\n# Sort within groups using window function (don't use orderBy for this)\nfrom pyspark.sql.window import Window\nfrom pyspark.sql.functions import rank\nw = Window.partitionBy('country').orderBy(col('revenue').desc())\ndf.withColumn('rank', rank().over(w))"
  },
  {
    id: 38, tag: "DATAFRAME",
    q: "Use collect(), take(), and first() — and understand when NOT to use collect().",
    a: "# first() — returns the first row as a Row object\nrow = df.first()\nprint(row['revenue'])   # access by column name\nprint(row[0])           # access by index\n\n# take(n) — returns first N rows as a list of Row objects\nrows = df.take(5)\nfor r in rows:\n    print(r['customer'], r['revenue'])\n\n# collect() — brings ALL rows to the driver as a Python list\nall_rows = df.collect()\nfor r in all_rows:\n    print(r['order_id'])\n\n# WARNING: NEVER use collect() on a large DataFrame!\n# collect() moves ALL data from the cluster to your driver node\n# 1 billion rows collected = driver runs out of memory = JVM crash\n\n# Safe alternatives:\ndf.show(20)                      # prints to console\ndf.limit(1000).toPandas()        # small sample to pandas\ndf.write.parquet('s3://...')     # write results to storage\n\n# Acceptable collect() uses:\n# - Small aggregation result (one row per country: 50 rows)\n# - Small lookup table (list of config values)\nresult = df.groupBy('country').count().collect()  # 50 rows — fine"
  },
  {
    id: 39, tag: "AGGREGATION",
    q: "Compute percentiles and approximate quantiles on a large DataFrame.",
    a: "from pyspark.sql.functions import percentile_approx, expr\n\n# Exact percentile (expensive on large data)\ndf.agg(\n    percentile_approx('revenue', 0.5).alias('median'),\n    percentile_approx('revenue', 0.25).alias('p25'),\n    percentile_approx('revenue', 0.75).alias('p75'),\n    percentile_approx('revenue', 0.95).alias('p95'),\n    percentile_approx('revenue', [0.25, 0.5, 0.75]).alias('quartiles')\n).show()\n\n# Using approxQuantile (faster, approximate)\n# Returns Python list — triggers .collect() internally\nquantiles = df.approxQuantile('revenue', [0.25, 0.5, 0.75], 0.01)\n# 0.01 is relative error tolerance (0 = exact but slow)\nprint(f'P25: {quantiles[0]}, Median: {quantiles[1]}, P75: {quantiles[2]}')\n\n# Per-group percentiles\ndf.groupBy('category').agg(\n    percentile_approx('revenue', 0.5).alias('median_revenue'),\n    percentile_approx('revenue', 0.95).alias('p95_revenue')\n).show()"
  },
  {
    id: 40, tag: "SCHEMA",
    q: "Read a Delta Lake table, query its history, and time travel to a previous version.",
    a: "# Read latest version\ndf = spark.read.format('delta').load('s3://bucket/delta/orders/')\n\n# Or read a named table (registered in metastore)\ndf = spark.read.table('orders')\n\n# See full change history\nfrom delta.tables import DeltaTable\ndt = DeltaTable.forPath(spark, 's3://bucket/delta/orders/')\ndt.history().show(truncate=False)\n# Shows: version, timestamp, operation (WRITE, UPDATE, DELETE, MERGE), user\n\n# TIME TRAVEL — read a previous version by version number\ndf_v3 = spark.read \\\n    .format('delta') \\\n    .option('versionAsOf', 3) \\\n    .load('s3://bucket/delta/orders/')\n\n# TIME TRAVEL — read by timestamp\ndf_yesterday = spark.read \\\n    .format('delta') \\\n    .option('timestampAsOf', '2024-01-14 00:00:00') \\\n    .load('s3://bucket/delta/orders/')\n\n# Restore table to a previous version\ndt.restoreToVersion(3)\ndt.restoreToTimestamp('2024-01-14')\n\n# VACUUM: clean up old files (can no longer time travel past retention)\ndt.vacuum(retentionHours=168)  # keep 7 days of history"
  },
  {
    id: 41, tag: "PERFORMANCE",
    q: "Tune spark.sql.shuffle.partitions for optimal join and groupBy performance.",
    a: "# The default is 200 — often wrong for your data size\n\n# Check current setting\nprint(spark.conf.get('spark.sql.shuffle.partitions'))  # 200\n\n# Set at SparkSession level\nspark.conf.set('spark.sql.shuffle.partitions', '400')\n\n# Rule of thumb:\n# Target partition size: 100-200 MB after shuffle\n# total_shuffle_data_MB / 150 = ideal num partitions\n#\n# Small dataset (1 GB total): 8-20 partitions\n# Medium dataset (100 GB):    500-1000 partitions\n# Large dataset  (1 TB):      5000-10000 partitions\n\n# Too FEW partitions:\n# - Large partitions -> workers run out of memory (OOM)\n# - Less parallelism -> slow\n\n# Too MANY partitions:\n# - Scheduler overhead: 100k tiny tasks take longer to schedule than 1000 medium tasks\n# - Too many small output files in S3\n\n# Adaptive Query Execution (AQE) — Spark 3.0+, auto-tunes partitions at runtime\nspark.conf.set('spark.sql.adaptive.enabled', 'true')\nspark.conf.set('spark.sql.adaptive.coalescePartitions.enabled', 'true')\n# AQE merges small shuffle partitions automatically after each stage\n# Highly recommended — enable in production"
  },
  {
    id: 42, tag: "PERFORMANCE",
    q: "Use Spark's built-in functions instead of UDFs for best performance.",
    a: "from pyspark.sql.functions import (\n    col, when, lit, round, abs, sqrt, log,\n    concat, concat_ws, substring, length, instr,\n    date_add, date_diff, date_format, current_date,\n    year, month, dayofweek, hour,\n    array_contains, array_size, struct, to_json\n)\n\n# String concat without UDF\ndf = df.withColumn('full_label', concat_ws(' - ', col('category'), col('product')))\n\n# Date math without UDF\ndf = df.withColumn('days_since', date_diff(current_date(), col('order_date')))\ndf = df.withColumn('due_date',   date_add(col('order_date'), 30))\n\n# Rounding\ndf = df.withColumn('revenue', round(col('revenue'), 2))\n\n# Conditional logic without UDF\ndf = df.withColumn('bucket',\n    when(col('revenue') >= 1000, 'large')\n    .when(col('revenue') >= 200, 'medium')\n    .otherwise('small')\n)\n\n# WHY built-ins beat UDFs:\n# Built-in functions run IN the JVM with optimized Spark internals\n# UDFs serialize data to Python, process in Python, serialize back to JVM\n# This Python<->JVM round trip can be 10-100x slower\n# Catalyst optimizer can inspect and optimize built-in functions\n# Catalyst CANNOT optimize inside a UDF (black box)\n# If a built-in exists for your logic -> ALWAYS use it"
  },
  {
    id: 43, tag: "FILTER",
    q: "Use sampling to work on a small representative subset during development.",
    a: "# Sample a fraction of rows (approximate)\ndf_sample = df.sample(fraction=0.1, seed=42)    # ~10% of rows\ndf_sample = df.sample(fraction=0.01, seed=42)   # ~1% of rows\nprint(df_sample.count())\n\n# Sample with replacement (for bootstrapping)\ndf_sample = df.sample(withReplacement=True, fraction=0.1, seed=42)\n\n# Take exact N rows (not random — just first N)\ndf_small = df.limit(10000)\n\n# Stratified sample (proportional per group)\n# Keeps distribution of 'status' column\nfractions = {'completed': 0.1, 'pending': 0.5, 'cancelled': 0.3}\ndf_stratified = df.sampleBy('status', fractions=fractions, seed=42)\n\n# Why sampling during development:\n# Running full pipeline on 1TB during development wastes time and money\n# Sample 1% = 10GB -> same logic, 100x faster iteration\n# Seed = reproducible results (same sample every run)\n# Always test on full data before production deploy"
  },
  {
    id: 44, tag: "CLEANING",
    q: "Detect and remove outliers using IQR (Interquartile Range) in Spark.",
    a: "# Compute Q1, Q3, and IQR using approxQuantile\nquantiles = df.approxQuantile('revenue', [0.25, 0.75], 0.01)\nQ1, Q3 = quantiles[0], quantiles[1]\nIQR = Q3 - Q1\n\nlower_bound = Q1 - 1.5 * IQR\nupper_bound = Q3 + 1.5 * IQR\n\nprint(f'Q1={Q1}, Q3={Q3}, IQR={IQR}')\nprint(f'Bounds: [{lower_bound}, {upper_bound}]')\n\n# Filter out outliers\ndf_clean = df.filter(\n    (col('revenue') >= lower_bound) &\n    (col('revenue') <= upper_bound)\n)\n\n# Flag outliers instead of dropping\ndf = df.withColumn('is_outlier',\n    (col('revenue') < lower_bound) | (col('revenue') > upper_bound)\n)\n\n# Clip (cap) values at boundaries\nfrom pyspark.sql.functions import least, greatest\ndf = df.withColumn('revenue_clipped',\n    least(greatest(col('revenue'), lit(lower_bound)), lit(upper_bound))\n)\n# Values below lower_bound -> lower_bound\n# Values above upper_bound -> upper_bound"
  },
  {
    id: 45, tag: "READ/WRITE",
    q: "Merge (upsert) new data into an existing Delta Lake table using DeltaTable.merge().",
    a: "from delta.tables import DeltaTable\nfrom pyspark.sql.functions import col\n\n# Load the existing Delta table\ndt = DeltaTable.forPath(spark, 's3://bucket/delta/orders/')\n\n# New/updated data coming in\nnew_data = spark.read.parquet('s3://bucket/staging/orders_update/')\n\n# MERGE: upsert new_data into dt\ndt.alias('target').merge(\n    new_data.alias('source'),\n    condition='target.order_id = source.order_id'  # match key\n) \\\n.whenMatchedUpdateAll() \\\n.whenNotMatchedInsertAll() \\\n.execute()\n\n# With conditional update (only update if source is newer)\ndt.alias('target').merge(\n    new_data.alias('source'),\n    'target.order_id = source.order_id'\n) \\\n.whenMatchedUpdate(\n    condition='source.updated_at > target.updated_at',\n    set={\n        'status':     'source.status',\n        'revenue':    'source.revenue',\n        'updated_at': 'source.updated_at'\n    }\n) \\\n.whenNotMatchedInsertAll() \\\n.execute()\n\n# This is idempotent — run it 100 times, same result\n# Equivalent to SQL: INSERT ... ON CONFLICT DO UPDATE"
  },

  // ── FINAL BATCH ─────────────────────────────────────────────────────────────
  {
    id: 46, tag: "DATAFRAME",
    q: "Compute the number of rows, nulls, distinct values, and % null for every column.",
    a: "from pyspark.sql.functions import col, count, countDistinct, when, round as spark_round\n\ntotal_rows = df.count()\n\n# Build a summary of all columns\nstats = df.agg(*[\n    count(when(col(c).isNull(), c)).alias(c + '_nulls')\n    for c in df.columns\n]).toPandas().T\n\nstats.columns = ['null_count']\nstats['null_pct'] = (stats['null_count'] / total_rows * 100).round(2)\nprint(stats)\n\n# Distinct counts per column\ndf.agg(*[\n    countDistinct(c).alias(c)\n    for c in df.columns\n]).show()\n\n# One-liner profile (Spark 3.3+)\ndf.summary('count', 'mean', 'min', 'max', '50%').show()"
  },
  {
    id: 47, tag: "AGGREGATION",
    q: "Use collect_list and collect_set to aggregate values into arrays per group.",
    a: "from pyspark.sql.functions import collect_list, collect_set, col, sort_array\n\n# collect_list: all values (keeps duplicates, preserves order as seen)\ndf.groupBy('customer').agg(\n    collect_list('product').alias('all_products_purchased')\n).show(truncate=False)\n# | Alice | [Laptop, Keyboard, Laptop] |  <- duplicates kept\n\n# collect_set: unique values only (no duplicates, no guaranteed order)\ndf.groupBy('customer').agg(\n    collect_set('product').alias('unique_products')\n).show(truncate=False)\n# | Alice | [Keyboard, Laptop] |  <- deduplicated\n\n# Sort the resulting array\ndf.groupBy('customer').agg(\n    sort_array(collect_set('product')).alias('products_sorted')\n)\n\n# Real use case: build a customer purchase history string\nfrom pyspark.sql.functions import concat_ws, array_distinct\ndf.groupBy('customer').agg(\n    concat_ws(', ', sort_array(collect_set('product'))).alias('product_history')\n).show(truncate=False)"
  },
  {
    id: 48, tag: "SCHEMA",
    q: "Write a full end-to-end PySpark pipeline: read CSV, clean, transform, write Parquet.",
    a: "from pyspark.sql import SparkSession\nfrom pyspark.sql.functions import col, to_date, trim, lower, when, round\nfrom pyspark.sql.types import StructType, StructField, IntegerType, StringType, DoubleType\n\n# 1. START SESSION\nspark = SparkSession.builder.appName('OrdersPipeline').getOrCreate()\n\n# 2. DEFINE SCHEMA\nschema = StructType([\n    StructField('order_id',    IntegerType(), False),\n    StructField('customer',    StringType(),  True),\n    StructField('category',    StringType(),  True),\n    StructField('quantity',    IntegerType(), True),\n    StructField('unit_price',  DoubleType(),  True),\n    StructField('discount',    DoubleType(),  True),\n    StructField('order_date',  StringType(),  True),\n    StructField('status',      StringType(),  True),\n])\n\n# 3. READ\ndf = spark.read.option('header', 'true').schema(schema).csv('s3://bucket/raw/orders.csv')\n\n# 4. CLEAN\ndf = df.dropDuplicates(['order_id'])\ndf = df.dropna(subset=['order_id', 'unit_price'])\ndf = df.withColumn('status', lower(trim(col('status'))))\ndf = df.withColumn('order_date', to_date(col('order_date'), 'yyyy-MM-dd'))\ndf = df.fillna({'discount': 0.0, 'quantity': 1})\n\n# 5. TRANSFORM\ndf = df.withColumn('revenue', round(col('quantity') * col('unit_price') * (1 - col('discount')), 2))\ndf = df.withColumn('year',  col('order_date').cast('string').substr(1, 4))\ndf = df.withColumn('month', col('order_date').cast('string').substr(6, 2))\ndf = df.withColumn('tier',\n    when(col('revenue') >= 1000, 'high')\n    .when(col('revenue') >= 300,  'medium')\n    .otherwise('low')\n)\n\n# 6. WRITE\ndf.write \\\n  .mode('overwrite') \\\n  .partitionBy('year', 'month') \\\n  .option('compression', 'snappy') \\\n  .parquet('s3://bucket/clean/orders/')\n\nprint('Pipeline complete. Rows written:', df.count())\nspark.stop()"
  },
];