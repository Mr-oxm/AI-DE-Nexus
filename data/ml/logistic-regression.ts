import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Logistic Regression",
subtitle: "The fundamental probabilistic classifier — predicts probabilities using the sigmoid function, with solid mathematical grounding.",
accent: "#f43f5e",
blocks: [
                { type: "h2", text: "From Linear Regression to Classification" },
                { type: "p", text: "Linear regression predicts continuous values. For classification, we need to predict probabilities P(y=1|x) ∈ [0, 1]. The key insight of logistic regression: apply a sigmoid function to the linear combination of features to 'squash' any real-valued output into a probability." },
                {
                    type: "code", lang: "text", code: `Problem with using linear regression for classification:

  Linear model output: ŷ = w₀ + w₁x₁ + ... + wₚxₚ
  Output range: (-∞, +∞) — cannot be a probability!

  Logistic Regression solution:
  Step 1: Compute linear score  z = w₀ + w₁x₁ + ... + wₚxₚ = xᵀw
  Step 2: Apply sigmoid         p = σ(z) = 1 / (1 + e^(−z))
  
  Now p ∈ (0, 1) for any real z.
  Classification rule: predict class 1 if p > 0.5, else class 0`
                },

                { type: "h2", text: "The Sigmoid Function" },
                { type: "p", text: "The sigmoid (logistic) function maps any real number to (0, 1). It has a characteristic S-shape. Its key properties make it ideal for probability outputs." },
                {
                    type: "code", lang: "text", code: `Sigmoid Function:

  σ(z) = 1 / (1 + e^(−z))

  Properties:
    σ(0)   = 0.5    → no evidence either way
    σ(+∞)  → 1.0   → very strong evidence for class 1
    σ(−∞)  → 0.0   → very strong evidence for class 0
    σ'(z)  = σ(z)·(1 − σ(z))  (derivative — useful in backpropagation)
    
    z > 0 → p > 0.5 → predict class 1
    z < 0 → p < 0.5 → predict class 0
    z = 0 → p = 0.5 → decision boundary

  Values:
    z = -4  → σ = 0.018  (98.2% confidence for class 0)
    z = -2  → σ = 0.119
    z =  0  → σ = 0.500  (uncertain)
    z = +2  → σ = 0.881
    z = +4  → σ = 0.982  (98.2% confidence for class 1)`
                },

                { type: "h2", text: "Odds and Log-Odds (Logit)" },
                { type: "p", text: "Understanding the link between the linear part and the sigmoid requires the concept of odds and log-odds. This shows that logistic regression is linear in log-odds space." },
                {
                    type: "code", lang: "text", code: `Odds: ratio of probability of success to failure
  Odds = p / (1 − p)
  
  If p = 0.80 → Odds = 0.80/0.20 = 4  (4:1 in favor)
  If p = 0.50 → Odds = 1.0
  If p = 0.25 → Odds = 0.333

Log-Odds (Logit):
  logit(p) = log(p / (1−p)) = log(Odds)
  
  The logit maps (0,1) → (−∞, +∞)
  It is the INVERSE of the sigmoid: logit(σ(z)) = z

Logistic Regression:
  log(p / (1−p)) = w₀ + w₁x₁ + ... + wₚxₚ
  
  Interpretation of coefficient w₁:
    Increasing x₁ by 1 unit multiplies the odds by e^(w₁)
    e.g., w₁=0.5 → one unit increase multiplies odds by e^0.5 ≈ 1.65`
                },

                { type: "h2", text: "Training: Maximum Likelihood Estimation" },
                { type: "p", text: "We train logistic regression by finding weights w that maximize the likelihood of observing the training data. This is equivalent to minimizing the binary cross-entropy (log-loss)." },
                {
                    type: "code", lang: "text", code: `Log-Likelihood (what we MAXIMIZE):

  L(w) = Σᵢ [ yᵢ·log(p̂ᵢ) + (1−yᵢ)·log(1−p̂ᵢ) ]

  where p̂ᵢ = σ(xᵢᵀw) = predicted probability for sample i

  Binary Cross-Entropy Loss (what we MINIMIZE = −L/n):

  BCE(w) = − (1/n) Σᵢ [ yᵢ·log(p̂ᵢ) + (1−yᵢ)·log(1−p̂ᵢ) ]

  Intuition:
    - If yᵢ=1 and p̂ᵢ→1 → log(p̂ᵢ)→0 → low loss (good prediction)
    - If yᵢ=1 and p̂ᵢ→0 → log(p̂ᵢ)→-∞ → high loss (terrible prediction)
    - Symmetric for yᵢ=0

  No closed-form solution (unlike linear regression)
  → Use iterative optimization: gradient descent or Newton's method`
                },

                { type: "h2", text: "Regularization" },
                { type: "p", text: "Like linear regression, logistic regression can overfit with many features. Regularization adds a penalty to the loss function." },
                {
                    type: "table", headers: ["Penalty", "Loss", "Effect", "Parameter in sklearn"], rows: [
                        ["L2 (Ridge)", "BCE + λ·Σwⱼ²", "Shrinks all weights; keeps all features", "penalty='l2', C=1/λ"],
                        ["L1 (Lasso)", "BCE + λ·Σ|wⱼ|", "Drives some weights to zero (feature selection)", "penalty='l1', C=1/λ"],
                        ["Elastic Net", "BCE + α||w||₁ + β||w||₂", "Combination", "penalty='elasticnet'"],
                        ["None", "BCE only", "No regularization (risk of overfit)", "penalty=None"],
                    ]
                },
                { type: "p", text: "Note: sklearn uses C = 1/λ — smaller C means stronger regularization (the opposite of λ intuition). So C=0.001 → strong regularization, C=1000 → weak regularization." },

                { type: "h2", text: "Decision Boundary" },
                { type: "p", text: "The decision boundary is the set of points where p = 0.5, i.e., where z = xᵀw = 0. For logistic regression, this boundary is always a linear hyperplane in feature space. This is why logistic regression cannot model non-linear boundaries without feature engineering." },
                {
                    type: "code", lang: "text", code: `Decision boundary for 2 features:

  z = w₀ + w₁x₁ + w₂x₂ = 0
  → x₂ = −(w₀ + w₁x₁) / w₂   (a straight line in 2D!)

  For non-linear boundaries, add polynomial features:
  Original: x₁, x₂
  Extended: x₁, x₂, x₁², x₁x₂, x₂²

  Now the boundary log regression learns is:
  w₀ + w₁x₁ + w₂x₂ + w₃x₁² + w₄x₁x₂ + w₅x₂² = 0
  → A curved boundary in original feature space (e.g., circle, ellipse)`
                },
                {
                    type: "code", lang: "python", code: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# ── Basic logistic regression (always scale features!)
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', LogisticRegression(
        penalty='l2',       # regularization type: 'l1', 'l2', 'elasticnet', None
        C=1.0,              # inverse regularization strength (larger=less reg)
        solver='lbfgs',     # optimization algorithm (lbfgs: default, liblinear: l1)
        max_iter=1000,      # max iterations for convergence
        random_state=42
    ))
])
pipe.fit(X_train, y_train)

# ── Predictions
y_pred = pipe.predict(X_test)              # class labels
y_prob = pipe.predict_proba(X_test)[:, 1] # probability for class 1

print(classification_report(y_test, y_pred))
print(f"AUC: {roc_auc_score(y_test, y_prob):.4f}")

# ── Interpret coefficients (weights after scaling!)
lr_model = pipe.named_steps['clf']
coef_df = pd.DataFrame({
    'feature': feature_names,
    'coefficient': lr_model.coef_[0],
    'odds_ratio': np.exp(lr_model.coef_[0])
}).sort_values('coefficient', ascending=False)
print(coef_df)`
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
