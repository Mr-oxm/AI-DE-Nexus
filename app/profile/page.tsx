"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile");
      return;
    }
    if (status === "authenticated" && session?.user?.id) {
      router.replace(`/profile/${session.user.id}`);
    }
  }, [status, session?.user?.id, router]);

  if (status === "loading") {
    return (
      <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-zinc-800/50 rounded-xl w-64" />
          <div className="h-32 bg-zinc-800/30 rounded-xl" />
        </div>
      </div>
    );
  }

  return null;
}
