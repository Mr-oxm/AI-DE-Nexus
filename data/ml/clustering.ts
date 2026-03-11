import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Unsupervised Learning — Clustering",
subtitle: "Discover hidden structure in unlabeled data — grouping similar observations without any predefined labels.",
accent: "#a78bfa",
blocks: [
                { type: "h2", text: "What Is Clustering?" },
                { type: "p", text: "Clustering is an unsupervised learning task where we group data points into clusters such that points within the same cluster are more similar to each other than to points in other clusters. There are no labels to guide the algorithm — it must discover structure purely from the data itself." },
                { type: "p", text: "Clustering is used for: customer segmentation (find groups for targeted marketing), document/topic grouping, anomaly detection (points that don't fit any cluster), image compression (replace pixels with cluster centers), and data exploration (understand what's in your data before labeling)." },
                { type: "callout", variant: "info", text: "Evaluating clustering is harder than supervised learning because there's no ground truth. Internal metrics measure cluster quality using only the data (cohesion and separation). External metrics compare against known labels if they exist." },

                { type: "h2", text: "K-Means Clustering" },
                { type: "p", text: "K-Means is the most widely used clustering algorithm. It partitions n observations into K clusters by iteratively assigning each point to its nearest centroid and then updating centroids to the mean of their assigned points." },
                {
                    type: "code", lang: "text", code: `K-Means Algorithm (Lloyd's Algorithm):

  Initialize: randomly select K points as initial centroids c₁,...,cₖ

  Repeat until convergence:
    Assignment step: assign each point to nearest centroid
      cluster(xᵢ) = argmin_k distance(xᵢ, cₖ)
    
    Update step: recompute centroids as cluster means
      cₖ = (1/|cluster k|) Σᵢ∈cluster_k xᵢ

  Convergence: when assignments no longer change

  Objective (minimize):
    J = Σₖ Σᵢ∈cluster_k ||xᵢ − cₖ||²   (within-cluster sum of squares — WCSS)

  Notes:
    - Result depends on random initialization!
    - K-Means can get stuck in local optima
    - K-Means++ initialization (sklearn default) greatly improves results
    - Guaranteed to converge, but not to global optimum`
                },

                { type: "h3", text: "Choosing K — The Elbow Method" },
                { type: "p", text: "K is the key hyperparameter. The Elbow method plots WCSS vs K and looks for the point where adding more clusters gives diminishing returns — the 'elbow' in the curve." },
                {
                    type: "code", lang: "python", code: `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np

# ── Elbow Method: find optimal K
wcss = []
k_range = range(2, 15)
for k in k_range:
    km = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
    km.fit(X_scaled)
    wcss.append(km.inertia_)  # WCSS

# Find elbow (where derivative changes most)
# In practice: visually inspect the plot

# ── Silhouette Score (better than elbow!)
sil_scores = []
for k in k_range:
    km = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
    labels = km.fit_predict(X_scaled)
    sil_scores.append(silhouette_score(X_scaled, labels))

best_k = k_range[np.argmax(sil_scores)]
print(f"Best K by silhouette: {best_k}, score: {max(sil_scores):.4f}")

# ── Final model
km = KMeans(n_clusters=best_k, init='k-means++', n_init=10, random_state=42)
labels = km.fit_predict(X_scaled)
centers = km.cluster_centers_   # centroids in feature space

print(f"Cluster sizes: {dict(zip(*np.unique(labels, return_counts=True)))}")`
                },

                { type: "h3", text: "Silhouette Score" },
                { type: "p", text: "The silhouette score measures how similar a point is to its own cluster (cohesion) compared to other clusters (separation). It ranges from -1 to 1." },
                {
                    type: "code", lang: "text", code: `Silhouette Score for one point i:

  a(i) = mean distance from i to all OTHER points in its cluster (cohesion)
  b(i) = min over other clusters of: mean distance from i to that cluster (separation)

  s(i) = (b(i) − a(i)) / max(a(i), b(i))

  s(i) ≈ +1: well-grouped (much closer to own cluster than others)
  s(i) ≈ 0:  on cluster boundary
  s(i) ≈ -1: probably in wrong cluster

  Overall silhouette score = mean s(i) over all points

  Interpretation:
    > 0.7: strong structure
    0.5–0.7: reasonable structure
    0.25–0.5: weak structure
    < 0.25: no substantial structure`
                },

                { type: "h2", text: "DBSCAN (Density-Based Spatial Clustering)" },
                { type: "p", text: "DBSCAN discovers clusters of arbitrary shape based on density. It requires no specification of K. Instead, you specify a neighborhood radius (ε) and minimum density (min_samples). Points in dense regions become clusters; points in sparse regions become noise/outliers." },
                {
                    type: "code", lang: "text", code: `DBSCAN Algorithm:

  Parameters:
    ε (epsilon): neighborhood radius — how far to look for neighbors
    min_samples: minimum points in ε-neighborhood to be a core point

  Point types:
    Core point:    has ≥ min_samples points within distance ε
    Border point:  within ε of a core point, but < min_samples neighbors
    Noise point:   not within ε of any core point → labeled as outlier (-1)

  Algorithm:
    1. Find all core points (high-density regions)
    2. Connect core points within ε of each other (density connectivity)
    3. Each connected component = one cluster
    4. Border points join nearest cluster; noise points get label -1

  Advantages over K-Means:
    ✓ Automatically determines number of clusters
    ✓ Finds arbitrarily shaped clusters (not just spherical)
    ✓ Robust to outliers (classifies them as noise)
    ✓ No assumption about cluster shape`
                },
                {
                    type: "code", lang: "python", code: `from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

# Scale data (DBSCAN uses distances)
X_scaled = StandardScaler().fit_transform(X)

# ── DBSCAN
dbscan = DBSCAN(
    eps=0.5,          # neighborhood radius
    min_samples=5,    # min points for core point
    metric='euclidean'
)
labels = dbscan.fit_predict(X_scaled)

n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise    = np.sum(labels == -1)
print(f"Clusters found: {n_clusters}")
print(f"Noise points:   {n_noise} ({100*n_noise/len(labels):.1f}%)")

# Finding good eps: k-distance plot (use k=min_samples-1)
from sklearn.neighbors import NearestNeighbors
nbrs = NearestNeighbors(n_neighbors=5)
nbrs.fit(X_scaled)
distances, _ = nbrs.kneighbors(X_scaled)
distances = np.sort(distances[:, -1])  # k-th nearest distance for each point
# Plot distances: the 'elbow' suggests a good eps value`
                },

                { type: "h2", text: "Hierarchical Clustering" },
                { type: "p", text: "Hierarchical clustering builds a hierarchy of clusters represented as a dendrogram (tree). Agglomerative (bottom-up): starts with each point as its own cluster and merges the two closest clusters repeatedly. No need to specify K upfront — you can cut the dendrogram at any level." },
                {
                    type: "code", lang: "python", code: `from sklearn.cluster import AgglomerativeClustering

# ── Agglomerative Clustering
agg = AgglomerativeClustering(
    n_clusters=4,           # number of clusters (or use distance_threshold)
    linkage='ward',         # 'ward' (minimize within-cluster variance), 
                            # 'average', 'complete', 'single'
    metric='euclidean'
)
labels = agg.fit_predict(X_scaled)

# Linkage methods:
# 'ward':     minimize variance increase (best for compact clusters)
# 'complete': max distance between points (compact, avoids chaining)
# 'average':  mean distance (moderate)
# 'single':   min distance (prone to chaining — long clusters)`
                },

                { type: "h2", text: "Comparison of Clustering Algorithms" },
                {
                    type: "table", headers: ["Algorithm", "Need K?", "Cluster Shape", "Scales to?", "Handles Noise?"], rows: [
                        ["K-Means", "Yes", "Spherical only", "Very large", "No (all points assigned)"],
                        ["DBSCAN", "No (ε, min_samples)", "Any shape", "Large", "Yes (outlier label)"],
                        ["Hierarchical", "No (cut dendrogram)", "Any shape", "Small/Medium (<10K)", "No"],
                        ["Gaussian Mixture", "Yes", "Elliptical", "Medium", "Soft assignments"],
                    ]
                },
                { type: "callout", variant: "tip", text: "Start with K-Means as a baseline — it's fast and interpretable. If clusters are non-spherical or you need outlier detection, try DBSCAN. For small datasets where you want to explore the hierarchy without committing to K, use hierarchical clustering with a dendrogram." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
