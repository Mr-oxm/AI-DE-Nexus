import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Data Preprocessing",
subtitle: "Raw data is always messy. Preprocessing turns it into a form that ML algorithms can learn from effectively.",
accent: "#34d399",
blocks: [
                { type: "h2", text: "Why Preprocessing Matters" },
                { type: "p", text: "ML algorithms are mathematical machines. They expect numbers, not strings. They struggle with vastly different scales across features. They break when data is missing. Real-world data has all of these problems. Preprocessing bridges the gap between raw data and algorithm expectations." },
                { type: "p", text: "The golden rule: fit all preprocessing transformers ONLY on training data. Then apply (transform) those same fitted transformers to validation and test data. Fitting on the whole dataset before splitting introduces data leakage — the model indirectly 'sees' test data during training and reports inflated performance." },
                { type: "callout", variant: "important", text: "Data leakage is the most common mistake in ML projects. Always split first, then fit your scalers/encoders/imputers on training data only." },

                { type: "h2", text: "Handling Missing Values" },
                { type: "p", text: "Missing values appear in real data for many reasons: sensor failures, user skipped form fields, merge left outer join, data entry errors. Before deciding how to handle them, first understand WHY they are missing." },
                {
                    type: "table", headers: ["Missing Pattern", "Description", "Strategy"], rows: [
                        ["MCAR (Missing Completely At Random)", "Missingness is random, unrelated to any variable", "Any imputation works; listwise deletion is safe"],
                        ["MAR (Missing At Random)", "Missingness depends on observed variables (e.g., males less likely to report salary)", "Imputation; model-based imputation"],
                        ["MNAR (Missing Not At Random)", "Missingness depends on the missing value itself (e.g., very sick patients skip survey)", "Hard — consider adding missingness indicator feature"],
                    ]
                },
                { type: "h3", text: "Imputation Strategies" },
                {
                    type: "code", lang: "python", code: `import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer, KNNImputer

df = pd.DataFrame({
    'age':    [25, np.nan, 35, 40, np.nan],
    'income': [50000, 60000, np.nan, 80000, 55000],
    'city':   ['Cairo', 'Alex', np.nan, 'Cairo', 'Giza']
})

# ── Strategy 1: Mean imputation (numeric, symmetric distributions)
mean_imp = SimpleImputer(strategy='mean')
df[['age']] = mean_imp.fit_transform(df[['age']])

# ── Strategy 2: Median imputation (numeric, skewed / outliers)
median_imp = SimpleImputer(strategy='median')
df[['income']] = median_imp.fit_transform(df[['income']])

# ── Strategy 3: Most frequent / mode (categorical)
mode_imp = SimpleImputer(strategy='most_frequent')
df[['city']] = mode_imp.fit_transform(df[['city']])

# ── Strategy 4: KNN imputation (uses similarity between samples)
# Fill missing values using the k nearest neighbors
knn_imp = KNNImputer(n_neighbors=3)
df_numeric = knn_imp.fit_transform(df[['age', 'income']])

# ── Strategy 5: Add missingness indicator (for MNAR)
df['income_missing'] = df['income'].isna().astype(int)

# ── Drop rows with too many missing values
threshold = 0.5  # drop row if > 50% missing
df_clean = df.dropna(thresh=int(threshold * df.shape[1]))`
                },
                { type: "callout", variant: "warning", text: "Deleting rows (listwise deletion) is only safe when data is MCAR and you have plenty of data. Deleting can bias your dataset if the missing pattern is informative." },

                { type: "h2", text: "Feature Scaling" },
                { type: "p", text: "Many algorithms (gradient descent, KNN, SVM, neural networks, PCA) are sensitive to feature scale. If 'age' ranges 18–80 and 'income' ranges 20,000–500,000, 'income' will dominate distance calculations and gradient updates — not because it's more informative, but simply because it's larger." },

                { type: "h3", text: "Min-Max Scaling (Normalization)" },
                { type: "p", text: "Scales every feature to [0, 1] (or any [a, b] range). Formula: x_scaled = (x − x_min) / (x_max − x_min). Preserves the shape of the distribution. Sensitive to outliers since they become the min/max." },
                {
                    type: "code", lang: "text", code: `Example:  income = [20000, 50000, 80000, 100000]
  x_min = 20000,  x_max = 100000
  Scaled:  [0.0,   0.375,  0.75,   1.0  ]`
                },

                { type: "h3", text: "Standardization (Z-score Scaling)" },
                { type: "p", text: "Centers each feature to mean=0, std=1. Formula: x_scaled = (x − μ) / σ. Does NOT bound values to any range. More robust to outliers than Min-Max. Works better when data is approximately Gaussian. Preferred for linear models, SVM, neural networks, PCA." },
                {
                    type: "code", lang: "text", code: `Example:  income = [20000, 50000, 80000, 100000]
  μ = 62500,  σ = 31374
  Scaled:  [-1.35,  -0.40,   0.56,   1.19 ]`
                },

                {
                    type: "code", lang: "python", code: `from sklearn.preprocessing import MinMaxScaler, StandardScaler, RobustScaler

X_train = [[25, 50000], [35, 80000], [40, 120000]]
X_test  = [[28, 65000]]

# ── Min-Max Scaling
minmax = MinMaxScaler()
X_train_mm = minmax.fit_transform(X_train)   # fit + transform on train
X_test_mm  = minmax.transform(X_test)         # only transform on test

# ── Standardization
std = StandardScaler()
X_train_std = std.fit_transform(X_train)
X_test_std  = std.transform(X_test)

# ── Robust Scaler (uses IQR → less sensitive to outliers)
robust = RobustScaler()
X_train_rob = robust.fit_transform(X_train)

# Decision guide:
# - Linear/Logistic Regression, SVM, Neural Networks → StandardScaler
# - KNN, K-Means, PCA                               → StandardScaler
# - Outliers present                                  → RobustScaler
# - Image pixel values (0-255)                       → MinMaxScaler (→ 0-1)
# - Tree-based models (RF, XGBoost)                  → No scaling needed`
                },

                { type: "h2", text: "Encoding Categorical Variables" },
                { type: "p", text: "ML algorithms operate on numbers. Categories like 'red', 'blue', 'green' or 'Cairo', 'Alex', 'Giza' must be converted to numeric representations. The choice of encoding matters for both correctness and model performance." },

                { type: "h3", text: "Ordinal Encoding" },
                { type: "p", text: "Assign integers to categories: 'Low'→0, 'Medium'→1, 'High'→2. Only valid when there is a meaningful ORDER between categories. Never apply to nominal (unordered) categories like city names — it implies Cairo(0) < Alex(1) < Giza(2) which is nonsensical." },

                { type: "h3", text: "One-Hot Encoding (OHE)" },
                { type: "p", text: "Create one binary column per category. 'City' with values {Cairo, Alex, Giza} becomes three columns: is_Cairo, is_Alex, is_Giza. A row for Cairo gets [1, 0, 0]. Correct for nominal categories. Can cause high dimensionality (curse of dimensionality) when there are many unique values (high cardinality)." },
                {
                    type: "code", lang: "text", code: `Original:  city       After OHE:  city_Cairo  city_Alex  city_Giza
           Cairo                      1           0          0
           Alex                       0           1          0
           Giza                       0           0          1
           Cairo                      1           0          0

Note: Drop one column (drop_first=True) to avoid perfect multicollinearity
(the 'dummy variable trap') in linear models.`
                },

                { type: "h3", text: "Target Encoding (Mean Encoding)" },
                { type: "p", text: "Replace each category with the mean target value for that category. Very effective for high-cardinality categoricals (e.g., 1000 city names). Risk of data leakage: must be computed only on training data with cross-validation smoothing." },
                {
                    type: "code", lang: "python", code: `import pandas as pd
from sklearn.preprocessing import OrdinalEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer

df = pd.DataFrame({
    'education': ['Bachelor', 'Master', 'PhD', 'Bachelor', 'Master'],
    'city':      ['Cairo', 'Alex', 'Giza', 'Giza', 'Cairo'],
    'salary':    [50000, 70000, 90000, 55000, 72000]
})

# ── Ordinal Encoding (education has a meaningful order)
edu_order = [['Bachelor', 'Master', 'PhD']]
oe = OrdinalEncoder(categories=edu_order)
df['education_enc'] = oe.fit_transform(df[['education']])

# ── One-Hot Encoding (city has no natural order)
ohe = OneHotEncoder(drop='first', sparse_output=False)
city_encoded = ohe.fit_transform(df[['city']])
# city_encoded shape: (5, 2) — one column dropped

# ── Using ColumnTransformer to process multiple column types at once
preprocessor = ColumnTransformer(transformers=[
    ('ordinal', OrdinalEncoder(categories=edu_order), ['education']),
    ('onehot',  OneHotEncoder(drop='first'),           ['city']),
], remainder='passthrough')  # keep other columns as-is

X_processed = preprocessor.fit_transform(df.drop('salary', axis=1))`
                },

                { type: "h2", text: "Train / Validation / Test Split" },
                { type: "p", text: "Data must be partitioned into non-overlapping sets. Each set serves a distinct purpose in model development." },
                {
                    type: "table", headers: ["Set", "Purpose", "Size (typical)", "Rule"], rows: [
                        ["Training", "Fit model parameters (weights, thresholds)", "60–80%", "Model sees this repeatedly during training"],
                        ["Validation", "Tune hyperparameters, model selection", "10–20%", "Touch many times; use to compare models"],
                        ["Test", "Final unbiased performance estimate", "10–20%", "Touch ONCE at the very end, never during development"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `from sklearn.model_selection import train_test_split

X, y = ...  # full dataset

# ── Simple 80/20 split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── Three-way split (train / val / test)
X_temp, X_test,  y_temp, y_test  = train_test_split(X, y, test_size=0.10, random_state=42)
X_train, X_val,  y_train, y_val  = train_test_split(X_temp, y_temp, test_size=0.111, random_state=42)
# → 80% train, 10% val, 10% test

# ── Stratified split (preserves class ratios — critical for imbalanced data)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── Time-series: split by time, NEVER shuffle
# (future data must not leak into training)
split_idx = int(len(X) * 0.8)
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]`
                },
                { type: "callout", variant: "tip", text: "For small datasets, skip the validation set and use cross-validation instead. Cross-validation uses all data for both training and validation across multiple folds, giving a more reliable estimate with less data." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
