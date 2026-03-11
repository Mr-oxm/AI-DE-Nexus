import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Ensemble Learning",
subtitle: "Combining many weak learners into a single powerful model — Bagging, Boosting, Random Forests, and XGBoost.",
accent: "#f97316",
blocks: [
                { type: "h2", text: "Why Ensemble Methods Work" },
                { type: "p", text: "One fundamental insight from statistics: if you have many independent estimators each making random errors, averaging them cancels out errors. Ensemble methods extend this idea to ML: instead of training one model, train many and combine their predictions." },
                {
                    type: "code", lang: "text", code: `The Wisdom of Crowds (mathematical argument):

  Assume 100 binary classifiers, each with accuracy 70%
  (each makes independent errors with probability 0.30)

  Probability that majority vote is WRONG:
    = P(more than 50 classifiers wrong)
    = Σₖ₌₅₁¹⁰⁰ C(100,k) · 0.30ᵏ · 0.70^(100-k)
    ≈ 0.00034  ← less than 0.04%!

  Individual accuracy: 70%  → Ensemble accuracy: ~99.97%

  Key requirement: classifiers must be DIVERSE (independent errors).
  If all classifiers make the SAME errors, ensemble doesn't help.`
                },

                { type: "h2", text: "Bagging (Bootstrap Aggregating)" },
                { type: "p", text: "Bagging trains multiple models on different random subsets of the training data (with replacement — called bootstrap samples). Each model sees slightly different data, making them diverse. Predictions are combined by averaging (regression) or majority vote (classification)." },
                {
                    type: "code", lang: "text", code: `Bagging Algorithm:

  For b = 1 to B (number of trees/models):
    1. Sample n examples WITH REPLACEMENT from training set
       (bootstrap sample — ~63% unique, 37% duplicates)
    2. Train base learner hₐ on this bootstrap sample
  
  Prediction for new x:
    Classification: majority vote of {h₁(x), h₂(x), ..., hᵦ(x)}
    Regression:     average of {h₁(x), h₂(x), ..., hᵦ(x)}

  Key property: Reduces VARIANCE (not bias)
    - Each model has similar bias to a single model
    - Averaging reduces variance (individual model errors cancel)
    - Best when base learner is a high-variance model (deep trees)`
                },

                { type: "h2", text: "Random Forests" },
                { type: "p", text: "Random Forests extend bagging with an extra source of randomness: at each split, only a random subset of features is considered. This decorrelates the trees further, reducing variance even more. The result is one of the most reliable and widely-used ML algorithms." },
                {
                    type: "code", lang: "text", code: `Random Forest Algorithm:

  For b = 1 to B:
    1. Bootstrap sample from training data
    2. Build decision tree, BUT at each split:
       a. Randomly select m features (out of total p)
       b. Find BEST split among these m features only
          (not all p features, unlike bagging)
    
  Typical values for m:
    Classification: m = √p  (square root of total features)
    Regression:     m = p/3

  Why does feature subsampling help?
    Without it, if one feature is very strong, ALL trees use it
    → trees are correlated → averaging doesn't help much
    With it, trees are forced to explore other features → more diverse`
                },
                {
                    type: "code", lang: "python", code: `from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import numpy as np

# ── Random Forest Classifier
rf = RandomForestClassifier(
    n_estimators=500,    # number of trees (more = better, diminishing returns)
    max_features='sqrt', # features per split: 'sqrt', 'log2', int, float
    max_depth=None,      # None = grow until pure (trees overfit individually - OK!)
    min_samples_leaf=1,  # min samples in leaf
    bootstrap=True,      # use bootstrap samples
    oob_score=True,      # use out-of-bag samples for free validation
    n_jobs=-1,           # use all CPU cores
    random_state=42
)
rf.fit(X_train, y_train)

# OOB score: free validation estimate without separate validation set
# Each tree is evaluated on its ~37% bootstrap-excluded samples
print(f"OOB Score: {rf.oob_score_:.4f}")  # close to CV score

# Feature importances (mean impurity decrease across all trees)
importances = pd.Series(rf.feature_importances_, index=feature_names)
print(importances.sort_values(ascending=False).head(10))`
                },

                { type: "h2", text: "Boosting — Sequential Learning" },
                { type: "p", text: "Boosting trains models sequentially, where each new model focuses on correcting the mistakes of the previous ones. Unlike bagging (parallel, reduces variance), boosting is sequential and reduces both bias AND variance." },
                {
                    type: "code", lang: "text", code: `Boosting Core Idea:

  Iteration 1: Train weak learner h₁ on original data
               Identify misclassified samples
  Iteration 2: Train h₂ with MORE WEIGHT on misclassified samples
               h₂ focuses on the hard examples that h₁ got wrong
  Iteration 3: Train h₃ with focus on what h₂ still gets wrong
  ...
  Final: weighted combination of all weak learners
    H(x) = Σₜ αₜ · hₜ(x)   where αₜ = weight of learner t

  Risk: boosting can overfit if run for too many iterations
  Solution: early stopping based on validation loss`
                },

                { type: "h3", text: "Gradient Boosting — The Modern Standard" },
                { type: "p", text: "Gradient Boosting generalizes boosting to arbitrary differentiable loss functions. Instead of re-weighting samples, each new tree is trained to predict the residual (negative gradient of the loss) from the previous ensemble." },
                {
                    type: "code", lang: "text", code: `Gradient Boosting Algorithm:

  Initialize: F₀(x) = argmin_γ Σᵢ L(yᵢ, γ)  (e.g., predict mean for MSE)

  For m = 1 to M:
    1. Compute pseudo-residuals (negative gradient):
       rᵢ = − [∂L(yᵢ, F(xᵢ)) / ∂F(xᵢ)]   for each sample i
       
       For MSE loss:  rᵢ = yᵢ − F_{m-1}(xᵢ)  (simple residuals)
       For log-loss:  rᵢ = yᵢ − p̂ᵢ           (probability errors)

    2. Fit a tree hₘ to predict these pseudo-residuals
    3. Update: Fₘ(x) = F_{m-1}(x) + η · hₘ(x)
               η = learning rate (shrinkage hyperparameter)`
                },

                { type: "h3", text: "XGBoost — Industry Standard" },
                { type: "p", text: "XGBoost (eXtreme Gradient Boosting) adds several critical improvements over vanilla gradient boosting: second-order Taylor expansion for better optimization, L1/L2 regularization directly in the tree objective, column/row subsampling like Random Forest, and highly optimized parallel computation." },
                {
                    type: "code", lang: "python", code: `import xgboost as xgb
from sklearn.model_selection import cross_val_score

# ── XGBoost Classifier
xgb_model = xgb.XGBClassifier(
    n_estimators=500,      # number of boosting rounds (trees)
    learning_rate=0.05,    # η: shrinkage (0.01–0.3, lower = more trees needed)
    max_depth=6,           # tree depth (3–8 typical)
    min_child_weight=1,    # min sum of instance weights in child node
    subsample=0.8,         # fraction of training samples per tree (row subsampling)
    colsample_bytree=0.8,  # fraction of features per tree (col subsampling)
    reg_alpha=0.0,         # L1 regularization (λ in XGB notation)
    reg_lambda=1.0,        # L2 regularization
    scale_pos_weight=1,    # > 1 for imbalanced data (ratio negative/positive)
    early_stopping_rounds=50,  # stop if val score doesn't improve for 50 rounds
    eval_metric='auc',
    random_state=42,
    n_jobs=-1
)

# With early stopping (needs eval_set)
xgb_model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=100  # print every 100 rounds
)

print(f"Best iteration: {xgb_model.best_iteration}")
print(f"Val AUC: {xgb_model.best_score:.4f}")`
                },

                { type: "h2", text: "Bagging vs Boosting — Key Differences" },
                {
                    type: "table", headers: ["Aspect", "Bagging (Random Forest)", "Boosting (XGBoost)"], rows: [
                        ["Training order", "Parallel (independent trees)", "Sequential (each depends on previous)"],
                        ["Diversity source", "Bootstrap samples + feature subsampling", "Focus on misclassified samples"],
                        ["Error reduction", "Primarily variance", "Both bias and variance"],
                        ["Overfitting risk", "Low (deep trees are OK)", "Higher (needs early stopping)"],
                        ["Hyperparameter sensitivity", "Relatively robust", "More sensitive (learning_rate, n_estimators)"],
                        ["Best use case", "High variance models, noisy data", "When you need highest accuracy"],
                        ["Training speed", "Fast (parallelizable)", "Slower (sequential, but XGB is optimized)"],
                    ]
                },

                { type: "h2", text: "Stacking (Meta-Ensemble)" },
                { type: "p", text: "Stacking trains multiple diverse models (level-0) and then trains a meta-learner (level-1) that learns how to best combine their predictions." },
                {
                    type: "code", lang: "python", code: `from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC

# ── Define base models (should be diverse!)
base_models = [
    ('rf',  RandomForestClassifier(n_estimators=100)),
    ('gb',  GradientBoostingClassifier(n_estimators=100)),
    ('svm', SVC(probability=True)),
]

# ── Meta-learner: learns how to combine base model predictions
stacking = StackingClassifier(
    estimators=base_models,
    final_estimator=LogisticRegression(),  # meta-learner
    cv=5,          # use CV to generate training data for meta-learner
    stack_method='predict_proba',
    n_jobs=-1
)
stacking.fit(X_train, y_train)`
                },
                { type: "callout", variant: "important", text: "Random Forest and XGBoost are the two most important ML algorithms to master for tabular data. In virtually all Kaggle competitions and industry ML projects, one or both are at the core. Only deep learning beats them when you have very large datasets or unstructured data (images/text)." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
