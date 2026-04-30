import { Session } from "next-auth";

export function canEditResource(
  session: Session | null,
  authorId: string | { toString(): string },
  contributorIds?: (string | { toString?: () => string })[]
): boolean {
  if (!session?.user?.id) return false;
  const authorIdStr = typeof authorId === "string" ? authorId : authorId.toString();
  const role = (session.user as { role?: string }).role;
  if (role === "admin" || role === "superadmin" || authorIdStr === session.user.id) return true;
  if (contributorIds?.length) {
    const isContributor = contributorIds.some(
      (c) => (typeof c === "string" ? c : c?.toString?.()) === session!.user!.id
    );
    if (isContributor) return true;
  }
  return false;
}
