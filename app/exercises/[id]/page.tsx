import ExerciseBank from "@/app/components/ExerciseBank";
import { HubDetailActions } from "@/app/components/HubDetailActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditResource } from "@/lib/can-edit";
import { cookies } from "next/headers";

async function getExerciseHub(id: string) {
  try {
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const cookieStore = await cookies();
    const res = await fetch(`${base}/api/exercises/hubs/${id}`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ExerciseSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, session] = await Promise.all([getExerciseHub(id), getServerSession(authOptions)]);
  if (!data) notFound();

  const contributorIds = (data.contributors ?? []).map((c: { toString: () => string }) => c.toString());
  const exercises = (data.exercises || []).map((e: { _id: string; tag: string; q: string; a: string; lang?: string; authorId?: { toString: () => string } | string }, i: number) => {
    const exAuthorId = typeof e.authorId === "string" ? e.authorId : (e.authorId as { toString?: () => string })?.toString?.() ?? "";
    const canEdit = canEditResource(session, exAuthorId, contributorIds);
    return {
      id: i + 1,
      tag: e.tag,
      q: e.q,
      a: e.a,
      lang: e.lang || "text",
      editHref: canEdit ? `/wizard/exercise?hubId=${id}&editExerciseId=${e._id}` : undefined,
    };
  });

  const tagColors: Record<string, string> = {};
  const colors = [
    "#00C9A7", "#F9C80E", "#FF6B35", "#845EC2", "#00B4D8",
    "#FF6B6B", "#E87040", "#4CC9F0", "#F77F00", "#52B788",
    "#C77DFF", "#F72585", "#10b981", "#f59e0b", "#8b5cf6",
  ];
  let idx = 0;
  exercises.forEach((e: { tag: string }) => {
    if (!tagColors[e.tag]) {
      tagColors[e.tag] = colors[idx++ % colors.length];
    }
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
            hubType="exercise"
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
