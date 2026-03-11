import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Anomaly & Outlier Detection",
subtitle: "Identify rare events and data points that deviate significantly from the norm — without labeled training examples.",
accent: "#ef4444",
blocks: [
                { type: "h2", text: "Anomalies vs Outliers" },
                { type: "p", text: "An outlier is a data point that is statistically far from the rest of the data distribution. An anomaly is a data point that is unusual and potentially indicative of a different generative process — fraud, sensor failure, intrusion, rare disease." },
                {
                    type: "table", headers: ["Type", "Description", "Example"], rows: [
                        ["Point anomaly", "A single observation is unusual", "A transaction of $50,000 when avg is $100"],
                        ["Contextual anomaly", "Unusual given context (time, location)", "25°C in Antarctica — normal in Egypt"],
                        ["Collective anomaly", "Group of observations together is unusual", "Sequence of very small transactions (structuring)"],
                    ]
                },

                { type: "h2", text: "Statistical Methods" },
                { type: "h3", text: "Z-Score (Standard Deviations from Mean)" },
                { type: "p", text: "Measures how many standard deviations a data point is from the mean. Assumes the data follows a roughly Gaussian (normal) distribution. A common threshold is |z| > 3." },
                {
                    type: "code", lang: "text", code: `Z-Score:

  z = (x − μ) / σ

  where μ = mean, σ = standard deviation

  |z| < 2.0:  normal (95.4% of Gaussian data)
  |z| < 3.0:  normal (99.7% of Gaussian data)
  |z| > 3.0:  outlier (0.3% of Gaussian data)

  Example:
    Salaries: μ=50,000, σ=10,000
    Point: 90,000  →  z = (90,000−50,000)/10,000 = 4.0  → OUTLIER
    Point: 65,000  →  z = (65,000−50,000)/10,000 = 1.5  → Normal

  Limitation: sensitive to the outliers themselves 
  (outliers affect μ and σ, masking extreme outliers)`
                },

                { type: "h3", text: "IQR (Interquartile Range)" },
                { type: "p", text: "More robust than Z-score because it uses quartiles (resistant to outliers). Defines outliers as points outside 1.5×IQR from the box boundaries (standard boxplot definition)." },
                {
                    type: "code", lang: "text", code: `IQR Method:

  Q1 = 25th percentile
  Q3 = 75th percentile
  IQR = Q3 − Q1

  Outlier boundaries:
    Lower fence: Q1 − 1.5 × IQR
    Upper fence: Q3 + 1.5 × IQR

  Extreme outliers:
    Lower: Q1 − 3.0 × IQR
    Upper: Q3 + 3.0 × IQR

  Example:
    Data: [10, 20, 25, 30, 35, 40, 45, 50, 200]
    Q1=22.5, Q3=47.5, IQR=25
    Upper fence = 47.5 + 1.5×25 = 85
    200 > 85 → OUTLIER`
                },
                {
                    type: "code", lang: "python", code: `import numpy as np
import pandas as pd

# ── Z-Score outlier detection
from scipy import stats

z_scores = np.abs(stats.zscore(df[numeric_cols]))
outlier_mask_z = (z_scores > 3).any(axis=1)
print(f"Outliers by Z-score: {outlier_mask_z.sum()}")

# ── IQR outlier detection
Q1 = df[numeric_cols].quantile(0.25)
Q3 = df[numeric_cols].quantile(0.75)
IQR = Q3 - Q1

lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR

outlier_mask_iqr = ((df[numeric_cols] < lower) | (df[numeric_cols] > upper)).any(axis=1)
print(f"Outliers by IQR: {outlier_mask_iqr.sum()}")

# Winsorize (clip) instead of removing
for col in numeric_cols:
    df[col] = df[col].clip(lower[col], upper[col])`
                },

                { type: "h2", text: "Isolation Forest" },
                { type: "p", text: "Isolation Forest is the most popular algorithm for anomaly detection on high-dimensional data. Core insight: anomalies are few and different — they are easier to isolate by random partitioning. An anomaly gets isolated (separated into its own leaf) with fewer random splits than a normal point." },
                {
                    type: "code", lang: "text", code: `Isolation Forest Algorithm:

  1. Build many isolation trees (random):
     - Randomly select feature f
     - Randomly select split threshold t ∈ [min(f), max(f)]
     - Recursively partition until all points isolated or max depth

  2. For each point x, compute its average path length h(x)
     = mean depth to reach x across all isolation trees

  3. Anomaly score = 2^(−h(x)/c(n))
     where c(n) = expected path length in a random binary tree

  Score interpretation:
    ≈ 1.0:  anomaly (isolated with very few splits)
    ≈ 0.5:  normal  (requires average splits)
    ≈ 0.0:  dense normal region (hard to isolate)

  Why anomalies are isolated quickly:
    - Anomalies are in sparse regions
    - Random splits easily separate them from all other points
    - Normal points are in dense regions, requiring many splits`
                },
                {
                    type: "code", lang: "python", code: `from sklearn.ensemble import IsolationForest

isof = IsolationForest(
    n_estimators=100,        # number of isolation trees
    max_samples='auto',      # samples per tree (default: min(256, n))
    contamination=0.05,      # expected fraction of outliers (0.01–0.5)
    random_state=42,
    n_jobs=-1
)
isof.fit(X_train)  # unsupervised: no y!

# Predict: -1 = outlier, +1 = inlier
labels = isof.predict(X)
anomaly_score = isof.score_samples(X)  # the lower, the more anomalous

outliers = X[labels == -1]
print(f"Detected anomalies: {(labels==-1).sum()}")

# For streaming/production — compute threshold on training set
threshold = np.percentile(isof.score_samples(X_train), 5)  # bottom 5%
new_predictions = (isof.score_samples(X_new) < threshold).astype(int)`
                },

                { type: "h2", text: "Local Outlier Factor (LOF)" },
                { type: "p", text: "LOF computes a local density for each point based on its K nearest neighbors. A point is anomalous if its local density is much lower than its neighbors' densities. This handles contextual anomalies that global methods miss." },
                {
                    type: "code", lang: "python", code: `from sklearn.neighbors import LocalOutlierFactor

lof = LocalOutlierFactor(
    n_neighbors=20,       # k in k-NN
    contamination=0.05,   # expected fraction of outliers
    metric='euclidean',
    novelty=False         # True for predicting new data; False for training data
)
labels = lof.fit_predict(X)  # -1 = outlier, +1 = inlier
lof_scores = lof.negative_outlier_factor_  # more negative = more anomalous

# For predicting on new data (set novelty=True during fit)
lof_novel = LocalOutlierFactor(n_neighbors=20, novelty=True, contamination=0.05)
lof_novel.fit(X_train)
new_labels = lof_novel.predict(X_new)`
                },

                { type: "h2", text: "Choosing an Anomaly Detection Method" },
                {
                    type: "table", headers: ["Method", "Best When", "Limitation"], rows: [
                        ["Z-Score", "Single feature, approximately normal distribution", "Fails with skewed data or multivariate anomalies"],
                        ["IQR", "Univariate, robust against extreme outliers", "Univariate only"],
                        ["Isolation Forest", "High-dimensional data, tabular features, scalable", "Doesn't capture local density well"],
                        ["LOF", "Local anomalies, varying density clusters", "Slow for large datasets, sensitive to k"],
                        ["One-Class SVM", "Small, clean dataset; non-linear boundary", "Slow, sensitive to parameters"],
                        ["Autoencoder", "High-dimensional data, images, sequences", "Requires neural network training, more complex"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `# ── Complete pipeline: detect, report, and explain anomalies
from sklearn.ensemble import IsolationForest
import pandas as pd

# Train
isof = IsolationForest(contamination=0.02, random_state=42)
isof.fit(X_train_scaled)

# Score new data
scores = isof.score_samples(X_test_scaled)
labels = isof.predict(X_test_scaled)  # -1 or +1

# Build anomaly report
anomaly_df = pd.DataFrame(X_test, columns=feature_names)
anomaly_df['anomaly_score'] = scores
anomaly_df['is_outlier'] = labels == -1

# Report top anomalies with their most extreme features
outlier_rows = anomaly_df[anomaly_df['is_outlier']].sort_values('anomaly_score')
print(f"Top 5 anomalies:")
print(outlier_rows.head(5)[['anomaly_score'] + feature_names[:5]])`
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
