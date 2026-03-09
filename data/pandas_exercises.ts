export const tagColors: Record<string, string> = {
  LOAD:      "#00C9A7",
  CLEAN:     "#F9C80E",
  TRANSFORM: "#845EC2",
  GROUPBY:   "#FF6B35",
  DATETIME:  "#00B4D8",
  WINDOW:    "#FF6B6B",
  COUNTS:    "#C77DFF",
  MERGE:     "#4CC9F0",
  PIVOT:     "#F77F00",
  OUTPUT:    "#52B788",
  VISUALIZE: "#FF9CEE",
};

export const exercises = [
  // ── LOAD ──────────────────────────────────────────────
  {
    id: 1, topic: "Load", tag: "LOAD",
    q: "Load the CSV into a DataFrame and display the first 7 rows.",
    a: `import pandas as pd

df = pd.read_csv("pandas_practice.csv")
df.head(7)`
  },
  {
    id: 2, topic: "Load", tag: "LOAD",
    q: "Show the shape, column names, dtypes, and count of nulls per column.",
    a: `print(df.shape)
print(df.columns.tolist())
print(df.dtypes)
print(df.isnull().sum())`
  },
  {
    id: 3, topic: "Load", tag: "LOAD",
    q: "Get summary statistics for all numeric columns.",
    a: `df.describe()`
  },

  // ── CLEAN ─────────────────────────────────────────────
  {
    id: 4, topic: "Clean", tag: "CLEAN",
    q: "Find and remove duplicate rows. How many duplicates were there?",
    a: `print("Duplicates:", df.duplicated().sum())  # → 1
df = df.drop_duplicates()
print("After:", df.shape)`
  },
  {
    id: 5, topic: "Clean", tag: "CLEAN",
    q: "Fill missing 'rating' values with the column mean (rounded to 1 decimal).",
    a: `mean_rating = round(df["rating"].mean(), 1)
df["rating"] = df["rating"].fillna(mean_rating)`
  },
  {
    id: 6, topic: "Clean", tag: "CLEAN",
    q: "Fill missing 'ship_date' with the string 'Not Shipped' — don't drop those rows.",
    a: `df["ship_date"] = df["ship_date"].fillna("Not Shipped")`
  },
  {
    id: 7, topic: "Clean", tag: "CLEAN",
    q: "Convert 'order_date' and 'ship_date' to datetime. Handle the 'Not Shipped' strings gracefully.",
    a: `df["order_date"] = pd.to_datetime(df["order_date"])
df["ship_date"] = pd.to_datetime(df["ship_date"], errors="coerce")
# errors="coerce" turns unparseable strings → NaT`
  },
  {
    id: 8, topic: "Clean", tag: "CLEAN",
    q: "Strip whitespace and lowercase the 'status' column, then confirm unique values.",
    a: `df["status"] = df["status"].str.strip().str.lower()
df["status"].unique()`
  },
  {
    id: 9, topic: "Clean", tag: "CLEAN",
    q: "Fix the 'unit_price' column — cast it to float and clip any values below 0 to 0.",
    a: `df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce")
df["unit_price"] = df["unit_price"].clip(lower=0)`
  },

  // ── TRANSFORM ─────────────────────────────────────────
  {
    id: 10, topic: "Transform", tag: "TRANSFORM",
    q: "Create a new column 'revenue' = quantity × unit_price × (1 - discount).",
    a: `df["revenue"] = df["quantity"] * df["unit_price"] * (1 - df["discount"])`
  },
  {
    id: 11, topic: "Transform", tag: "TRANSFORM",
    q: "Create a 'discount_pct' column showing discount as a readable percentage string e.g. '10%'.",
    a: `df["discount_pct"] = (df["discount"] * 100).astype(int).astype(str) + "%"`
  },
  {
    id: 12, topic: "Transform", tag: "TRANSFORM",
    q: "Filter only completed orders with revenue above 500.",
    a: `high_value = df[(df["status"] == "completed") & (df["revenue"] > 500)]
print(high_value.shape)`
  },
  {
    id: 13, topic: "Transform", tag: "TRANSFORM",
    q: "Select only orders from the USA or UK using .isin().",
    a: `df[df["country"].isin(["USA", "UK"])]`
  },
  {
    id: 14, topic: "Transform", tag: "TRANSFORM",
    q: "Sort orders by revenue descending and show the top 10.",
    a: `df.sort_values("revenue", ascending=False).head(10)`
  },
  {
    id: 15, topic: "Transform", tag: "TRANSFORM",
    q: "Rename 'unit_price' → 'price' and 'customer_name' → 'name' in one call.",
    a: `df.rename(columns={"unit_price": "price", "customer_name": "name"}, inplace=True)`
  },
  {
    id: 16, topic: "Transform", tag: "TRANSFORM",
    q: "Use .loc to select rows where department is 'Engineering' and only show order_id, product, revenue.",
    a: `df.loc[df["department"] == "Engineering", ["order_id", "product", "revenue"]]`
  },
  {
    id: 17, topic: "Transform", tag: "TRANSFORM",
    q: "Use .iloc to grab rows 5–15 and the first 4 columns.",
    a: `df.iloc[5:16, 0:4]`
  },
  {
    id: 18, topic: "Transform", tag: "TRANSFORM",
    q: "Add a 'high_value' boolean column: True if revenue > 1000, else False.",
    a: `df["high_value"] = df["revenue"] > 1000`
  },

  // ── GROUPBY ───────────────────────────────────────────
  {
    id: 19, topic: "GroupBy", tag: "GROUPBY",
    q: "Total revenue by country — sorted highest to lowest.",
    a: `df.groupby("country")["revenue"].sum().sort_values(ascending=False)`
  },
  {
    id: 20, topic: "GroupBy", tag: "GROUPBY",
    q: "For each department: total revenue, average rating, and number of orders.",
    a: `df.groupby("department").agg(
    total_revenue=("revenue", "sum"),
    avg_rating=("rating", "mean"),
    order_count=("order_id", "count")
).reset_index()`
  },
  {
    id: 21, topic: "GroupBy", tag: "GROUPBY",
    q: "What is the most purchased product? (by total quantity)",
    a: `df.groupby("product")["quantity"].sum().sort_values(ascending=False).head(1)`
  },
  {
    id: 22, topic: "GroupBy", tag: "GROUPBY",
    q: "Count orders by status — show as both count and % of total.",
    a: `counts = df["status"].value_counts()
pcts = df["status"].value_counts(normalize=True) * 100
pd.DataFrame({"count": counts, "pct": pcts.round(1)})`
  },
  {
    id: 23, topic: "GroupBy", tag: "GROUPBY",
    q: "Which customer has spent the most in total? Show top 5.",
    a: `df.groupby("customer_name")["revenue"] \\
  .sum() \\
  .sort_values(ascending=False) \\
  .head(5)`
  },
  {
    id: 24, topic: "GroupBy", tag: "GROUPBY",
    q: "Average unit_price per category.",
    a: `df.groupby("category")["unit_price"].mean().round(2)`
  },

  // ── DATETIME ──────────────────────────────────────────
  {
    id: 25, topic: "DateTime", tag: "DATETIME",
    q: "Extract year, month, and month name from order_date into new columns.",
    a: `df["year"]       = df["order_date"].dt.year
df["month"]      = df["order_date"].dt.month
df["month_name"] = df["order_date"].dt.month_name()`
  },
  {
    id: 26, topic: "DateTime", tag: "DATETIME",
    q: "Calculate how many days each order took to ship. Store in 'days_to_ship'.",
    a: `df["days_to_ship"] = (df["ship_date"] - df["order_date"]).dt.days`
  },
  {
    id: 27, topic: "DateTime", tag: "DATETIME",
    q: "Filter all orders placed in February 2023.",
    a: `feb = df[(df["order_date"].dt.year == 2023) & (df["order_date"].dt.month == 2)]
print(feb.shape)`
  },
  {
    id: 28, topic: "DateTime", tag: "DATETIME",
    q: "Get total monthly revenue using resample. (Set order_date as index first.)",
    a: `monthly = df.set_index("order_date")["revenue"].resample("M").sum()
print(monthly)`
  },
  {
    id: 29, topic: "DateTime", tag: "DATETIME",
    q: "Which day of the week has the most orders?",
    a: `df["order_date"].dt.day_name().value_counts()`
  },

  // ── WINDOW ────────────────────────────────────────────
  {
    id: 30, topic: "Window", tag: "WINDOW",
    q: "Sort by order_date and compute a 5-row rolling average of revenue.",
    a: `df = df.sort_values("order_date")
df["rolling_avg_rev"] = df["revenue"].rolling(window=5, min_periods=1).mean()`
  },
  {
    id: 31, topic: "Window", tag: "WINDOW",
    q: "Add a 'prev_revenue' column showing the previous row's revenue (lag by 1).",
    a: `df["prev_revenue"] = df["revenue"].shift(1)`
  },
  {
    id: 32, topic: "Window", tag: "WINDOW",
    q: "Calculate revenue % change row-over-row.",
    a: `df["rev_pct_change"] = df["revenue"].pct_change().round(4)`
  },
  {
    id: 33, topic: "Window", tag: "WINDOW",
    q: "Rank each order by revenue within its department (1 = highest).",
    a: `df["dept_rank"] = df.groupby("department")["revenue"] \\
    .rank(ascending=False, method="dense")`
  },

  // ── COUNTS ────────────────────────────────────────────
  {
    id: 34, topic: "Counts", tag: "COUNTS",
    q: "How many distinct customers placed orders?",
    a: `df["customer_id"].nunique()`
  },
  {
    id: 35, topic: "Counts", tag: "COUNTS",
    q: "Show the top 5 most common cities by order count.",
    a: `df["city"].value_counts().head(5)`
  },
  {
    id: 36, topic: "Counts", tag: "COUNTS",
    q: "Build a crosstab of department vs status (how many orders each dept has per status).",
    a: `pd.crosstab(df["department"], df["status"])`
  },
  {
    id: 37, topic: "Counts", tag: "COUNTS",
    q: "Show the proportion of each category (as % of all orders).",
    a: `df["category"].value_counts(normalize=True).mul(100).round(1)`
  },
  {
    id: 38, topic: "Counts", tag: "COUNTS",
    q: "How many unique products exist per category?",
    a: `df.groupby("category")["product"].nunique()`
  },

  // ── JOIN / MERGE ──────────────────────────────────────
  {
    id: 39, topic: "Merge", tag: "MERGE",
    q: "Split df into 'orders' (order info) and 'customers' (customer info), then merge them back.",
    a: `orders = df[["order_id","customer_id","product","quantity","revenue","status"]]
customers = df[["customer_id","customer_name","email","city","country"]].drop_duplicates()

merged = pd.merge(orders, customers, on="customer_id", how="left")
merged.head()`
  },
  {
    id: 40, topic: "Merge", tag: "MERGE",
    q: "Stack the first 30 rows and last 30 rows into a new DataFrame using concat.",
    a: `top = df.head(30)
bottom = df.tail(30)
combined = pd.concat([top, bottom], ignore_index=True)
print(combined.shape)`
  },

  // ── PIVOT ─────────────────────────────────────────────
  {
    id: 41, topic: "Pivot", tag: "PIVOT",
    q: "Create a pivot table: total revenue by department (rows) and status (columns).",
    a: `df.pivot_table(
    values="revenue",
    index="department",
    columns="status",
    aggfunc="sum",
    fill_value=0
)`
  },
  {
    id: 42, topic: "Pivot", tag: "PIVOT",
    q: "Melt the pivot table back to long format.",
    a: `pivot = df.pivot_table(
    values="revenue", index="department",
    columns="status", aggfunc="sum", fill_value=0
).reset_index()

long = pd.melt(pivot, id_vars=["department"], var_name="status", value_name="revenue")
long.head()`
  },

  // ── OUTPUT ────────────────────────────────────────────
  {
    id: 43, topic: "Output", tag: "OUTPUT",
    q: "Save the cleaned DataFrame to a new CSV without the index.",
    a: `df.to_csv("cleaned_orders.csv", index=False)`
  },
  {
    id: 44, topic: "Output", tag: "OUTPUT",
    q: "Save to Parquet with snappy compression.",
    a: `df.to_parquet("orders.parquet", compression="snappy", index=False)`
  },
  {
    id: 45, topic: "Output", tag: "OUTPUT",
    q: "Save only the completed orders to a separate CSV.",
    a: `df[df["status"] == "completed"].to_csv("completed_orders.csv", index=False)`
  },

  // ── VISUALIZE ─────────────────────────────────────────
  {
    id: 46, topic: "Visualize", tag: "VISUALIZE",
    q: "Plot a bar chart of total revenue by country.",
    a: `import matplotlib.pyplot as plt

rev_by_country = df.groupby("country")["revenue"].sum().sort_values(ascending=False)

rev_by_country.plot(kind="bar", figsize=(12, 5), color="steelblue")
plt.title("Total Revenue by Country")
plt.ylabel("Revenue ($)")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.show()`
  },
  {
    id: 47, topic: "Visualize", tag: "VISUALIZE",
    q: "Plot monthly revenue as a line chart.",
    a: `monthly = df.set_index("order_date")["revenue"].resample("M").sum()

monthly.plot(kind="line", figsize=(10, 5), marker="o", color="coral")
plt.title("Monthly Revenue")
plt.ylabel("Revenue ($)")
plt.tight_layout()
plt.show()`
  },
  {
    id: 48, topic: "Visualize", tag: "VISUALIZE",
    q: "Show the distribution of revenue using a histogram with 20 bins.",
    a: `df["revenue"].hist(bins=20, figsize=(8, 5), color="mediumpurple", edgecolor="white")
plt.title("Revenue Distribution")
plt.xlabel("Revenue ($)")
plt.tight_layout()
plt.show()`
  },
  {
    id: 49, topic: "Visualize", tag: "VISUALIZE",
    q: "Create a boxplot of revenue grouped by department using seaborn.",
    a: `import seaborn as sns
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
sns.boxplot(data=df, x="department", y="revenue", palette="Set2")
plt.title("Revenue Distribution by Department")
plt.xticks(rotation=30)
plt.tight_layout()
plt.show()`
  },
  {
    id: 50, topic: "Visualize", tag: "VISUALIZE",
    q: "Plot a heatmap of the correlation matrix for numeric columns.",
    a: `import seaborn as sns

plt.figure(figsize=(8, 6))
sns.heatmap(
    df.select_dtypes(include="number").corr(),
    annot=True, fmt=".2f", cmap="coolwarm"
)
plt.title("Correlation Matrix")
plt.tight_layout()
plt.show()`
  },
];
