import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Introduction to Machine Learning",
subtitle: "Understanding the learning paradigm — how machines learn patterns from data, and why ML works at all.",
accent: "#a78bfa",
blocks: [
                { type: "h2", text: "What Is Machine Learning?" },
                { type: "p", text: "Machine Learning (ML) is a sub-field of Artificial Intelligence where we write programs that learn from experience (data) rather than explicit rules. Instead of telling a computer every step to recognize a cat, we show it thousands of cat pictures and let it discover the distinguishing features itself." },
                { type: "p", text: "Formally, Tom Mitchell (1997) defined it: 'A computer program is said to learn from experience E with respect to some task T and performance measure P, if its performance on T, as measured by P, improves with experience E.' This simple definition captures everything — there must be a task, a way to measure quality, and data to learn from." },
                { type: "callout", variant: "important", text: "ML does NOT find causal relationships — it finds statistical correlations in data. A model predicting rain from barometer readings doesn't 'understand' meteorology; it learned that low pressure correlates with rain." },

                { type: "h2", text: "The Three Paradigms of ML" },
                { type: "p", text: "All of ML fits into three broad paradigms based on what signal is available during training." },
                {
                    type: "table", headers: ["Paradigm", "Training Signal", "Goal", "Examples"], rows: [
                        ["Supervised Learning", "Labeled examples (X, y)", "Learn mapping f: X → y", "Classification, Regression"],
                        ["Unsupervised Learning", "Unlabeled data (X only)", "Discover hidden structure", "Clustering, PCA, Autoencoders"],
                        ["Reinforcement Learning", "Rewards from environment", "Learn policy maximizing reward", "Game playing, Robotics, AlphaGo"],
                    ]
                },
                { type: "p", text: "Semi-supervised learning (few labels + many unlabeled examples) and self-supervised learning (labels derived from the data itself, as in GPT) are increasingly important variants." },

                { type: "h3", text: "Supervised Learning in Detail" },
                { type: "p", text: "Given a dataset D = {(x₁, y₁), (x₂, y₂), ..., (xₙ, yₙ)}, the goal is to learn a function h: X → Y (called a hypothesis) that maps inputs to correct outputs on unseen data. When the output y is a continuous number (house price, temperature) it's Regression. When y is a discrete class label (spam/not-spam, cat/dog/bird) it's Classification." },
                {
                    type: "code", lang: "text", code: `Supervised Learning setup:

  Training data:   X = [x₁, x₂, ..., xₙ]   (features / inputs)
                   y = [y₁, y₂, ..., yₙ]   (labels / targets)

  Goal:  learn h(·) such that h(x_new) ≈ y_new   for UNSEEN examples

  Regression:      y ∈ ℝ    (real-valued output)
  Classification:  y ∈ {0,1,...,K-1}  (discrete class label)`
                },

                { type: "h3", text: "Unsupervised Learning in Detail" },
                { type: "p", text: "No labels are provided. The algorithm must find structure on its own. Clustering algorithms group similar data points. Dimensionality reduction methods (PCA) compress data into fewer dimensions while keeping most information. Density estimation models the probability distribution of the data." },

                { type: "h2", text: "The Machine Learning Workflow" },
                { type: "p", text: "Real ML projects follow a structured pipeline. Jumping straight to modeling without proper data understanding and preprocessing is the most common mistake." },
                {
                    type: "code", lang: "text", code: `ML Project Workflow:

  1. Define the problem
     └── What are we predicting? (task type)
     └── What is success? (metric)
     └── What data do we have access to?

  2. Collect & explore data (EDA)
     └── Distribution of features and target
     └── Missing values, outliers, class balance
     └── Feature correlations

  3. Preprocess & engineer features
     └── Imputation, scaling, encoding
     └── Create new informative features
     └── Train/Validation/Test split

  4. Select & train models
     └── Start simple (baseline)
     └── Iterate toward complexity

  5. Evaluate rigorously
     └── Cross-validation, hold-out test set
     └── Correct metrics for the task

  6. Tune hyperparameters
     └── Grid search, random search, Bayesian opt

  7. Deploy & monitor
     └── Serve predictions in production
     └── Detect data drift and performance decay`
                },

                { type: "h2", text: "Core Terminology" },
                {
                    type: "table", headers: ["Term", "Definition", "Example"], rows: [
                        ["Feature (x)", "An input variable used to make predictions", "age, income, pixel value"],
                        ["Target / Label (y)", "The output we want to predict", "price, class, churn (0/1)"],
                        ["Instance / Sample", "One row of data = one example", "One customer's record"],
                        ["Dataset", "All instances together (n × p matrix)", "10,000 rows × 15 features"],
                        ["Model / Hypothesis (h)", "The learned function mapping X → y", "A trained decision tree"],
                        ["Parameter (θ)", "Internal values the model learns from data", "Weights in linear regression"],
                        ["Hyperparameter", "Settings chosen BEFORE training", "Tree depth, learning rate, K in KNN"],
                        ["Training set", "Data used to fit model parameters", "80% of dataset"],
                        ["Validation set", "Data used to tune hyperparameters", "10% of dataset"],
                        ["Test set", "Final held-out data for unbiased evaluation", "10% of dataset, touched once"],
                        ["Loss / Cost function", "Measures how wrong predictions are", "MSE, Cross-entropy, Hinge loss"],
                        ["Overfitting", "Model memorizes training data, fails on new data", "High train acc, low test acc"],
                        ["Underfitting", "Model too simple, fails even on training data", "Low train acc and low test acc"],
                        ["Generalization", "Ability to perform well on unseen data", "The ultimate goal of ML"],
                        ["Feature vector", "All features for one instance as a vector", "x = [25, 50000, 1, 0, ...]"],
                    ]
                },

                { type: "h2", text: "The Learning Problem — Mathematically" },
                { type: "p", text: "We want to find a hypothesis h from a hypothesis class H that minimizes the expected risk (true generalization error) on the data distribution P(X, Y)." },
                {
                    type: "code", lang: "text", code: `Expected Risk (what we WANT to minimize):
  R(h) = E_{(x,y)~P} [L(h(x), y)]

  where L is the loss function (e.g., squared error, 0-1 loss)

Empirical Risk (what we CAN compute on training data):
  R_emp(h) = (1/n) Σᵢ L(h(xᵢ), yᵢ)

  We minimize empirical risk (ERM) and hope it approximates true risk.
  The gap between R_emp and R is controlled by model complexity.

Regularized Risk (prevents overfitting):
  R_reg(h) = R_emp(h) + λ·Ω(h)

  λ = regularization strength
  Ω(h) = complexity penalty (e.g., sum of squared weights)`
                },
                { type: "callout", variant: "info", text: "The fundamental ML insight (PAC learning): if you have enough training data relative to model complexity, minimizing empirical risk leads to good generalization. More complex models need more data to generalize well." },

                { type: "h2", text: "Types of ML Algorithms — Map" },
                {
                    type: "table", headers: ["Category", "Algorithms", "Best Used When"], rows: [
                        ["Linear Models", "Linear Reg, Logistic Reg, Ridge, Lasso, SVM", "Linear relationships, interpretability needed"],
                        ["Tree-Based", "Decision Tree, Random Forest, Gradient Boosting, XGBoost", "Tabular data, non-linear, mixed types"],
                        ["Kernel Methods", "SVM with RBF, Gaussian Processes", "Non-linear, medium datasets"],
                        ["Probabilistic", "Naive Bayes, Bayesian Networks", "Text classification, small data"],
                        ["Instance-Based", "KNN", "Simple baseline, non-parametric"],
                        ["Ensemble", "Bagging, Boosting, Stacking", "When single model is insufficient"],
                        ["Neural Networks", "MLP, CNN, RNN, Transformer", "Images, text, audio, complex patterns"],
                        ["Clustering", "K-Means, DBSCAN, Hierarchical", "No labels, discover groups"],
                        ["Dimensionality Reduction", "PCA, t-SNE, UMAP, Autoencoders", "High-dimensional data, visualization"],
                    ]
                },

                { type: "h2", text: "When NOT to Use Machine Learning" },
                { type: "p", text: "ML is not always the best tool. Use rule-based systems when: the problem can be solved with simple if-else logic, you need 100% explainability and auditability, you have very little data (< few hundred examples), the relationship is deterministic and known. ML shines when: the rules are too complex for humans to write, the pattern changes over time, you have abundant labeled data, and approximate solutions are acceptable." },
                {
                    type: "callout", variant: "tip", text: "Always establish a baseline before training ML models. A baseline can be: predict always the majority class, predict the mean target value, use simple business rules. If your model can't beat the baseline, something is wrong."
                },

                { type: "h2", text: "Python Quickstart" },
                {
                    type: "code", lang: "python", code: `import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# 1. Load data
data = load_iris()
X, y = data.data, data.target
print(f"Dataset shape: {X.shape}")  # (150, 4)
print(f"Classes: {data.target_names}")  # ['setosa' 'versicolor' 'virginica']

# 2. Split data (stratified to preserve class balance)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. Preprocess: scale features (important for logistic reg, SVM, KNN)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)  # fit on train, transform train
X_test = scaler.transform(X_test)         # transform test (no refit!)

# 4. Train model
model = LogisticRegression(max_iter=200)
model.fit(X_train, y_train)

# 5. Evaluate
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.3f}")
print(classification_report(y_test, y_pred, target_names=data.target_names))`
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
