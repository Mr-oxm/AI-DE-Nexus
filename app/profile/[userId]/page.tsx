"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Code, Database, User, ArrowUpRight, PenLine, Star } from "lucide-react";

type ProfileData = {
  user: { name?: string; id: string };
  docHubs: { _id: string; title: string; description?: string }[];
  exerciseHubs: { _id: string; title: string; description?: string }[];
  cheatsheetHubs: { _id: string; title: string; description?: string }[];
  starred?: { _id: string; title: string; description?: string; _type: string }[];
};

export default function ProfileByUserIdPage() {
  const params = useParams();
  const userId = params.userId as string;
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const profileRes = await fetch(`/api/profile/${userId}`);
      const profileData = await profileRes.json();
      if (profileData.error) {
        setError(profileData.error);
        return;
      }
      let starred: unknown[] = [];
      if (session?.user?.id === userId) {
        const starRes = await fetch(`/api/stars/for-user?userId=${userId}`);
        starred = await starRes.json();
      }
      setData({
        ...profileData,
        starred: Array.isArray(starred) ? starred : [],
      });
    };
    load().finally(() => setLoading(false));
  }, [userId, session?.user?.id]);

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-zinc-800/50 rounded-xl w-64" />
          <div className="h-32 bg-zinc-800/30 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto">
        <p className="text-zinc-500">{error || "Profile not found."}</p>
        <Link href="/" className="text-sm text-blue-400 hover:underline mt-4 inline-block">
          Back to home
        </Link>
      </div>
    );
  }

  const total = data.docHubs.length + data.exerciseHubs.length + data.cheatsheetHubs.length;

  return (
    <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 mb-10">
        <div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: "linear-gradient(90deg, transparent, #3b82f660, #10b98160, transparent)" }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0">
            <User size={36} className="text-zinc-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
              {data.user.name || "Author"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {total} {total === 1 ? "contribution" : "contributions"} across docs, exercises, and cheatsheets
            </p>
            {isOwnProfile && (
              <Link
                href="/wizard"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
              >
                <PenLine size={14} /> Creator Studio
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 mb-10" />

      {/* Doc Hubs */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4 flex items-center gap-2">
          <BookOpen size={14} /> Doc Hubs ({data.docHubs.length})
        </h2>
        {data.docHubs.length === 0 ? (
          <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 text-center text-zinc-500">
            <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No doc hubs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.docHubs.map((hub) => (
              <Link
                key={hub._id}
                href={`/docs/${hub._id}`}
                className="group flex flex-col p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 relative overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(90deg, transparent, #3b82f660, transparent)" }}
                />
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border bg-blue-500/10 border-blue-500/25">
                  <BookOpen size={17} className="text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1.5 group-hover:text-zinc-50 transition-colors">
                  {hub.title}
                </h3>
                {hub.description && (
                  <p className="text-xs text-zinc-600 leading-relaxed flex-1 mb-4 line-clamp-2">
                    {hub.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  Browse topics
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Exercise Hubs */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4 flex items-center gap-2">
          <Code size={14} /> Exercise Hubs ({data.exerciseHubs.length})
        </h2>
        {data.exerciseHubs.length === 0 ? (
          <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 text-center text-zinc-500">
            <Code size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No exercise hubs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.exerciseHubs.map((hub) => (
              <Link
                key={hub._id}
                href={`/exercises/${hub._id}`}
                className="group flex flex-col p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 relative overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(90deg, transparent, #10b98160, transparent)" }}
                />
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border bg-emerald-500/10 border-emerald-500/25">
                  <Code size={17} className="text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1.5 group-hover:text-zinc-50 transition-colors">
                  {hub.title}
                </h3>
                {hub.description && (
                  <p className="text-xs text-zinc-600 leading-relaxed flex-1 mb-4 line-clamp-2">
                    {hub.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  Start practicing
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Starred (own profile only) */}
      {isOwnProfile && data.starred && data.starred.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4 flex items-center gap-2">
            <Star size={14} /> Starred ({data.starred.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.starred.map((hub: { _id: string; title: string; description?: string; _type?: string }) => {
              const href =
                hub._type === "doc"
                  ? `/docs/${hub._id}`
                  : hub._type === "exercise"
                  ? `/exercises/${hub._id}`
                  : `/cheatsheets/${hub._id}`;
              const Icon = hub._type === "doc" ? BookOpen : hub._type === "exercise" ? Code : Database;
              const accent = hub._type === "doc" ? "#3b82f6" : hub._type === "exercise" ? "#10b981" : "#f59e0b";
              return (
                <Link
                  key={hub._id}
                  href={href}
                  className="group flex flex-col p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border"
                    style={{
                      backgroundColor: `${accent}12`,
                      borderColor: `${accent}25`,
                    }}
                  >
                    <Icon size={17} style={{ color: accent }} />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1.5 group-hover:text-zinc-50 transition-colors">
                    {hub.title}
                  </h3>
                  {hub.description && (
                    <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">{hub.description}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-400 mt-2">
                    View
                    <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Cheatsheet Hubs */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4 flex items-center gap-2">
          <Database size={14} /> Cheatsheet Hubs ({data.cheatsheetHubs.length})
        </h2>
        {data.cheatsheetHubs.length === 0 ? (
          <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 text-center text-zinc-500">
            <Database size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No cheatsheet hubs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.cheatsheetHubs.map((hub) => (
              <Link
                key={hub._id}
                href={`/cheatsheets/${hub._id}`}
                className="group flex flex-col p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 relative overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(90deg, transparent, #f59e0b60, transparent)" }}
                />
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border bg-amber-500/10 border-amber-500/25">
                  <Database size={17} className="text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1.5 group-hover:text-zinc-50 transition-colors">
                  {hub.title}
                </h3>
                {hub.description && (
                  <p className="text-xs text-zinc-600 leading-relaxed flex-1 mb-4 line-clamp-2">
                    {hub.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  View cheatsheet
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
