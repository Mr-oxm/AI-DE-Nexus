"use client";
import { DocSection } from "../DocSection";

export default function FundamentalsDocPage() {
    return (
        <DocSection
            title="Data Fundamentals"
            subtitle="The conceptual foundation every data engineer must have — understanding how data is stored, organized, and flows through modern systems."
            accent="#10b981"
            blocks={[
                { type: "h2", text: "Why Data Fundamentals?" },
                { type: "p", text: "Data fundamentals is not about memorizing definitions. It's about building a mental model of the data world so you can make intelligent decisions as an engineer. When someone asks 'where should I store this data?' or 'why is this query slow?', your answer should be grounded in solid fundamentals — not guesswork." },
                { type: "p", text: "Think of it like architecture: before building a house, you must understand the difference between load-bearing walls and partition walls, between a foundation and a floor. These are the same kind of foundational distinctions a data engineer must know." },

                { type: "h2", text: "Databases vs Files — What's the Difference?" },
                { type: "p", text: "Before databases, people stored data in flat files (CSVs, text files). Files are simple but have no way to query them efficiently, enforce data types, prevent duplicates, or handle multiple users editing at once. Databases solve all of these problems." },
                {
                    type: "table", headers: ["Aspect", "Flat Files (CSV/JSON)", "Relational Database (SQL)"], rows: [
                        ["Query speed", "Must read entire file to find one row", "Indexes enable instant lookup of any row"],
                        ["Concurrent access", "Two users writing at same time = corruption", "Handles thousands of concurrent reads/writes safely"],
                        ["Data types", "Everything is text — no type enforcement", "Columns have strict types; bad data rejected"],
                        ["Relationships", "No way to link CSV files reliably", "Foreign keys enforce relationships between tables"],
                        ["Transactions", "No concept — half-written file is corrupted data", "ACID transactions: all-or-nothing changes"],
                        ["Scale", "Degrades badly past ~1M rows", "Can handle billions of rows with proper indexing"],
                    ]
                },

                { type: "h2", text: "OLTP — The Engine of Every App" },
                { type: "p", text: "Every time you open Instagram and scroll your feed, there are OLTP database queries happening: fetch the 10 most recent posts for the people you follow. When you like a post: UPDATE posts SET likes = likes + 1. When you send a DM: INSERT INTO messages. These are tiny, fast, targeted read/write operations — exactly what OLTP is designed for. Millions of users doing millions of these small operations simultaneously." },
                { type: "p", text: "OLTP databases are normalized (split into many tables) specifically to avoid update anomalies. If your product name is stored in 50,000 order rows, correcting a typo requires 50,000 UPDATEs. If it's stored once in a products table (and referenced by ID from orders), fixing the typo is one UPDATE. Normalization minimizes the surface area for data corruption." },
                { type: "p", text: "OLTP (Online Transaction Processing) is the type of database powering every application you use. When you create an account, place an order, or send a message — that's an OLTP database being written to. OLTP systems are optimized for many small, concurrent operations happening very fast." },
                { type: "p", text: "Imagine a busy bank — hundreds of tellers simultaneously processing transactions (deposits, withdrawals, transfers). Each individual transaction is small and fast. This is OLTP. The database must process each tiny operation in milliseconds and handle thousands of them per second." },
                {
                    type: "code", lang: "text", code: `OLTP Characteristics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:        Day-to-day application operations
Operations:     Many small INSERT, UPDATE, DELETE, SELECT by PK
Concurrent:     Thousands of users simultaneously
Query type:     Simple, targeted (WHERE id = 12345)
Schema:         Highly normalized (3NF) — no data duplication
Row size:       Small — one row per transaction
Examples:       MySQL, PostgreSQL (as app DB), Oracle

OLTP table example (normalized):
customers(id, name, email) → stores each customer once
orders(id, customer_id, date, status) → links to customer by ID
order_items(id, order_id, product_id, qty, price) → each line item` },

                { type: "h2", text: "OLAP — The Engine of Business Intelligence" },
                { type: "p", text: "Now imagine the Instagram data team asking: 'Which content formats (Reels, Stories, Posts) drove the most engagement across users aged 18-25 in MENA region last quarter?' This is NOT a query you run on the same database Instagram's app writes to. It would scan billions of rows, consume enormous compute, and slow down or crash the app for every user." },
                { type: "p", text: "This is why OLAP systems exist — a completely separate system built exclusively for answering these heavy analytical questions. The application database and the analytics database are different systems with different data, different schemas, and different optimization goals. Moving data between them is the data engineer's core job." },
                { type: "p", text: "OLAP (Online Analytical Processing) is the type of system designed for analyzing and reporting on large amounts of data. Instead of many small fast operations, OLAP handles few but extremely heavy queries that scan millions or billions of rows to compute aggregations." },
                { type: "p", text: "Continuing the bank analogy: at the end of the month, the bank's management team wants a report: 'total deposits by branch by region for Q3'. This requires scanning millions of transactions. If you ran this on the OLTP database, it would slow down all the tellers. So we move data to a separate OLAP system designed for these heavy reads." },
                {
                    type: "code", lang: "text", code: `OLAP Characteristics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:        Analytics, reporting, dashboards
Operations:     Heavy aggregations over many rows
Concurrent:     Few analysts (not thousands)
Query type:     Complex, scanning millions of rows
Schema:         Denormalized (star/snowflake) — optimized for reads
Row size:       Wide fact tables with many metrics
Examples:       BigQuery, Snowflake, Amazon Redshift, Azure Synapse

OLAP table example (denormalized star schema):
sales_fact(date, customer_name, product_name, country, revenue, qty)
-- All info in one wide table — no expensive joins needed
-- Optimized for: "total revenue by country per quarter"` },
                {
                    type: "comparison",
                    left: {
                        label: "OLTP (Write-Heavy)", items: [
                            "Optimized for INSERT/UPDATE/DELETE speed",
                            "Normalized — data split across many tables",
                            "Row-based storage (fast row writes)",
                            "Strong consistency, ACID required",
                            "Small result sets (one record at a time)",
                            "Examples: banking apps, e-commerce order systems",
                        ]
                    },
                    right: {
                        label: "OLAP (Read-Heavy)", items: [
                            "Optimized for SELECT aggregation performance",
                            "Denormalized — wide tables, fewer joins needed",
                            "Columnar storage (read only needed columns)",
                            "Eventual consistency often acceptable",
                            "Large result sets (scan millions of rows)",
                            "Examples: BigQuery, Snowflake, Redshift",
                        ]
                    }
                },
                { type: "callout", variant: "important", text: "The data engineer's primary job is the bridge between OLTP and OLAP: extract data from operational systems → clean and transform it → load it into the analytical system. This movement is called the data pipeline." },

                { type: "h2", text: "Columnar Storage — Why OLAP Is Fast" },
                { type: "p", text: "The key insight behind columnar storage is that analytical queries almost never need ALL columns — they select a few specific ones. 'Total revenue by country' only needs revenue and country. 'Average age of active users' only needs age and status. Reading the other 50 columns is pure waste." },
                { type: "p", text: "There's a second benefit that's often underappreciated: compression. In columnar storage, all values for one column are stored together — all countries next to each other, all amounts next to each other. Similar values compress dramatically better than interleaved row data. 'Egypt, Egypt, Egypt, Egypt, USA, Egypt, Egypt...' compresses to 'Egypt × 6, USA × 1...' — a fraction of the original size. Real-world Parquet files often achieve 5-10x compression vs raw CSV. Less storage cost AND faster I/O." },
                { type: "p", text: "Traditional databases store data row-by-row. When you query just one column (e.g., SELECT SUM(revenue)), the database still reads ALL columns for every row because they're stored together. Columnar storage (used by Parquet, ORC, BigQuery, Snowflake) stores each column separately on disk." },
                {
                    type: "code", lang: "text", code: `Row-based storage (OLTP):
Row 1: [1, Ali, Egypt, 8500, 2023-01-15]
Row 2: [2, Mona, USA, 9100, 2023-02-20]
Row 3: [3, John, Egypt, 7800, 2023-03-10]

Query: SELECT SUM(salary) FROM employees
Must read: 1 + Ali + Egypt + 8500 + date | 2 + Mona + ...  (all columns!)

──────────────────────────────────────────────────────────

Columnar storage (OLAP):
Column 'id':         [1, 2, 3]
Column 'name':       [Ali, Mona, John]
Column 'country':    [Egypt, USA, Egypt]
Column 'salary':     [8500, 9100, 7800]  ← only reads THIS
Column 'hire_date':  [2023-01-15, ...]

Query: SELECT SUM(salary) FROM employees
Reads: ONLY salary column → [8500, 9100, 7800]  → sum = 25400` },
                {
                    type: "list", items: [
                        "Column-only reads: queries that select 3 columns out of 100 read 3% of the data",
                        "Better compression: same values cluster together (all Egyptians, all January dates) → algorithms compress them extremely well",
                        "Vectorized execution: CPU can process entire column chunks using SIMD instructions",
                        "Result: analytical queries can be 10-100x faster than row-based storage",
                    ]
                },

                { type: "h2", text: "Data Warehouse — The Single Source of Truth" },
                { type: "p", text: "A data warehouse is a special kind of database designed for analytics. It stores clean, structured, historical data from all the company's operational systems in one place. Analysts, BI tools, and dashboards all read from the warehouse — they never touch the operational databases directly." },
                {
                    type: "list", items: [
                        "Clean and validated: raw messy data is cleaned before entering the warehouse",
                        "Historical: warehouses keep years of history — not just current state",
                        "Integrated: data from multiple source systems is unified into a consistent schema",
                        "Subject-oriented: organized around business subjects (sales, customers, products)",
                        "Non-volatile: once data enters, it stays — it's not modified like in OLTP",
                    ]
                },
                {
                    type: "table", headers: ["Warehouse", "Key Strength", "Best For"], rows: [
                        ["Google BigQuery", "Serverless, auto-scales, pay-per-query, SQL-native", "Variable workloads, ad-hoc analysis"],
                        ["Snowflake", "Separates compute from storage, multi-cloud, zero admin", "Enterprise, data sharing between companies"],
                        ["Amazon Redshift", "Deep AWS integration, great for large steady workloads", "AWS-first companies"],
                        ["Azure Synapse", "Integrates with Azure ecosystem, supports Spark and SQL", "Microsoft/Azure shops"],
                        ["Databricks Lakehouse", "Combines lake + warehouse, Delta Lake format", "ML + analytics in one platform"],
                    ]
                },

                { type: "h2", text: "Data Lake — The Raw Vault" },
                { type: "p", text: "Before data lakes, companies had a painful choice: run expensive ETL processes to load data into a structured warehouse (which took time and money, and required knowing upfront what schema you'd need), or simply delete data that didn't fit the warehouse schema. Both options caused data loss. Valuable raw logs, clickstream events, and unstructured text were routinely discarded because storing them in a traditional warehouse was too expensive." },
                { type: "p", text: "Cloud object storage (S3, GCS, ADLS) changed the economics completely. At $0.023/GB/month on S3, storing 10TB of raw logs costs $230/month — previously unthinkably cheap. This made it economically rational to store EVERYTHING and figure out the schema later. The data lake was born from this economic shift." },
                { type: "callout", variant: "warning", text: "The 'data swamp' anti-pattern: data lakes without governance become unusable. Files with no documentation, no naming conventions, no data catalog, expired/deleted pipelines leaving orphan files, no data quality checks. Anyone looking for data can't find it or trust it. Avoid this by treating the data lake as a product: document tables, enforce naming conventions, run quality checks, and maintain a catalog." },
                { type: "p", text: "A data lake is cheap, scalable storage (usually object storage like Amazon S3) where you dump EVERYTHING — raw, unprocessed, in any format. No cleaning required before storing. The philosophy is 'store now, figure out the schema later' (schema-on-read)." },
                { type: "p", text: "The data lake appeared because companies realized they were throwing away valuable raw data to avoid the cost of warehousing it. With cloud storage costing pennies per GB, it became practical to keep everything: logs, images, CSVs, JSON, audio files — all of it." },
                {
                    type: "code", lang: "text", code: `Data Lake → S3 folder structure example:
s3://company-datalake/
├── raw/
│   ├── orders/2025/01/15/orders_20250115.json       ← raw JSON from API
│   ├── clickstream/2025/01/15/click_events.avro     ← Kafka dump
│   └── user_uploads/profile_photo_101.jpg           ← image file
├── processed/
│   ├── orders_cleaned/date=2025-01-15/part-0001.parquet
│   └── user_features/user_id=1001/features.parquet
└── analytics/
    └── daily_revenue_by_country/date=2025-01-15/report.parquet` },
                {
                    type: "comparison",
                    left: {
                        label: "Data Lake", items: [
                            "Raw data in any format (JSON, CSV, images, audio)",
                            "Schema-on-read — structure defined at query time",
                            "Very cheap storage (S3, ADLS, GCS)",
                            "Flexible — store anything without upfront design",
                            "Primary users: data scientists, ML engineers",
                            "Risk: becomes a 'data swamp' without governance",
                        ]
                    },
                    right: {
                        label: "Data Warehouse", items: [
                            "Clean, structured data in tables",
                            "Schema-on-write — structure enforced at load time",
                            "More expensive (compute for queries)",
                            "Rigid — schema must be defined before loading",
                            "Primary users: analysts, BI tools, dashboards",
                            "Benefit: reliable, consistent, fast for SQL queries",
                        ]
                    }
                },

                { type: "h2", text: "Data Lakehouse — Best of Both Worlds" },
                { type: "p", text: "The data lakehouse is a modern architecture that combines the cheap storage of a data lake with the query performance and reliability of a data warehouse. Built on open table formats like Delta Lake, Apache Iceberg, and Apache Hudi." },
                {
                    type: "list", items: [
                        "ACID transactions ON object storage (S3) — files can be updated atomically",
                        "Schema enforcement — rejects bad data at write time like a warehouse",
                        "Time travel — query data as it was at any point in the past",
                        "Streaming + batch in the same table — append streaming events, query with SQL",
                        "Open format — not locked into one vendor's proprietary format",
                    ]
                },
                {
                    type: "code", lang: "python", code: `# Delta Lake example (Python with PySpark)
# ACID transaction: update + insert in one atomic operation
from delta.tables import DeltaTable

deltaTable = DeltaTable.forPath(spark, "s3://bucket/delta/customers/")

(deltaTable.alias("target")
    .merge(
        source_df.alias("source"),
        "target.customer_id = source.customer_id"  # match condition
    )
    .whenMatchedUpdate(set={"name": "source.name", "email": "source.email"})
    .whenNotMatchedInsertAll()
    .execute()
)

# Time Travel: query as of a specific point in time
historical_df = spark.read.format("delta")\
    .option("timestampAsOf", "2025-01-01")\
    .load("s3://bucket/delta/customers/")` },

                { type: "h2", text: "ETL vs ELT — How Data Moves" },
                { type: "p", text: "The debate between ETL and ELT comes down to a single question: where do you do the computation? ETL transforms data before it reaches the destination, using a separate compute engine (a Python script, a Spark cluster). ELT loads raw data to the destination first, then uses the destination's compute power to transform it." },
                { type: "p", text: "In 2010, ETL was the only viable approach — data warehouses (Teradata, Oracle) charged per core and per query. Running heavy transformations inside the warehouse was prohibitively expensive. So companies built Hadoop/Spark clusters to transform data outside the warehouse, then load only the clean results. The transformation layer was the bottleneck: complex Python code that was hard to test, hard to version-control, and hard for analysts to understand." },
                { type: "p", text: "By 2020, BigQuery and Snowflake arrived with elastic, cheap compute. The cost of running complex SQL transformations inside the warehouse dropped dramatically. ELT emerged as the modern pattern: load raw data in (fast, cheap), transform inside the warehouse using SQL that analysts can read and understand. dbt (data build tool) formalized this: write SQL models, dbt runs them in the correct order, tests them, and documents them." },
                { type: "p", text: "ETL and ELT describe the pattern of moving data from a source system to a destination. The letters stand for Extract (get data from source), Transform (clean/reshape), Load (write to destination). The order of T and L changes depending on when and where you transform." },

                { type: "h3", text: "ETL — Traditional Pattern" },
                { type: "p", text: "Extract raw data → Transform it outside the database → Load the clean result. Used when the destination isn't powerful enough to handle complex transformations, or when transformation requires tools not available in the database." },
                {
                    type: "code", lang: "text", code: `ETL Flow:
Source DB → [Extract with Python/Spark] → [Transform in memory/Spark cluster] → Load clean data → Warehouse

Example:
1. Extract: Python script pulls raw orders from MySQL into Pandas DataFrame
2. Transform: clean nulls, standardize country names, compute revenue
3. Load: write cleaned DataFrame to Snowflake

Pros:
✓ Works with limited warehouse compute
✓ Can use any tool for transformation (Python, Spark)
✓ Keeps warehouse clean — only clean data enters

Cons:
✗ Transformation bottleneck outside warehouse
✗ Harder to debug — errors happen in the middle
✗ Raw data not preserved for re-processing` },

                { type: "h3", text: "ELT — Modern Cloud Pattern" },
                { type: "p", text: "Extract raw data → Load it immediately to the warehouse → Transform inside the warehouse using SQL. Modern cloud warehouses (BigQuery, Snowflake) are extremely powerful and can handle heavy transformations via SQL. The raw data is preserved and transformation is done close to where data lives." },
                {
                    type: "code", lang: "text", code: `ELT Flow:
Source → [Extract] → Load raw to staging → [SQL transform inside warehouse] → Clean tables

Example (using dbt for the T step):
1. Extract: Fivetran/Airbyte automatically pulls raw data from source systems
2. Load: writes raw data to 'raw' schema in Snowflake unchanged
3. Transform: dbt runs SQL models inside Snowflake:
   - stg_orders.sql → clean and standardize raw orders
   - fct_orders.sql → build fact table from staging
   - dim_customers.sql → build customer dimension

Pros:
✓ Raw data always preserved (re-processable)
✓ Warehouse compute does the heavy lifting (scales elastically)
✓ Transformation is version-controlled SQL (not black-box Python)
✓ Easier debugging — every layer visible in SQL
✓ Tools like dbt make this workflow excellent

Cons:
✗ More storage cost (keep raw + transformed)
✗ Requires powerful warehouse (BigQuery/Snowflake compatible)` },
                { type: "callout", variant: "tip", text: "Modern DE teams use ELT with dbt (data build tool). Engineers write SQL transformation models, dbt handles dependency management, testing, and documentation. The result is a fully tested, version-controlled transformation layer." },

                { type: "h2", text: "ACID Properties — Why Your Data Doesn't Corrupt" },
                { type: "p", text: "Without ACID, running a database at any meaningful scale is like playing Jenga with real money. Concurrent users can see each other's half-completed writes. A payment can deduct money from one account without adding it to another. A 'successful' insert might not survive the next server restart." },
                { type: "p", text: "These aren't theoretical concerns — they happened constantly in early databases. The history of computing is littered with examples of lost data, double-charges, and inventory oversells from software that didn't implement these properties correctly. ACID emerged as the formal specification of what 'correct' database behavior looks like under concurrency and failure." },
                { type: "p", text: "ACID is a set of properties that guarantee that database transactions are processed reliably. Without ACID, concurrent operations could corrupt your data in subtle, hard-to-detect ways. Understanding this helps explain why OLTP databases are designed differently from data lakes." },

                { type: "h3", text: "Atomicity — All or Nothing" },
                { type: "p", text: "A transaction is a group of operations that must ALL succeed or ALL fail. There is no partial success. If your bank transfer deducts money from account A but then crashes before adding it to account B, the deduction is rolled back. Money doesn't disappear." },
                {
                    type: "code", lang: "sql", code: `-- Bank transfer: ATOMIC transaction
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE account_id = 'A';
UPDATE accounts SET balance = balance + 500 WHERE account_id = 'B';

-- If either UPDATE fails (network error, constraint violation, etc.)
-- BOTH changes are rolled back. Account A keeps its money.

COMMIT;  -- Only if BOTH succeed does the change become permanent` },

                { type: "h3", text: "Consistency — Valid States Only" },
                { type: "p", text: "A transaction can only bring the database from one valid state to another valid state. If a transaction would violate a constraint (like a NOT NULL or a foreign key), it's rejected. The database never ends up in an impossible state." },
                {
                    type: "code", lang: "sql", code: `-- Consistency constraint example
ALTER TABLE accounts ADD CONSTRAINT balance_positive CHECK (balance >= 0);

-- This transaction will FAIL if account A only has $300
BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE account_id = 'A';
-- CHECK constraint violated! balance would be -200.
-- Transaction ROLLED BACK. Database stays valid.
COMMIT;` },

                { type: "h3", text: "Isolation — Concurrent Transactions Don't Interfere" },
                { type: "p", text: "Multiple transactions running simultaneously appear to each other as if they run sequentially. They don't see each other's intermediate states. This prevents 'dirty reads' (reading uncommitted data) and 'phantom reads' (seeing rows that appeared mid-transaction)." },
                {
                    type: "code", lang: "text", code: `Without isolation (problem):
Time 1: Transaction A reads inventory = 1 for product X
Time 2: Transaction B reads inventory = 1 for product X
Time 3: Transaction A decrements → inventory = 0, completes
Time 4: Transaction B decrements → inventory = -1  🚨 OVERSOLD

With isolation:
Transaction B is blocked while A is active, or sees a snapshot of data
before A started. Result is always: inventory ≥ 0` },

                { type: "h3", text: "Durability — Committed = Permanent" },
                { type: "p", text: "Once a transaction is committed, it stays committed — even if the server crashes, power goes out, or the disk fails. Data is written to durable storage and logged so it can be recovered after any failure." },

                { type: "h2", text: "Normalization — Organizing Data Without Redundancy" },
                { type: "p", text: "Normalization was formalized by Edgar Codd (the inventor of relational databases) in the 1970s as a series of 'Normal Forms' — rules that progressively eliminate different categories of redundancy. First Normal Form (1NF) eliminates repeating groups. Second Normal Form (2NF) eliminates partial dependencies. Third Normal Form (3NF) eliminates transitive dependencies." },
                { type: "p", text: "For interviews, the key intuition is this: in a normalized schema, every fact is stored in exactly one place. No duplication. When something changes, you change it in one place and every related record automatically reflects it. This is perfect for operational systems where data changes constantly (OLTP). But for analytics (OLAP), multiple JOINs to reconstruct a single meaningful row hurt performance — which is why data warehouses intentionally de-normalize into wide, redundant tables." },
                { type: "p", text: "Normalization is the process of organizing tables to minimize data duplication and dependency. The idea is simple: each piece of information should exist in exactly one place. When it needs to be updated, you update it in one place — not hunting through thousands of duplicated records." },
                {
                    type: "code", lang: "text", code: `❌ UNNORMALIZED table:
order_id | customer_name | customer_email    | product     | category | price
1001     | Ali Ahmed     | ali@email.com     | iPhone 15   | Phones   | 999
1002     | Ali Ahmed     | ali@email.com     | MacBook Pro | Laptops  | 1999
1003     | Mona Smith    | mona@email.com    | iPhone 15   | Phones   | 999

Problems:
- 'ali@email.com' stored twice → update = must change 2 rows
- 'iPhone 15' with category/price stored twice → inconsistency risk
- No way to have a customer with no orders

✅ NORMALIZED tables (3 separate tables):
customers:  id=1, name=Ali Ahmed, email=ali@email.com
            id=2, name=Mona Smith, email=mona@email.com

products:   id=P1, name=iPhone 15, category=Phones, price=999
            id=P2, name=MacBook Pro, category=Laptops, price=1999

orders:     id=1001, customer_id=1, product_id=P1
            id=1002, customer_id=1, product_id=P2
            id=1003, customer_id=2, product_id=P1

Benefits:
- Email stored once → one place to update
- Product price stored once → no inconsistency
- Customer can exist with no orders` },

                { type: "h2", text: "Primary, Foreign, and Surrogate Keys" },
                { type: "p", text: "Keys are how relational databases maintain integrity and connect tables. Understanding keys is foundational for designing any schema." },
                {
                    type: "table", headers: ["Key Type", "Definition", "Properties", "Example"], rows: [
                        ["Primary Key (PK)", "Uniquely identifies each row in a table", "NOT NULL, UNIQUE, only one per table", "customer_id INT PRIMARY KEY"],
                        ["Natural Key", "A real-world identifier used as PK", "Has business meaning but can change", "email, national_id, product_sku"],
                        ["Surrogate Key", "System-generated integer PK (not from real world)", "Never changes, no business meaning, fast joins", "id SERIAL PRIMARY KEY (auto-increment)"],
                        ["Foreign Key (FK)", "Column that references the PK of another table", "Enforces referential integrity", "order.customer_id → customers.id"],
                        ["Composite Key", "Multiple columns together form the PK", "Neither column alone is unique", "PRIMARY KEY(order_id, product_id)"],
                        ["Unique Key", "Column with unique constraint but not the PK", "Can be NULL (unlike PK)", "UNIQUE(email)"],
                    ]
                },
                {
                    type: "code", lang: "sql", code: `-- Creating tables with proper key constraints
CREATE TABLE customers (
    id          SERIAL PRIMARY KEY,           -- surrogate PK
    email       VARCHAR(200) UNIQUE NOT NULL, -- natural key (unique)
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    id          SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    status      VARCHAR(20) DEFAULT 'pending',

    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE RESTRICT          -- prevent deleting a customer who has orders
    ON UPDATE CASCADE           -- if customer ID changes, update orders too
);

-- Why use surrogate keys in warehouses?
-- Source system might use 'natural' IDs like 'CUST-2025-US-001234'
-- These are strings → slow for joins
-- They can change when customer is migrated between systems
-- Warehouse creates its own integer surrogate: customer_key = 1, 2, 3...` },

                { type: "h2", text: "Data Types — What Goes in Each Column" },
                { type: "p", text: "Choosing the right data type is important for storage efficiency, query performance, and data quality. Wrong types waste space and cause errors." },
                {
                    type: "table", headers: ["Category", "Types", "When to Use", "Pitfalls"], rows: [
                        ["Integer", "TINYINT, INT, BIGINT", "IDs, counts, years, quantities", "Use BIGINT for IDs in large systems — INT maxes at 2.1 billion"],
                        ["Decimal", "DECIMAL(p,s), NUMERIC", "Money, prices, exact decimals", "Never use FLOAT/DOUBLE for money — floating point errors!"],
                        ["Floating Point", "FLOAT, DOUBLE", "Scientific measurements, ML features", "Not suitable where exact precision required"],
                        ["Text", "VARCHAR(n), TEXT", "Names, descriptions, free text", "Set size limit with VARCHAR for validation"],
                        ["Boolean", "BOOLEAN, TINYINT(1)", "Flags, yes/no fields", "NULL means 'unknown' — not false"],
                        ["Date/Time", "DATE, TIMESTAMP, TIMESTAMPTZ", "Events, logs, scheduling", "Always store in UTC, convert at display layer"],
                        ["JSON", "JSON, JSONB", "Semi-structured, flexible schema", "JSONB (binary JSON) is indexed — much faster than JSON"],
                        ["Array", "ARRAY", "Tags, multi-value attributes", "Hard to query — consider separate table instead"],
                    ]
                },

                { type: "h2", text: "Schema Design Patterns" },
                { type: "h3", text: "One-to-Many Relationship" },
                { type: "p", text: "One record in table A relates to many records in table B. The FK lives on the 'many' side. Most common relationship type." },
                {
                    type: "code", lang: "sql", code: `-- One customer → many orders (one-to-many)
-- FK lives on the orders table (many side)
customers: id, name
orders: id, customer_id [FK → customers.id], amount` },

                { type: "h3", text: "Many-to-Many Relationship" },
                { type: "p", text: "Many records in A relate to many records in B. Needs a junction table to represent the relationship. Example: students take many courses, courses have many students." },
                {
                    type: "code", lang: "sql", code: `-- Students ↔ Courses: many-to-many
-- Requires junction table
students:      id, name
courses:       id, title
enrollments:   student_id [FK → students.id], course_id [FK → courses.id], enrolled_date
               PRIMARY KEY(student_id, course_id)  -- composite PK` },

                { type: "h2", text: "Data Governance Basics" },
                { type: "p", text: "Data governance is a framework of policies and processes to ensure data is accurate, available, consistent, secure, and used responsibly across the organization. For data engineers, this means building systems that are auditable, documented, and secure by design." },
                {
                    type: "list", items: [
                        "Data lineage: knowing where a piece of data came from and how it was transformed — like a paper trail for your data",
                        "Data catalog: a searchable inventory of all datasets, their meanings, owners, and relationships (tools: Amundsen, DataHub, Alation)",
                        "Data quality: automated checks that ensure data meets expectations (completeness, uniqueness, validity, consistency)",
                        "Access control: who can see what data — RBAC (Role-Based Access Control) at column or row level",
                        "PII handling: Personally Identifiable Information must be masked, encrypted, or anonymized according to GDPR/CCPA",
                        "Retention policies: how long different types of data are kept before deletion (regulatory requirement)",
                    ]
                },

                { type: "h2", text: "Interview Q&A" },
                {
                    type: "table", headers: ["Question", "Strong Answer"], rows: [
                        ["Why not just query the production database for reports?", "Production DBs (OLTP) are optimized for fast writes and concurrent transactions. Heavy analytical queries scan millions of rows, slow all transactions, and degrade app performance. We separate concerns by moving data to an OLAP system."],
                        ["What's the difference between schema-on-read and schema-on-write?", "Schema-on-write (warehouses) enforces structure at storage time — bad data gets rejected. Schema-on-read (data lakes) stores raw data flexibly — schema is applied only when reading. The tradeoff is flexibility vs data quality guarantees."],
                        ["Why would you choose ELT over ETL?", "Modern cloud warehouses have elastic compute that handles heavy SQL transforms. ELT preserves raw data for reprocessing, uses version-controlled SQL transforms (dbt), and leverages the warehouse's parallel query engine — no separate compute cluster needed."],
                        ["What is data normalization and when do you NOT want it?", "Normalization splits data into related tables to eliminate redundancy. You denormalize in OLAP systems because fewer joins = faster analytical queries. Analytics is read-heavy and rarely updates dimension info, so duplication is a worthwhile trade for query speed."],
                        ["Explain ACID with a real example", "ACID guarantees transactions are Atomic (bank transfer: deduct + credit both happen or neither), Consistent (balance can't go negative), Isolated (two transfers don't see each other's half-state), Durable (committed transfer survives server crash)."],
                    ]
                },
            ]}
        />
    );
}
