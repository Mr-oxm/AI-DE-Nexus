import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Data Imbalance",
subtitle: "When one class vastly outnumbers another, standard ML models fail silently. Learn how to detect and fix class imbalance.",
accent: "#ef4444",
blocks: [
                { type: "h2", text: "What Is Data Imbalance?" },
                { type: "p", text: "Class imbalance occurs when the number of samples in each class is significantly different. In fraud detection, maybe 0.1% of transactions are fraudulent. In medical diagnostics, 5% of patients might have the rare disease. In churn prediction, maybe 10% of users churn." },
                { type: "p", text: "Standard classifiers trained on imbalanced data tend to predict the majority class for almost everything. This gives high accuracy but zero utility — they completely miss the rare class you actually care about." },
                {
                    type: "code", lang: "text", code: `Example: Fraud Detection (1000 transactions)
  
  Class distribution:
    Non-fraud: 990 (99%)
    Fraud:      10  (1%)

  Naive model — always predict "Not Fraud":
    Accuracy = 990/1000 = 99%  ← looks amazing!
    Recall for Fraud = 0/10 = 0% ← completely useless!

  Imbalance severity:
    Mild:   < 4:1 ratio (common, usually manageable)
    Moderate: 4:1 to 30:1 (need techniques)
    Severe:  > 100:1 (requires aggressive strategies)`
                },

                { type: "h2", text: "Strategies Overview" },
                {
                    type: "table", headers: ["Category", "Technique", "How It Works", "Pros / Cons"], rows: [
                        ["Data-level", "Random Oversampling", "Duplicate minority class samples", "+ Simple; - Overfitting on duplicates"],
                        ["Data-level", "Random Undersampling", "Remove majority class samples", "+ Fast; - Information loss"],
                        ["Data-level", "SMOTE", "Synthesize new minority samples", "+ No exact duplicates; - Can generate noise"],
                        ["Data-level", "ADASYN", "Adaptive SMOTE: more samples near boundary", "+ Focus on hard examples; - More complex"],
                        ["Algorithm-level", "Class weights", "Penalize misclassification of minority more", "+ Simple, no data change; - All models support it"],
                        ["Algorithm-level", "Threshold tuning", "Adjust decision boundary for minority class", "+ Fine-grained control; - Need probability output"],
                        ["Cost-sensitive", "Cost-sensitive learning", "Explicitly specify misclassification costs", "+ Domain-aligned; - Need cost matrix"],
                    ]
                },

                { type: "h2", text: "Oversampling" },
                { type: "h3", text: "Random Oversampling" },
                { type: "p", text: "The simplest approach: randomly duplicate samples from the minority class until classes are balanced. Risk: the model may overfit to the duplicated points, memorizing their exact values." },

                { type: "h3", text: "SMOTE (Synthetic Minority Oversampling Technique)" },
                { type: "p", text: "SMOTE generates new synthetic minority class samples by interpolating between existing ones. For each minority sample, it finds its k nearest neighbors (among minority samples), randomly selects one, and creates a new sample along the line segment connecting them." },
                {
                    type: "code", lang: "text", code: `SMOTE Algorithm:

  For each minority sample xᵢ:
    1. Find k nearest neighbors among minority class
    2. Randomly choose one neighbor xₙ
    3. Generate synthetic sample:
       x_new = xᵢ + λ · (xₙ − xᵢ)   where λ ∈ [0, 1] random

  This creates samples BETWEEN existing minority samples,
  not exact copies.

  Example:
    x₁ = [25, 50000]  (age=25, income=50000)
    x₂ = [30, 60000]  (nearest neighbor)
    λ  = 0.6
    x_new = [25 + 0.6·(30−25), 50000 + 0.6·(60000−50000)]
           = [28, 56000]`
                },
                {
                    type: "code", lang: "python", code: `from imblearn.over_sampling import SMOTE, ADASYN, RandomOverSampler
from imblearn.under_sampling import RandomUnderSampler
from imblearn.combine import SMOTETomek
from collections import Counter

print("Before:", Counter(y_train))  # {0: 990, 1: 10}

# ── SMOTE
smote = SMOTE(sampling_strategy='auto', k_neighbors=5, random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_train, y_train)
print("After SMOTE:", Counter(y_resampled))  # {0: 990, 1: 990}

# ── ADASYN (Adaptive Synthetic Sampling)
# Generates more samples near the decision boundary (harder examples)
adasyn = ADASYN(sampling_strategy='auto', n_neighbors=5, random_state=42)
X_ada, y_ada = adasyn.fit_resample(X_train, y_train)

# ── SMOTETomek (combine oversample minority + undersample majority)
# Removes Tomek links (borderline majority-minority pairs) after SMOTE
smt = SMOTETomek(random_state=42)
X_smt, y_smt = smt.fit_resample(X_train, y_train)

# ⚠️ CRITICAL: Apply resampling ONLY to training set!
# NEVER apply to validation or test set.`
                },

                { type: "h2", text: "Undersampling" },
                { type: "p", text: "Remove majority class samples to balance the dataset. Faster than oversampling (no new data generated), but risks losing useful information. Best for very large datasets where removing some majority samples still leaves plenty." },
                {
                    type: "code", lang: "python", code: `from imblearn.under_sampling import (
    RandomUnderSampler, TomekLinks, NearMiss
)

# Random undersampling
rus = RandomUnderSampler(sampling_strategy=0.5, random_state=42)
# sampling_strategy=0.5 → minority:majority = 1:2 after sampling
X_under, y_under = rus.fit_resample(X_train, y_train)

# Tomek Links: remove majority samples that are borderline 
# (closest neighbor is minority class → ambiguous boundary)
tom = TomekLinks()
X_tom, y_tom = tom.fit_resample(X_train, y_train)

# NearMiss: keep majority samples closest to minority (hardest cases)
nm = NearMiss(version=1)
X_nm, y_nm = nm.fit_resample(X_train, y_train)`
                },

                { type: "h2", text: "Class Weights — Algorithm-Level Solution" },
                { type: "p", text: "Many scikit-learn models support a class_weight parameter. Setting class_weight='balanced' automatically assigns weights inversely proportional to class frequency. This makes the model penalize misclassifying minority class samples more heavily during training, without changing the data at all." },
                {
                    type: "code", lang: "text", code: `class_weight = 'balanced':
  weight(class k) = n_samples / (n_classes · n_samples_of_class_k)

  Example (990 non-fraud, 10 fraud):
    weight(0) = 1000 / (2 × 990) ≈ 0.505 (light weight)
    weight(1) = 1000 / (2 × 10)  = 50.0  (heavy weight)

  A fraud misclassification now costs 50x more than non-fraud.
  The model will try much harder to get frauds right.`
                },
                {
                    type: "code", lang: "python", code: `from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

# Logistic Regression with class weights
lr = LogisticRegression(class_weight='balanced')
lr.fit(X_train, y_train)

# Decision Tree with class weights
dt = DecisionTreeClassifier(class_weight='balanced')

# Random Forest with class weights
rf = RandomForestClassifier(class_weight='balanced', n_estimators=100)

# Custom class weights (if you know misclassification costs)
custom_weights = {0: 1, 1: 50}  # minority class 50x more important
rf_custom = RandomForestClassifier(class_weight=custom_weights)`
                },

                { type: "h2", text: "Threshold Tuning" },
                { type: "p", text: "Most classifiers predict a probability (e.g., P(fraud)=0.15). By default, they classify as Positive if probability > 0.5. You can lower this threshold to catch more positives (higher recall, lower precision). This is especially useful after training — tune the threshold on the validation set." },
                {
                    type: "code", lang: "python", code: `import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score

# Get predicted probabilities
y_prob = model.predict_proba(X_val)[:, 1]

# Try different thresholds
thresholds = np.arange(0.05, 0.95, 0.05)
results = []
for t in thresholds:
    y_pred_t = (y_prob >= t).astype(int)
    results.append({
        'threshold': t,
        'precision': precision_score(y_val, y_pred_t, zero_division=0),
        'recall':    recall_score(y_val, y_pred_t),
        'f1':        f1_score(y_val, y_pred_t, zero_division=0),
    })

# Pick threshold that maximizes F1 (or recall if that's priority)
best = max(results, key=lambda x: x['f1'])
print(f"Best threshold: {best['threshold']}")
print(f"F1={best['f1']:.4f} Precision={best['precision']:.4f} Recall={best['recall']:.4f}")

# Apply chosen threshold to test set
optimal_threshold = best['threshold']
y_pred_final = (model.predict_proba(X_test)[:, 1] >= optimal_threshold).astype(int)`
                },
                { type: "callout", variant: "important", text: "When evaluating models on imbalanced datasets, never use accuracy as your primary metric. Use F1-score, AUC-ROC, or the Matthews Correlation Coefficient (MCC). Better yet, choose metrics aligned with business cost: 'sending 100 fraud alerts per day is acceptable, missing > 5% of fraud is not'." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
