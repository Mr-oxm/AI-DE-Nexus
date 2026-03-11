import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Rule Learning & Naive Bayes",
subtitle: "From propositional logic rules to probabilistic reasoning — interpretable models with elegant mathematical foundations.",
accent: "#8b5cf6",
blocks: [
                { type: "h2", text: "Rule Learning" },
                { type: "p", text: "Rule learning algorithms induce a set of IF-THEN rules from training data. Each rule takes the form: IF (condition₁ AND condition₂ AND ...) THEN class = C. Rules are human-readable and directly applicable in expert systems and compliance-heavy domains." },
                {
                    type: "code", lang: "text", code: `Example rules for loan approval:

  Rule 1: IF income > 60,000 AND credit_score > 700
          THEN loan_approved = True   (covers 45% of positives)

  Rule 2: IF employment = 'permanent' AND debt_ratio < 0.3
          THEN loan_approved = True   (covers additional 30%)

  Default: THEN loan_approved = False  (all remaining cases)

  Rule properties:
    Coverage:  fraction of training examples the rule covers
    Accuracy:  fraction of covered examples that are correctly classified`
                },

                { type: "h3", text: "RIPPER Algorithm" },
                { type: "p", text: "RIPPER (Repeated Incremental Pruning to Produce Error Reduction) is a leading rule learning algorithm. It builds rules greedily then prunes to reduce overfitting, repeating for each class in order of frequency." },
                {
                    type: "code", lang: "text", code: `RIPPER Algorithm Overview:

  1. Sort classes by frequency (minority first)
  2. For each class (except the default/majority):
     a. Grow phase: greedily add conditions that maximize coverage
        while maintaining accuracy on training set
     b. Prune phase: remove conditions that improve performance
        on validation set (avoids overfitting)
     c. Add rule to rule set; remove correctly covered examples
  3. Default rule: predict majority class for all remaining examples
  
  Growing a single rule (greedy):
    while rule doesn't cover 100% of one class:
      add the condition (feature, threshold) that maximizes:
        FOIL gain = p · [log₂(p/(p+n)) − log₂(p₀/(p₀+n₀))]
        p, n = positives/negatives covered AFTER adding condition
        p₀, n₀ = positives/negatives covered BEFORE`
                },

                { type: "h2", text: "Bayes Theorem — The Foundation" },
                { type: "p", text: "Naive Bayes is grounded in Bayes' theorem, one of the most fundamental results in probability theory. It tells us how to update our beliefs (probabilities) when we observe new evidence." },
                {
                    type: "code", lang: "text", code: `Bayes' Theorem:

  P(A | B) = P(B | A) · P(A) / P(B)

  In ML classification context:
  P(Class | Features) = P(Features | Class) · P(Class) / P(Features)

  Where:
    P(Class | Features)  = Posterior — what we want to compute
    P(Features | Class)  = Likelihood — how probable these features given class
    P(Class)             = Prior — baseline probability of each class
    P(Features)          = Evidence — same for all classes, can ignore for comparison

  Classification rule: pick Class that maximizes the Posterior
    ĉ = argmax_c P(c) · P(x₁, x₂, ..., xₚ | c)`
                },

                { type: "h2", text: "The Naive Independence Assumption" },
                { type: "p", text: "The bottleneck of exact Bayes classification is computing P(x₁, x₂, ..., xₚ | c) — the joint likelihood of all features given a class. With p features each having many values, this requires exponentially many parameters. Naive Bayes sidesteps this by assuming all features are conditionally independent given the class." },
                {
                    type: "code", lang: "text", code: `Naive Assumption: features are independent given the class

  P(x₁, x₂, ..., xₚ | c) = P(x₁|c) · P(x₂|c) · ... · P(xₚ|c)
                           = Πⱼ P(xⱼ | c)

  Classification becomes:
    ĉ = argmax_c P(c) · Πⱼ P(xⱼ | c)

  In practice, compute log-probabilities to avoid underflow:
    ĉ = argmax_c [log P(c) + Σⱼ log P(xⱼ | c)]

  The independence assumption is "naive" because it's almost
  never exactly true in real data — yet NB often works surprisingly well.
  The key is getting the RANKING right (which class is most likely),
  not perfect probability calibration.`
                },

                { type: "h2", text: "Types of Naive Bayes Classifiers" },
                {
                    type: "table", headers: ["Variant", "Feature Distribution", "Use Case"], rows: [
                        ["Gaussian NB", "P(xⱼ|c) ~ Normal distribution", "Continuous features (assume Gaussian)"],
                        ["Multinomial NB", "P(xⱼ|c) ~ Multinomial (counts)", "Text classification (word counts)"],
                        ["Bernoulli NB", "P(xⱼ|c) ~ Bernoulli (0/1)", "Text with binary features (word present/absent)"],
                        ["Complement NB", "Estimate complement class probs", "Imbalanced text tasks"],
                    ]
                },

                { type: "h3", text: "Gaussian Naive Bayes — Math" },
                { type: "p", text: "For continuous features, we model P(xⱼ|c) as a Gaussian (Normal) distribution. We estimate the mean μ_jc and variance σ²_jc for each feature j and class c from the training data." },
                {
                    type: "code", lang: "text", code: `Gaussian NB:

  Training: for each class c and each feature j:
    μⱼc = mean of xⱼ for samples in class c
    σ²ⱼc = variance of xⱼ for samples in class c

  Likelihood:
    P(xⱼ | c) = (1 / √(2π σ²ⱼc)) · exp(−(xⱼ − μⱼc)² / (2σ²ⱼc))

  Example: Classifying emails as spam/ham
    age of sender account:
      μ(spam) = 1.2 years,  σ(spam) = 0.5
      μ(ham)  = 4.8 years,  σ(ham)  = 2.1

    For a new email from 0.5 year old account:
      P(0.5 | spam) = Gaussian(0.5; μ=1.2, σ=0.5) = 0.821
      P(0.5 | ham)  = Gaussian(0.5; μ=4.8, σ=2.1) = 0.027`
                },

                { type: "h3", text: "Multinomial Naive Bayes — Text Classification" },
                { type: "p", text: "For text classification, features are typically word counts (or TF-IDF). Multinomial NB models P(word_w | class_c) as the frequency of word w in documents of class c." },
                {
                    type: "code", lang: "text", code: `Multinomial NB for spam classification:

  Training data: 1000 spam emails, 4000 ham emails
  
  P(spam) = 1000/5000 = 0.20
  P(ham)  = 4000/5000 = 0.80

  Word frequencies (simplified):
    P("free"  | spam) = 500/10000 = 0.05
    P("free"  | ham)  = 50/80000  = 0.000625
    P("offer" | spam) = 300/10000 = 0.03
    P("offer" | ham)  = 20/80000  = 0.00025
    P("hello" | spam) = 100/10000 = 0.01
    P("hello" | ham)  = 4000/80000 = 0.05

  New email: "free offer hello"
    Score(spam) = log(0.20) + log(0.05) + log(0.03) + log(0.01)
               = −1.609 + (−2.996) + (−3.507) + (−4.605) = −12.71
    Score(ham)  = log(0.80) + log(0.000625) + log(0.00025) + log(0.05)
               = −0.223 + (−7.378) + (−8.294) + (−2.996) = −18.89
    Prediction: SPAM (higher log-probability)`
                },
                { type: "callout", variant: "warning", text: "Zero probability problem: if a word never appeared in training spam emails, P(word|spam)=0 and the entire product becomes 0. Fix with Laplace smoothing: add 1 to every word count. This ensures no probability is ever exactly zero." },
                {
                    type: "code", lang: "python", code: `from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.pipeline import Pipeline

# ── Gaussian NB for continuous features
gnb = GaussianNB(var_smoothing=1e-9)  # smoothing for numerical stability
gnb.fit(X_train, y_train)

# Access learned parameters per class
print("Class means:", gnb.theta_)      # μ for each feature per class
print("Class variances:", gnb.var_)    # σ² for each feature per class
print("Class priors:", gnb.class_prior_)

# ── Multinomial NB for text data
text_pipeline = Pipeline([
    ('vectorize', TfidfVectorizer(max_features=10000, stop_words='english')),
    ('classifier', MultinomialNB(alpha=1.0))  # alpha=1 is Laplace smoothing
])
text_pipeline.fit(X_text_train, y_train)
predictions = text_pipeline.predict(["win a free prize now!"])

# ── When to use Naive Bayes:
# ✓ Text classification (spam, sentiment, topic classification)
# ✓ Very small datasets (few dozen samples)
# ✓ Real-time prediction needed (extremely fast)
# ✓ When interpretability matters
# ✗ When features are highly correlated (assumption is badly violated)
# ✗ When exact probability calibration is needed`
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
