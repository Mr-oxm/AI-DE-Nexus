"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { BookOpen, Database, Code, Menu, X, Home, Github, Sun, Moon, Wand2, User, LogOut, Shield, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { useSession } from "next-auth/react";

const referenceItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Docs Hub", href: "/docs", icon: BookOpen },
    { name: "Exercise Hub", href: "/exercises", icon: Code },
    { name: "Cheatsheets Hub", href: "/cheatsheets", icon: Database },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Logo / Brand */}
            <div className="px-4 py-5 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700/70 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-zinc-200">NX</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-100 leading-tight tracking-tight">The AI/DE Nexus</p>
                        <p className="text-[11px] text-zinc-500 leading-tight">by Omar Emara</p>
                    </div>
                </div>
                <Link
                    href="https://github.com/Mr-oxm"
                    target="_blank"
                    className="flex w-full mt-2 items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                    <Github size={14} />
                    <span>GitHub Profile</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
                <div>
                    <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                        Reference
                    </p>
                    <div className="space-y-0.5">
                        {referenceItems.map((item) => {
                            const isActive = item.href === "/"
                                ? pathname === "/"
                                : pathname === item.href || pathname.startsWith(item.href + "/");
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium
                                        transition-all duration-150 group relative
                                        ${isActive
                                            ? "bg-zinc-800 text-zinc-100"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={15}
                                        className={`shrink-0 transition-colors ${isActive ? "text-zinc-300" : "text-zinc-600 group-hover:text-zinc-400"}`}
                                    />
                                    <span className="flex-1 truncate">{item.name}</span>
                                    {isActive && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                {session && (
                    <>
                        <div>
                            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                                Creator Tools
                            </p>
                            <div className="space-y-0.5">
                                <Link
                                    href="/wizard"
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium
                                        transition-all duration-150 group relative
                                        ${pathname === "/wizard" || pathname.startsWith("/wizard/")
                                            ? "bg-zinc-800 text-zinc-100"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                                        }
                                    `}
                                >
                                    <Wand2 size={15} className="shrink-0" />
                                    <span className="flex-1 truncate">Creator Studio</span>
                                    {(pathname === "/wizard" || pathname.startsWith("/wizard/")) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                    )}
                                </Link>
                            </div>
                        </div>
                        <div>
                            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                                Notifications
                            </p>
                            <div className="space-y-0.5">
                                <Link
                                    href="/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium
                                        transition-all duration-150 group relative
                                        ${pathname === "/notifications"
                                            ? "bg-zinc-800 text-zinc-100"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                                        }
                                    `}
                                >
                                    <Bell size={15} className="shrink-0" />
                                    <span className="flex-1 truncate">Inbox</span>
                                    {pathname === "/notifications" && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                    )}
                                </Link>
                            </div>
                        </div>
                    </>
                )}
                {session && ((session.user as { role?: string }).role === "admin" || (session.user as { role?: string }).role === "superadmin") && (
                    <div>
                        <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                            Admin
                        </p>
                        <div className="space-y-0.5">
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium
                                    transition-all duration-150 group relative
                                    ${pathname === "/admin" || pathname.startsWith("/admin/")
                                        ? "bg-zinc-800 text-zinc-100"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                                    }
                                `}
                            >
                                <Shield size={15} className="shrink-0" />
                                <span className="flex-1 truncate">Dashboard</span>
                                {(pathname === "/admin" || pathname.startsWith("/admin/")) && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                )}
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-zinc-800/80 space-y-3">
                {status === "authenticated" && session?.user ? (
                    <>
                        <Link
                            href={session.user.id ? `/profile/${session.user.id}` : "/profile"}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-150"
                        >
                            <User size={14} className="text-zinc-500 shrink-0" />
                            <span className="truncate flex-1">{session.user.name || session.user.email}</span>
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-150"
                        >
                            <LogOut size={14} className="text-zinc-500" />
                            <span>Sign out</span>
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => signIn()}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-150"
                    >
                        <User size={14} className="text-zinc-500" />
                        <span>Sign in</span>
                    </button>
                )}
                <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-150"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <>
                            <Sun size={14} className="text-zinc-500" />
                            <span>Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon size={14} className="text-zinc-500" />
                            <span>Dark Mode</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-3.5 left-3.5 z-50 p-2 bg-zinc-900 rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors md:hidden"
                aria-label="Toggle sidebar"
            >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 flex-col bg-zinc-950/50 backdrop-blur-md border-r border-zinc-800/80 z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Drawer */}
            <aside
                className={`md:hidden fixed inset-y-0 left-0 w-56 flex flex-col bg-zinc-950/70 backdrop-blur-md border-r border-zinc-800/80 z-40 transform transition-transform duration-250 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
