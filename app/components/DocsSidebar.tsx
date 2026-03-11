"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface DocsSidebarGroup {
    title?: string;
    items: {
        title: string;
        slug: string;
        icon: any;
        color: string;
    }[];
}

interface DocsSidebarProps {
    basePath: string; // The base path like "/docs/de" or "/docs/ml"
    title: string;
    groups: DocsSidebarGroup[];
}

export function DocsSidebar({ basePath, title, groups }: DocsSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-zinc-800/60 sticky top-0 h-screen overflow-y-auto">
            <div className="px-4 py-5 border-b border-zinc-800/60">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Documentation</p>
                <p className="text-sm font-semibold text-zinc-200 mt-1">{title}</p>
            </div>
            <nav className="px-3 py-4 flex-1">
                {groups.map((group, groupIdx) => (
                    <div key={groupIdx} className={groupIdx > 0 ? "mt-4" : ""}>
                        {group.title && (
                            <p className="px-3 mb-2 mt-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
                                {group.title}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((sec) => {
                                const href = `${basePath}/${sec.slug}`;
                                const isActive = pathname === href;
                                const Icon = sec.icon;
                                return (
                                    <Link
                                        key={sec.slug}
                                        href={href}
                                        className={`
                                            flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium
                                            transition-all duration-150
                                            ${isActive
                                                ? "bg-zinc-800 text-zinc-100"
                                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                                            }
                                        `}
                                    >
                                        <Icon
                                            size={13}
                                            style={{ color: isActive ? sec.color : undefined }}
                                            className={isActive ? "" : "text-zinc-700"}
                                        />
                                        {sec.title}
                                    </Link>
                                );
                            })}
                        </div>
                        {groupIdx < groups.length - 1 && (
                            <div className="border-t border-zinc-800/40 my-3 mx-3" />
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
