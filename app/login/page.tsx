"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "../../lib/supabaseClient";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let active = true;

    supabase.auth.getSession().then(({ data }: { data: any }) => {
      if (!active) return;
      if (data.session) {
        router.replace(next);
      }
    });

    return () => {
      active = false;
    };
  }, [router, next, mounted]);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.145] dark:bg-black">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Log in to continue.</p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);

            try {
              console.log("🔍 Login Debug - Attempting login with:", { email, password: "***" });
              
              const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              console.log("🔍 Login Debug - Response:", { 
                data: data ? "Session data received" : "No session data", 
                error: signInError?.message || "No error" 
              });

              if (signInError) throw signInError;

              console.log("🔍 Login Debug - Success! Redirecting to:", next);
              router.push(next);
            } catch (err) {
              console.error("🔍 Login Debug - Error:", err);
              const message = err instanceof Error ? err.message : "Login failed";
              console.error("🔍 Login Debug - Error message:", message);
              setError(message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Email</span>
            <input
              className="h-11 rounded-xl border border-black/[.08] bg-transparent px-4 outline-none focus:border-black dark:border-white/[.145] dark:focus:border-white"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Password</span>
            <input
              className="h-11 rounded-xl border border-black/[.08] bg-transparent px-4 outline-none focus:border-black dark:border-white/[.145] dark:focus:border-white"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-black dark:text-white">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
