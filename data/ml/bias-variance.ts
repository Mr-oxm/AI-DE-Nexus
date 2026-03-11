import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Bias, Variance & Cross-Validation",
subtitle: "The most important theoretical framework in ML — understanding why models fail and how to measure generalization honestly.",
accent: "#eab308",
blocks: [
                { type: "h2", text: "The Bias-Variance Tradeoff" },
                { type: "p", text: "Every machine learning model's error can be decomposed into three parts: bias, variance, and irreducible noise. Understanding this decomposition tells you WHY your model is failing and what to do about it." },
                {
                    type: "code", lang: "text", code: `Expected Test Error Decomposition:

  E[(y − ŷ)²] = Bias² + Variance + Irreducible Noise

  Bias²:            (E[ŷ] − y)²
    → How far the average prediction is from the true value
    → Measures systematic, consistent error
    → Caused by wrong assumptions in the model (too simple)

  Variance:          E[(ŷ − E[ŷ])²]
    → How much predictions vary across different training sets
    → High variance → model is overly sensitive to training data
    → Caused by model being too complex

  Irreducible Noise: σ²
    → Inherent noise in the data that no model can eliminate
    → The floor of achievable error`
                },

                { type: "h2", text: "Underfitting vs Overfitting" },
                {
                    type: "comparison",
                    left: {
                        label: "Underfitting (High Bias)",
                        items: [
                            "Model is too simple for the data",
                            "High training error AND high test error",
                            "Example: linear model on non-linear data",
                            "Fix: more complex model, add features, reduce regularization",
                            "Symptoms: flat learning curve, both errors high",
                        ]
                    },
                    right: {
                        label: "Overfitting (High Variance)",
                        items: [
                            "Model is too complex, memorizes training data",
                            "Low training error BUT high test error",
                            "Example: deep tree with no pruning",
                            "Fix: regularization, more data, simpler model, dropout",
                            "Symptoms: big gap between train and test error",
                        ]
                    }
                },
                {
                    type: "code", lang: "text", code: `Bias-Variance across model complexity:

  Very Simple Model (Low K in KNN, shallow tree):
    Bias:     High  (misses true pattern)
    Variance: Low   (stable across training sets)
    Total Error: High (underfitting)

  Optimal Model:
    Bias:     Medium
    Variance: Medium
    Total Error: Minimum (sweet spot)

  Very Complex Model (K=1 in KNN, very deep tree):
    Bias:     Low   (fits training data perfectly)
    Variance: High  (very sensitive to training data)
    Total Error: High (overfitting)

  Strategies to reduce bias:   Add features, use complex model, train longer
  Strategies to reduce variance: Regularization, more data, ensemble methods, early stopping`
                },

                { type: "h2", text: "How to Diagnose: Learning Curves" },
                { type: "p", text: "A learning curve plots training and validation error as a function of training set size. The shape reveals whether your model is overfitting or underfitting." },
                {
                    type: "code", lang: "text", code: `Learning Curve Patterns:

  HIGH BIAS (Underfitting):
    ┌─────────────────────────────────────────────────┐
    │ Error                                           │
    │   training error  ─────────────────────────     │  (converges high)
    │   validation error ───────────────────────      │  (also high)
    │                                                 │
    │   Both curves plateau at HIGH error             │
    │   Small gap between train and validation        │
    └─────────────────────────────────────────────────┘
    Solution: Use a more complex model / add better features

  HIGH VARIANCE (Overfitting):
    ┌─────────────────────────────────────────────────┐
    │ Error                                           │
    │   validation error ─────────────                │  (high, decreasing)
    │                                                 │
    │   training error    ─────────                   │  (low)
    │                                                 │
    │   Large GAP between train and validation        │
    └─────────────────────────────────────────────────┘
    Solution: More data, regularization, simpler model`
                },
                {
                    type: "code", lang: "python", code: `from sklearn.model_selection import learning_curve
import numpy as np

train_sizes, train_scores, val_scores = learning_curve(
    estimator=model,
    X=X_train,
    y=y_train,
    train_sizes=np.linspace(0.1, 1.0, 10),
    cv=5,
    scoring='accuracy',
    n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
train_std  = train_scores.std(axis=1)
val_mean   = val_scores.mean(axis=1)
val_std    = val_scores.std(axis=1)

# Large gap at right side → high variance (overfitting)
# Both curves plateau low → high bias (underfitting)
print(f"Final train score: {train_mean[-1]:.4f}")
print(f"Final val score:   {val_mean[-1]:.4f}")
print(f"Gap: {train_mean[-1] - val_mean[-1]:.4f}")`
                },

                { type: "h2", text: "Cross-Validation" },
                { type: "p", text: "Cross-validation (CV) is the standard technique for estimating model generalization performance. It partitions the data into multiple folds, trains on some and evaluates on others, cycling through all combinations. This gives a more reliable estimate than a single train/test split." },

                { type: "h3", text: "K-Fold Cross-Validation" },
                {
                    type: "code", lang: "text", code: `K-Fold CV (k=5):

  Full dataset: [─────────────────────────────────────────]
  
  Fold 1:  [TEST  ][─train─────────────────────────────────]
  Fold 2:  [──────][TEST  ][─train──────────────────────────]
  Fold 3:  [──────────────][TEST  ][─train──────────────────]
  Fold 4:  [────────────────────][TEST  ][─train────────────]
  Fold 5:  [──────────────────────────][TEST  ][─train──────]
  
  Each fold: train on 80%, validate on 20%
  Result: 5 validation scores → report mean ± std
  
  k=5 or k=10 is standard.
  k=n (leave-one-out) is the most thorough but very slow.`
                },

                { type: "h3", text: "Stratified K-Fold" },
                { type: "p", text: "Stratified K-Fold preserves the class proportion in each fold. Critical for imbalanced datasets — without stratification, some folds might have no minority class samples." },

                { type: "h3", text: "Other CV Strategies" },
                {
                    type: "table", headers: ["Strategy", "When to Use"], rows: [
                        ["K-Fold", "General purpose, balanced classes"],
                        ["Stratified K-Fold", "Classification with class imbalance"],
                        ["Leave-One-Out (LOO)", "Very small datasets (<100 samples)"],
                        ["Time-Series CV (Walk-Forward)", "Time-series data — future must not leak into training"],
                        ["Group K-Fold", "When samples have groups (e.g., multiple measurements per patient)"],
                        ["Repeated K-Fold", "Extra confidence — repeat CV multiple times with different splits"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `from sklearn.model_selection import (
    cross_val_score, cross_validate,
    KFold, StratifiedKFold, TimeSeriesSplit
)

# ── Basic K-Fold CV
cv_scores = cross_val_score(
    estimator=model,
    X=X_train, y=y_train,
    cv=5,
    scoring='f1'
)
print(f"CV F1: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# ── Stratified K-Fold (better for classification)
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X_train, y_train, cv=skf, scoring='roc_auc')

# ── Multiple metrics at once
results = cross_validate(model, X_train, y_train, cv=5,
    scoring=['accuracy', 'precision', 'recall', 'f1'],
    return_train_score=True
)
for metric in ['accuracy', 'f1']:
    print(f"{metric}: {results['test_'+metric].mean():.4f}")

# ── Time Series Split (walk-forward validation)
tscv = TimeSeriesSplit(n_splits=5)
for train_idx, val_idx in tscv.split(X):
    X_tr, X_v = X[train_idx], X[val_idx]
    y_tr, y_v = y[train_idx], y[val_idx]
    # Always respect temporal order!`
                },

                { type: "h2", text: "Hyperparameter Tuning" },
                {
                    type: "code", lang: "python", code: `from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from scipy.stats import loguniform, randint

# ── Grid Search (exhaustive — good for small search space)
param_grid = {
    'clf__C': [0.001, 0.01, 0.1, 1, 10, 100],
    'clf__penalty': ['l1', 'l2']
}
grid_search = GridSearchCV(
    pipeline, param_grid,
    cv=5, scoring='f1',
    n_jobs=-1, verbose=1
)
grid_search.fit(X_train, y_train)
print("Best params:", grid_search.best_params_)
print("Best CV score:", grid_search.best_score_)

# ── Randomized Search (for large search spaces)
param_dist = {
    'n_estimators': randint(100, 1000),
    'max_depth': randint(3, 20),
    'learning_rate': loguniform(0.001, 0.3),
}
random_search = RandomizedSearchCV(
    model, param_dist,
    n_iter=50, cv=5, scoring='roc_auc',
    random_state=42, n_jobs=-1
)
random_search.fit(X_train, y_train)`
                },
                { type: "callout", variant: "warning", text: "Hyperparameter tuning uses the validation set (through CV). After tuning, evaluate once on the held-out test set. If you tune based on test set performance and then report that score, you're overfitting to the test set — your reported performance will be too optimistic." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
