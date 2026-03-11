import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Feature Selection & Feature Engineering",
subtitle: "The data you give a model matters more than the algorithm. Learn to extract signal and eliminate noise.",
accent: "#10b981",
blocks: [
                { type: "h2", text: "Why Features Matter More Than Algorithms" },
                { type: "p", text: "The famous phrase 'garbage in, garbage out' perfectly describes ML. A simple model trained on excellent, well-engineered features often outperforms a complex model on raw, noisy features. Feature engineering is the art of representing data in a way that makes the underlying pattern as obvious as possible to the learning algorithm." },
                { type: "callout", variant: "important", text: "In many Kaggle competitions and real projects, the winning difference between teams is NOT the algorithm — it's the features. A domain expert who creates clever features will beat a pure ML engineer most of the time." },

                { type: "h2", text: "Feature Selection" },
                { type: "p", text: "Feature selection identifies which features are most useful for prediction and removes irrelevant, redundant, or noisy features. Benefits: reduced overfitting, faster training, better model interpretability, reduced storage and computation." },

                { type: "h3", text: "Filter Methods" },
                { type: "p", text: "Filters evaluate each feature independently of the model, based purely on statistical properties. They are fast but don't account for feature interactions." },
                {
                    type: "table", headers: ["Method", "Measures", "For"], rows: [
                        ["Variance threshold", "Remove low-variance features (near-constant)", "All feature types"],
                        ["Pearson correlation", "Linear correlation with target and among features", "Numeric features, linear relationships"],
                        ["Chi-squared (χ²)", "Statistical dependence between feature and target", "Categorical features"],
                        ["Mutual Information", "Nonlinear dependency between feature and target", "All types, captures non-linear"],
                        ["ANOVA F-test", "Between-class variance vs within-class variance", "Numeric features, classification"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `from sklearn.feature_selection import (
    VarianceThreshold, SelectKBest, chi2,
    mutual_info_classif, f_classif, SelectPercentile
)

# ── Variance threshold: remove near-constant features
vt = VarianceThreshold(threshold=0.01)  # remove if var < 0.01
X_filtered = vt.fit_transform(X)

# ── Chi-squared: select top K features (non-negative features required)
chi2_selector = SelectKBest(chi2, k=10)
X_chi2 = chi2_selector.fit_transform(X, y)
selected_features = chi2_selector.get_support(indices=True)

# ── Mutual Information: works for non-linear dependencies
mi_scores = mutual_info_classif(X, y, random_state=42)
top_features = sorted(range(len(mi_scores)), key=lambda i: mi_scores[i], reverse=True)[:10]

# ── ANOVA F-test
anova_selector = SelectPercentile(f_classif, percentile=50)  # top 50%
X_anova = anova_selector.fit_transform(X, y)`
                },

                { type: "h3", text: "Wrapper Methods" },
                { type: "p", text: "Wrapper methods use the model itself to evaluate subsets of features. They are typically more accurate than filter methods (because they capture feature interactions) but much slower — they train a new model for each feature subset." },
                {
                    type: "code", lang: "python", code: `from sklearn.feature_selection import RFE, RFECV, SequentialFeatureSelector
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

# ── Recursive Feature Elimination (RFE)
# Iteratively removes least important features until k remain
estimator = LogisticRegression(max_iter=1000)
rfe = RFE(estimator=estimator, n_features_to_select=10, step=1)
rfe.fit(X_train, y_train)
print("Selected features:", rfe.support_)
print("Feature rankings:", rfe.ranking_)  # 1 = selected

# ── RFECV: automatically find optimal number of features
rfecv = RFECV(estimator=estimator, cv=5, scoring='accuracy')
rfecv.fit(X_train, y_train)
print(f"Optimal: {rfecv.n_features_} features")

# ── Sequential Forward Selection (greedy)
sfs = SequentialFeatureSelector(
    RandomForestClassifier(n_estimators=100),
    n_features_to_select=10,
    direction='forward',  # 'forward' or 'backward'
    cv=5
)
sfs.fit(X_train, y_train)`
                },

                { type: "h3", text: "Embedded Methods" },
                { type: "p", text: "Embedded methods learn which features are important as part of the model training process itself. They are a natural compromise between filter and wrapper methods." },
                {
                    type: "code", lang: "python", code: `from sklearn.linear_model import Lasso, LassoCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectFromModel
import numpy as np

# ── L1 (Lasso) regularization: drives irrelevant feature weights to zero
lasso = LassoCV(cv=5, random_state=42)
lasso.fit(X_train, y_train)
print("Non-zero features:", np.sum(lasso.coef_ != 0))
important = SelectFromModel(lasso, prefit=True)
X_lasso = important.transform(X_test)

# ── Tree-based feature importance
rf = RandomForestClassifier(n_estimators=500, random_state=42)
rf.fit(X_train, y_train)
importances = rf.feature_importances_

# Permutation importance (more reliable than impurity-based)
from sklearn.inspection import permutation_importance
perm_imp = permutation_importance(rf, X_val, y_val, n_repeats=10, random_state=42)
sorted_idx = perm_imp.importances_mean.argsort()[::-1]`
                },

                { type: "h2", text: "Feature Engineering" },
                { type: "p", text: "Feature engineering creates new features from existing ones to better represent the underlying pattern. It requires domain knowledge and creativity." },

                { type: "h3", text: "Numerical Transformations" },
                {
                    type: "code", lang: "python", code: `import numpy as np
import pandas as pd

df = pd.DataFrame({'income': [1000, 5000, 50000, 200000, 1000000],
                   'age': [20, 25, 35, 50, 65]})

# ── Log transform: compress right-skewed distributions (income, population)
df['log_income'] = np.log1p(df['income'])  # log1p = log(1+x), safe for 0

# ── Polynomial features: capture non-linear relationships
from sklearn.preprocessing import PolynomialFeatures
poly = PolynomialFeatures(degree=2, include_bias=False, interaction_only=False)
# For features [a, b] creates: [a, b, a², ab, b²]
X_poly = poly.fit_transform(X_train)

# ── Binning: convert continuous to categorical
df['age_group'] = pd.cut(df['age'], bins=[0,25,35,50,65,100],
                          labels=['<25','25-35','35-50','50-65','65+'])

# ── Quantile binning (equal-frequency bins)
df['income_quartile'] = pd.qcut(df['income'], q=4, labels=['Q1','Q2','Q3','Q4'])`
                },

                { type: "h3", text: "Interaction Features" },
                {
                    type: "code", lang: "python", code: `# ── Manually create interaction features
df['income_per_age'] = df['income'] / df['age']
df['debt_to_income'] = df['debt'] / df['income']  # domain: DTI ratio

# ── Cross-features for categorical
df['region_category'] = df['region'] + '_' + df['category']

# ── Date-based features (very powerful for time data)
df['date'] = pd.to_datetime(df['date'])
df['year']       = df['date'].dt.year
df['month']      = df['date'].dt.month
df['day_of_week'] = df['date'].dt.dayofweek   # 0=Monday
df['is_weekend'] = df['day_of_week'].isin([5,6]).astype(int)
df['quarter']    = df['date'].dt.quarter
df['days_since_start'] = (df['date'] - df['date'].min()).dt.days`
                },

                { type: "h3", text: "Target Encoding" },
                { type: "p", text: "Replace each category with the mean of the target variable for that category. Powerful for high-cardinality categoricals. Must be done carefully to avoid data leakage." },
                {
                    type: "code", lang: "python", code: `# ── Target encoding with k-fold to prevent leakage
from sklearn.model_selection import KFold

def target_encode_cv(train, target, col, n_folds=5):
    """Encode categorical col using mean target, computed out-of-fold."""
    encoded = train[col].copy().astype(float)
    kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)
    global_mean = target.mean()
    
    for train_idx, val_idx in kf.split(train):
        fold_means = target.iloc[train_idx].groupby(
            train[col].iloc[train_idx]).mean()
        encoded.iloc[val_idx] = train[col].iloc[val_idx].map(fold_means)
    
    encoded.fillna(global_mean, inplace=True)
    return encoded

# For test set: compute encoding from full training set
city_means = y_train.groupby(X_train['city']).mean()
X_test['city_encoded'] = X_test['city'].map(city_means).fillna(city_means.mean())`
                },
                { type: "callout", variant: "tip", text: "Start simple: always try training with just the raw features first. Then add engineered features one by one and validate each on cross-validation. Keep only features that measurably improve performance — unused features add noise and slow inference." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
