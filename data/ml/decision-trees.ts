import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Decision Trees",
subtitle: "A tree-like model that learns a sequence of if-else decisions — interpretable, powerful, and the backbone of ensemble methods.",
accent: "#f59e0b",
blocks: [
                { type: "h2", text: "What Is a Decision Tree?" },
                { type: "p", text: "A decision tree is a hierarchical model that partitions the feature space into regions and assigns a prediction to each region. At each internal node, the tree asks a yes/no question about one feature (e.g., 'Is age > 30?'). Depending on the answer, it follows the left or right branch, continuing until it reaches a leaf node where it makes a final prediction." },
                { type: "p", text: "Decision trees are non-parametric models — they don't assume any functional form. They can model arbitrarily complex boundaries by growing deep enough. They work for both classification (predict class) and regression (predict continuous value)." },
                {
                    type: "code", lang: "text", code: `Example Decision Tree (classifying loan approval):

                   [Income > 50,000?]
                  /                  \\
                Yes                   No
         [Credit > 700?]          → DENIED
         /              \\
       Yes               No
  → APPROVED       [Employed?]
                   /         \\
                Yes            No
           → APPROVED      → DENIED

  Each path from root to leaf = one decision rule.
  A classification tree predicts the majority class in each leaf.
  A regression tree predicts the mean target value in each leaf.`
                },

                { type: "h2", text: "How Trees Are Grown: Recursive Binary Splitting" },
                { type: "p", text: "The tree is built top-down by a greedy algorithm. At each node, we evaluate every possible split (for each feature, every possible threshold) and choose the split that maximizes the reduction in impurity. This continues recursively on each child region." },
                {
                    type: "code", lang: "text", code: `Algorithm (CART — Classification and Regression Trees):

  function BuildTree(dataset D):
    if stopping_criterion(D):    # all same class, depth limit, etc.
      return Leaf(predict(D))
    
    best_split = None
    best_gain  = -∞
    
    for each feature j in features:
      for each threshold t in unique_values(D[:, j]):
        D_left  = {x ∈ D : x[j] ≤ t}
        D_right = {x ∈ D : x[j] > t}
        gain = impurity(D) - weighted_impurity(D_left, D_right)
        if gain > best_gain:
          best_gain  = gain
          best_split = (j, t)
    
    D_left, D_right = split(D, best_split)
    return Node(split=best_split,
                left=BuildTree(D_left),
                right=BuildTree(D_right))`
                },

                { type: "h2", text: "Splitting Criteria for Classification" },
                { type: "p", text: "For classification trees, impurity measures how 'mixed' the classes are in a node. A pure node (all same class) has zero impurity. We want splits that maximize purity in the child nodes." },

                { type: "h3", text: "Gini Impurity" },
                { type: "p", text: "Gini impurity measures the probability of misclassifying a randomly chosen element if it were labeled according to the class distribution in the node. If all samples belong to one class, Gini = 0 (pure). Maximum impurity is 0.5 (binary: 50/50 split)." },
                {
                    type: "code", lang: "text", code: `Gini Impurity:

  Gini(t) = 1 − Σₖ p(k|t)²

  where p(k|t) = proportion of class k samples in node t

  Example (node with 70 positives, 30 negatives):
    p(+) = 0.70,  p(−) = 0.30
    Gini = 1 − (0.70² + 0.30²) = 1 − (0.49 + 0.09) = 0.42

  Example (pure node — all positives):
    p(+) = 1.0,  p(−) = 0.0
    Gini = 1 − (1.0² + 0.0²) = 0.0  ← perfectly pure

  Information Gain (Gini) for split S:
    IG = Gini(parent) − [|D_L|/|D| · Gini(D_L) + |D_R|/|D| · Gini(D_R)]`
                },

                { type: "h3", text: "Entropy and Information Gain" },
                { type: "p", text: "Entropy comes from information theory. It measures the uncertainty or disorder in a node. A node with equal class proportions has maximum entropy; a pure node has zero entropy." },
                {
                    type: "code", lang: "text", code: `Entropy:

  H(t) = − Σₖ p(k|t) · log₂(p(k|t))

  Example (70 positives, 30 negatives):
    H = −(0.70·log₂(0.70) + 0.30·log₂(0.30))
      = −(0.70·(−0.515) + 0.30·(−1.737))
      = −(−0.361 − 0.521) = 0.882 bits

  Pure node: H = 0 bits (log₂(1) = 0)
  50/50 split: H = 1.0 bit (maximum uncertainty for binary)

  Information Gain:
    IG = H(parent) − [|D_L|/|D| · H(D_L) + |D_R|/|D| · H(D_R)]

  Gini vs Entropy: Gini is slightly faster to compute (no log).
  In practice, results are almost identical. CART uses Gini; ID3/C4.5 use Entropy.`
                },

                { type: "h3", text: "Regression Trees: Mean Squared Error" },
                { type: "p", text: "For regression, impurity is measured by MSE. At each node, we compare predictions to the node mean, and the best split minimizes the weighted sum of MSE in the children." },
                {
                    type: "code", lang: "text", code: `Regression Split Criterion:

  MSE(t) = (1/|t|) Σᵢ∈t (yᵢ − ȳₜ)²   where ȳₜ = mean(y in node t)

  Leaf prediction = mean(y in leaf)

  Best split minimizes:
    |D_L|/|D| · MSE(D_L) + |D_R|/|D| · MSE(D_R)`
                },

                { type: "h2", text: "Overfitting in Decision Trees" },
                { type: "p", text: "A decision tree can grow until every training sample is in its own leaf (zero training error). But such a complex tree memorizes the training data completely and fails on new data. This is overfitting — the tree has learned noise instead of signal." },
                {
                    type: "comparison",
                    left: {
                        label: "Overfitting (Deep Tree)",
                        items: [
                            "Zero training error",
                            "Very complex decision boundaries",
                            "Each leaf has 1-2 samples",
                            "High variance — changes with training data",
                            "Poor generalization on test data",
                        ]
                    },
                    right: {
                        label: "Good Fit (Pruned Tree)",
                        items: [
                            "Small training error",
                            "Simple, interpretable boundaries",
                            "Each leaf has many samples",
                            "Low variance — stable across datasets",
                            "Good generalization on test data",
                        ]
                    }
                },

                { type: "h2", text: "Pruning Strategies" },
                { type: "h3", text: "Pre-Pruning (Early Stopping)" },
                { type: "p", text: "Stop growing the tree before it becomes too complex, by imposing constraints during construction." },
                {
                    type: "table", headers: ["Hyperparameter", "Description", "Typical Values"], rows: [
                        ["max_depth", "Maximum depth of the tree", "3–20; start with 3–5"],
                        ["min_samples_split", "Min samples required to split a node", "2–20; higher = simpler tree"],
                        ["min_samples_leaf", "Min samples required in each leaf", "1–20; higher = simpler tree"],
                        ["max_features", "Max features considered at each split", "'sqrt', 'log2', or int"],
                        ["min_impurity_decrease", "Split only if impurity decreases by this much", "0.0–0.1"],
                    ]
                },

                { type: "h3", text: "Post-Pruning (Cost-Complexity Pruning)" },
                { type: "p", text: "Grow the full tree, then prune back subtrees that don't improve generalization. Scikit-learn implements Minimal Cost-Complexity Pruning (also called weakest link pruning). The parameter ccp_alpha controls pruning strength." },
                {
                    type: "code", lang: "python", code: `from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import cross_val_score
import numpy as np

# ── Train with pre-pruning
tree = DecisionTreeClassifier(
    max_depth=5,
    min_samples_split=10,
    min_samples_leaf=5,
    random_state=42
)
tree.fit(X_train, y_train)

# ── Visualize the tree rules
print(export_text(tree, feature_names=feature_names))

# ── Post-pruning: find best ccp_alpha via cross-validation
path = tree.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas = path.ccp_alphas[:-1]  # remove last (single leaf)

cv_scores = []
for alpha in ccp_alphas:
    t = DecisionTreeClassifier(ccp_alpha=alpha, random_state=42)
    scores = cross_val_score(t, X_train, y_train, cv=5)
    cv_scores.append(scores.mean())

best_alpha = ccp_alphas[np.argmax(cv_scores)]
print(f"Best ccp_alpha: {best_alpha:.6f}")

final_tree = DecisionTreeClassifier(ccp_alpha=best_alpha)
final_tree.fit(X_train, y_train)`
                },

                { type: "h2", text: "Feature Importance" },
                { type: "p", text: "Decision trees naturally rank features by how much they reduce impurity when used in splits, summed across all nodes and weighted by the number of samples. This gives us a feature importance score." },
                {
                    type: "code", lang: "python", code: `import pandas as pd
import matplotlib.pyplot as plt

# Feature importance from tree
importances = pd.Series(tree.feature_importances_, index=feature_names)
importances_sorted = importances.sort_values(ascending=False)

print("Feature Importances:")
for feature, imp in importances_sorted.items():
    bar = '█' * int(imp * 50)
    print(f"  {feature:20s} {imp:.4f}  {bar}")`
                },
                { type: "callout", variant: "important", text: "Decision trees are the building block of the most powerful ML algorithms: Random Forests and Gradient Boosting. Understanding trees deeply is prerequisite to understanding ensemble methods." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
