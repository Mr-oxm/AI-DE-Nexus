"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Brain, FlaskConical, TrendingUp, TrendingDown, GitBranch, BarChart2,
    Scale, Layers, BookOpen, Wrench, Activity, Shuffle,
    Cpu, Network, Boxes, Minimize2, ScanSearch, AlertTriangle,
    PenLine, Zap, Sigma, LayoutGrid
} from "lucide-react";

const mathSections = [
    { title: "Statistics & Probability", slug: "stats-probability", icon: Sigma, color: "#38bdf8" },
    { title: "Linear Algebra", slug: "linear-algebra", icon: LayoutGrid, color: "#c084fc" },
    { title: "Calculus & Optimization", slug: "calculus", icon: TrendingDown, color: "#f43f5e" },
];

const mlSections = [
    { title: "Intro to Machine Learning", slug: "intro", icon: Brain, color: "#a78bfa" },
    { title: "Data Preprocessing", slug: "preprocessing", icon: FlaskConical, color: "#34d399" },
    { title: "Linear Regression", slug: "linear-regression", icon: TrendingUp, color: "#60a5fa" },
    { title: "Decision Trees", slug: "decision-trees", icon: GitBranch, color: "#f59e0b" },
    { title: "Classifier Performance", slug: "performance", icon: BarChart2, color: "#f97316" },
    { title: "Data Imbalance", slug: "imbalance", icon: Scale, color: "#ef4444" },
    { title: "K-Nearest Neighbors", slug: "knn", icon: Layers, color: "#06b6d4" },
    { title: "Rule Learning & Naive Bayes", slug: "naive-bayes", icon: BookOpen, color: "#8b5cf6" },
    { title: "Feature Selection & Engineering", slug: "feature-engineering", icon: Wrench, color: "#10b981" },
    { title: "Logistic Regression", slug: "logistic-regression", icon: Activity, color: "#f43f5e" },
    { title: "Bias, Variance & Cross-Validation", slug: "bias-variance", icon: Shuffle, color: "#eab308" },
    { title: "Support Vector Machines", slug: "svm", icon: Cpu, color: "#3b82f6" },
    { title: "Multi-Class Classification", slug: "multiclass", icon: Network, color: "#d946ef" },
    { title: "Ensemble Learning", slug: "ensemble", icon: Boxes, color: "#f97316" },
    { title: "Dimensionality Reduction", slug: "dimensionality", icon: Minimize2, color: "#06b6d4" },
    { title: "Clustering", slug: "clustering", icon: ScanSearch, color: "#a78bfa" },
    { title: "Anomaly Detection", slug: "anomaly", icon: AlertTriangle, color: "#ef4444" },
    { title: "ML Pipelines & Best Practices", slug: "pipelines", icon: Zap, color: "#34d399" },
    { title: "Neural Networks Intro", slug: "neural-networks", icon: Brain, color: "#f59e0b" },
];

import { DocsSidebar } from "@/app/components/DocsSidebar";

export default function MlLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <DocsSidebar
                basePath="/docs/ml"
                title="ML Knowledge Base"
                groups={[
                    { title: "📐 Math Prerequisites", items: mathSections },
                    { title: "🤖 ML Topics", items: mlSections }
                ]}
            />
            {/* Content */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
