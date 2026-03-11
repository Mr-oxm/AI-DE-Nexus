import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Multi-Class Classification",
subtitle: "Extending binary classifiers to K classes — decomposition strategies, native multi-class algorithms, and multi-label settings.",
accent: "#d946ef",
blocks: [
                { type: "h2", text: "Beyond Binary: The Multi-Class Problem" },
                { type: "p", text: "Binary classification predicts between 2 classes. Multi-class (or multinomial) classification predicts one of K > 2 classes. Many real-world problems are multi-class: handwritten digit recognition (10 classes), language identification (100+ languages), product category assignment (1000s of categories)." },
                { type: "p", text: "Some algorithms natively handle multiple classes (decision trees, random forests, naive Bayes, neural networks). Others are inherently binary (standard SVM, logistic regression) and must be extended using decomposition strategies: One-vs-Rest (OvR) or One-vs-One (OvO)." },

                { type: "h2", text: "One-vs-Rest (OvR) — Also Called One-vs-All" },
                { type: "p", text: "Train K binary classifiers, one for each class. Classifier k treats class k as positive and all other classes as negative. At prediction time, run all K classifiers and pick the class whose classifier outputs the highest score (or probability)." },
                {
                    type: "code", lang: "text", code: `OvR for K=3 classes (Dog, Cat, Bird):

  Train 3 binary classifiers:
    h₁: Dog vs {Cat, Bird}   → "Is it a Dog?"
    h₂: Cat vs {Dog, Bird}   → "Is it a Cat?"
    h₃: Bird vs {Dog, Cat}   → "Is it a Bird?"

  Predict for new image x:
    score₁ = h₁.predict_proba(x) = 0.20  (20% confident it's a Dog)
    score₂ = h₂.predict_proba(x) = 0.75  (75% confident it's a Cat)
    score₃ = h₃.predict_proba(x) = 0.10  (10% confident it's a Bird)
    
    Prediction: Cat (highest score)

  Properties:
    Training time: O(K)  — fast, scales well
    Training data imbalance: each classifier has 1 positive class
                             vs (K-1) negative classes → mild imbalance
    Used by default in: LogisticRegression, SVM (LinearSVC)`
                },

                { type: "h2", text: "One-vs-One (OvO)" },
                { type: "p", text: "Train K(K-1)/2 binary classifiers — one for every pair of classes. Each classifier is trained on only the two relevant classes (ignoring all others). At prediction time, run all classifiers and use majority voting." },
                {
                    type: "code", lang: "text", code: `OvO for K=3 classes (Dog, Cat, Bird):

  Train K(K-1)/2 = 3 classifiers:
    h₁₂: Dog vs Cat
    h₁₃: Dog vs Bird
    h₂₃: Cat vs Bird

  Predict for new point x:
    h₁₂(x) → Cat  (1 vote for Cat)
    h₁₃(x) → Bird (1 vote for Bird)
    h₂₃(x) → Cat  (1 vote for Cat)
    
    Votes: Dog=0, Cat=2, Bird=1
    Prediction: Cat (most votes)

  Properties:
    Training time: O(K²) — quadratic! Slow for large K
    Training set per classifier: only 2-class subset → faster per classifier
    Less imbalance per classifier
    Used by default in: SVC (kernel SVM)`
                },

                { type: "h2", text: "OvR vs OvO — Comparison" },
                {
                    type: "table", headers: ["Aspect", "OvR", "OvO"], rows: [
                        ["Number of classifiers", "K", "K(K-1)/2"],
                        ["Training per classifier", "Full n samples (1 vs rest)", "Smaller subset (2 classes only)"],
                        ["Recommendation for SVM", "LinearSVC (fast)", "SVC (works better, multiclass native)"],
                        ["Scalability with K", "Good (linear)", "Poor (quadratic)"],
                        ["Class imbalance", "Yes (1 vs many)", "Less severe"],
                        ["Default in sklearn", "LogisticRegression, LinearSVC", "SVC (kernel)"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `from sklearn.multiclass import OneVsRestClassifier, OneVsOneClassifier
from sklearn.svm import SVC, LinearSVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# ── Logistic Regression already handles multi-class natively
# multi_class='ovr' or 'multinomial' (softmax)
lr = LogisticRegression(multi_class='multinomial', solver='lbfgs', max_iter=1000)
lr.fit(X_train, y_train)
# predict_proba returns probabilities for EACH class
proba = lr.predict_proba(X_test)  # shape: (n_samples, n_classes)

# ── Explicitly use OvR wrapper for any binary classifier
ovr_svm = OneVsRestClassifier(SVC(kernel='rbf', probability=True))
ovr_svm.fit(X_train, y_train)

# ── Explicitly use OvO wrapper
ovo_svm = OneVsOneClassifier(SVC(kernel='rbf'))
ovo_svm.fit(X_train, y_train)

# ── Evaluation
y_pred = lr.predict(X_test)
print(classification_report(y_test, y_pred, target_names=class_names))`
                },

                { type: "h2", text: "Softmax — Native Multi-Class Probability" },
                { type: "p", text: "For neural networks and multinomial logistic regression, the softmax function provides a principled way to output a probability distribution over K classes. It's the multi-class generalization of the sigmoid." },
                {
                    type: "code", lang: "text", code: `Softmax Function:

  Given K raw scores (logits): z₁, z₂, ..., zₖ

  P(y = k | x) = softmax(z)_k = e^(zₖ) / Σⱼ e^(zⱼ)

  Properties:
    All probabilities are positive (e^z > 0 always)
    All probabilities sum to 1 (by normalization)
    Higher zₖ → higher P(class k)
    
  Example (3 classes, logits = [2.0, 1.0, 0.5]):
    exp([2.0, 1.0, 0.5]) = [7.39, 2.72, 1.65]
    total = 11.76
    softmax = [7.39/11.76, 2.72/11.76, 1.65/11.76]
             = [0.628, 0.231, 0.140]
    Prediction: class 0 (62.8% probability)`
                },

                { type: "h2", text: "Multi-Label Classification" },
                { type: "p", text: "Multi-label classification is different from multi-class: each sample can belong to MULTIPLE classes simultaneously. A movie can be both Action AND Comedy AND Drama. An article can be tagged with Python, Machine Learning, AND Data Engineering." },
                {
                    type: "comparison",
                    left: {
                        label: "Multi-Class",
                        items: [
                            "Exactly ONE class per sample",
                            "Classes are mutually exclusive",
                            "Example: digit recognition (one digit per image)",
                            "Predict: single class label",
                            "Output: vector of probabilities summing to 1",
                        ]
                    },
                    right: {
                        label: "Multi-Label",
                        items: [
                            "ZERO or MORE classes per sample",
                            "Classes can co-occur",
                            "Example: movie genres (action AND comedy)",
                            "Predict: set of class labels",
                            "Output: K independent binary predictions",
                        ]
                    }
                },
                {
                    type: "code", lang: "python", code: `from sklearn.multioutput import MultiOutputClassifier
from sklearn.multiclass import OneVsRestClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    hamming_loss, jaccard_score, f1_score, classification_report
)

# y_train shape: (n_samples, n_labels) — each row is a binary vector
# e.g., y = [[1, 0, 1], [0, 1, 1], [1, 1, 0]]
#           action  comedy  drama

# ── Method 1: MultiOutputClassifier (one model per label)
multi_rf = MultiOutputClassifier(RandomForestClassifier(n_estimators=100))
multi_rf.fit(X_train, y_train)  # y must be 2D: (n, n_labels)

# ── Method 2: OvR with binary y columns works too
ovr = OneVsRestClassifier(RandomForestClassifier())
ovr.fit(X_train, y_train)

# ── Multi-label metrics
y_pred = multi_rf.predict(X_test)
y_prob = multi_rf.predict_proba(X_test)  # list of probabilities per label

# Hamming Loss: fraction of labels incorrectly predicted
print(f"Hamming Loss: {hamming_loss(y_test, y_pred):.4f}")  # lower is better

# Jaccard Score (set similarity): |intersection|/|union| per sample
print(f"Jaccard:      {jaccard_score(y_test, y_pred, average='samples'):.4f}")

# Per-label F1
print(f"Micro F1:     {f1_score(y_test, y_pred, average='micro'):.4f}")
print(f"Macro F1:     {f1_score(y_test, y_pred, average='macro'):.4f}")`
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
