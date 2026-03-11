import { DocBlock } from "@/app/components/DocSection";

export const data = {
  title: "Linear Regression",
  subtitle: "The simplest and most interpretable ML model — learning a linear relationship between features and a continuous output.",
  accent: "#60a5fa",
  blocks: [
    { type: "h2", text: "The Core Idea" },
    { type: "p", text: "Linear regression models the relationship between input features and a continuous output by finding the best-fitting straight line (or hyperplane in higher dimensions). The model assumes the output is a weighted sum of the inputs plus some noise." },
    { type: "p", text: "Despite its simplicity, linear regression is remarkably powerful and is used as the foundational building block for understanding more complex models. Understanding it deeply — especially gradient descent and the cost function — prepares you for neural networks, logistic regression, and almost everything else in ML." },

    { type: "h2", text: "Simple Linear Regression" },
    { type: "p", text: "With one input feature x, we predict y using a straight line: ŷ = w₀ + w₁·x. Here w₀ is the intercept (bias term) and w₁ is the slope (weight/coefficient). The goal is to find the values of w₀ and w₁ that produce predictions closest to the true y values on the training data." },
    {
      type: "code", lang: "text", code: `Simple Linear Regression:

  ŷ = w₀ + w₁ · x

  where:
    ŷ  = predicted value
    x  = input feature
    w₀ = intercept (bias) — prediction when x = 0
    w₁ = slope — how much ŷ changes per unit change in x

  Example: Predicting house price from size
    ŷ (price in $1000s) = 50 + 0.15 · (area in m²)
    → A 100m² house costs ~65,000$
    → Each additional m² adds $150 to the price`
    },

    { type: "h2", text: "Multiple Linear Regression" },
    { type: "p", text: "With p features, we extend to a hyperplane: ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₚxₚ. We can write this compactly in matrix form as ŷ = Xw using the design matrix X (with a column of 1s for the intercept) and weight vector w." },
    {
      type: "code", lang: "text", code: `Multiple Linear Regression (matrix form):

  ŷ = Xw

  where:
    X ∈ ℝ^(n × (p+1))  — design matrix (n samples, p features + bias column)
    w ∈ ℝ^(p+1)         — weight vector (intercept + p feature weights)
    ŷ ∈ ℝ^n             — predicted outputs for all n samples

  Example: Predicting price from size, rooms, and location_score
    ŷ = w₀ + w₁·size + w₂·rooms + w₃·location_score

  Matrix form (3 samples):
    X = [[1, 80,  2, 7.5],     w = [50,  ]
         [1, 120, 3, 8.0],         [0.15,]
         [1, 60,  2, 6.0]]         [10.0,]
                                    [5.0  ]`
    },

    { type: "h2", text: "The Cost Function: Mean Squared Error" },
    { type: "p", text: "To find the best weights w, we need a way to measure 'how wrong' our predictions are. The most common choice for regression is Mean Squared Error (MSE). We square the errors so: (1) negative and positive errors don't cancel, (2) large errors are penalized more than small ones." },
    {
      type: "code", lang: "text", code: `Mean Squared Error (MSE):

  MSE(w) = (1/n) · Σᵢ (yᵢ − ŷᵢ)²
          = (1/n) · Σᵢ (yᵢ − xᵢᵀw)²
          = (1/n) · ||y − Xw||²

  ||·|| denotes the L2 (Euclidean) norm.

  We want to find:  w* = argmin_w MSE(w)

  This is a convex quadratic function of w —
  it has exactly ONE global minimum (no local minima to get stuck in).`
    },

    { type: "h2", text: "Ordinary Least Squares (Analytical Solution)" },
    { type: "p", text: "For linear regression with MSE loss, there's a closed-form analytical solution called the Normal Equation. Setting the gradient of MSE to zero and solving for w gives us the Ordinary Least Squares (OLS) estimator." },
    {
      type: "code", lang: "text", code: `Normal Equation (OLS):

  ∇_w MSE = -(2/n) Xᵀ(y − Xw) = 0
  → Xᵀy = XᵀXw
  → w* = (XᵀX)⁻¹ Xᵀy

  This gives the EXACT optimal weights in one step.

  Limitation: Computing (XᵀX)⁻¹ costs O(p³) — too slow when p > ~10,000 features.
  Solution for large p: use gradient descent instead.`
    },

    { type: "h2", text: "Gradient Descent — The Iterative Alternative" },
    { type: "p", text: "Gradient descent is an iterative optimization algorithm that takes steps proportional to the negative gradient of the cost function. The gradient points in the direction of steepest ascent; we go in the OPPOSITE direction to find the minimum." },
    {
      type: "code", lang: "text", code: `Gradient Descent Update Rule:

  w ← w − α · ∇_w MSE(w)

  where:
    α = learning rate (step size) — hyperparameter
    ∇_w MSE = -(2/n) Xᵀ(y − Xw)

  Algorithm:
    1. Initialize w randomly (or all zeros)
    2. Compute gradient on training data
    3. Update w using update rule
    4. Repeat until convergence

  Variants:
    Batch GD:   use all n samples per gradient step (slow per step, stable)
    Stochastic GD (SGD): use 1 sample per step (fast but noisy)
    Mini-batch GD: use b samples (~32–512) — best of both worlds`
    },
    {
      type: "code", lang: "python", code: `import numpy as np

# Manual gradient descent for linear regression
def gradient_descent(X, y, lr=0.01, epochs=1000):
    n, p = X.shape
    w = np.zeros(p)  # initialize weights to zero

    for epoch in range(epochs):
        y_pred = X @ w            # matrix multiply: ŷ = Xw
        residuals = y - y_pred    # errors
        gradient = -(2/n) * X.T @ residuals  # ∂MSE/∂w
        w -= lr * gradient        # update step

        if epoch % 100 == 0:
            mse = np.mean(residuals**2)
            print(f"Epoch {epoch}: MSE = {mse:.4f}")
    return w

# Add bias column (column of 1s) to X
X_with_bias = np.column_stack([np.ones(len(X)), X])
w_learned = gradient_descent(X_with_bias, y)`
    },

    { type: "h2", text: "Evaluation Metrics" },
    { type: "p", text: "Regression models are evaluated differently from classifiers. There is no concept of 'accuracy' — instead we measure how close predictions are to true values using various error metrics." },
    {
      type: "table", headers: ["Metric", "Formula", "Intuition", "Range"], rows: [
        ["MAE (Mean Absolute Error)", "(1/n)Σ|yᵢ−ŷᵢ|", "Average absolute prediction error in the target unit", "[0, ∞), 0 = perfect"],
        ["MSE (Mean Squared Error)", "(1/n)Σ(yᵢ−ŷᵢ)²", "Penalizes large errors heavily; in squared target units", "[0, ∞), 0 = perfect"],
        ["RMSE (Root MSE)", "√MSE", "Same unit as target; interpretable as 'average error'", "[0, ∞), 0 = perfect"],
        ["R² (Coefficient of Determination)", "1 − SSres/SStot", "Fraction of variance explained by the model", "(-∞, 1], 1 = perfect"],
        ["Adjusted R²", "1 − (1−R²)(n−1)/(n−p−1)", "R² penalized for number of features; prevents inflation", "Same as R²"],
      ]
    },
    {
      type: "code", lang: "text", code: `R² Intuition:

  SStot = Σ(yᵢ − ȳ)²   — total variance in y (baseline: always predict mean)
  SSres = Σ(yᵢ − ŷᵢ)²  — residual variance (how much model leaves unexplained)

  R² = 1 − SSres/SStot

  R² = 1.0  → perfect fit (model explains 100% of variance)
  R² = 0.0  → model no better than always predicting the mean
  R² < 0    → model WORSE than always predicting the mean (possible!)

  Example: R² = 0.85 means the model explains 85% of the variance in y.`
    },
    {
      type: "code", lang: "python", code: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Inspect learned parameters
print("Intercept (w₀):", model.intercept_)
print("Coefficients:", model.coef_)

# Predict
y_pred = model.predict(X_test)

# Evaluate
mae  = mean_absolute_error(y_test, y_pred)
mse  = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2   = r2_score(y_test, y_pred)

print(f"MAE:  {mae:.2f}")
print(f"RMSE: {rmse:.2f}")
print(f"R²:   {r2:.4f}")`
    },

    { type: "h2", text: "Regularization: Ridge and Lasso" },
    { type: "p", text: "Plain linear regression can overfit when there are many features or features are correlated (multicollinearity). Regularization adds a penalty term to the cost function that keeps weights small, preventing any one feature from dominating." },
    {
      type: "table", headers: ["Method", "Penalty Term", "Effect", "When to Use"], rows: [
        ["Ridge (L2)", "λ Σwᵢ²", "Shrinks all weights toward zero; keeps all features", "Many small effects; correlated features"],
        ["Lasso (L1)", "λ Σ|wᵢ|", "Shrinks weights to exactly zero; automatic feature selection", "Sparse solutions; want to identify most important features"],
        ["Elastic Net", "α·L1 + (1-α)·L2", "Compromise between Ridge and Lasso", "High-dimensional data with correlated features"],
      ]
    },
    {
      type: "code", lang: "python", code: `from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.model_selection import cross_val_score

# Ridge: minimizes MSE + λ·||w||²
ridge = Ridge(alpha=1.0)  # alpha = λ regularization strength
ridge.fit(X_train, y_train)

# Lasso: minimizes MSE + λ·||w||₁
# Features with zero coefficient are effectively excluded
lasso = Lasso(alpha=0.1)
lasso.fit(X_train, y_train)
print("Lasso zero weights:", np.sum(lasso.coef_ == 0))  # count removed features

# Cross-validate to find best alpha
alphas = [0.001, 0.01, 0.1, 1.0, 10.0, 100.0]
for a in alphas:
    scores = cross_val_score(Ridge(alpha=a), X_train, y_train, cv=5, scoring='r2')
    print(f"alpha={a:.3f}  R²: {scores.mean():.4f} ± {scores.std():.4f}")`
    },
    { type: "divider" },

    { type: "h2", text: "What Are Residuals and Why Do They Matter?" },
    { type: "p", text: "A residual is the difference between a true value and your model's prediction: eᵢ = yᵢ - ŷᵢ. Residuals are the leftovers — what the model failed to explain. Analysing residuals is one of the most powerful diagnostic tools in regression." },
    {
      type: "code", lang: "text", code: `Residual = Truth - Prediction
  eᵢ = yᵢ - ŷᵢ

What a good residual plot looks like:
  → Points scattered randomly around zero (no pattern)
  → No funnel shape (equal spread for all predicted values)
  → No curves (the relationship is actually linear)

What bad residual plots reveal:
  Curved pattern → relationship is non-linear, should add polynomial features
  Funnel (widening spread) → Heteroscedasticity, try log-transforming the target
  Clusters → there may be different groups in the data (need segmentation)

In code:
  residuals = y_test - model.predict(X_test)
  plt.scatter(model.predict(X_test), residuals)
  plt.axhline(0, color='red')
  plt.xlabel("Predicted values")
  plt.ylabel("Residuals")
  plt.title("Residual Plot")`
    },

    { type: "h2", text: "The 5 Classical Assumptions of Linear Regression" },
    { type: "p", text: "Linear regression comes with assumptions. Violating them doesn't mean the model is always wrong, but it does mean the interpretation of coefficients and p-values may be unreliable." },
    {
      type: "table", headers: ["Assumption", "What it means", "How to check", "What breaks if violated"], rows: [
        ["Linearity", "The true relationship between X and y is linear", "Scatter plots, residual vs fitted plots", "Systematic bias; model consistently under/over-predicts"],
        ["Independence", "Each observation is independent of the others", "Domain knowledge; Durbin-Watson test for time series", "Standard errors are wrong; confidence intervals invalid"],
        ["Homoscedasticity", "Residuals have constant variance across all fitted values", "Residual plot shows even spread (no funnel)", "OLS is no longer BLUE (Best Linear Unbiased Estimator)"],
        ["Normality of errors", "Residuals are normally distributed", "Q-Q plot, Shapiro-Wilk test", "Hypothesis tests and CIs may be unreliable for small n"],
        ["No multicollinearity", "Features are not highly correlated with each other", "Correlation matrix, VIF (Variance Inflation Factor)", "Coefficients become unstable, hard to interpret, signs flip"],
      ]
    },
    { type: "callout", variant: "tip", text: "The most impactful assumption in practice is No Multicollinearity. If two features are 95% correlated (say, 'house_area_m2' and 'house_area_ft2'), their individual coefficients become meaningless — you can't tell which one is responsible. Always check the correlation matrix and VIF before interpreting coefficients." },

    { type: "h2", text: "Geometric Interpretation of OLS" },
    { type: "p", text: "Here is the deep insight that no one tells beginners: the OLS solution is actually a geometric projection! You are projecting the vector y (ground truth) onto the column space of X (the space of all possible predictions). The closest point in that space is ŷ = Xw*, and the residual vector (y - ŷ) is exactly perpendicular (orthogonal) to every column of X." },
    {
      type: "code", lang: "text", code: `Geometric picture:

  y         = the true target vector in ℝⁿ space (one dimension per sample)
  ŷ = X w*  = the predicted vector — must lie in the column space of X
  e = y - ŷ = residual vector

  OLS finds the projection of y onto col(X):
    ŷ = X (XᵀX)⁻¹ Xᵀ y    ← the Projection Matrix is H = X(XᵀX)⁻¹Xᵀ
    
  The residuals are perpendicular to every feature:
    Xᵀ(y - Xw*) = 0  ← this is exactly the normal equation Xᵀy = XᵀXw*!
    
  Why does perpendicularity minimize error?
    The shortest path from y to any plane is the perpendicular drop.
    That perpendicular point IS the least-squares solution.`
    },

    { type: "h2", text: "Feature Importance in Linear Regression" },
    { type: "p", text: "The raw coefficients of a linear model tell you the effect of a one-unit change in a feature. But raw coefficients are not directly comparable if features are on different scales. To compare importance, you must first standardize the features." },
    {
      type: "code", lang: "python", code: `import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# Scale features first (crucial for coefficient comparison)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)

# Fit ridge regression (regularized, more stable coefficients)
model = Ridge(alpha=1.0)
model.fit(X_scaled, y_train)

# Plot standardized coefficients as feature importance
feature_names = ['size', 'rooms', 'location', 'age', 'floor']
coefs = pd.Series(model.coef_, index=feature_names)

# Sort by absolute magnitude
coefs.abs().sort_values(ascending=True).plot(kind='barh')
plt.title("Feature Importance (Standardized Coefficients)")
plt.xlabel("Coefficient Magnitude (Standardized)")
plt.tight_layout()
plt.show()

# Interpretation:
# The feature with the LARGEST absolute standardized coefficient
# has the MOST influence on the prediction.
# Positive coefficient → increases prediction
# Negative coefficient → decreases prediction`
    },
  ]
} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
