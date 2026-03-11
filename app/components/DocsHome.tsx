import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface DocsHomeGroup {
    title?: string;
    items: {
        title: string;
        slug: string;
        icon: any;
        color: string;
        desc: string;
    }[];
}

interface DocsHomeProps {
    title: string;
    description: string;
    basePath: string; // e.g. "/docs/de"
    groups: DocsHomeGroup[];
}

export function DocsHome({ title, description, basePath, groups }: DocsHomeProps) {
    return (
        <div className="px-6 md:px-10 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="mb-10 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Documentation</p>
                <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{title}</h1>
                <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">{description}</p>
            </div>

            <div className="border-t border-zinc-800 mb-8" />

            {groups.map((group, gIdx) => (
                <div key={gIdx} className="mb-8">
                    {group.title && (
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
                            {group.title}
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.items.map((sec) => {
                            const Icon = sec.icon;
                            return (
                                <Link
                                    key={sec.slug}
                                    href={`${basePath}/${sec.slug}`}
                                    className="group flex flex-col p-5 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 relative overflow-hidden"
                                >
                                    {/* Top accent line on hover */}
                                    <div
                                        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ background: `linear-gradient(90deg, transparent, ${sec.color}60, transparent)` }}
                                    />

                                    {/* Icon */}
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border"
                                        style={{
                                            backgroundColor: `${sec.color}12`,
                                            borderColor: `${sec.color}25`,
                                        }}
                                    >
                                        <Icon size={17} style={{ color: sec.color }} />
                                    </div>

                                    {/* Content */}
                                    <h2 className="text-sm font-semibold text-zinc-200 mb-1.5 group-hover:text-zinc-50 transition-colors">
                                        {sec.title}
                                    </h2>
                                    <p className="text-xs text-zinc-600 leading-relaxed flex-1 mb-4">
                                        {sec.desc}
                                    </p>

                                    {/* CTA */}
                                    <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                        Read notes
                                        <ArrowUpRight
                                            size={13}
                                            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
