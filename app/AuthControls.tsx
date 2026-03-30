"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthProvider";

export default function AuthControls() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading session…</div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          href="/login"
        >
          Log in
        </Link>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#383838] dark:bg-white dark:text-black dark:hover:bg-[#ccc]"
          href="/signup"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">Signed in as {user.email}</div>
      <button
        className="inline-flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        type="button"
        onClick={async () => {
          await signOut();
          router.refresh();
        }}
      >
        Logout
      </button>
    </div>
  );
}
