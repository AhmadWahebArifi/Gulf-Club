"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthProvider";
import { supabase } from "../../lib/supabaseClient";

type CharityOption = {
  id: string;
  name: string;
  description: string;
};

type ScoreRow = {
  id: string;
  user_id: string;
  date: string;
  score?: number;
  points?: number;
  value?: number;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan?: "monthly" | "yearly" | string | null;
  status?: boolean | null;
  renewal_date?: string | null;
};

function formatMaybeSupabaseError(err: unknown, fallback: string) {
  if (!err) return fallback;
  if (err instanceof Error) return err.message;

  if (typeof err === "object") {
    const e = err as Record<string, unknown>;
    const message = typeof e.message === "string" ? e.message : null;
    const code = typeof e.code === "string" ? e.code : null;
    const details = typeof e.details === "string" ? e.details : null;
    const hint = typeof e.hint === "string" ? e.hint : null;

    if (message || code || details || hint) {
      const parts = [
        code ? `code=${code}` : null,
        message ? message : null,
        details ? `details=${details}` : null,
        hint ? `hint=${hint}` : null,
      ].filter(Boolean);
      return parts.join(" · ");
    }

    try {
      return JSON.stringify(err);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

const ADMIN_EMAIL = "admin@golfclub.com";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseUrlHost: string | null = null;
  if (supabaseUrl) {
    try {
      supabaseUrlHost = new URL(supabaseUrl).host;
    } catch {
      supabaseUrlHost = "(invalid url)";
    }
  }

  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/dashboard");
    }
  }, [loading, user, router]);

  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);

  const [score, setScore] = useState<number | "">("");
  const [playedAt, setPlayedAt] = useState("");
  const [scores, setScores] = useState<ScoreRow[]>([]);

  const [charities, setCharities] = useState<CharityOption[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>("");
  const [charityPercentage, setCharityPercentage] = useState<number | "">(100);

  const [participationType, setParticipationType] = useState<"weekly" | "monthly" | "tournament">(
    "weekly",
  );
  const [notes, setNotes] = useState("");

  const [drawNumbers, setDrawNumbers] = useState<number[]>([]);
  const [matchResult, setMatchResult] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    let active = true;
    setDbLoading(true);
    setDbError(null);

    Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("charities").select("id,name,description").order("name", { ascending: true }),
      supabase
        .from("user_charity")
        .select("charity_id,percentage")
        .eq("user_id", user.id)
        .order("percentage", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5),
    ])
      .then(([subRes, charitiesRes, userCharityRes, scoresRes]) => {
        if (!active) return;

        if (subRes.error) throw subRes.error;
        if (charitiesRes.error) throw charitiesRes.error;
        if (userCharityRes.error) throw userCharityRes.error;
        if (scoresRes.error) throw scoresRes.error;

        setSubscription((subRes.data as SubscriptionRow | null) ?? null);
        setCharities((charitiesRes.data as CharityOption[]) ?? []);
        setScores((scoresRes.data as ScoreRow[]) ?? []);

        const userCharity = userCharityRes.data as { charity_id: string; percentage: number } | null;
        if (userCharity) {
          setSelectedCharityId(userCharity.charity_id);
          setCharityPercentage(userCharity.percentage);
        } else if (charitiesRes.data && charitiesRes.data.length > 0) {
          setSelectedCharityId(charitiesRes.data[0].id);
          setCharityPercentage(100);
        }
      })
      .catch((err) => {
        if (!active) return;
        setDbError(formatMaybeSupabaseError(err, "Failed to load dashboard data"));
      })
      .finally(() => {
        if (!active) return;
        setDbLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black" suppressHydrationWarning>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
      </div>
    );
  }

  const subscriptionLabel = subscription?.status === true ? "Active" : "Inactive";
  const renewalLabel = subscription?.renewal_date
    ? new Date(subscription.renewal_date).toLocaleDateString()
    : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="mb-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Welcome to GolfClub
              </h1>
              <p className="mt-2 text-lg text-purple-200">Play Golf. Support Charity. Win Prizes.</p>
            </div>
            <div className="flex gap-3">
              {user.email === ADMIN_EMAIL && (
                <Link
                  href="/admin"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm px-6 text-sm font-medium text-white transition-all hover:bg-white/20 border border-white/20"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 text-sm font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {dbLoading ? (
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm px-6 py-4 text-purple-200">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400"></div>
                Syncing with database…
              </div>
            </div>
          ) : null}

          {dbError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-6 py-4 text-red-300">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                {dbError}
              </div>
            </div>
          ) : null}
        </div>

        {/* Big CTA Card */}
        {!subscription || subscription.status !== true ? (
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-8 shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Subscribe & Support Charity
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join our community of golfers making a difference. Play rounds, support causes you care about, and win amazing prizes.
              </p>
              <button
                className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-lg font-bold text-purple-600 transition-all hover:bg-purple-50 shadow-xl hover:shadow-2xl"
                type="button"
                disabled={dbLoading}
                onClick={async () => {
                  if (!user) return;
                  
                  setDbLoading(true);
                  setDbError(null);
                  try {
                    const { data: newSubscription, error: upsertError } = await supabase
                      .from("subscriptions")
                      .upsert({
                        user_id: user.id,
                        plan: "monthly",
                        status: true,
                        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                      })
                      .select()
                      .single();

                    if (upsertError) throw upsertError;

                    setSubscription(newSubscription as SubscriptionRow);
                  } catch (err) {
                    setDbError(formatMaybeSupabaseError(err, "Failed to subscribe - RLS policy issue? Check Supabase dashboard > Authentication > Policies"));
                  } finally {
                    setDbLoading(false);
                  }
                }}
              >
                {dbLoading ? "Subscribing…" : "Subscribe Now - Support Charity"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                🎉 Active Member
              </h2>
              <p className="text-xl text-green-100 mb-4">
                Thank you for supporting charity through golf!
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-6 py-3 text-white">
                <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
                Subscription Active
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Score Tracking Section */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Add Your Score</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Record your latest golf round
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="w-full rounded-lg border border-black/[.08] px-3 pig-2 dark:border-white/[.145] dark:bg-black"
                  placeholder="Enter your score"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date Played</label>
                <input
                  type="date"
                  value={playedAt}
                  onChange={(e) => setPlayedAt(e.target.value)}
                  className="w-full rounded-lg border border-black/[.08] px- py-2 dark:border-white/[.145] dark:bg-black"
                />
              </div>
              <button
                className="w-full rounded-xl bg-black px- pig-2 temple-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                onClick={async () => {
                  if (!score || !playedAt) return;
                  setDbLoading(true);
                  try {
                    await supabase.from("scores").insert({
                      user_id: user.id,
                      score: parseInt(score.toString()),
                      date: playedAt,
                    });
                    setScore("");
                    setPlayedAt("");
                    // Refresh scores
                    const { data } = await supabase
                      .from("scores")
                      .select("*")
                      .eq("user_id", user.id)
                      .order("date", { ascending: false })
                      .limit(5);
                    setScores(data || []);
                  } catch (err) {
                    setDbError("Failed to save score");
                  } finally {
                    setDbLoading(false);
                  }
                }}
              >
                Save Score
              </button>
            </div>

            {/* Recent Scores */}
            {scores.length > 0 && (
              <div className="mt-6">
                <h3 className="textpig-2 font-semibold mb-2">Recent Scores</h3>
                <div className="space-y-2">
                  {scores.map((s) => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span>{s.score}</span>
                      <span className="text-zinc-500">{new Date(s.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Charity Selection Section */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Charity Support</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Choose your cause and contribution
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Charity</label>
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full rounded-lg border border-black/[.08] px- pig-2 dark:border-white/[.145] dark:bg-black"
                >
                  {charities.map((charity) => (
                    <option key={charity.id} value={charity.id}>
                      {charity.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Percentage to Charity (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={charityPercentage}
                  onChange={(e) => setCharityPercentage(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="w-full rounded-lg border border-black/[.08] px- pig-2 dark:border-white/[.145] dark:bg-black"
                  placeholder="Enter percentage"
                />
              </div>
              <button
                className="w-full rounded-xl bg-green-600 px- pig-2 temple-2 text-sm font-medium text-white hover:bg-green-700"
                onClick={async () => {
                  if (!selectedCharityId || !charityPercentage) return;
                  setDbLoading(true);
                  try {
                    await supabase.from("user_charity").upsert({
                      user_id: user.id,
                      charity_id: selectedCharityId,
                      percentage: parseInt(charityPercentage.toString()),
                    });
                    setDbError(null);
                  } catch (err) {
                    setDbError("Failed to save charity preference");
                  } finally {
                    setDbLoading(false);
                  }
                }}
              >
                Save Charity Preference
              </button>
            </div>
          </section>

          {/* Diagnostics Section */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black lg:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Diagnostics</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Use this to debug connection/RLS/schema issues.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] disabled:opacity-60 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                disabled={diagnosticsRunning}
                onClick={async () => {
                  setDiagnosticsRunning(true);
                  try {
                    const [{ data: sessionData, error: sessionError }, subRes, charitiesRes, userCharityRes, scoresRes] =
                      await Promise.all([
                        supabase.auth.getSession(),
                        supabase.from("subscriptions").select("*").limit(1),
                        supabase.from("charities").select("id,name,description").limit(1),
                        supabase.from("user_charity").select("user_id,charity_id,percentage").limit(1),
                        supabase.from("scores").select("id,user_id,score,date").limit(1),
                      ]);

                    setDiagnostics({
                      supabaseUrlHost,
                      authUserId: user.id,
                      authEmail: user.email,
                      sessionPresent: Boolean(sessionData.session),
                      sessionError: sessionError ? { message: sessionError.message, name: sessionError.name } : null,
                      subscriptions: {
                        status: subRes.status,
                        error: subRes.error ? subRes.error : null,
                        sample: subRes.data?.[0] ?? null,
                      },
                      charities: {
                        status: charitiesRes.status,
                        error: charitiesRes.error ? charitiesRes.error : null,
                        sample: charitiesRes.data?.[0] ?? null,
                      },
                      user_charity: {
                        status: userCharityRes.status,
                        error: userCharityRes.error ? userCharityRes.error : null,
                        sample: userCharityRes.data?.[0] ?? null,
                      },
                      scores: {
                        status: scoresRes.status,
                        error: scoresRes.error ? scoresRes.error : null,
                        sample: scoresRes.data?.[0] ?? null,
                      },
                    });
                  } catch (err) {
                    const message = err instanceof Error ? err.message : "Diagnostics failed";
                    setDiagnostics({ supabaseUrlHost, error: message });
                  } finally {
                    setDiagnosticsRunning(false);
                  }
                }}
              >
                {diagnosticsRunning ? "Running…" : "Run diagnostics"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Supabase host</div>
                <div className="mt-1 font-medium">{supabaseUrlHost ?? "—"}</div>
              </div>
              <div className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Auth user id</div>
                <div className="mt-1 font-medium break-all">{user.id}</div>
              </div>
              <div className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Auth session</div>
                <div className="mt-1 font-medium">{user ? "Logged in" : "Logged out"}</div>
              </div>
            </div>

            {diagnostics ? (
              <pre className="mt-4 overflow-auto rounded-xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm p-4 text-xs text-purple-200">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            ) : null}
          </section>

          {/* Score Tracking Section */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Add Your Score</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Record your latest golf round
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="w-full rounded-lg border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black"
                  placeholder="Enter your score"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date Played</label>
                <input
                  type="date"
                  value={playedAt}
                  onChange={(e) => setPlayedAt(e.target.value)}
                  className="w-full rounded-lg border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black"
                />
              </div>
              <button
                className="w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                onClick={async () => {
                  if (!score || !playedAt) return;
                  setDbLoading(true);
                  try {
                    await supabase.from("scores").insert({
                      user_id: user.id,
                      score: parseInt(score.toString()),
                      date: playedAt,
                    });
                    setScore("");
                    setPlayedAt("");
                    // Refresh scores
                    const { data } = await supabase
                      .from("scores")
                      .select("*")
                      .eq("user_id", user.id)
                      .order("date", { ascending: false })
                      .limit(5);
                    setScores(data || []);
                  } catch (err) {
                    setDbError("Failed to save score");
                  } finally {
                    setDbLoading(false);
                  }
                }}
              >
                Save Score
              </button>
            </div>

            {/* Recent Scores */}
            {scores.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">Recent Scores</h3>
                <div className="space-y-2">
                  {scores.map((s) => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span>{s.score}</span>
                      <span className="text-zinc-500">{new Date(s.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Charity Selection Section */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Charity Support</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Choose your cause and contribution
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Charity</label>
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full rounded-lg border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black"
                >
                  {charities.map((charity) => (
                    <option key={charity.id} value={charity.id}>
                      {charity.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Percentage to Charity (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={charityPercentage}
                  onChange={(e) => setCharityPercentage(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="w-full rounded-lg border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black"
                  placeholder="Enter percentage"
                />
              </div>
              <button
                className="w-full rounded-xl bg-green-600 px-4 pig-2 temple-2 text-sm font-medium text-white hover:bg-green-700"
                onClick={async () => {
                  if (!selectedCharityId || !charityPercentage) return;
                  setDbLoading(true);
                  try {
                    await supabase.from("user_charity").upsert({
                      user_id: user.id,
                      charity_id: selectedCharityId,
                      percentage: parseInt(charityPercentage.toString()),
                    });
                    setDbError(null);
                  } catch (err) {
                    setDbError("Failed to save charity preference");
                  } finally {
                    setDbLoading(false);
                  }
                }}
              >
                Save Charity Preference
              </button>
            </div>
          </section>

          </div>
      </div>
    </div>
  );
}
