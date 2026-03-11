import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "K-Nearest Neighbors (KNN)",
subtitle: "The simplest non-parametric algorithm: classify or regress based on the K most similar training samples.",
accent: "#06b6d4",
blocks: [
                { type: "h2", text: "Core Idea" },
                { type: "p", text: "KNN is one of the simplest ML algorithms. It stores all training data and makes predictions by finding the K most similar training samples (neighbors) to a new query point, then aggregating their labels. There is no explicit training phase — prediction IS the computation." },
                { type: "p", text: "KNN is a lazy learner (or instance-based learner): instead of building a model during training, it simply remembers the training data and does all the work at prediction time. This makes training O(1) but prediction O(n) or O(n·d) where n=samples and d=features." },
                {
                    type: "code", lang: "text", code: `KNN Algorithm:

  Training:
    Store all (xᵢ, yᵢ) pairs — that's it.

  Prediction for new point x_query:
    1. Compute distance from x_query to ALL training points
    2. Find K points with smallest distances (K-nearest neighbors)
    3. Aggregation:
       - Classification: majority vote among K neighbors
       - Regression:     average of K neighbors' y values

  Example (K=3, classification):
    Query: [25 years old, 50,000 income]
    3 nearest neighbors: [Class A, Class A, Class B]
    Prediction: Class A (2 votes vs 1)`
                },

                { type: "h2", text: "Distance Metrics" },
                { type: "p", text: "The choice of distance metric fundamentally affects which points are considered 'neighbors'. The right metric depends on the data type and domain knowledge." },
                {
                    type: "table", headers: ["Metric", "Formula", "Best For"], rows: [
                        ["Euclidean (L2)", "√Σ(xᵢ−yᵢ)² — straight-line distance", "Continuous features, normal scale"],
                        ["Manhattan (L1)", "Σ|xᵢ−yᵢ| — city-block distance", "Robust to outliers, high dimensions"],
                        ["Minkowski", "(Σ|xᵢ−yᵢ|ᵖ)^(1/p) — generalization", "p=1 (Manhattan), p=2 (Euclidean)"],
                        ["Cosine", "1 − (x·y)/(||x||·||y||)", "Text/NLP features, direction matters"],
                        ["Hamming", "Fraction of positions that differ", "Binary or categorical features"],
                    ]
                },
                {
                    type: "code", lang: "text", code: `Euclidean Distance Example:
  Point A: age=25, income=50,000
  Point B: age=30, income=80,000
  
  Without scaling:
    d = √((30−25)² + (80000−50000)²) = √(25 + 900,000,000) ≈ 30,000
    → distance dominated by income (larger scale!)
  
  After StandardScaler:
    A_scaled: [−1.0, −0.8]
    B_scaled: [+0.5, +0.7]
    d = √((0.5−(−1.0))² + (0.7−(−0.8))²) = √(2.25 + 2.25) ≈ 2.12
    → both features contribute equally`
                },

                { type: "h2", text: "Choosing K — The Critical Hyperparameter" },
                { type: "p", text: "K is the most important hyperparameter in KNN. It directly controls the bias-variance tradeoff." },
                {
                    type: "comparison",
                    left: {
                        label: "K=1 (very small)",
                        items: [
                            "Low bias — flexible model",
                            "High variance — sensitive to noise",
                            "Decision boundary is jagged/complex",
                            "Overfits to training data",
                            "Accuracy on train = 100% always",
                        ]
                    },
                    right: {
                        label: "K=N (very large)",
                        items: [
                            "High bias — too simple",
                            "Low variance — stable",
                            "Always predicts majority class (useless)",
                            "Extreme underfitting",
                            "Same prediction for every test point",
                        ]
                    }
                },
                { type: "p", text: "The optimal K is typically found via cross-validation. A common heuristic starting point is K = √n (square root of training set size). For binary classification, choose odd K to avoid ties." },
                {
                    type: "code", lang: "python", code: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
import numpy as np

# Find best K via cross-validation
k_values = range(1, 31)
cv_scores = []
for k in k_values:
    knn = KNeighborsClassifier(n_neighbors=k)
    scores = cross_val_score(knn, X_train, y_train, cv=5, scoring='accuracy')
    cv_scores.append(scores.mean())

best_k = k_values[np.argmax(cv_scores)]
print(f"Best K: {best_k}, CV Accuracy: {max(cv_scores):.4f}")

# Train final model
knn = KNeighborsClassifier(
    n_neighbors=best_k,
    metric='euclidean',   # distance metric
    weights='uniform',    # 'uniform' = equal vote; 'distance' = closer = more weight
    p=2                   # Minkowski parameter (2 = Euclidean)
)
knn.fit(X_train, y_train)  # just stores data
print(f"Test Accuracy: {knn.score(X_test, y_test):.4f}")`
                },

                { type: "h2", text: "The Curse of Dimensionality" },
                { type: "p", text: "KNN struggles in high-dimensional spaces due to the 'curse of dimensionality'. In high dimensions, all points become approximately equidistant from each other — the notion of 'nearest neighbor' loses meaning." },
                {
                    type: "code", lang: "text", code: `Curse of Dimensionality Intuition:

  In 1D: To cover 10% of data range, need 10% of the line.
  In 2D: To cover 10% in each dimension, need 10%² = 1% of area.
  In 10D: Need 10%^10 = 0.0000001% of volume — essentially nothing.

  Consequence: In 1000 dimensions with 1000 training samples,
  EVERY training point is roughly the same distance from your query!
  
  The nearest neighbor is barely closer than the farthest neighbor.
  KNN loses discriminative power entirely.

  Solutions:
    - Apply PCA or feature selection first (reduce dimensions)
    - Use domain-specific distance metrics
    - Switch to models that work better in high dimensions (SVM, trees)`
                },

                { type: "h2", text: "KNN for Regression" },
                { type: "p", text: "KNN can also be used for regression. Instead of majority vote, we predict the average y value of the K nearest neighbors. Optionally, weight by inverse distance (closer neighbors have more influence)." },
                {
                    type: "code", lang: "python", code: `from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error

# KNN Regression — predict continuous value
knn_reg = KNeighborsRegressor(
    n_neighbors=5,
    weights='distance',  # closer points contribute more
    metric='euclidean'
)
knn_reg.fit(X_train, y_train)
y_pred = knn_reg.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"RMSE: {rmse:.2f}")`
                },

                { type: "h2", text: "Computational Complexity & Speed-Ups" },
                {
                    type: "table", headers: ["Strategy", "Description", "Speedup"], rows: [
                        ["Brute force", "Compute all n distances at query time", "O(n·d) per query — baseline"],
                        ["KD-Tree", "Binary space partitioning tree for fast lookup", "O(d·log n) for low d"],
                        ["Ball Tree", "Spherical hierarchical partitioning", "Better than KD-tree for high d"],
                        ["Approximate NN (ANNOY, FAISS)", "Trade accuracy for massive speedup", "Used in production recommender systems"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `# Use Ball Tree for faster search in medium dimensions
knn_fast = KNeighborsClassifier(
    n_neighbors=5,
    algorithm='ball_tree',  # 'auto', 'ball_tree', 'kd_tree', 'brute'
    leaf_size=30
)
knn_fast.fit(X_train, y_train)

# When to use KNN:
# ✓ Simple baseline — easy to implement and explain
# ✓ Non-linear decision boundaries without complex models
# ✓ Moderate-sized datasets (< 100K samples) and features (< 50)
# ✓ Anomaly detection (find samples with no close neighbors)
# ✗ Large datasets (prediction is slow)
# ✗ Very high-dimensional data (curse of dimensionality)
# ✗ When inference speed matters in production`
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
