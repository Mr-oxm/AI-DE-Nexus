import ExerciseBank from "@/app/components/ExerciseBank";
import { HubDetailActions } from "@/app/components/HubDetailActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditResource } from "@/lib/can-edit";
import { cookies } from "next/headers";

async function getCheatsheetHub(id: string) {
  try {
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const cookieStore = await cookies();
    const res = await fetch(`${base}/api/cheatsheets/hubs/${id}`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CheatsheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, session] = await Promise.all([getCheatsheetHub(id), getServerSession(authOptions)]);
  if (!data) notFound();

  const sections = data.sections || [];
  const tagColors: Record<string, string> = {};
  const exercises: { id: number; tag: string; q: string; a: string; lang: string; editHref?: string }[] = [];
  let idCounter = 1;

  const contributorIds = (data.contributors ?? []).map((c: { toString: () => string }) => c.toString());
  sections.forEach((sec: { _id: string; label: string; color: string; authorId?: { toString: () => string } | string; snippets: { title: string; code: string; lang?: string }[] }) => {
    const cleanLabel = sec.label.replace(/^\d+\s*—\s*/, "");
    tagColors[cleanLabel] = sec.color || "#3b82f6";
    const secAuthorId = typeof sec.authorId === "string" ? sec.authorId : (sec.authorId as { toString?: () => string })?.toString?.() ?? "";
    const canEdit = canEditResource(session, secAuthorId, contributorIds);
    const editHref = canEdit ? `/wizard/cheatsheet?hubId=${id}&editSectionId=${sec._id}` : undefined;
    (sec.snippets || []).forEach((snippet: { title: string; code: string; lang?: string }) => {
      exercises.push({
        id: idCounter++,
        tag: cleanLabel,
        q: snippet.title,
        a: snippet.code,
        lang: snippet.lang || "python",
        editHref,
      });
    });
  });

  const author = data.authorId as { _id?: string; name?: string } | undefined;
  const authorName = author?.name;
  const authorId = author?._id?.toString?.() ?? (typeof data.authorId === "string" ? data.authorId : undefined);
  const authorIdStr = authorId ?? "";

  return (
    <div className="px-6 md:px-10 max-w-5xl mx-auto">
      <ExerciseBank
        title={data.title}
        description={data.description}
        exercises={exercises}
        tagColors={tagColors}
        authorName={authorName}
        authorId={authorId}
        headerSlot={
          <HubDetailActions
            hubType="cheatsheet"
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
    </div>
  );
}
