export const sections = [
  {
    id: "shell",
    label: "01 — Shell / Unzip",
    color: "#FF6B35",
    snippets: [
      {
        title: "Unzip a .tar.gz file",
        code: `# Extract to current directory
tar -xvzf archive.tar.gz

# Extract to specific folder
tar -xvzf archive.tar.gz -C /path/to/dir

# Flags: x=extract, v=verbose, z=gzip, f=file`,
        lang: "bash",
      },
      {
        title: "Unzip a .tar file (no gzip)",
        code: `tar -xvf archive.tar`,
        lang: "bash",
      },
      {
        title: "List contents without extracting",
        code: `tar -tvf archive.tar.gz`,
        lang: "bash",
      },
      {
        title: "Unzip a .zip file",
        code: `unzip archive.zip
unzip archive.zip -d /target/folder`,
        lang: "bash",
      },
    ],
  },
  {
    id: "load",
    label: "02 — Load Data",
    color: "#00C9A7",
    snippets: [
      {
        title: "Load a Parquet file",
        code: `import pandas as pd

df = pd.read_parquet("data.parquet")

# With specific engine
df = pd.read_parquet("data.parquet", engine="pyarrow")

# Load only certain columns
df = pd.read_parquet("data.parquet", columns=["id", "name", "amount"])`,
        lang: "python",
      },
      {
        title: "Quick peek at the data",
        code: `df.head()          # first 5 rows
df.tail(10)        # last 10 rows
df.shape           # (rows, cols)
df.dtypes          # column types
df.info()          # overview + nulls
df.describe()      # stats for numerics`,
        lang: "python",
      },
      {
        title: "Load CSV / JSON (bonus)",
        code: `df = pd.read_csv("file.csv")
df = pd.read_json("file.json")
df = pd.read_csv("file.csv", parse_dates=["date_col"])`,
        lang: "python",
      },
    ],
  },
  {
    id: "transform",
    label: "03 — Transform",
    color: "#845EC2",
    snippets: [
      {
        title: "Select & filter",
        code: `# Select columns
df[["col1", "col2"]]

# Filter rows
df[df["age"] > 30]
df[(df["age"] > 30) & (df["city"] == "NYC")]

# .loc → label-based
df.loc[0:5, "name":"age"]

# .iloc → index-based
df.iloc[0:5, 0:3]`,
        lang: "python",
      },
      {
        title: "Create & rename columns",
        code: `# New column
df["total"] = df["price"] * df["qty"]

# Rename
df.rename(columns={"old_name": "new_name"}, inplace=True)

# Apply a function
df["name_upper"] = df["name"].str.upper()
df["tax"] = df["price"].apply(lambda x: x * 0.1)`,
        lang: "python",
      },
      {
        title: "Group by & aggregate",
        code: `# Single aggregation
df.groupby("city")["revenue"].sum()

# Multiple aggregations
df.groupby("category").agg(
    total=("revenue", "sum"),
    avg=("revenue", "mean"),
    count=("id", "count")
).reset_index()`,
        lang: "python",
      },
      {
        title: "Sort & rank",
        code: `df.sort_values("revenue", ascending=False)
df.sort_values(["city", "revenue"], ascending=[True, False])

df["rank"] = df["score"].rank(ascending=False)`,
        lang: "python",
      },
      {
        title: "Join / Merge",
        code: `# Inner join (default)
pd.merge(df1, df2, on="id")

# Left join
pd.merge(df1, df2, on="id", how="left")

# Different column names
pd.merge(df1, df2, left_on="user_id", right_on="id")

# Stack rows
pd.concat([df1, df2], ignore_index=True)`,
        lang: "python",
      },
      {
        title: "Pivot & melt",
        code: `# Pivot table
df.pivot_table(
    values="sales",
    index="region",
    columns="month",
    aggfunc="sum"
)

# Melt (wide → long)
pd.melt(df, id_vars=["id"], value_vars=["jan", "feb"])`,
        lang: "python",
      },
    ],
  },
  {
    id: "clean",
    label: "04 — Clean",
    color: "#F9C80E",
    snippets: [
      {
        title: "Handle missing values",
        code: `df.isnull().sum()          # count nulls per column
df.dropna()                # drop rows with any null
df.dropna(subset=["col"])  # drop only if specific col is null
df.fillna(0)               # fill with 0
df["col"].fillna(df["col"].mean(), inplace=True)`,
        lang: "python",
      },
      {
        title: "Remove duplicates",
        code: `df.duplicated().sum()              # count dupes
df.drop_duplicates(inplace=True)
df.drop_duplicates(subset=["id"])  # by specific col`,
        lang: "python",
      },
      {
        title: "Fix data types",
        code: `df["date"] = pd.to_datetime(df["date"])
df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
df["id"] = df["id"].astype(str)
df["flag"] = df["flag"].astype(bool)`,
        lang: "python",
      },
      {
        title: "String cleaning",
        code: `df["name"] = df["name"].str.strip()         # remove whitespace
df["name"] = df["name"].str.lower()         # lowercase
df["code"] = df["code"].str.replace("-", "") # remove chars
df["email"].str.contains("@gmail")          # filter`,
        lang: "python",
      },
      {
        title: "Clip / replace outliers",
        code: `# Replace exact values
df["status"].replace({"Y": True, "N": False}, inplace=True)

# Clip to range
df["score"] = df["score"].clip(0, 100)

# Filter outliers using IQR
Q1 = df["val"].quantile(0.25)
Q3 = df["val"].quantile(0.75)
IQR = Q3 - Q1
df = df[(df["val"] >= Q1 - 1.5*IQR) & (df["val"] <= Q3 + 1.5*IQR)]`,
        lang: "python",
      },
    ],
  },
  {
    id: "datetime",
    label: "05 — DateTime",
    color: "#00B4D8",
    snippets: [
      {
        title: "Parse & extract",
        code: `df["date"] = pd.to_datetime(df["date"])

df["year"]  = df["date"].dt.year
df["month"] = df["date"].dt.month
df["day"]   = df["date"].dt.day
df["dow"]   = df["date"].dt.day_name()  # "Monday" etc
df["hour"]  = df["date"].dt.hour`,
        lang: "python",
      },
      {
        title: "Filter by date",
        code: `df[df["date"] > "2023-01-01"]
df[df["date"].between("2023-01-01", "2023-12-31")]

# Set date as index for easy slicing
df = df.set_index("date")
df["2023-06"]       # all of June 2023
df["2023-01":"2023-06"]  # range`,
        lang: "python",
      },
      {
        title: "Date math & resampling",
        code: `# Difference between dates
df["days_diff"] = (df["end"] - df["start"]).dt.days

# Add time
df["due"] = df["start"] + pd.Timedelta(days=30)

# Resample (like groupby for time)
df.resample("M")["sales"].sum()   # monthly
df.resample("W")["sales"].mean()  # weekly`,
        lang: "python",
      },
    ],
  },
  {
    id: "window",
    label: "06 — Window Fns",
    color: "#FF6B6B",
    snippets: [
      {
        title: "Rolling (moving average)",
        code: `# 7-day rolling average
df["rolling_avg"] = df["sales"].rolling(window=7).mean()

# Rolling sum
df["rolling_sum"] = df["sales"].rolling(7).sum()

# min_periods avoids NaN at start
df["rolling_avg"] = df["sales"].rolling(7, min_periods=1).mean()`,
        lang: "python",
      },
      {
        title: "Shift (lag / lead)",
        code: `# Lag: previous row value
df["prev_sales"] = df["sales"].shift(1)

# Lead: next row value
df["next_sales"] = df["sales"].shift(-1)

# % change from previous row
df["pct_change"] = df["sales"].pct_change()`,
        lang: "python",
      },
      {
        title: "Rank",
        code: `# Simple rank
df["rank"] = df["score"].rank(ascending=False)

# Rank within groups
df["rank_in_group"] = df.groupby("dept")["salary"] \\
    .rank(ascending=False, method="dense")`,
        lang: "python",
      },
    ],
  },
  {
    id: "counts",
    label: "07 — Counts & Uniq",
    color: "#C77DFF",
    snippets: [
      {
        title: "value_counts",
        code: `df["city"].value_counts()           # frequency table
df["city"].value_counts(normalize=True)  # as proportions (0-1)
df["city"].value_counts(dropna=False)    # include NaN

# Top 5 most common
df["category"].value_counts().head(5)`,
        lang: "python",
      },
      {
        title: "nunique — count distinct",
        code: `df["user_id"].nunique()           # total distinct users

# Distinct count per group
df.groupby("country")["user_id"].nunique()

# Across all columns
df.nunique()`,
        lang: "python",
      },
      {
        title: "crosstab — frequency matrix",
        code: `# Counts
pd.crosstab(df["gender"], df["city"])

# With proportions
pd.crosstab(df["gender"], df["city"], normalize="index")`,
        lang: "python",
      },
    ],
  },
  {
    id: "output",
    label: "08 — Write Output",
    color: "#52B788",
    snippets: [
      {
        title: "Write to Parquet",
        code: `df.to_parquet("output.parquet")

# With compression
df.to_parquet("output.parquet", compression="snappy")

# Partition by column (like Hive)
df.to_parquet("output/", partition_cols=["year", "month"])`,
        lang: "python",
      },
      {
        title: "Write to CSV / JSON",
        code: `df.to_csv("output.csv", index=False)   # no row numbers
df.to_csv("output.csv", sep="|")       # pipe-delimited

df.to_json("output.json", orient="records", lines=True)`,
        lang: "python",
      },
      {
        title: "Write to SQL / Excel",
        code: `# SQL (needs sqlalchemy)
from sqlalchemy import create_engine
engine = create_engine("postgresql://user:pw@host/db")
df.to_sql("table_name", engine, if_exists="replace", index=False)

# Excel
df.to_excel("output.xlsx", index=False, sheet_name="Sheet1")`,
        lang: "python",
      },
    ],
  },
  {
    id: "viz",
    label: "09 — Visualize",
    color: "#FF9CEE",
    snippets: [
      {
        title: "Basic matplotlib setup",
        code: `import matplotlib.pyplot as plt
import seaborn as sns

# Good defaults
plt.figure(figsize=(10, 6))
sns.set_theme(style="whitegrid")`,
        lang: "python",
      },
      {
        title: "Line & bar charts",
        code: `# Line chart
df.plot(x="date", y="revenue", kind="line")
plt.title("Revenue over time")
plt.show()

# Bar chart
df.groupby("category")["sales"].sum().plot(kind="bar")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()`,
        lang: "python",
      },
      {
        title: "Distribution plots",
        code: `# Histogram
df["age"].hist(bins=20)

# KDE (density)
df["score"].plot(kind="kde")

# Boxplot
df.boxplot(column="salary", by="department")

# Seaborn violin
sns.violinplot(data=df, x="group", y="value")`,
        lang: "python",
      },
      {
        title: "Scatter & heatmap",
        code: `# Scatter
plt.scatter(df["x"], df["y"], alpha=0.5, c=df["category"].astype("category").cat.codes)

# Seaborn scatter with hue
sns.scatterplot(data=df, x="age", y="salary", hue="dept")

# Correlation heatmap
sns.heatmap(df.corr(), annot=True, cmap="coolwarm", fmt=".2f")`,
        lang: "python",
      },
      {
        title: "Save the figure",
        code: `plt.savefig("output.png", dpi=150, bbox_inches="tight")`,
        lang: "python",
      },
    ],
  },
];