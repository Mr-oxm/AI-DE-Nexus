import { DocSection } from "@/app/components/DocSection";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditResource } from "@/lib/can-edit";

async function getDocTopic(topicId: string) {
  try {
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/docs/topics/${topicId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getDocHub(hubId: string) {
  try {
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/docs/hubs/${hubId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DocTopicPage({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id: hubId, topicId } = await params;
  const [topic, hub, session] = await Promise.all([
    getDocTopic(topicId),
    getDocHub(hubId),
    getServerSession(authOptions),
  ]);
  if (!topic) notFound();

  const author = topic.authorId as { _id?: string; name?: string } | undefined;
  const authorName = author?.name;
  const authorId = author?._id?.toString?.() ?? (typeof topic.authorId === "string" ? topic.authorId : undefined);
  const rawAuthorId = topic.authorId as { _id?: { toString: () => string }; toString?: () => string } | string;
  const topicAuthorId = typeof rawAuthorId === "string" ? rawAuthorId : (rawAuthorId?._id?.toString?.() ?? rawAuthorId?.toString?.() ?? "");
  const contributorIds = (hub?.contributors ?? []).map((c: { toString: () => string }) => c.toString());
  const canEdit = canEditResource(session, topicAuthorId, contributorIds);
  const editHref = canEdit ? `/wizard/doc?editTopicId=${topicId}&hubId=${hubId}` : undefined;

  const contributors = (topic.contributorIds ?? [])
    .map((c: { _id?: unknown; name?: string } | { toString: () => string }) => {
      const id =
        typeof c === "object" && c && "_id" in c
          ? String((c as { _id?: unknown })._id)
          : String(c);
      const name = typeof c === "object" && c && "name" in c ? (c as { name?: string }).name : undefined;
      return { id, name: name ?? "Unknown" };
    })
    .filter((c) => c.id !== authorId);

  return (
    <DocSection
      title={topic.title}
      subtitle={topic.subtitle}
      accent={topic.accent || "#3b82f6"}
      blocks={topic.blocks || []}
      breadcrumbHubLabel={hub?.title}
      breadcrumbHubHref={hub ? `/docs/${hubId}` : undefined}
      authorName={authorName}
      authorId={authorId}
      contributors={contributors}
      editHref={editHref}
    />
  );
}
