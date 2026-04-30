import { DocsHome } from "@/app/components/DocsHome";
import { HubDetailActions } from "@/app/components/HubDetailActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { BookOpen } from "lucide-react";

async function getDocHub(id: string) {
  try {
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const cookieStore = await cookies();
    const res = await fetch(`${base}/api/docs/hubs/${id}`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DocHubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, session] = await Promise.all([getDocHub(id), getServerSession(authOptions)]);
  if (!data) notFound();

  const topics = data.topics || [];
  const items = topics.map((t: { _id: string; title: string; subtitle?: string; accent: string }) => ({
    title: t.title,
    id: t._id,
    icon: BookOpen,
    color: t.accent || "#3b82f6",
    desc: t.subtitle || "",
  }));

  const authorIdStr = typeof data.authorId === "object" && data.authorId?._id
    ? String(data.authorId._id)
    : String(data.authorId);
  const contributorIds = (data.contributors ?? []).map((c: { toString: () => string }) => c.toString());

  return (
    <DocsHome
      title={data.title}
      description={data.description || ""}
      basePath={`/docs/${id}`}
      groups={[{ items }]}
      headerSlot={
        <HubDetailActions
          hubType="doc"
          hubId={id}
          hubTitle={data.title}
          authorId={authorIdStr}
          contributorIds={contributorIds}
          sessionUserId={session?.user?.id}
          forkedFrom={data.forkedFrom}
          starCount={data.starCount}
          starred={data.starred}
        />
      }
    />
  );
}
