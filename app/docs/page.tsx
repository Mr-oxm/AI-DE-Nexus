import { cookies } from "next/headers";
import { HubCard } from "@/app/components/HubCard";

async function getDocHubs() {
  try {
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const cookieStore = await cookies();
    const res = await fetch(`${base}/api/docs/hubs`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DocsHubPage() {
  const hubs = await getDocHubs();

  return (
    <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-2">
          Documentation
        </p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight mb-3">
          Docs Hub
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
          Browse documentation hubs — each hub contains topic pages you can explore.
        </p>
      </div>

      <div className="border-t border-zinc-800 mb-10" />

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
          Available Hubs
        </p>
        {hubs.length === 0 ? (
          <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center text-zinc-500">
            <p className="text-sm">No documentation hubs yet.</p>
            <p className="text-xs mt-2">Sign in as an author and create one via the Creator Studio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hubs.map((hub: { _id: string; title: string; description: string; accent: string; forkedFrom?: { title: string }; starCount?: number; starred?: boolean }) => (
              <HubCard
                key={hub._id}
                type="doc"
                hub={hub}
                iconVariant={hub.title.toLowerCase().includes("de") ? "de" : "ml"}
                initialStarred={hub.starred}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
