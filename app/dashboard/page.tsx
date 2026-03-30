"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  score: number;
  date: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: "monthly" | "yearly";
  status: "active" | "inactive";
  renewal_date: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

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

  useEffect(() => {
    if (!user) return;

    let active = true;
    setDbLoading(true);
    setDbError(null);

    Promise.all([
      supabase
        .from("subscriptions")
        .select("id,user_id,plan,status,renewal_date")
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
        .select("id,user_id,score,date")
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
        const message = err instanceof Error ? err.message : "Failed to load dashboard data";
        setDbError(message);
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
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
      </div>
    );
  }

  const subscriptionLabel = subscription?.status === "active" ? "Active" : "Inactive";
  const renewalLabel = subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : "—";

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Welcome, {user.email}</p>
            </div>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Back to home
            </Link>
          </div>

          {dbLoading ? (
            <div className="rounded-xl border border-black/[.08] bg-white px-4 py-3 text-sm text-zinc-600 dark:border-white/[.145] dark:bg-black dark:text-zinc-400">
              Syncing with database…
            </div>
          ) : null}

          {dbError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {dbError}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <h2 className="text-lg font-semibold">Subscription status</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Your membership status and billing health.
            </p>

            <div className="mt-4 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Current status</div>
                  <div className="mt-1 text-base font-medium">{subscriptionLabel}</div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    Plan: {subscription?.plan ?? "—"} · Renewal: {renewalLabel}
                  </div>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">{subscription ? "" : "No subscription row found."}</div>
              </div>

              {dbError ? (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {dbError}
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <h2 className="text-lg font-semibold">Score input</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Log a score for your round.</p>

            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setDbError(null);

                if (!user) return;
                if (score === "") return;

                if (score < 1 || score > 45) {
                  setDbError("Score must be between 1 and 45.");
                  return;
                }

                const dateToSave = playedAt || new Date().toISOString().slice(0, 10);

                setDbLoading(true);
                try {
                  const { error: insertError } = await supabase.from("scores").insert({
                    user_id: user.id,
                    score,
                    date: dateToSave,
                  });

                  if (insertError) throw insertError;

                  const { data: idsToDelete, error: idsError } = await supabase
                    .from("scores")
                    .select("id")
                    .eq("user_id", user.id)
                    .order("date", { ascending: false })
                    .range(5, 1000);

                  if (idsError) throw idsError;

                  if (idsToDelete && idsToDelete.length > 0) {
                    const idList = idsToDelete.map((r) => r.id);
                    const { error: deleteError } = await supabase.from("scores").delete().in("id", idList);
                    if (deleteError) throw deleteError;
                  }

                  const { data: latestScores, error: latestScoresError } = await supabase
                    .from("scores")
                    .select("id,user_id,score,date")
                    .eq("user_id", user.id)
                    .order("date", { ascending: false })
                    .limit(5);

                  if (latestScoresError) throw latestScoresError;

                  setScores((latestScores as ScoreRow[]) ?? []);
                  setScore("");
                  setPlayedAt("");
                } catch (err) {
                  const message = err instanceof Error ? err.message : "Failed to save score";
                  setDbError(message);
                } finally {
                  setDbLoading(false);
                }
              }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Score</span>
                  <input
                    className="h-11 rounded-xl border border-black/[.08] bg-transparent px-4 outline-none focus:border-black dark:border-white/[.145] dark:focus:border-white"
                    value={score}
                    onChange={(e) => {
                      const v = e.target.value;
                      setScore(v === "" ? "" : Number(v));
                    }}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={45}
                    placeholder="e.g. 32"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Date</span>
                  <input
                    className="h-11 rounded-xl border border-black/[.08] bg-transparent px-4 outline-none focus:border-black dark:border-white/[.145] dark:focus:border-white"
                    value={playedAt}
                    onChange={(e) => setPlayedAt(e.target.value)}
                    type="date"
                  />
                </label>
              </div>

              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
                type="submit"
                disabled={dbLoading || score === ""}
              >
                {dbLoading ? "Saving…" : "Save score"}
              </button>
            </form>

            <div className="mt-6">
              <div className="text-sm font-medium">Latest scores</div>
              <div className="mt-3 flex flex-col gap-2">
                {scores.length === 0 ? (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">No scores yet.</div>
                ) : (
                  scores.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-black/[.08] px-4 py-3 text-sm dark:border-white/[.145]"
                    >
                      <div className="font-medium">{s.score}</div>
                      <div className="text-zinc-600 dark:text-zinc-400">{new Date(s.date).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">Only the latest 5 are kept.</div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <h2 className="text-lg font-semibold">Charity selection</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Choose where your participation supports.
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3">
                {charities.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer gap-3 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]"
                  >
                    <input
                      type="radio"
                      name="charity"
                      checked={selectedCharityId === c.id}
                      onChange={() => setSelectedCharityId(c.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{c.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Percentage</span>
                <input
                  className="h-11 rounded-xl border border-black/[.08] bg-transparent px-4 outline-none focus:border-black dark:border-white/[.145] dark:focus:border-white"
                  value={charityPercentage}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCharityPercentage(v === "" ? "" : Number(v));
                  }}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  placeholder="e.g. 100"
                />
              </label>

              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-solid border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                type="button"
                disabled={dbLoading || !selectedCharityId || charityPercentage === ""}
                onClick={async () => {
                  if (!user) return;
                  if (!selectedCharityId) return;
                  if (charityPercentage === "") return;

                  setDbLoading(true);
                  setDbError(null);
                  try {
                    const { error: clearError } = await supabase
                      .from("user_charity")
                      .delete()
                      .eq("user_id", user.id);

                    if (clearError) throw clearError;

                    const { error: insertError } = await supabase.from("user_charity").insert({
                      user_id: user.id,
                      charity_id: selectedCharityId,
                      percentage: charityPercentage,
                    });

                    if (insertError) throw insertError;
                  } catch (err) {
                    const message = err instanceof Error ? err.message : "Failed to save charity";
                    setDbError(message);
                  } finally {
                    setDbLoading(false);
                  }
                }}
              >
                {dbLoading ? "Saving…" : "Save charity"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <h2 className="text-lg font-semibold">Participation info</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Details about how you’re participating.
            </p>

            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Participation saved (placeholder)");
              }}
            >
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Participation type</span>
                <select
                  className="h-11 rounded-xl border border-black/[.08] bg-transparent px-4 text-sm outline-none focus:border-black dark:border-white/[.145] dark:focus:border-white"
                  value={participationType}
                  onChange={(e) => setParticipationType(e.target.value as "weekly" | "monthly" | "tournament")}
                >
                  <option value="weekly">Weekly rounds</option>
                  <option value="monthly">Monthly challenge</option>
                  <option value="tournament">Tournament</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Notes</span>
                <textarea
                  className="min-h-28 rounded-xl border border-black/[.08] bg-transparent px-4 py-3 text-sm outline-none focus:border-black dark:border-white/[.145] dark:focus:border-white"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Playing with friends, walking 18 holes, etc."
                />
              </label>

              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-solid border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                type="submit"
              >
                Save participation
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
