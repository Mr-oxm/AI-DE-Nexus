import { DocsSidebar } from "@/app/components/DocsSidebar";
import { notFound } from "next/navigation";

async function getDocHub(id: string) {
  try {
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/docs/hubs/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DocHubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getDocHub(id);
  if (!data) notFound();

  const topics = data.topics || [];
  const items = topics.map((t: { _id: string; title: string; accent: string }) => ({
    title: t.title,
    id: t._id,
    color: t.accent || "#3b82f6",
  }));

  return (
    <div className="flex min-h-screen">
      <DocsSidebar
        basePath={`/docs/${id}`}
        title={data.title}
        groups={[{ items }]}
      />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
