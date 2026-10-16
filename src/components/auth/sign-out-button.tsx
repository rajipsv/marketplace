"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
    >
      Sign out
    </button>
  );
}
