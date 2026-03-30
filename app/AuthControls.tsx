"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import { useState } from "react";

export default function AuthControls() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <LoadingSpinner size="sm" />
        Loading session…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-600 px-6 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white hover:scale-105"
          href="/login"
        >
          Log in
        </Link>
        <Link
          className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 px-6 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105"
          href="/signup"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="text-sm text-zinc-400">Signed in as {user.email}</div>
      <button
        className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-600 px-6 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <>
            <LoadingSpinner size="sm" />
            Signing out…
          </>
        ) : (
          "Logout"
        )}
      </button>
    </div>
  );
}
