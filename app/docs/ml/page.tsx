import {
    Brain, FlaskConical, TrendingUp, TrendingDown, GitBranch, BarChart2,
    Scale, Layers, BookOpen, Wrench, Activity, Shuffle,
    Cpu, Network, Boxes, Minimize2, ScanSearch, AlertTriangle,
    ArrowRight, Zap, Sigma, LayoutGrid
} from "lucide-react";
import Link from "next/link";

const mathPrereqs = [
    {
        title: "Statistics & Probability",
        slug: "stats-probability",
        icon: Sigma,
        color: "#38bdf8",
        desc: "Mean, median, variance, standard deviation, IQR, Bayes' theorem, normal distribution, CLT — the statistical foundation of all ML.",
    },
    {
        title: "Linear Algebra",
        slug: "linear-algebra",
        icon: LayoutGrid,
        color: "#c084fc",
        desc: "Scalars, vectors, matrices, dot products, matrix multiplication, transpose, inverse, eigenvalues, eigenvectors, SVD — the mathematical language of ML.",
    },
    {
        title: "Calculus & Optimization",
        slug: "calculus",
        icon: TrendingDown,
        color: "#f43f5e",
        desc: "Derivatives, partial derivatives, the chain rule, gradients, Jacobians, and convexity — the engine behind gradient descent and backpropagation.",
    },
];

const sections = [
    {
        title: "Intro to Machine Learning",
        slug: "intro",
        icon: Brain,
        color: "#a78bfa",
        desc: "Types of ML (supervised, unsupervised, RL), general workflow, key terminology, the learning problem formulation.",
    },
    {
        title: "Data Preprocessing",
        slug: "preprocessing",
        icon: FlaskConical,
        color: "#34d399",
        desc: "Handling missing values, feature scaling (min-max, standardization), encoding categoricals, and train/validation/test splitting.",
    },
    {
        title: "Linear Regression",
        slug: "linear-regression",
        icon: TrendingUp,
        color: "#60a5fa",
        desc: "Simple & multiple regression, cost function, OLS, gradient descent intuition, evaluation with MSE, RMSE, MAE, and R².",
    },
    {
        title: "Decision Trees",
        slug: "decision-trees",
        icon: GitBranch,
        color: "#f59e0b",
        desc: "Splitting criteria (Gini, Entropy, info gain), tree growth, overfitting, pre- and post-pruning strategies.",
    },
    {
        title: "Classifier Performance Measures",
        slug: "performance",
        icon: BarChart2,
        color: "#f97316",
        desc: "Confusion matrix, accuracy, precision, recall, F1-score, ROC curve, AUC — and when each metric matters most.",
    },
    {
        title: "Data Imbalance",
        slug: "imbalance",
        icon: Scale,
        color: "#ef4444",
        desc: "Oversampling, undersampling, SMOTE, class weights, threshold tuning — handling skewed class distributions.",
    },
    {
        title: "K-Nearest Neighbors (KNN)",
        slug: "knn",
        icon: Layers,
        color: "#06b6d4",
        desc: "Distance metrics, choosing K, curse of dimensionality, KNN for classification vs regression, scalability.",
    },
    {
        title: "Rule Learning & Naive Bayes",
        slug: "naive-bayes",
        icon: BookOpen,
        color: "#8b5cf6",
        desc: "Propositional rule learning, RIPPER, Bayes theorem, conditional independence assumption, Gaussian & Multinomial NB.",
    },
    {
        title: "Feature Selection & Engineering",
        slug: "feature-engineering",
        icon: Wrench,
        color: "#10b981",
        desc: "Filter, wrapper, embedded methods; mutual information; creating interaction features; polynomial expansion; target encoding.",
    },
    {
        title: "Logistic Regression",
        slug: "logistic-regression",
        icon: Activity,
        color: "#f43f5e",
        desc: "Sigmoid function, odds & log-odds, MLE, regularization (L1/L2), decision boundary, probabilistic interpretation.",
    },
    {
        title: "Bias, Variance & Cross-Validation",
        slug: "bias-variance",
        icon: Shuffle,
        color: "#eab308",
        desc: "Bias-variance tradeoff, underfitting vs overfitting, k-fold CV, stratified CV, learning curves, validation curves.",
    },
    {
        title: "Support Vector Machines",
        slug: "svm",
        icon: Cpu,
        color: "#3b82f6",
        desc: "Maximum margin classifier, support vectors, soft margin (C), kernel trick (RBF, Polynomial), SVM regression.",
    },
    {
        title: "Multi-Class Classification",
        slug: "multiclass",
        icon: Network,
        color: "#d946ef",
        desc: "One-vs-Rest (OvR), One-vs-One (OvO), softmax, multi-label classification, handling ambiguous boundaries.",
    },
    {
        title: "Ensemble Learning",
        slug: "ensemble",
        icon: Boxes,
        color: "#f97316",
        desc: "Bagging, boosting, Random Forests, AdaBoost, Gradient Boosting, XGBoost — combining weak learners into strong models.",
    },
    {
        title: "Dimensionality Reduction",
        slug: "dimensionality",
        icon: Minimize2,
        color: "#06b6d4",
        desc: "PCA intuition, explained variance ratio, eigenvectors, t-SNE, UMAP, feature importance from tree models.",
    },
    {
        title: "Clustering",
        slug: "clustering",
        icon: ScanSearch,
        color: "#a78bfa",
        desc: "K-Means, Elbow method, Silhouette score, Hierarchical clustering, DBSCAN, evaluation of unsupervised models.",
    },
    {
        title: "Anomaly & Outlier Detection",
        slug: "anomaly",
        icon: AlertTriangle,
        color: "#ef4444",
        desc: "Statistical methods, IQR, Z-score, Isolation Forest, Local Outlier Factor, Autoencoder-based detection.",
    },
    {
        title: "ML Pipelines & Best Practices",
        slug: "pipelines",
        icon: Zap,
        color: "#34d399",
        desc: "Scikit-learn Pipeline, ColumnTransformer, GridSearchCV, model versioning, deployment basics, avoiding data leakage.",
    },
    {
        title: "Neural Networks Intro",
        slug: "neural-networks",
        icon: Brain,
        color: "#f59e0b",
        desc: "Perceptron, activation functions (ReLU, sigmoid, tanh), forward pass, backpropagation concept, layers and weights.",
    },
];

import { DocsHome } from "@/app/components/DocsHome";

export default function MlIndexPage() {
    return (
        <DocsHome
            title="ML Knowledge Base"
            description="A structured, theory-first reference for Machine Learning — covering mathematical foundations, intuitions, and practical code examples for every major ML topic."
            basePath="/docs/ml"
            groups={[
                { title: "📐 Math Prerequisites", items: mathPrereqs },
                { title: "🤖 ML Topics", items: sections }
            ]}
        />
    );
}
