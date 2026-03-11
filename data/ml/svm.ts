import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Support Vector Machines (SVM)",
subtitle: "Maximum-margin classifiers with the kernel trick — elegant mathematics that handles non-linear problems in transformed spaces.",
accent: "#3b82f6",
blocks: [
                { type: "h2", text: "The Maximum Margin Classifier" },
                { type: "p", text: "SVM's core insight: don't just find ANY separating hyperplane — find the one with the MAXIMUM MARGIN. The margin is the distance between the hyperplane and the nearest training points from each class. A larger margin means the classifier is more confident and generalizes better to unseen data." },
                {
                    type: "code", lang: "text", code: `Hyperplane in 2D = a line: w₁x₁ + w₂x₂ + b = 0

  Many planes separate the classes:
                     Class +1   Class -1
    Plane A:    ×    ─────     ●
    Plane B:    ×   ──────     ●    ← wider margin, better!
    
  SVM picks the plane that MAXIMIZES the margin.

  Margin = 2 / ||w||

  The support vectors are the training points closest to the
  hyperplane (sitting exactly on the margin boundaries).
  ALL other training points don't affect the decision boundary!

  Decision function for new point x:
    f(x) = sign(wᵀx + b)
    |wᵀx + b| = confidence (distance from boundary)`
                },

                { type: "h2", text: "Hard-Margin SVM — The Optimization Problem" },
                { type: "p", text: "For linearly separable data, we can require all points to be on the correct side of the margin. This is the hard-margin SVM: find w and b that minimize ||w||² subject to all training points being correctly classified with a margin of at least 1." },
                {
                    type: "code", lang: "text", code: `Hard-Margin SVM (linearly separable data):

  Minimize:    (1/2) ||w||²              (maximize margin = 2/||w||)
  Subject to:  yᵢ(wᵀxᵢ + b) ≥ 1  ∀i   (all correctly classified with margin)

  where yᵢ ∈ {−1, +1} (class labels)

  This is a convex quadratic programming problem
  → exactly one global optimal solution (no local minima).

  The support vectors are points where:
    yᵢ(wᵀxᵢ + b) = 1  (touching the margin boundary)
    
  All other points: yᵢ(wᵀxᵢ + b) > 1  (do NOT affect the solution)`
                },

                { type: "h2", text: "Soft-Margin SVM and the C Parameter" },
                { type: "p", text: "Real data is never perfectly linearly separable. Soft-margin SVM introduces slack variables ξᵢ that allow points to violate the margin (or even be misclassified), paying a penalty proportional to the violation." },
                {
                    type: "code", lang: "text", code: `Soft-Margin SVM:

  Minimize:    (1/2) ||w||² + C · Σᵢ ξᵢ
  Subject to:  yᵢ(wᵀxᵢ + b) ≥ 1 − ξᵢ    (allow margin violations)
               ξᵢ ≥ 0                      (non-negative slack)

  ξᵢ = 0:    point correctly classified with margin
  0<ξᵢ<1:   point correctly classified BUT inside the margin
  ξᵢ = 1:   point exactly on the decision boundary
  ξᵢ > 1:   point misclassified

  C controls the tradeoff:
    Large C:  small penalty for wide margin → allow few violations → harder margin
              → tight margin → risk of overfitting
    Small C:  large penalty for misclassifications → accept many violations → soft margin
              → wide margin → more regularized → better generalization

  C is inversely related to regularization strength:
    C small (e.g., 0.1) → strong regularization, wider margin, more misclassifications
    C large (e.g., 100) → weak regularization, narrow margin, fewer misclassifications`
                },

                { type: "h2", text: "The Kernel Trick — Non-Linear SVM" },
                { type: "p", text: "The kernel trick is one of the most elegant ideas in ML. Many problems are not linearly separable in the original feature space, but WOULD be linearly separable in a higher-dimensional feature space. The kernel trick lets us compute inner products in this high-dimensional space WITHOUT explicitly transforming the data." },
                {
                    type: "code", lang: "text", code: `Kernel Trick Intuition:

  Original problem: classify points arranged in rings
    ● ● ● ○ ○ ● ● ●  (● = class A, ○ = class B)
    Not linearly separable in 2D!

  Map to higher dimension: φ(x₁, x₂) = (x₁, x₂, x₁² + x₂²)
    In 3D, the classes CAN be separated by a plane!

  The kernel function:
    K(x, z) = φ(x)ᵀφ(z)   (inner product in transformed space)
    
    We only need K(·,·), NOT φ(·) explicitly!
    This is important because φ could be infinite-dimensional.

Common Kernels:
  Linear:      K(x,z) = xᵀz              (no transformation)
  Polynomial:  K(x,z) = (γxᵀz + r)^d    (captures polynomial interactions)
  RBF/Gaussian: K(x,z) = exp(−γ||x−z||²) (infinite-dimensional mapping)
  Sigmoid:     K(x,z) = tanh(γxᵀz + r)`
                },

                { type: "h3", text: "RBF Kernel — The Most Common Choice" },
                { type: "p", text: "The Radial Basis Function (RBF) or Gaussian kernel is the default choice for SVM. It can model arbitrarily complex boundaries. The γ (gamma) parameter controls how far the influence of a single training example reaches." },
                {
                    type: "code", lang: "text", code: `RBF Kernel: K(x, z) = exp(−γ||x − z||²)

  γ = 1/(2σ²) where σ is the Gaussian width

  Small γ: large σ → broad Gaussian → each point influences a wide area
           → smoother decision boundary → lower variance → risk of underfitting

  Large γ: small σ → narrow Gaussian → each point influences only its neighborhood
           → jagged decision boundary → higher variance → risk of overfitting

  The RBF SVM has two hyperparameters: C and γ
  → typically tuned together via grid/random search`
                },
                {
                    type: "code", lang: "python", code: `from sklearn.svm import SVC, SVR
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

# ⚠️ SVM is sensitive to feature scale — ALWAYS scale!
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('svm', SVC(
        kernel='rbf',       # 'linear', 'poly', 'rbf', 'sigmoid'
        C=1.0,              # regularization (try: 0.1, 1, 10, 100)
        gamma='scale',      # RBF gamma ('scale', 'auto', or float)
        probability=True,   # enable predict_proba (slower)
        random_state=42
    ))
])

# ── Grid search for C and gamma
param_grid = {
    'svm__C':     [0.1, 1, 10, 100],
    'svm__gamma': [0.001, 0.01, 0.1, 1, 'scale', 'auto']
}
grid = GridSearchCV(pipe, param_grid, cv=5, scoring='f1', n_jobs=-1)
grid.fit(X_train, y_train)
print("Best params:", grid.best_params_)

# ── Linear SVM (faster for large datasets)
from sklearn.svm import LinearSVC
fast_svm = LinearSVC(C=1.0, max_iter=5000)  # much faster than SVC(kernel='linear')

# ── SVM for regression
svr = SVR(kernel='rbf', C=100, gamma=0.1, epsilon=0.1)
svr.fit(X_train, y_train)`
                },

                { type: "h2", text: "Practical Considerations" },
                {
                    type: "table", headers: ["Aspect", "Details"], rows: [
                        ["Scaling", "Mandatory! SVM is not scale-invariant. Always use StandardScaler."],
                        ["Training complexity", "O(n²) to O(n³) with n = training samples. Slow for n > 50,000."],
                        ["Prediction speed", "O(n_sv × d) where n_sv = number of support vectors. Fast for small n_sv."],
                        ["Kernel selection", "Start with RBF. Use linear if n_features > n_samples or text data."],
                        ["C selection", "Small C (0.01–1): if many noisy samples. Large C (10–1000): if data is clean."],
                        ["γ selection", "Small γ (scale/auto): if many features. Large γ: if few features."],
                        ["Imbalance", "Use class_weight='balanced' for imbalanced datasets."],
                    ]
                },
                { type: "callout", variant: "tip", text: "For datasets with more than 10,000 samples, SVM is slow. Consider LinearSVC (LibLinear solver) which is O(n) and much faster, or switch to Gradient Boosting (XGBoost) which often achieves better performance on large tabular datasets." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
