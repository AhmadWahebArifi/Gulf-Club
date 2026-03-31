"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.145] dark:bg-black">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign up with your email and password.
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSuccess(null);

            if (!email || !password) {
              setError("Email and password are required.");
              return;
            }

            if (password !== confirmPassword) {
              setError("Passwords do not match.");
              return;
            }

            setLoading(true);
            try {
              const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  emailRedirectTo: `${window.location.origin}/dashboard`,
                }
              });

              if (signUpError) throw signUpError;

              if (data.session) {
                // User was automatically confirmed (rare case)
                router.push("/dashboard");
                return;
              }

              // User needs to confirm email
              setSuccess("Account created! Please check your email and click the confirmation link to login.");
            } catch (err) {
              const message = err instanceof Error ? err.message : "Signup failed";
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
              autoComplete="new-password"
              required
              minLength={6}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Confirm password</span>
            <input
              className="h-11 rounded-xl border border-black/[.08] bg-transparent px-4 outline-none focus:border-black dark:border-white/[.145] dark:focus:border-white"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </label>

          {success ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              <div className="font-medium mb-1">✅ {success}</div>
              <div className="text-xs mt-2 space-y-1">
                <p>📧 Check your inbox (and spam folder)</p>
                <p>🔗 Click the confirmation link in the email</p>
                <p>🔄 Then return here to login</p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <div className="font-medium mb-1">❌ {error}</div>
              {error.includes("Invalid login credentials") && (
                <div className="text-xs mt-2">
                  <p>💡 If you just signed up, please confirm your email first.</p>
                  <p>📧 Check your email for the confirmation link.</p>
                </div>
              )}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-black dark:text-white">
            Log in
          </Link>
        </p>

        <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>💡 Tip:</strong> After signing up, check your email (including spam folder) and click the confirmation link before trying to login.
          </p>
        </div>
      </div>
    </div>
  );
}
