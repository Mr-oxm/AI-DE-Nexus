import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Data Modeling",
subtitle: "Designing analytics-ready schemas — the make-or-break round in every DE interview.",
accent: "#8b5cf6",
blocks: [
                { type: "h2", text: "What Is Data Modeling and Why Does It Matter?" },
                { type: "p", text: "Data modeling is the process of deciding how to structure your data — what tables to create, what columns they should have, how tables relate to each other, and what PRIMARY KEY each table uses. Good modeling makes analytics fast, code simple, and business questions easy to answer. Bad modeling makes queries slow, code complicated, and analysis nearly impossible." },
                { type: "p", text: "Think of data modeling like architectural blueprints. Before building a house, architects draw detailed plans — room layout, load-bearing walls, plumbing routes. Without blueprints, construction is chaotic. Data modeling creates the blueprint for your analytics system." },
                { type: "callout", variant: "important", text: "Always start a modeling interview by clarifying: 'What business questions must this model answer?' Designing without knowing the questions is like building a house without knowing how many bedrooms are needed." },

                { type: "h2", text: "Why Bad Modeling Is Painful" },
                { type: "p", text: "Imagine an analyst wants to answer: 'What is the total revenue per product category last quarter?' In a well-modeled warehouse, this is a 5-line SQL query that returns in 2 seconds. In a poorly modeled warehouse, it requires 6 joins across confusingly named tables, takes 3 minutes to run, and still might return the wrong answer because product categories are stored inconsistently across different source dumps." },
                { type: "p", text: "Bad modeling isn't just an aesthetic problem — it compounds over time. Every new analyst who joins has to reverse-engineer the schema. Every new dashboard takes weeks instead of days. Every schema migration breaks existing queries in unpredictable ways. The cost of a bad data model grows exponentially with the number of people using it and the amount of data in it." },

                { type: "h2", text: "The 3 Levels of Data Modeling" },
                { type: "p", text: "Data models evolve from vague conceptual ideas to concrete physical implementations. Each level adds more detail and technical specificity." },
                {
                    type: "table", headers: ["Level", "Audience", "What It Defines", "Tools"], rows: [
                        ["Conceptual", "Business stakeholders, not technical", "What entities exist in the business domain (no columns yet)", "Whiteboard, diagrams, Lucid Chart"],
                        ["Logical", "Data architects + developers", "Attributes (columns) and relationships between entities, no database-specific types", "ERD tools, structured notation"],
                        ["Physical", "Database engineers", "Exact SQL CREATE TABLE with types, constraints, indexes, partitioning, naming conventions", "Database DDL scripts, dbt"],
                    ]
                },
                {
                    type: "code", lang: "text", code: `CONCEPTUAL MODEL: (just boxes and relationships)
[Customer] ──places──> [Order] ──contains──> [Product]

LOGICAL MODEL: (add attributes and cardinality)
Customer: id, name, email, signup_date
Order: id, customer_id (N:1→Customer), order_date, status, total_amount
Product: id, name, category, price
OrderItem: id, order_id (N:1→Order), product_id (N:1→Product), quantity, unit_price

PHYSICAL MODEL: (actual SQL)
CREATE TABLE customers (
    customer_key    BIGSERIAL PRIMARY KEY,
    customer_id     VARCHAR(50) UNIQUE NOT NULL,  -- source system ID
    name            VARCHAR(200) NOT NULL,
    email           VARCHAR(200) UNIQUE,
    signup_date     DATE,
    created_at      TIMESTAMP DEFAULT NOW()
) TABLESPACE analytics_ts;

CREATE INDEX idx_customer_email ON customers(email);` },

                { type: "h2", text: "Fact Tables — The Core of Your Warehouse" },
                { type: "p", text: "The word 'fact' literally means something that happened — a measurable event in the real world. A sale happened. A user clicked. A trip completed. A payment was made. Fact tables are the record of history: every row is a point-in-time event that the business cares about measuring." },
                { type: "p", text: "An analogy: if your company is a movie, the fact table is the play-by-play transcript of every scene — every event, every action. The dimension tables are the character descriptions — who the actors are, what props exist, where scenes take place. Without the transcript (facts), you have no story. Without the character descriptions (dimensions), the transcript has no context." },
                { type: "p", text: "A fact table records events or measurements. Every row is one thing that happened: one sale, one click, one trip, one payment. Fact tables are huge — they grow constantly as new events occur. They hold the numbers (metrics) that business cares about." },
                {
                    type: "list", items: [
                        "Rows represent events (a sale happened, a payment was made, a user logged in)",
                        "Columns are either foreign keys (linking to dimensions) or measurable facts (amounts, quantities, durations)",
                        "Can have billions of rows — partitioned by date for performance",
                        "Rarely updated — events are appended, historical records preserved",
                        "Named with _fact suffix: sales_fact, trip_fact, payment_fact",
                    ]
                },
                {
                    type: "code", lang: "sql", code: `-- Example: E-Commerce Order Item Fact Table
CREATE TABLE order_items_fact (
    -- Surrogate key
    order_item_key      BIGINT PRIMARY KEY,  -- system-generated

    -- Natural keys (for tracing back to source)
    order_id            VARCHAR(50),
    order_item_id       VARCHAR(50),

    -- Foreign Keys to Dimensions (linking to "context")
    date_key            INT NOT NULL,         -- FK → date_dim
    customer_key        INT NOT NULL,         -- FK → customer_dim
    product_key         INT NOT NULL,         -- FK → product_dim
    store_key           INT,                  -- FK → store_dim (nullable for online)
    promotion_key       INT,                  -- FK → promotion_dim (nullable)

    -- MEASURES (the actual numbers)
    quantity            INT NOT NULL,
    unit_price          DECIMAL(12,4) NOT NULL,
    discount_amount     DECIMAL(12,4) DEFAULT 0,
    gross_revenue       DECIMAL(12,4) NOT NULL,   -- quantity * unit_price
    net_revenue         DECIMAL(12,4) NOT NULL,   -- gross - discount
    cost                DECIMAL(12,4),
    profit              DECIMAL(12,4)             -- net_revenue - cost
)
PARTITION BY RANGE (date_key)  -- partitioned for fast date-range queries
;` },

                { type: "h2", text: "Dimension Tables — The Context of Every Event" },
                { type: "p", text: "'Revenue was $4.2 million yesterday' — that's a fact. But is that good or bad? Is that from new customers or returning ones? From which country? Which product category? Dimension tables answer these contextual questions. They are the adjectives and nouns that give facts meaning." },
                { type: "p", text: "Dimension tables are relatively small and stable — a company might have 10 million orders (fact rows) but only 200,000 customers (dimension rows). Customer attributes like name, city, and tier change occasionally but not constantly. The dimension is like a reference book; the fact table is like the transaction log." },
                { type: "p", text: "Dimension tables describe the 'who, what, where, when' context around events. They tell you about the customer, the product, the location, the date. Dimension tables are small-to-medium sized, rarely change, and are joined to fact tables to give events meaning." },
                {
                    type: "code", lang: "sql", code: `-- Customer Dimension (SCD Type 2 — tracks history)
CREATE TABLE customer_dim (
    customer_key    INT PRIMARY KEY,           -- surrogate key (never changes)
    customer_id     VARCHAR(50) NOT NULL,      -- natural key from source system
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    email           VARCHAR(200),
    phone           VARCHAR(20),
    city            VARCHAR(100),
    country         VARCHAR(100),
    signup_channel  VARCHAR(50),              -- how they joined: 'web', 'mobile', 'referral'
    customer_tier   VARCHAR(20),              -- 'Bronze', 'Silver', 'Gold'
    -- SCD Type 2 fields
    effective_date  DATE NOT NULL,            -- when this version became active
    expiry_date     DATE,                     -- NULL = current record
    is_current      BOOLEAN DEFAULT TRUE
);

-- Product Dimension
CREATE TABLE product_dim (
    product_key     INT PRIMARY KEY,
    product_id      VARCHAR(50) NOT NULL,
    product_name    VARCHAR(500),
    sku             VARCHAR(100),
    category        VARCHAR(100),
    subcategory     VARCHAR(100),
    brand           VARCHAR(100),
    supplier        VARCHAR(200),
    unit_cost       DECIMAL(10,4),
    is_active       BOOLEAN DEFAULT TRUE
);

-- Date Dimension (pre-populated with every date for 10+ years)
CREATE TABLE date_dim (
    date_key        INT PRIMARY KEY,          -- e.g., 20250101
    date            DATE NOT NULL,
    year            INT,
    quarter         INT,
    month           INT,
    month_name      VARCHAR(20),
    week_of_year    INT,
    day_of_month    INT,
    day_of_week     INT,                      -- 1=Sunday, 7=Saturday
    day_name        VARCHAR(20),
    is_weekend      BOOLEAN,
    is_holiday      BOOLEAN,
    fiscal_year     INT,
    fiscal_quarter  INT
);` },

                { type: "h2", text: "Star Schema — The Industry Standard" },
                { type: "p", text: "The star schema is the most widely used data warehouse design. One large fact table sits in the center, surrounded by multiple small dimension tables. When you draw this, it looks like a star — hence the name." },
                {
                    type: "code", lang: "text", code: `Star Schema Visual:

         ┌──────────────┐
         │  date_dim    │
         │  (calendar)  │
         └──────┬───────┘
                │
┌───────────┐   │   ┌──────────────┐
│customer_  │   │   │  product_dim │
│   dim     ├───┤   │  (products)  │
│           │   │   └──────┬───────┘
└─────┬─────┘   │          │
      │         ▼          │
      └───► fact_order_items ◄──┘
              (the center)
                 ▲
                 │
         ┌───────┴──────┐
         │  store_dim   │
         │  (locations) │
         └──────────────┘

Key Properties of Star Schema:
• Fact table contains ONLY: foreign keys + measures
• Each dimension connects DIRECTLY to fact (no chains)
• Minimal joins needed (fact + 1-2 dims = most queries done)
• Optimized for analytical read performance` },
                { type: "callout", variant: "tip", text: "Star schema reduces join depth to 1 level (always just fact → dimension). Fewer joins = fewer shuffle operations in Spark, faster aggregations in BigQuery/Snowflake. This is why it's the industry default." },

                { type: "h2", text: "Snowflake Schema — When Dimensions Get Normalized" },
                { type: "p", text: "In snowflake schema, dimension tables are themselves normalized into sub-dimensions. For example, a customer_dim might link to a city_dim, which links to a country_dim, which links to a region_dim. The resulting diagram looks like a snowflake." },
                {
                    type: "comparison",
                    left: {
                        label: "Star Schema (preferred)", items: [
                            "customer_dim has: city, country, region all in one row",
                            "1 join: fact → customer_dim gets all context",
                            "Denormalized: country 'Egypt' repeated per customer",
                            "Storage trade-off: minor duplication acceptable",
                            "Query performance: fastest",
                            "Maintenance: simpler schema",
                        ]
                    },
                    right: {
                        label: "Snowflake Schema (use sparingly)", items: [
                            "customer_dim → city_dim → country_dim → region_dim",
                            "4 joins needed to get full context",
                            "Normalized: country stored once in country_dim",
                            "Storage trade-off: minimal (negligible in cloud)",
                            "Query performance: slower (more joins)",
                            "Maintenance: complex schema",
                        ]
                    }
                },
                { type: "p", text: "When would you EVER use snowflake schema? Only when dimension tables are extremely large and their sub-dimensions change independently. For example: if you have 10M products and their categories can change independently, separating into product_dim → category_dim prevents updating 10M rows when a category name changes." },

                { type: "h2", text: "Slowly Changing Dimensions (SCD) — Handling Change Over Time" },
                { type: "p", text: "Here's the problem SCD solves: a customer places orders in Cairo in 2020, then moves to Dubai in 2023. In 2025, your analytics team asks: 'Show us 2020 revenue by city.' If you simply UPDATE the city to Dubai when the customer moves, all 2020 orders now appear under Dubai — which is wrong. Cairo gets no credit. Revenue looks like it appeared in Dubai before the branch even opened." },
                { type: "p", text: "This is not a hypothetical edge case. It happens constantly in real warehouses — customers change cities, employees change departments, products change categories. Every UPDATE to a dimension destroys historical accuracy. SCD is the principled answer to this problem: how do we handle dimension changes while preserving the correct historical context for every fact?" },
                { type: "p", text: "Real-world business data changes over time. A customer moves to a different city. A product changes its category. An employee gets a promotion. How should your warehouse handle these changes? This is the SCD problem — one of the most important modeling concepts for interviews." },

                { type: "h3", text: "SCD Type 0 — Ignore Changes" },
                { type: "p", text: "Never update the dimension. Use only when the attribute should never change (it's fixed at creation time). Rare — usually a design failure." },
                {
                    type: "code", lang: "sql", code: `-- SCD Type 0: birthdate (should never change — fixed at birth)
-- If source system sends a different birthdate: reject it, keep original
UPDATE customer_dim SET birthdate = new_date ...;  -- ❌ Should not be allowed` },

                { type: "h3", text: "SCD Type 1 — Overwrite the Old Value" },
                { type: "p", text: "Simply UPDATE the existing row with the new value. Old value is permanently lost. Use when history doesn't matter — fixing a typo in a name, correcting an obviously wrong entry." },
                {
                    type: "code", lang: "sql", code: `-- SCD Type 1: update and lose history
UPDATE customer_dim
SET name = 'Ali Ahmed'   -- correcting a typo from 'AliAhmed'
WHERE customer_id = 'C1001';
-- Old name 'AliAhmed' is permanently gone

-- Limitation: if you want to answer "What was Ali's name in 2020?"
-- → Answer: impossible. History is lost.

-- Use when: fixing data errors, updating fields that truly don't matter historically
-- (e.g., phone number update when historical phone doesn't matter)` },

                { type: "h3", text: "SCD Type 2 — Insert a New Row for Each Change" },
                { type: "p", text: "The most important SCD type. Instead of overwriting, you close the current record (set expiry_date) and create a NEW row with the new value. This preserves a complete history of every attribute change. Queries can now answer 'what city was this customer in at any point in time?'" },
                {
                    type: "code", lang: "sql", code: `-- SCD Type 2: full history preserved via multiple rows

-- Customer starts in Cairo:
customer_key | customer_id | city  | start_date | end_date   | is_current
1            | C1001       | Cairo | 2020-01-01 | 2023-06-01 | FALSE

-- Customer moves to Giza — OLD record closed, NEW record inserted:
customer_key | customer_id | city  | start_date | end_date   | is_current
1            | C1001       | Cairo | 2020-01-01 | 2023-06-01 | FALSE  ← closed
2            | C1001       | Giza  | 2023-06-01 | NULL       | TRUE   ← current

-- Query: What was this customer's city on 2021-01-01?
SELECT city FROM customer_dim
WHERE customer_id = 'C1001'
  AND start_date <= '2021-01-01'
  AND (end_date > '2021-01-01' OR end_date IS NULL);
-- Result: Cairo ✓

-- Why is the surrogate key essential for SCD Type 2?
-- Natural key (customer_id = 'C1001') appears in BOTH rows
-- Fact table rows from 2020 join to customer_key=1 (Cairo)
-- Fact table rows from 2023 join to customer_key=2 (Giza)
-- This is only possible because the surrogate key is different for each version!` },

                { type: "h3", text: "SCD Type 3 — Add a Column for Previous Value" },
                { type: "p", text: "Add extra columns to store the previous value. Only tracks one change — still limited compared to Type 2. Use when you only care about current and one previous state (rare)." },
                {
                    type: "code", lang: "sql", code: `-- SCD Type 3: current + previous in same row
customer_dim:
customer_id | current_city | previous_city | city_changed_date
C1001       | Giza         | Cairo         | 2023-06-01

-- Limitation: if customer moves again (Giza → Alexandria):
customer_id | current_city | previous_city | ...
C1001       | Alexandria   | Giza          | 2025-01-01
-- Cairo completely forgotten! Only 2 states tracked.

-- Use case: "show current and previous region for sales comparison"
-- One historical level is enough, no need for full history` },

                { type: "h2", text: "The Grain — The Most Critical Design Decision" },
                { type: "p", text: "The grain is the single most important decision in data warehouse design — yet it's the one most often skipped or gotten wrong. It's so important that it must be the very first decision, before any columns are defined." },
                { type: "p", text: "Here's why the grain matters so much: if you define the grain too broadly (one row per order instead of one row per order line item), you permanently lose data. You can aggregate line items up to orders anytime. But you can never disaggregate orders back into line items if you didn't store them that way. A wrong grain choice is irreversible without a full pipeline rewrite." },
                { type: "p", text: "The formal rule: state the grain as 'one row represents ONE [thing].' Not 'sales data' — that's too vague. 'One row represents one order line item on a transaction' — that's a grain. Ask this question explicitly in every DE interview that involves modeling: 'Before we design columns, what does one row represent?'" },
                { type: "p", text: "The grain is the formal definition of what ONE ROW in your fact table represents. This must be decided FIRST — before any columns, before any dimensions. It determines everything else about the model. The golden rule: choose the most granular grain that satisfies business needs." },
                {
                    type: "code", lang: "text", code: `Wrong question: "What columns should my table have?"
Right question: "What does one row in my fact table represent?"

E-Commerce Example — 2 possible grains:

GRAIN 1: One row per order
order_id | customer_id | date_key | total_amount
1001     | C1          | 20250115 | 450.00
Can answer: how many orders per day? Customer's total spending?
Cannot answer: which products were most popular? Revenue by product category?

GRAIN 2: One row per order LINE ITEM (correct — more granular)
order_item_id | order_id | product_id | customer_id | date_key | qty | revenue
I1            | 1001     | P1         | C1          | 20250115 | 1  | 100
I2            | 1001     | P2         | C1          | 20250115 | 2  | 200
I3            | 1001     | P3         | C1          | 20250115 | 1  | 150
Can answer: EVERYTHING Grain 1 can + product breakdown, category analysis, basket size

Lesson: More granular grain = more flexible model = better analytics
You can always aggregate up from line items to orders
You can NEVER disaggregate from orders to line items (data is lost)` },

                { type: "h2", text: "Surrogate Keys — Why Your Warehouse Needs Its Own IDs" },
                { type: "p", text: "Imagine you're a data engineer at a company that acquires another company. Both companies independently assigned customer_id = 1001 to completely different customers. When you merge the data, you have a collision. Which customer_id 1001 is the real one? Without surrogate keys, this is a nightmare to resolve." },
                { type: "p", text: "Surrogate keys are also essential for SCD Type 2. The same business entity (customer Ali with customer_id = 'C1001') now has TWO rows in the customer dimension — one for when he lived in Cairo, one for when he moved to Dubai. Both rows have customer_id = 'C1001' (the business key). But the fact table needs to know WHICH version of Ali was the customer at order time. The different surrogate keys (customer_key = 1 for Cairo-version, customer_key = 2 for Dubai-version) solve this exactly." },
                { type: "p", text: "A surrogate key is a system-generated integer that the warehouse assigns to each record — it has no business meaning. In contrast, a natural key is the identifier from the source system (like a customer_id string from the CRM)." },
                {
                    type: "list", items: [
                        "Source IDs can change: companies merge systems, re-platform their databases, or simply change ID formats. Surrogate keys remain stable.",
                        "Source IDs can collide: two different source systems might both have a customer_id = 1001. Without surrogates, you can't distinguish them.",
                        "Source IDs are slow: string IDs like 'CUST-US-2025-001234' are 20+ character strings. Joining on integer surrogate keys (1, 2, 3...) is much faster.",
                        "SCD Type 2 requires surrogates: the same customer (customer_id='C1001') has multiple rows with different cities. Each row needs its own unique key — the surrogate key.",
                    ]
                },
                {
                    type: "code", lang: "sql", code: `-- Surrogate key generation strategies

-- Option 1: SERIAL / IDENTITY (auto-increment in PostgreSQL)
CREATE TABLE customer_dim (
    customer_key BIGSERIAL PRIMARY KEY,  -- auto-increments
    customer_id  VARCHAR(50),            -- source key
    ...
);

-- Option 2: Sequence (explicit control)
CREATE SEQUENCE customer_key_seq;
INSERT INTO customer_dim (customer_key, ...)
VALUES (nextval('customer_key_seq'), ...);

-- Option 3: Hash-based surrogate (deterministic, reproducible)
-- MD5 hash of the natural key → converted to integer
-- Useful for distributed systems where sequence coordination is hard
-- customer_key = MD5('C1001' + 'version_1')::UUID

-- Option 4: dbt surrogate_key macro
-- In dbt models, use {{ dbt_utils.surrogate_key(['customer_id', 'effective_date']) }}
-- Generates consistent hash used as surrogate key` },

                { type: "h2", text: "Full Design Walkthrough — Ride-Sharing Company" },
                { type: "p", text: "Business questions to answer: trips per city, revenue per driver, average trip duration by city, peak hours analysis, driver rating trends, promotion effectiveness." },
                {
                    type: "code", lang: "sql", code: `-- STEP 1: Define the grain
-- → One row per trip (each trip is the atomic event)

-- STEP 2: Identify measures
-- fare_amount, distance_km, duration_min, driver_rating, promotion_discount

-- STEP 3: Identify dimensions
-- WHEN → date_dim, time_dim  (date + hour of day for peak analysis)
-- WHO (rider) → rider_dim
-- WHO (driver) → driver_dim
-- WHERE → city_dim
-- WHAT discount → promotion_dim

-- STEP 4: Create fact table
CREATE TABLE trip_fact (
    trip_key          BIGINT PRIMARY KEY,      -- surrogate
    trip_id           VARCHAR(50),             -- source natural key
    date_key          INT REFERENCES date_dim,
    time_key          INT REFERENCES time_dim, -- for peak-hour analysis
    rider_key         INT REFERENCES rider_dim,
    driver_key        INT REFERENCES driver_dim,
    city_key          INT REFERENCES city_dim,
    promotion_key     INT REFERENCES promotion_dim,  -- NULL if no promo
    -- MEASURES
    fare_amount       DECIMAL(10,2),
    distance_km       DECIMAL(8,2),
    duration_min      INT,
    driver_rating     DECIMAL(3,2),            -- 1.0 to 5.0
    promo_discount    DECIMAL(10,2) DEFAULT 0
);

-- STEP 5: Key analytics queries this model enables

-- Revenue by driver per month
SELECT d.driver_name, dt.month, SUM(t.fare_amount) AS monthly_revenue
FROM trip_fact t
JOIN driver_dim d ON t.driver_key = d.driver_key
JOIN date_dim dt ON t.date_key = dt.date_key
GROUP BY d.driver_name, dt.month;

-- Peak hour analysis (what hours are busiest?)
SELECT tm.hour_of_day, COUNT(*) AS trip_count, AVG(fare_amount) AS avg_fare
FROM trip_fact t
JOIN time_dim tm ON t.time_key = tm.time_key
GROUP BY tm.hour_of_day
ORDER BY trip_count DESC;

-- Promotion ROI
SELECT p.promo_name, COUNT(*) trips, SUM(promo_discount) cost,
       SUM(fare_amount) revenue, SUM(fare_amount) - SUM(promo_discount) AS net
FROM trip_fact t
JOIN promotion_dim p ON t.promotion_key = p.promotion_key
WHERE t.promotion_key IS NOT NULL
GROUP BY p.promo_name;` },

                { type: "h2", text: "Conformed Dimensions — Reusing Dimensions Across Fact Tables" },
                { type: "p", text: "A conformed dimension is a dimension table that is shared across multiple fact tables in the same warehouse. The date_dim table is the classic example — every fact table (sales_fact, trip_fact, support_fact) joins to the SAME date_dim. This means you can JOI different fact tables on the shared date dimension and get consistent results." },
                {
                    type: "code", lang: "sql", code: `-- Conformed date_dim used across ALL fact tables in the warehouse
-- sales_fact.date_key → date_dim.date_key
-- trips_fact.date_key → date_dim.date_key
-- support_fact.date_key → date_dim.date_key

-- This enables cross-domain analysis:
SELECT
    dt.month,
    SUM(s.revenue) AS sales_revenue,
    COUNT(t.trip_key) AS total_trips,
    COUNT(sup.ticket_id) AS support_tickets
FROM date_dim dt
LEFT JOIN sales_fact s ON s.date_key = dt.date_key
LEFT JOIN trips_fact t ON t.date_key = dt.date_key
LEFT JOIN support_fact sup ON sup.date_key = dt.date_key
WHERE dt.year = 2025
GROUP BY dt.month
ORDER BY dt.month;
-- This is ONLY possible because they share a conformed date_dim` },

                { type: "h2", text: "Data Vault — An Alternative for Complex Systems" },
                { type: "p", text: "Data Vault is an alternative modeling methodology designed for enterprise data warehouses with many source systems, frequent schema changes, and audit/compliance requirements. It's more complex than star schema but highly flexible." },
                {
                    type: "table", headers: ["Data Vault Component", "What It Is", "Equivalent In Star Schema"], rows: [
                        ["Hub", "The business key of an entity (the core identity)", "Natural key of a dimension"],
                        ["Link", "Relationship between hubs (foreign key relationships)", "Association table or junction"],
                        ["Satellite", "Context and attributes of a hub (what changes over time)", "Slowly Changing Dimension columns"],
                    ]
                },
                { type: "callout", variant: "info", text: "For most companies and interviews, star schema is what you need. Data Vault is used at large enterprises (banks, insurance companies) with 50+ source systems and strict audit requirements. Mention it shows breadth of knowledge." },

                { type: "h2", text: "Interview Q&A" },
                {
                    type: "table", headers: ["Question", "Strong Answer"], rows: [
                        ["What is the grain of a fact table?", "The grain is the precise definition of what one row represents — stated as 'one row per X'. It must be defined first. The wrong grain makes downstream analysis impossible. Choose the most atomic grain that answers all required business questions."],
                        ["Why not put all attributes in the fact table?", "Fact tables should hold only measurable events and foreign keys. Putting attributes (city, name, category) in the fact table duplicates data on every event row, makes updates expensive, and prevents SCD history tracking. Dimensions centralize attributes — facts join to them."],
                        ["When would you use SCD Type 2?", "When historical accuracy matters. If a customer moves cities and we need to correctly report revenue by city for past orders, we need Type 2. Otherwise we'd falsely attribute old Cairo orders to Giza after the move. Use Type 1 only when history truly doesn't matter."],
                        ["Star vs snowflake?", "Star schema uses denormalized flat dimensions — one join from fact to dimension. Snowflake normalizes dimensions further. Star schema wins for query performance (fewer joins = less shuffle in Spark, faster aggregations in BigQuery). Use snowflake only for very large dimensions that change independently."],
                        ["What is a junk dimension?", "A junk dimension groups together low-cardinality flags and codes that don't belong to any specific dimension (e.g., is_promoted, payment_method, order_channel). Instead of adding 10 small FK columns to the fact table, combine them into one junk_dim row. Reduces fact table width."],
                    ]
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
