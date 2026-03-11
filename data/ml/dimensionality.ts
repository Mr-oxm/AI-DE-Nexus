import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Dimensionality Reduction",
subtitle: "Compress high-dimensional data into fewer dimensions while preserving the most important structure and variance.",
accent: "#06b6d4",
blocks: [
                { type: "h2", text: "Why Reduce Dimensions?" },
                { type: "p", text: "High-dimensional data is problematic for several reasons: the curse of dimensionality makes distances meaningless, models overfit, computation is expensive, and visualization is impossible. Dimensionality reduction compresses the data into fewer dimensions while preserving as much information as possible." },
                {
                    type: "table", headers: ["Motivation", "Explanation"], rows: [
                        ["Visualization", "Plot and explore data in 2D/3D to find clusters and patterns"],
                        ["Noise removal", "Low-variance dimensions often represent noise"],
                        ["Faster training", "Fewer features → less computation → faster models"],
                        ["Reduce overfitting", "Fewer dimensions = simpler model = better generalization"],
                        ["Feature compression", "Represent images, text as dense low-dimensional vectors"],
                    ]
                },

                { type: "h2", text: "Principal Component Analysis (PCA)" },
                { type: "p", text: "PCA is the most fundamental dimensionality reduction method. It finds a new coordinate system (the principal components) aligned with the directions of maximum variance in the data. Projecting onto the top k principal components gives the k-dimensional representation that preserves the most variance." },
                {
                    type: "code", lang: "text", code: `PCA Core Intuition:

  Original data: 100 features but they're correlated
  PCA finds a rotation of the coordinate axes such that:
    PC1 = direction of maximum variance in the data
    PC2 = direction of maximum variance perpendicular to PC1
    PC3 = direction of maximum variance perpendicular to PC1, PC2
    ...
    PCₚ = direction of least variance

  After transformation:
    - PCs are uncorrelated (orthogonal)
    - First few PCs capture most of the total variance
    - Last few PCs mostly capture noise

  By keeping only the top k principal components,
  we compress p dimensions → k dimensions`
                },

                { type: "h3", text: "PCA Mathematics" },
                { type: "p", text: "PCA is computed via eigendecomposition of the covariance matrix (or equivalently, SVD of the centered data matrix). The eigenvectors are the principal components (directions), and the eigenvalues represent the variance captured by each component." },
                {
                    type: "code", lang: "text", code: `PCA Algorithm:

  1. Center the data: X̃ = X − mean(X)   (subtract column means)
  2. Compute covariance matrix: Σ = (1/n) X̃ᵀX̃   (p × p matrix)
  3. Eigendecomposition: Σ = VΛVᵀ
     V = matrix of eigenvectors (each column = one principal component)
     Λ = diagonal matrix of eigenvalues λ₁ ≥ λ₂ ≥ ... ≥ λₚ
  4. Select top k eigenvectors: Vₖ (p × k matrix)
  5. Project: Z = X̃ · Vₖ   (n × k matrix — the reduced dataset)

  Explained Variance by component k:
    EVR(k) = λₖ / Σⱼ λⱼ

  Cumulative Explained Variance:
    CEVR(k) = Σⱼ₌₁ᵏ λⱼ / Σⱼ λⱼ

  Choose k such that CEVR(k) ≥ 0.95 (commonly: keep 95% of variance)`
                },
                {
                    type: "code", lang: "python", code: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np

# ⚠️ Always scale data before PCA! (PCA is sensitive to scale)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)

# ── PCA to find optimal number of components
pca_full = PCA()  # keep all components
pca_full.fit(X_scaled)

# Explained variance ratio per component
evr = pca_full.explained_variance_ratio_
cevr = np.cumsum(evr)

# Find k for 95% variance retained
k = np.argmax(cevr >= 0.95) + 1
print(f"Components for 95% variance: {k}")
print(f"Variance ratios: {evr[:10]}")  # first 10

# ── Apply PCA with chosen k
pca = PCA(n_components=k)
X_train_pca = pca.fit_transform(X_scaled)
X_test_pca  = pca.transform(scaler.transform(X_test))

print(f"Original shape: {X_scaled.shape}")
print(f"Reduced shape:  {X_train_pca.shape}")  # (n, k)

# ── PCA for visualization (n_components=2 or 3)
pca_2d = PCA(n_components=2)
X_2d = pca_2d.fit_transform(X_scaled)
# scatter plot: plt.scatter(X_2d[:,0], X_2d[:,1], c=y_train)

# ── Examine principal components
print("PC1 loadings (which original features contribute most):")
loading_df = pd.DataFrame(
    pca.components_[:3].T,
    index=feature_names,
    columns=[f'PC{i+1}' for i in range(3)]
)
print(loading_df.abs().sort_values('PC1', ascending=False).head(5))`
                },

                { type: "h2", text: "Explained Variance Ratio — Choosing k" },
                {
                    type: "code", lang: "text", code: `Example: Dataset with 50 features

  Component | Variance Explained | Cumulative
  PC1       | 32.5%              | 32.5%
  PC2       | 18.2%              | 50.7%
  PC3       | 11.4%              | 62.1%
  PC4       | 8.1%               | 70.2%
  PC5       | 5.6%               | 75.8%
  ...
  PC15      | 0.9%               | 95.2%  ← 95% threshold
  ...
  PC50      | 0.01%              | 100.0%

  → Keep 15 components to retain 95% of variance
  → Compressed 50 → 15 features (70% reduction)

  Rules of thumb:
    - Use elbow in scree plot (where variance drops sharply)
    - 95% cumulative variance is a common threshold
    - For visualization: always use k=2 or k=3`
                },

                { type: "h2", text: "Feature Importance from Tree Models" },
                { type: "p", text: "Tree-based models (Random Forest, XGBoost) provide feature importance scores directly — a fast, model-specific alternative to PCA for feature selection (not compression)." },
                {
                    type: "code", lang: "python", code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

rf = RandomForestClassifier(n_estimators=500, random_state=42)
rf.fit(X_train, y_train)

# ── Impurity-based importance (fast, but can be biased toward high-cardinality)
imp_df = pd.DataFrame({
    'feature': feature_names,
    'importance': rf.feature_importances_
}).sort_values('importance', ascending=False)

# ── Permutation importance (more reliable, model-agnostic)
perm = permutation_importance(
    rf, X_val, y_val, n_repeats=10, random_state=42, n_jobs=-1
)
perm_df = pd.DataFrame({
    'feature': feature_names,
    'importance': perm.importances_mean,
    'std': perm.importances_std
}).sort_values('importance', ascending=False)

# Drop unimportant features (importance < threshold)
important_features = perm_df[perm_df['importance'] > 0.001]['feature'].tolist()
X_reduced = X_train[important_features]`
                },

                { type: "h2", text: "t-SNE and UMAP (Non-Linear Visualization)" },
                { type: "p", text: "PCA is linear — it can only capture linear structure. t-SNE and UMAP are non-linear methods that are specifically designed for 2D/3D visualization and can reveal cluster structure that PCA misses." },
                {
                    type: "table", headers: ["Method", "Preserves", "Speed", "Reproducible?", "Use Case"], rows: [
                        ["PCA", "Global variance (linear)", "Very fast", "Yes", "General reduction, preprocessing"],
                        ["t-SNE", "Local neighborhoods", "Slow (O(n²))", "With fixed seed", "Visualization of clusters"],
                        ["UMAP", "Both local and global structure", "Fast", "With seed", "Visualization + feature extraction"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `from sklearn.manifold import TSNE

# t-SNE for 2D visualization
tsne = TSNE(n_components=2, perplexity=30, random_state=42, n_iter=1000)
X_tsne = tsne.fit_transform(X_scaled)  # WARNING: cannot transform new data!

# UMAP (requires: pip install umap-learn)
import umap
umap_model = umap.UMAP(n_components=2, n_neighbors=15, min_dist=0.1, random_state=42)
X_umap = umap_model.fit_transform(X_scaled)
# UMAP CAN transform new data: umap_model.transform(X_new)

# Key notes:
# - t-SNE and UMAP are for VISUALIZATION only
# - Do NOT use them as preprocessing for downstream ML!
# - PCA components CAN be used as features for ML`
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
