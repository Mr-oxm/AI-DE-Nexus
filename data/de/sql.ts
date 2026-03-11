import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "SQL for Data Engineering",
subtitle: "The most critical skill for data engineers — from basic queries to advanced window functions, CTEs, and production-level optimizations.",
accent: "#3b82f6",
blocks: [
                { type: "h2", text: "What Is SQL and Why Does It Matter?" },
                { type: "p", text: "SQL (Structured Query Language) is the universal language for talking to databases. It lets you ask questions like 'show me all customers who spent more than $500 last month' or 'give me daily sales per country'. Whether you're a junior or senior data engineer, you'll use SQL every single day." },
                { type: "p", text: "In data engineering specifically, SQL is used to: explore new datasets when they arrive, write transformation logic that converts raw data into clean analytics-ready tables, validate pipelines by comparing row counts and totals, and query results for reporting. Every major tool — dbt, Spark SQL, BigQuery, Snowflake — uses SQL as its core language." },
                { type: "callout", variant: "important", text: "For junior DE roles, SQL is often the elimination round. You don't need to solve 500 problems — you need deep understanding of 10 core patterns." },

                { type: "h2", text: "How Databases Actually Store Data" },
                { type: "p", text: "Before writing any SQL, understand what you're querying. A relational database stores data in tables — think of a table like an Excel spreadsheet with columns (attributes) and rows (records). Each column has a fixed data type: text, number, date, boolean." },
                {
                    type: "code", lang: "text", code: `Table: employees
┌─────┬──────────┬────────────┬──────────┬────────┐
│ id  │ name     │ department │ salary   │ active │
├─────┼──────────┼────────────┼──────────┼────────┤
│ 1   │ Ali      │ IT         │ 8500.00  │ true   │
│ 2   │ Mona     │ HR         │ 7200.00  │ true   │
│ 3   │ John     │ IT         │ 9100.00  │ false  │
│ 4   │ Sara     │ Finance    │ 8800.00  │ true   │
└─────┴──────────┴────────────┴──────────┴────────┘

Columns (attributes): id, name, department, salary, active
Rows (records): 4 employees
Data types: integer, text, text, decimal, boolean` },
                { type: "p", text: "A real production database can have millions or billions of rows across thousands of tables. SQL is how you navigate, filter, and summarize all of that efficiently." },

                { type: "h2", text: "SQL Execution Order — The Most Important Concept" },
                { type: "p", text: "This is where most beginners get confused. SQL does NOT execute in the order you write it. You write SELECT at the top, but it's actually executed near the end. Understanding the real execution order immediately explains 70% of error messages you'll encounter." },
                {
                    type: "table", headers: ["Step", "Clause", "What It Does", "Common Mistake"], rows: [
                        ["1", "FROM / JOIN", "Load the tables and build the initial dataset", "Forgetting that JOIN comes before WHERE"],
                        ["2", "WHERE", "Filter rows (individual row conditions)", "Trying to use aliases defined in SELECT"],
                        ["3", "GROUP BY", "Collapse rows into groups", "Forgetting that aggregation collapses rows"],
                        ["4", "HAVING", "Filter groups (aggregate conditions)", "Using WHERE instead of HAVING for aggregates"],
                        ["5", "SELECT", "Choose and compute columns", "Trying to reference a SELECT alias in WHERE"],
                        ["6", "DISTINCT", "Remove duplicate rows from result", "—"],
                        ["7", "ORDER BY", "Sort the final rows", "Can use SELECT aliases here unlike WHERE"],
                        ["8", "LIMIT / OFFSET", "Take a subset of sorted results", "—"],
                    ]
                },
                {
                    type: "code", lang: "sql", code: `-- ❌ WRONG: Can't use alias 'yearly' in WHERE (WHERE runs before SELECT)
SELECT salary * 12 AS yearly
FROM employees
WHERE yearly > 100000;   -- ERROR: 'yearly' doesn't exist yet!

-- ✅ CORRECT option 1: repeat the expression
SELECT salary * 12 AS yearly
FROM employees
WHERE salary * 12 > 100000;

-- ✅ CORRECT option 2: use a subquery
SELECT * FROM (
    SELECT salary * 12 AS yearly, name FROM employees
) t
WHERE yearly > 100000;

-- ❌ WRONG: Can't use aggregate in WHERE (WHERE runs before GROUP BY)
SELECT department, COUNT(*) FROM employees
WHERE COUNT(*) > 2;      -- ERROR!

-- ✅ CORRECT: Use HAVING for aggregate filters
SELECT department, COUNT(*)
FROM employees
GROUP BY department
HAVING COUNT(*) > 2;` },

                { type: "h2", text: "SELECT — Choosing and Transforming Columns" },
                { type: "p", text: "SELECT is what you write first, but it runs later. It chooses which columns to include in the output and lets you compute new values, rename columns, and call functions." },
                {
                    type: "code", lang: "sql", code: `-- Select all columns (avoid in production — reads unnecessary data)
SELECT * FROM employees;

-- Select specific columns (always prefer this)
SELECT name, department, salary FROM employees;

-- Compute new columns
SELECT
    name,
    salary,
    salary * 12 AS yearly_salary,         -- math
    UPPER(name) AS name_upper,             -- string function
    ROUND(salary / 30, 2) AS daily_rate,  -- rounding
    CASE
        WHEN salary > 9000 THEN 'Senior'
        WHEN salary > 7000 THEN 'Mid'
        ELSE 'Junior'
    END AS level                           -- conditional column
FROM employees;

-- Column aliases make output readable
SELECT department AS dept, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;` },
                { type: "callout", variant: "tip", text: "In big data, always SELECT only the columns you need. Parquet stores data column-by-column, so SELECT * reads all columns from disk unnecessarily. In Spark queries on a 500-column table, wrong SELECT can make queries 50x slower." },

                { type: "h2", text: "WHERE — Filtering Rows" },
                { type: "p", text: "WHERE filters individual rows based on conditions. Only rows where the condition is TRUE make it through to the next step. This runs BEFORE any grouping, so it operates on raw rows, not aggregated results." },
                {
                    type: "code", lang: "sql", code: `-- Comparison operators
SELECT * FROM employees WHERE salary > 8000;
SELECT * FROM employees WHERE salary >= 8000;
SELECT * FROM employees WHERE salary = 8500;
SELECT * FROM employees WHERE department != 'HR';

-- Range check (inclusive)
SELECT * FROM employees WHERE salary BETWEEN 7000 AND 9000;

-- List membership
SELECT * FROM employees WHERE department IN ('IT', 'Finance');
SELECT * FROM employees WHERE department NOT IN ('HR');

-- Null checks (NULL = nothing, not zero, not empty string)
SELECT * FROM employees WHERE manager_id IS NULL;      -- no manager
SELECT * FROM employees WHERE manager_id IS NOT NULL;  -- has manager

-- Pattern matching (% = wildcard)
SELECT * FROM employees WHERE name LIKE 'A%';    -- starts with A
SELECT * FROM employees WHERE name LIKE '%li%';   -- contains 'li'
SELECT * FROM employees WHERE name ILIKE 'ali';   -- case-insensitive

-- Combining conditions
SELECT * FROM employees
WHERE department = 'IT'
  AND salary > 8000
  AND active = true;

SELECT * FROM employees
WHERE department = 'IT' OR department = 'Finance';` },
                { type: "callout", variant: "warning", text: "Never compare against NULL with =. 'WHERE manager_id = NULL' always returns zero rows because NULL is not equal to anything, including itself. Always use 'IS NULL' or 'IS NOT NULL'." },

                { type: "h2", text: "GROUP BY — Aggregating Data" },
                { type: "p", text: "GROUP BY collapses multiple rows into a single summary row per unique combination of grouped columns. Once you GROUP BY, you can only SELECT the grouped columns and aggregate functions (SUM, COUNT, AVG, MAX, MIN). All other individual row detail is lost." },
                {
                    type: "code", lang: "sql", code: `-- Count employees per department
SELECT department, COUNT(*) AS employee_count
FROM employees
GROUP BY department;

-- Result:
-- department | employee_count
-- IT         | 2
-- HR         | 1
-- Finance    | 1

-- Multiple aggregations
SELECT
    department,
    COUNT(*)           AS headcount,
    AVG(salary)        AS avg_salary,
    MAX(salary)        AS max_salary,
    MIN(salary)        AS min_salary,
    SUM(salary)        AS total_payroll
FROM employees
GROUP BY department;

-- Group by multiple columns
SELECT
    department,
    EXTRACT(YEAR FROM hire_date) AS hire_year,
    COUNT(*) AS hires
FROM employees
GROUP BY department, hire_year
ORDER BY hire_year;

-- HAVING: filter groups after aggregation
SELECT department, AVG(salary) AS avg_sal
FROM employees
GROUP BY department
HAVING AVG(salary) > 8000;    -- only departments with avg > 8000` },
                { type: "p", text: "Think of GROUP BY like sorting cards into piles: each pile is a group, and then you calculate one summary number for the whole pile. Once the pile is summarized, you can't see the individual cards anymore." },

                { type: "h2", text: "Aggregate Functions Deep Dive" },
                {
                    type: "table", headers: ["Function", "What It Returns", "Handles NULLs?", "Example"], rows: [
                        ["COUNT(*)", "Number of rows (including NULLs)", "Counts all rows", "COUNT(*) → 4"],
                        ["COUNT(col)", "Number of NON-NULL values in column", "Skips NULLs", "COUNT(salary) → 3 if one is null"],
                        ["COUNT(DISTINCT col)", "Number of unique non-null values", "Skips NULLs", "COUNT(DISTINCT department) → 3"],
                        ["SUM(col)", "Sum of all non-null numbers", "Skips NULLs", "SUM(salary) → 34600"],
                        ["AVG(col)", "Average of non-null numbers", "Skips NULLs (note: affects result!)", "AVG(salary) → 8650"],
                        ["MAX(col)", "Largest value (works on text, dates too)", "Skips NULLs", "MAX(salary) → 9100"],
                        ["MIN(col)", "Smallest value", "Skips NULLs", "MIN(hire_date) → earliest date"],
                        ["STDDEV(col)", "Standard deviation", "Skips NULLs", "Spread of values around average"],
                    ]
                },
                {
                    type: "code", lang: "sql", code: `-- The NULL trap with AVG
-- Table: salaries = [8000, 9000, NULL, 7000]
-- COUNT(*)   = 4    (counts all rows)
-- COUNT(sal) = 3    (skips NULL)
-- AVG(sal)   = 8000 (sums 24000 / 3, NOT 4 — NULL skipped)

-- If you want NULL treated as 0:
AVG(COALESCE(salary, 0))   -- replaces NULL with 0 before averaging

-- COALESCE: returns first non-null value
SELECT COALESCE(nickname, first_name, 'Unknown') AS display_name
FROM users;` },

                { type: "h2", text: "JOINs — Combining Tables" },
                { type: "p", text: "Real-world databases split information across multiple tables to avoid duplication. JOINs bring those tables back together for querying. Think of JOIN like VLOOKUP in Excel — you match rows from two tables using a common key." },
                {
                    type: "code", lang: "text", code: `customers table:        orders table:
id | name               order_id | customer_id | amount
1  | Ali                1001     | 1           | $200
2  | Mona               1002     | 1           | $300  ← Ali has 2 orders
3  | John               1003     | 2           | $150
                        1004     | 4           | $400  ← customer_id 4 doesn't exist` },
                {
                    type: "table", headers: ["JOIN Type", "Returns", "Rows in Result", "Common Use Case"], rows: [
                        ["INNER JOIN", "Only rows where key exists in BOTH tables", "≤ min(left, right)", "Customers who have placed orders"],
                        ["LEFT JOIN", "All left rows + matching right rows (NULL if no match)", "= all left rows", "All customers, with or without orders"],
                        ["RIGHT JOIN", "All right rows + matching left (rare, just flip LEFT)", "= all right rows", "Rarely used — just swap table order with LEFT JOIN"],
                        ["FULL OUTER JOIN", "All rows from both, NULLs where no match", "= left ∪ right", "Reconciling two data sources"],
                        ["CROSS JOIN", "Every row paired with every other row (Cartesian)", "= left × right", "Generating combinations or test data"],
                    ]
                },
                {
                    type: "code", lang: "sql", code: `-- INNER JOIN: only customers who have at least one order
SELECT c.name, o.order_id, o.amount
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
-- Result: Ali (order 1001), Ali (order 1002), Mona (order 1003)
-- John NOT included (no orders), order 1004 NOT included (no matching customer)

-- LEFT JOIN: ALL customers, with orders if they exist
SELECT c.name, o.order_id, o.amount
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
-- Result: Ali (1001), Ali (1002), Mona (1003), John (NULL, NULL)

-- LEFT JOIN + IS NULL: customers with NO orders (interview classic!)
SELECT c.name
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.order_id IS NULL;   -- only keep rows where join produced NULL
-- Result: John

-- JOIN + GROUP BY: total spending per customer
SELECT c.name, COUNT(o.order_id) AS order_count, SUM(o.amount) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.name;` },
                { type: "callout", variant: "warning", text: "JOIN trap — duplicate keys: If your right table has duplicate values in the join key (e.g., a product appears 3 times in a lookup table), each left row will match ALL 3 right rows, causing your result to have 3x more rows than expected. Always verify join key uniqueness before joining." },
                {
                    type: "code", lang: "sql", code: `-- Joining multiple tables (chained JOINs)
SELECT
    e.name AS employee,
    d.dept_name AS department,
    m.name AS manager,
    l.city AS office_location
FROM employees e
JOIN departments d ON e.dept_id = d.id
LEFT JOIN employees m ON e.manager_id = m.id    -- self-join for manager
JOIN locations l ON d.location_id = l.id;

-- Self join: find employees in the same department
SELECT a.name AS emp1, b.name AS emp2, a.department
FROM employees a
JOIN employees b ON a.department = b.department
WHERE a.id < b.id;   -- avoid duplicate pairs (A,B) and (B,A)` },

                { type: "h2", text: "Window Functions — The Most Powerful SQL Feature" },
                { type: "p", text: "Window functions are like GROUP BY but they keep every row. They calculate a result for each row based on a 'window' of related rows — without collapsing those rows into one. This unlocks capabilities that are simply impossible with GROUP BY alone." },
                { type: "p", text: "The key structure is: FUNCTION() OVER (PARTITION BY ... ORDER BY ...). PARTITION BY defines the groups (like GROUP BY). ORDER BY defines the ranking or sequence within each group. But all rows remain in the output — the calculation is added as a new column." },
                {
                    type: "code", lang: "sql", code: `-- The fundamental difference:
-- GROUP BY → collapses rows, returns 1 row per group
SELECT department, AVG(salary) FROM employees GROUP BY department;
-- Result: 2 rows (IT avg, HR avg) — individual employees gone

-- WINDOW → keeps all rows, adds calculation as column
SELECT name, department, salary,
       AVG(salary) OVER (PARTITION BY department) AS dept_avg
FROM employees;
-- Result: 4 rows — EVERY employee + their department's average
-- name | department | salary | dept_avg
-- Ali  | IT         | 8500   | 8800
-- John | IT         | 9100   | 8800
-- Mona | HR         | 7200   | 7200` },

                { type: "h3", text: "ROW_NUMBER — Rank Every Row Uniquely" },
                { type: "p", text: "Assigns a unique sequential integer to each row within its partition, starting at 1. This is the most commonly used window function in real data engineering — primarily for deduplication and getting the latest record." },
                {
                    type: "code", lang: "sql", code: `-- Scenario: user_events table has duplicate events (re-sends)
-- user_id | event_id | event_date | amount
-- 101     | E1       | 2025-01-05 | 200
-- 101     | E1       | 2025-01-05 | 200   ← DUPLICATE
-- 102     | E2       | 2025-01-06 | 350

-- Step 1: Assign row numbers, newest first within each user
WITH deduped AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY event_id    -- group by the natural key
               ORDER BY created_at DESC -- pick latest ingest time
           ) AS rn
    FROM user_events
)
-- Step 2: Keep only the first row per event_id
SELECT * FROM deduped WHERE rn = 1;

-- ─────────────────────────────────────────────────────
-- Classic: latest transaction per user (VERY common in interviews)
-- transactions: user_id | amount | transaction_date
SELECT user_id, amount, transaction_date
FROM (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY user_id
               ORDER BY transaction_date DESC  -- newest = rank 1
           ) AS rn
    FROM transactions
) t
WHERE rn = 1;` },

                { type: "h3", text: "RANK vs DENSE_RANK — When Ties Matter" },
                { type: "p", text: "Both rank rows within a partition, but they handle ties differently. RANK skips numbers after ties (like Olympic medals — if two people get gold, there's no silver). DENSE_RANK never skips (there's always a silver)." },
                {
                    type: "code", lang: "sql", code: `-- scores: Alice=100, Bob=100, Tom=90, Anna=85
-- ROW_NUMBER:   Alice=1, Bob=2,  Tom=3,  Anna=4  (always unique)
-- RANK:         Alice=1, Bob=1,  Tom=3,  Anna=4  (skips 2)
-- DENSE_RANK:   Alice=1, Bob=1,  Tom=2,  Anna=3  (no gaps)

SELECT name, score,
       ROW_NUMBER()  OVER (ORDER BY score DESC) AS row_num,
       RANK()        OVER (ORDER BY score DESC) AS rnk,
       DENSE_RANK()  OVER (ORDER BY score DESC) AS dense_rnk
FROM scores;

-- Interview pattern: Top 3 earners per department
-- Using DENSE_RANK so if two people tie for 3rd, both appear
SELECT name, department, salary
FROM (
    SELECT *,
           DENSE_RANK() OVER (
               PARTITION BY department
               ORDER BY salary DESC
           ) AS sal_rank
    FROM employees
) t
WHERE sal_rank <= 3;

-- Using ROW_NUMBER gives exactly N rows per department (one picks arbitrarily on tie)
-- Using RANK with WHERE rank <= 3 might give you 4 rows if two tie for 3rd` },

                { type: "h3", text: "LAG and LEAD — Looking at Adjacent Rows" },
                { type: "p", text: "LAG looks at the PREVIOUS row. LEAD looks at the NEXT row. Both are extremely useful for time-series analysis: comparing this month to last month, detecting consecutive events, finding session gaps." },
                {
                    type: "code", lang: "sql", code: `-- Monthly sales data
-- month    | sales
-- 2025-01  | 10000
-- 2025-02  | 12000
-- 2025-03  | 11500

SELECT
    month,
    sales,
    LAG(sales, 1) OVER (ORDER BY month) AS prev_month_sales,
    LEAD(sales, 1) OVER (ORDER BY month) AS next_month_sales,
    -- Calculate month-over-month growth %
    ROUND(
        (sales - LAG(sales, 1) OVER (ORDER BY month)) * 100.0 /
        LAG(sales, 1) OVER (ORDER BY month), 2
    ) AS mom_growth_pct
FROM monthly_sales;

-- Result:
-- month    | sales | prev_month | next_month | growth_pct
-- 2025-01  | 10000 | NULL       | 12000      | NULL
-- 2025-02  | 12000 | 10000      | 11500      | 20.00
-- 2025-03  | 11500 | 12000      | NULL       | -4.17

-- LAG with offset and default value
LAG(sales, 3, 0) OVER (ORDER BY month)
-- looks back 3 rows, defaults to 0 if no row exists

-- Session analysis: find gap > 30 min = new session
SELECT
    user_id,
    event_time,
    LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time) AS prev_event,
    CASE
        WHEN event_time - LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time)
             > INTERVAL '30 minutes'
        THEN 1 ELSE 0
    END AS is_new_session
FROM user_events;` },

                { type: "h3", text: "Running Totals and Moving Averages" },
                { type: "p", text: "Window functions can be applied over a sliding frame of rows — not just the whole partition. This enables running totals, 7-day moving averages, and cumulative metrics." },
                {
                    type: "code", lang: "sql", code: `-- Running total (cumulative sum)
SELECT
    date, amount,
    SUM(amount) OVER (ORDER BY date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM daily_sales;

-- 7-day moving average
SELECT
    date, sales,
    AVG(sales) OVER (ORDER BY date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW  -- this row + 6 before
    ) AS moving_avg_7d
FROM daily_sales;

-- Frame options:
-- ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  → cumulative
-- ROWS BETWEEN 6 PRECEDING AND CURRENT ROW          → 7-day window
-- ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING          → 3-row centered average
-- ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING  → suffix sum` },

                { type: "h2", text: "CTEs (Common Table Expressions)" },
                { type: "p", text: "A CTE is a named temporary result set that you define before your main query using the WITH keyword. Think of it like creating a named variable or a temp table that only exists for the duration of one query. CTEs make complex queries readable by breaking them into logical steps." },
                {
                    type: "code", lang: "sql", code: `-- Without CTE (hard to read):
SELECT dep, avg_sal FROM (
    SELECT d.name AS dep, AVG(e.salary) AS avg_sal
    FROM departments d
    JOIN employees e ON d.id = e.dept_id
    WHERE e.active = true
    GROUP BY d.name
) t WHERE avg_sal > 8000;

-- ────── Same query WITH CTEs (readable and maintainable) ──────

-- Step 1: Get active employees
WITH active_employees AS (
    SELECT * FROM employees WHERE active = true
),

-- Step 2: Calculate department averages
dept_averages AS (
    SELECT
        d.name AS department,
        AVG(e.salary) AS avg_salary,
        COUNT(*) AS headcount
    FROM departments d
    JOIN active_employees e ON d.id = e.dept_id
    GROUP BY d.name
),

-- Step 3: Find high-paying departments
high_paying AS (
    SELECT * FROM dept_averages WHERE avg_salary > 8000
)

-- Final result
SELECT department, avg_salary, headcount
FROM high_paying
ORDER BY avg_salary DESC;` },
                { type: "callout", variant: "info", text: "CTEs are primarily for readability, not performance. In most engines (Spark, BigQuery, PostgreSQL v14+), the optimizer treats CTEs as inline views and optimizes them. If you reference the same CTE 5+ times in one query, consider a temp table instead." },

                { type: "h3", text: "Recursive CTEs — Traversing Hierarchies" },
                { type: "p", text: "Recursive CTEs can reference themselves, enabling traversal of hierarchical data like org charts, bill of materials, or threaded comments — things that are impossible with flat SQL." },
                {
                    type: "code", lang: "sql", code: `-- Org chart: find the full reporting chain for any employee
-- employees table: id, name, manager_id (NULL for CEO)

WITH RECURSIVE org_chart AS (
    -- Anchor: start with the CEO (no manager)
    SELECT id, name, manager_id, 1 AS level, name AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: join each employee to their manager
    SELECT e.id, e.name, e.manager_id,
           oc.level + 1,
           oc.path || ' → ' || e.name
    FROM employees e
    JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT name, level, path
FROM org_chart
ORDER BY path;

-- Result (example):
-- name    | level | path
-- Omar    | 1     | Omar
-- Ali     | 2     | Omar → Ali
-- Mona    | 3     | Omar → Ali → Mona` },

                { type: "h2", text: "Subqueries — SQL Inside SQL" },
                { type: "p", text: "A subquery (also called inner query or nested query) is a complete SQL statement embedded inside another. You use subqueries when you need a value to compare with, or when you want to query the result of another query like a temporary table." },
                {
                    type: "code", lang: "sql", code: `-- ─── 1. Scalar Subquery (returns one value) ───
-- Find employees earning above the company average
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
-- The inner query runs once, returns a single number, then the outer uses it

-- ─── 2. Row Subquery (returns one row) ───
SELECT name FROM employees
WHERE (department, salary) = (
    SELECT department, MAX(salary) FROM employees
    WHERE department = 'IT'
);

-- ─── 3. Table Subquery (returns many rows) ───
-- Used in FROM clause as a derived table
SELECT dept, total
FROM (
    SELECT department AS dept, SUM(salary) AS total
    FROM employees
    GROUP BY department
) dept_totals
WHERE total > 20000;

-- ─── 4. Correlated Subquery (references outer query) ───
-- For each employee, show their salary vs department average
-- NOTE: correlated subqueries run once PER ROW — can be slow!
SELECT
    name,
    department,
    salary,
    (SELECT AVG(salary) FROM employees inner_e
     WHERE inner_e.department = outer_e.department) AS dept_avg
FROM employees outer_e;

-- ─── 5. EXISTS (check if rows exist) ───
-- Find customers who have placed at least one order
SELECT name FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);
-- More efficient than IN for large subqueries — stops at first match` },

                { type: "h2", text: "String Functions" },
                { type: "p", text: "Data engineers regularly clean and reshape text data. These functions are essential for standardizing formats, extracting parts of strings, and building display values." },
                {
                    type: "code", lang: "sql", code: `-- Case transformation
UPPER('hello')        → 'HELLO'
LOWER('WORLD')        → 'world'
INITCAP('john doe')   → 'John Doe'

-- Trimming whitespace (common data quality fix)
TRIM('  ali  ')       → 'ali'
LTRIM('  ali')        → 'ali'
RTRIM('ali  ')        → 'ali'

-- Length
LENGTH('hello')       → 5

-- Substring extraction
SUBSTRING('omar_emara@company.com', 1, 4)  → 'omar'
SPLIT_PART('2025-01-15', '-', 2)           → '01'  (month)

-- Concatenation
CONCAT('Hello', ' ', 'World')   → 'Hello World'
'Hello' || ' ' || 'World'       → 'Hello World'  (standard SQL)

-- Pattern replace
REPLACE('omar.emara', '.', '_')    → 'omar_emara'
REGEXP_REPLACE(phone, '[^0-9]', '') -- remove non-digits from phone

-- Real DE use: normalizing email domains
SELECT
    LOWER(TRIM(email)) AS clean_email,
    SPLIT_PART(LOWER(email), '@', 2) AS domain
FROM users;` },

                { type: "h2", text: "Date and Time Functions" },
                { type: "p", text: "Almost every data engineering query involves dates. Knowing date functions well is essential for time-based filtering, partitioning, and computing derived metrics like age, tenure, or days since last activity." },
                {
                    type: "code", lang: "sql", code: `-- Current date/time
CURRENT_DATE              → '2025-03-08'
CURRENT_TIMESTAMP         → '2025-03-08 14:30:00'
NOW()                     → '2025-03-08 14:30:00'

-- Extracting parts
EXTRACT(YEAR FROM hire_date)      → 2023
EXTRACT(MONTH FROM hire_date)     → 6
EXTRACT(DOW FROM hire_date)       → 5  (0=Sunday, 6=Saturday)
DATE_TRUNC('month', event_time)   → '2025-03-01' (truncate to month start)

-- Date arithmetic
hire_date + INTERVAL '90 days'    → date 90 days later
CURRENT_DATE - hire_date          → number of days
AGE(CURRENT_DATE, hire_date)      → '2 years 3 months 5 days'

-- Common real-world patterns
SELECT * FROM orders WHERE order_date >= CURRENT_DATE - INTERVAL '30 days';
SELECT * FROM orders WHERE DATE_TRUNC('month', order_date) = '2025-01-01';
SELECT * FROM events WHERE EXTRACT(YEAR FROM event_time) = 2025;

-- Grouping by time period
SELECT
    DATE_TRUNC('week', order_date) AS week_start,
    SUM(amount) AS weekly_revenue
FROM orders
GROUP BY week_start
ORDER BY week_start;` },

                { type: "h2", text: "NULL Handling — The Silent Bug Maker" },
                { type: "p", text: "NULL in SQL means 'unknown' or 'missing'. It is NOT zero, NOT an empty string, NOT false. Most operations involving NULL return NULL — this causes silent calculation errors that are hard to catch." },
                {
                    type: "code", lang: "sql", code: `-- NULL propagation: almost everything + NULL = NULL
SELECT 100 + NULL    → NULL    -- not 100!
SELECT NULL = NULL   → NULL    -- not TRUE! (use IS NULL)
SELECT NULL OR TRUE  → TRUE    -- exception: OR can resolve
SELECT NULL AND FALSE → FALSE  -- exception: AND can resolve

-- COALESCE: return first non-null (very commonly used)
COALESCE(nickname, first_name, 'Anonymous')
-- if nickname is null, tries first_name, then falls back to 'Anonymous'

-- NULLIF: returns NULL if two values are equal (avoid divide-by-zero)
NULLIF(denominator, 0)
-- if denominator = 0, returns NULL → prevents division by zero error

-- Safe division:
SELECT revenue / NULLIF(visits, 0) AS revenue_per_visit
FROM campaigns;  -- returns NULL instead of erroring when visits=0

-- NVL / IFNULL / ISNULL (dialect-specific COALESCE shortcuts)
NVL(salary, 0)        -- Oracle
IFNULL(salary, 0)     -- MySQL
ISNULL(salary, 0)     -- SQL Server
COALESCE(salary, 0)   -- Standard SQL (works everywhere)

-- Find rows where any column is null
SELECT * FROM employees WHERE salary IS NULL OR department IS NULL;` },

                { type: "h2", text: "CASE WHEN — Conditional Logic" },
                { type: "p", text: "CASE WHEN is SQL's if-else statement. It's used to create categorization columns, transform values, and build pivot tables." },
                {
                    type: "code", lang: "sql", code: `-- Simple case: value comparison
SELECT name,
    CASE department
        WHEN 'IT' THEN 'Technical'
        WHEN 'HR' THEN 'People'
        WHEN 'Finance' THEN 'Financial'
        ELSE 'Other'
    END AS dept_type
FROM employees;

-- Searched case: condition expressions
SELECT name, salary,
    CASE
        WHEN salary >= 9000 THEN 'Band 5'
        WHEN salary >= 8000 THEN 'Band 4'
        WHEN salary >= 7000 THEN 'Band 3'
        ELSE 'Band 1-2'
    END AS salary_band
FROM employees;

-- CASE inside aggregate: conditional counts (pivot pattern)
SELECT
    COUNT(CASE WHEN department = 'IT' THEN 1 END) AS it_count,
    COUNT(CASE WHEN department = 'HR' THEN 1 END) AS hr_count,
    COUNT(CASE WHEN salary > 8500 THEN 1 END) AS high_earners
FROM employees;

-- CASE inside SUM: weighted or conditional totals
SELECT
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS completed_revenue,
    SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) AS refunded_amount
FROM orders;` },

                { type: "h2", text: "Real DE Patterns — Used Daily in Production" },

                { type: "h3", text: "Incremental Load Pattern" },
                { type: "p", text: "Loading ALL data from scratch every day is expensive. Incremental loads only load NEW or CHANGED records since the last run, using a watermark column like updated_at." },
                {
                    type: "code", lang: "sql", code: `-- Step 1: Find last successful load timestamp
WITH last_load AS (
    SELECT MAX(loaded_at) AS watermark FROM pipeline_metadata
    WHERE pipeline = 'orders' AND status = 'success'
)

-- Step 2: Load only records newer than watermark
INSERT INTO orders_clean
SELECT
    id,
    customer_id,
    amount,
    status,
    CURRENT_TIMESTAMP AS loaded_at
FROM raw_orders
WHERE updated_at > (SELECT watermark FROM last_load);` },

                { type: "h3", text: "Upsert / MERGE Pattern" },
                { type: "p", text: "When source data has updates, a simple INSERT would create duplicates. MERGE (or INSERT ... ON CONFLICT) handles this: update the row if it exists, insert if it doesn't." },
                {
                    type: "code", lang: "sql", code: `-- PostgreSQL: upsert with ON CONFLICT
INSERT INTO customers (id, name, email, updated_at)
VALUES (101, 'Ali Ahmed', 'ali@email.com', NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = EXCLUDED.updated_at;

-- Standard SQL MERGE (Snowflake, BigQuery, SQL Server)
MERGE INTO target_customers AS t
USING staging_customers AS s ON t.id = s.id
WHEN MATCHED THEN UPDATE SET
    t.name = s.name,
    t.email = s.email,
    t.updated_at = s.updated_at
WHEN NOT MATCHED THEN INSERT (id, name, email, updated_at)
    VALUES (s.id, s.name, s.email, s.updated_at);` },

                { type: "h3", text: "Data Validation Pattern" },
                { type: "p", text: "Always validate your pipeline output. These checks should run after every load and alert if they fail." },
                {
                    type: "code", lang: "sql", code: `-- Check 1: Row count match (no rows lost)
SELECT 'source_count' AS check_name, COUNT(*) AS value FROM raw_orders
UNION ALL
SELECT 'target_count', COUNT(*) FROM clean_orders;

-- Check 2: Sum reconciliation (no values corrupted)
SELECT 'source_total' AS check_name, SUM(amount) FROM raw_orders
UNION ALL
SELECT 'target_total', SUM(amount) FROM clean_orders;

-- Check 3: Null check on required fields
SELECT
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN customer_id IS NULL THEN 1 END) AS null_customer,
    COUNT(CASE WHEN amount IS NULL THEN 1 END) AS null_amount,
    COUNT(CASE WHEN order_date IS NULL THEN 1 END) AS null_date
FROM clean_orders;

-- Check 4: Duplicates
SELECT order_id, COUNT(*) AS cnt
FROM clean_orders
GROUP BY order_id
HAVING COUNT(*) > 1;   -- should return 0 rows

-- Check 5: Invalid values
SELECT COUNT(*) FROM clean_orders WHERE amount < 0 OR amount > 1000000;` },

                { type: "h2", text: "Performance SQL — Production Thinking" },
                { type: "p", text: "Writing correct SQL is one skill. Writing efficient SQL that runs fast on billions of rows is another. Here are the major performance concepts every data engineer needs to know." },
                {
                    type: "table", headers: ["Optimization", "Why It Works", "Example"], rows: [
                        ["Filter early (predicate pushdown)", "Reduces rows before expensive JOIN/GROUP operations — less data = less work", "WHERE date > '2025-01-01' before a JOIN"],
                        ["Select only needed columns", "Columnar formats (Parquet) only read selected columns — avoids reading entire file", "SELECT id, name instead of SELECT *"],
                        ["Partition pruning", "Queries on partition col skip irrelevant file segments entirely", "WHERE country='Egypt' on country-partitioned table"],
                        ["Pre-aggregate before joining", "Aggregating a small table before joining with a big table reduces join size dramatically", "GROUP BY → then JOIN, not JOIN → then GROUP BY"],
                        ["Broadcast small tables", "In Spark: send small dim tables to all workers to avoid shuffle", "broadcast(product_dim) in join"],
                        ["Use materialized views/summary tables", "Pre-compute slow queries and store results — queries become instant reads", "daily_revenue_by_country precomputed table"],
                        ["Avoid functions on indexed columns in WHERE", "WHERE TO_CHAR(date, 'MM') = '01' prevents using index — extract during ingestion instead", "Add month_col = EXTRACT(MONTH, date) at ingestion time"],
                    ]
                },
                {
                    type: "code", lang: "sql", code: `-- ❌ SLOW: JOIN full tables → then aggregate
SELECT c.name, SUM(o.amount)
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.name;

-- ✅ FAST: Aggregate first → then JOIN smaller result
WITH order_totals AS (
    SELECT customer_id, SUM(amount) AS total
    FROM orders
    GROUP BY customer_id
)
SELECT c.name, ot.total
FROM customers c
JOIN order_totals ot ON c.id = ot.customer_id;

-- ❌ SLOW: Function ON the filtered column prevents index use
WHERE YEAR(order_date) = 2025

-- ✅ FAST: Use range filter (index-friendly)
WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'` },

                { type: "h2", text: "Interview Question Bank" },
                {
                    type: "table", headers: ["Question", "Pattern / Key Answer"], rows: [
                        ["Get the Nth highest salary", "DENSE_RANK() OVER ORDER BY salary DESC, filter WHERE rank = N"],
                        ["Top 3 salaries per department", "DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC), filter <= 3"],
                        ["Find duplicate records", "GROUP BY natural key HAVING COUNT(*) > 1"],
                        ["Latest record per user", "ROW_NUMBER() OVER (PARTITION BY user ORDER BY date DESC), filter rn=1"],
                        ["Users with no orders", "LEFT JOIN orders WHERE orders.id IS NULL"],
                        ["Running total", "SUM() OVER (PARTITION BY key ORDER BY date)"],
                        ["MoM growth", "LAG(value) OVER (ORDER BY month)"],
                        ["Employees above dept average", "AVG(salary) OVER (PARTITION BY dept) in subquery, filter outer"],
                        ["Consecutive days active", "LAG(date) OVER, check if diff = 1 day, session numbering"],
                        ["Cumulative share (pct of total)", "SUM(n) / SUM(SUM(n)) OVER () — window on aggregate"],
                    ]
                },
                { type: "callout", variant: "important", text: "Interviewers want to hear DE-specific thinking: 'I'd filter early to reduce scan cost', 'This data might be partitioned by date so I'd use a date filter for pruning', 'I'd make sure the join key is unique to prevent row multiplication', 'For 2B rows I'd consider pre-aggregating this into a summary table'." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
