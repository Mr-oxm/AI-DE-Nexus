import { DocSection } from "@/app/components/DocSection";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    const mlSlugs = [
        'anomaly', 'bias-variance', 'clustering', 'decision-trees',
        'dimensionality', 'ensemble', 'feature-engineering', 'imbalance',
        'intro', 'knn', 'linear-algebra', 'linear-regression',
        'logistic-regression', 'multiclass', 'naive-bayes', 'neural-networks',
        'performance', 'pipelines', 'preprocessing', 'stats-probability', 'svm', 'calculus'
    ];
    return mlSlugs.map((slug) => ({ slug }));
}

export default async function MlContentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let data;
    try {
        const mod = await import(`@/data/ml/${slug}`);
        data = mod.data;
    } catch (e) {
        console.error(e);
        notFound();
    }

    return (
        <DocSection
            title={data.title}
            subtitle={data.subtitle}
            accent={data.accent}
            blocks={data.blocks}
        />
    );
}
