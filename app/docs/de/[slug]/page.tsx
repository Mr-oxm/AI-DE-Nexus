import { DocSection } from "@/app/components/DocSection";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    const docsSlugs = [
        'cloud', 'file-formats', 'fundamentals', 'governance',
        'modeling', 'nosql', 'orchestration', 'pipelines',
        'spark', 'sql', 'streaming'
    ];
    return docsSlugs.map((slug) => ({ slug }));
}

export default async function DocsContentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let data;
    try {
        const mod = await import(`@/data/de/${slug}`);
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
