import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Classifier Performance Measures",
subtitle: "Accuracy alone doesn't tell the full story. Learn the full toolkit for evaluating classification models honestly.",
accent: "#f97316",
blocks: [
                { type: "h2", text: "The Confusion Matrix" },
                { type: "p", text: "The confusion matrix is the foundation of all classifier evaluation. For binary classification, it's a 2×2 table showing the four possible outcomes when comparing predicted labels to true labels." },
                {
                    type: "code", lang: "text", code: `Confusion Matrix (binary classification):

                        Predicted
                    Positive    Negative
  Actual  Positive │  TP       │  FN      │
          Negative │  FP       │  TN      │

  TP = True Positive  — predicted Positive, actually Positive (correct)
  TN = True Negative  — predicted Negative, actually Negative (correct)
  FP = False Positive — predicted Positive, actually Negative (Type I error)
  FN = False Negative — predicted Negative, actually Positive (Type II error)

  Example (email spam classifier, 100 emails):
    Actual spam=40, Actual ham=60

    Predicted spam=35: 30 were actual spam (TP), 5 were ham (FP)
    Predicted ham=65:  10 were actual spam (FN), 55 were ham (TN)

              Predicted Spam  Predicted Ham
  Actual Spam      30 (TP)        10 (FN)
  Actual Ham        5 (FP)        55 (TN)`
                },

                { type: "h2", text: "Accuracy" },
                { type: "p", text: "Accuracy is the fraction of correct predictions. Simple to understand, but deeply misleading for imbalanced datasets." },
                {
                    type: "code", lang: "text", code: `Accuracy = (TP + TN) / (TP + TN + FP + FN)

  Example: (30 + 55) / 100 = 85%

  ⚠️ The accuracy trap:
  Dataset: 95% healthy patients, 5% sick patients
  A model that ALWAYS predicts "healthy" gets:
    Accuracy = 95% — looks great!
    But it catches ZERO sick patients.

  When to use accuracy:
    ✓ Classes are balanced (roughly equal samples per class)
    ✓ All errors cost equally
  When NOT to use:
    ✗ Imbalanced classes
    ✗ Different costs for FP vs FN (medical, fraud detection)`
                },

                { type: "h2", text: "Precision" },
                { type: "p", text: "Precision answers: 'Of all the samples we predicted as Positive, how many were actually Positive?' High precision means low false alarm rate. Critical when false positives are costly (e.g., flagging legitimate transactions as fraud)." },
                {
                    type: "code", lang: "text", code: `Precision = TP / (TP + FP)

  Example: 30 / (30 + 5) = 30/35 = 85.7%
  → Of all emails flagged as spam, 85.7% were actually spam.

  Use precision when:
    - False Positives are costly
    - You don't want to annoy users with wrong alarms
    - Example: Spam filter (mislabeling real emails as spam is bad)`
                },

                { type: "h2", text: "Recall (Sensitivity / True Positive Rate)" },
                { type: "p", text: "Recall answers: 'Of all actual Positive samples, how many did we correctly identify?' High recall means low miss rate. Critical when false negatives are costly (e.g., missing a cancer diagnosis)." },
                {
                    type: "code", lang: "text", code: `Recall = TP / (TP + FN)

  Example: 30 / (30 + 10) = 30/40 = 75%
  → Of all actual spam emails, we caught 75% of them.

  Use recall when:
    - False Negatives are costly
    - Missing a true positive is dangerous
    - Examples: Cancer detection, fraud detection on the bank side,
      security threat detection`
                },

                { type: "h2", text: "The Precision-Recall Tradeoff" },
                { type: "p", text: "There's a fundamental tradeoff between precision and recall. Making the model more aggressive (lower threshold for Positive class) catches more true positives (higher recall) but also more false positives (lower precision). You can't simply maximize both simultaneously — the right balance depends on your application." },
                {
                    type: "code", lang: "text", code: `Precision-Recall tradeoff example (spam filter):

  Low threshold (aggressive — flag everything suspicious):
    → Recall=0.95  (miss very few spam)
    → Precision=0.60  (many legitimate emails wrongly flagged)

  High threshold (conservative — only flag obvious spam):
    → Recall=0.50  (miss half the spam)
    → Precision=0.98  (almost no legitimate emails flagged)

  The right balance depends on the application:
    - Medical diagnosis: maximize recall (don't miss sick patients)
    - Email spam: balance (don't annoy users, but catch most spam)
    - Fraud detection: depends on bank's tolerance for FP vs FN cost`
                },

                { type: "h2", text: "F1-Score" },
                { type: "p", text: "The F1-score is the harmonic mean of precision and recall. It gives a single number that balances both. The harmonic mean is preferred over the arithmetic mean because it punishes extreme imbalances (a model with Precision=1.0 and Recall=0.0 has F1=0, not 0.5)." },
                {
                    type: "code", lang: "text", code: `F1 = 2 · (Precision · Recall) / (Precision + Recall)
   = 2·TP / (2·TP + FP + FN)

  Example: 2 · (0.857 · 0.75) / (0.857 + 0.75) = 1.286 / 1.607 = 0.800

  Fβ-score (generalization):
    Fβ = (1 + β²) · (Precision · Recall) / (β²·Precision + Recall)
  
    β = 1  → F1 (equal weight to Precision and Recall)
    β = 2  → F2 (double weight on Recall — for medical diagnosis)
    β = 0.5 → F0.5 (double weight on Precision — for spam filtering)`
                },

                { type: "h2", text: "Specificity and Other Rates" },
                {
                    type: "table", headers: ["Metric", "Formula", "Also Called", "Key Use Case"], rows: [
                        ["Sensitivity / Recall / TPR", "TP/(TP+FN)", "True Positive Rate", "Medical tests — catch all sick"],
                        ["Specificity / TNR", "TN/(TN+FP)", "True Negative Rate", "Rule out disease in healthy"],
                        ["Precision / PPV", "TP/(TP+FP)", "Positive Predictive Value", "Credibility of positive prediction"],
                        ["NPV", "TN/(TN+FN)", "Negative Predictive Value", "Credibility of negative prediction"],
                        ["FPR", "FP/(FP+TN) = 1−Specificity", "False Positive Rate / Fall-out", "ROC curve x-axis"],
                        ["FNR", "FN/(FN+TP) = 1−Recall", "Miss Rate", "Medical: missed diagnoses"],
                        ["MCC", "(TP·TN−FP·FN)/√((TP+FP)(TP+FN)(TN+FP)(TN+FN))", "Matthews Correlation Coefficient", "Imbalanced datasets"],
                    ]
                },

                { type: "h2", text: "ROC Curve and AUC" },
                { type: "p", text: "The ROC (Receiver Operating Characteristic) curve plots True Positive Rate (Recall) vs False Positive Rate at every possible classification threshold. It shows the full tradeoff picture across all operating points, not just one threshold." },
                { type: "p", text: "AUC (Area Under the ROC Curve) is a single number summarizing the entire ROC curve. AUC = probability that a randomly chosen positive example is ranked higher (more confident) than a randomly chosen negative example by the model. AUC = 0.5 is random guessing; AUC = 1.0 is perfect." },
                {
                    type: "code", lang: "text", code: `ROC Curve interpretation:

  Y-axis: TPR = TP/(TP+FN) = Recall (sensitivity)
  X-axis: FPR = FP/(FP+TN) = 1 - Specificity

  Perfect classifier:   → top-left corner (TPR=1, FPR=0)  AUC=1.0
  Random classifier:    → diagonal line                     AUC=0.5
  Terrible classifier:  → bottom-right                      AUC<0.5

  As you lower the classification threshold:
    More predictions are called "Positive"
    → TPR increases (catch more true positives)
    → FPR increases (more false alarms)`
                },
                {
                    type: "code", lang: "python", code: `from sklearn.metrics import (
    confusion_matrix, accuracy_score, precision_score,
    recall_score, f1_score, roc_auc_score, classification_report,
    roc_curve
)
import matplotlib.pyplot as plt

# Predictions
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]  # probability for positive class

# Core metrics
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
print(f"Precision: {precision_score(y_test, y_pred):.4f}")
print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
print(f"F1-Score:  {f1_score(y_test, y_pred):.4f}")
print(f"AUC-ROC:   {roc_auc_score(y_test, y_prob):.4f}")

# Full report per class
print(classification_report(y_test, y_pred))

# ROC curve
fpr, tpr, thresholds = roc_curve(y_test, y_prob)
# plt.plot(fpr, tpr); plt.plot([0,1],[0,1],'--'); plt.show()

# Choose threshold based on business need:
# Find threshold where recall >= 0.90 (catch 90% of positives)
min_recall = 0.90
idx = next(i for i, t in enumerate(tpr) if t >= min_recall)
print(f"Threshold for recall>=0.90: {thresholds[idx]:.3f}")`
                },

                { type: "h2", text: "Multi-Class Evaluation" },
                { type: "p", text: "For multi-class problems (>2 classes), precision, recall, and F1 are computed per class. Then we aggregate using different averaging strategies." },
                {
                    type: "table", headers: ["Averaging", "Description", "When to Use"], rows: [
                        ["macro", "Un-weighted mean of per-class scores", "When all classes are equally important"],
                        ["weighted", "Mean weighted by number of samples per class", "When class frequency matters"],
                        ["micro", "Compute TP/FP/FN globally across all classes", "Multi-label or severe class imbalance"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `from sklearn.metrics import f1_score, precision_score, recall_score

# Multi-class averaging options
print(f1_score(y_test, y_pred, average='macro'))    # unweighted mean
print(f1_score(y_test, y_pred, average='weighted')) # weighted by class size
print(f1_score(y_test, y_pred, average='micro'))    # global TP/FP/FN`
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
