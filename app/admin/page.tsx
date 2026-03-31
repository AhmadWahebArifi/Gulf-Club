"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../lib/AuthProvider";
import { supabase } from "../../lib/supabaseClient";
import Navbar from "../../components/Navbar";

const DEFAULT_ADMIN_EMAIL = "admin@golfclub.com";

type ScoreRow = {
  id: string;
  user_id: string;
  date: string;
  score?: number;
  points?: number;
  value?: number;
  user_email?: string;
};

type Winner = {
  user_id: string;
  user_email: string;
  points: number;
  entries: number;
  prize: string;
};

type DrawEventRow = {
  id: string;
  period_start: string;
  created_at: string;
  algorithm: string;
  params: Record<string, unknown> | null;
};

type VerificationSubmission = {
  id: string;
  user_email: string;
  file_path: string;
  file_name: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  notes?: string;
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

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const isAdmin = useMemo(() => {
    const configured = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
    const emails = (configured ? configured.split(",") : [DEFAULT_ADMIN_EMAIL])
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const current = user?.email?.toLowerCase() ?? "";
    return Boolean(current && emails.includes(current));
  }, [user?.email]);

  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [drawEvents, setDrawEvents] = useState<DrawEventRow[]>([]);
  const [selectedDrawEventId, setSelectedDrawEventId] = useState<string | null>(null);
  const [verifications, setVerifications] = useState<VerificationSubmission[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }

    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }

    loadData();
  }, [loading, user, router]);

  const loadData = async () => {
    if (!user) return;
    
    setDbLoading(true);
    setDbError(null);

    try {
      const [scoresRes, verificationsRes, drawEventsRes] = await Promise.all([
        supabase.from("scores").select("*").order("date", { ascending: false }).limit(50),
        supabase.from("verifications").select("*").order("submitted_at", { ascending: false }).limit(20),
        supabase.from("draw_events").select("*").order("period_start", { ascending: false }).limit(12),
      ]);

      if (scoresRes.error) throw scoresRes.error;
      if (verificationsRes.error) throw verificationsRes.error;
      if (drawEventsRes.error) throw drawEventsRes.error;

      setScores(((scoresRes.data as ScoreRow[]) ?? []) as ScoreRow[]);
      setVerifications((verificationsRes.data as VerificationSubmission[]) ?? []);
      const events = (drawEventsRes.data as DrawEventRow[]) ?? [];
      setDrawEvents(events);
      setSelectedDrawEventId((prev) => prev ?? (events[0]?.id ?? null));
    } catch (err) {
      setDbError(formatMaybeSupabaseError(err, "Failed to load admin data"));
    } finally {
      setDbLoading(false);
    }
  };

  const ENTRY_POINTS = 10;
  const WINNER_COUNT = 3;

  function startOfCurrentMonthISO() {
    const d = new Date();
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    return start.toISOString().slice(0, 10);
  }

  function entriesFromPoints(points: number) {
    if (!Number.isFinite(points) || points <= 0) return 0;
    return Math.max(1, Math.floor(points / ENTRY_POINTS));
  }

  function weightedPickOne(items: Array<{ user_id: string; weight: number }>) {
    const total = items.reduce((sum, it) => sum + it.weight, 0);
    if (total <= 0) return null;
    let r = Math.random() * total;
    for (const it of items) {
      r -= it.weight;
      if (r <= 0) return it.user_id;
    }
    return items[items.length - 1]?.user_id ?? null;
  }

  const runMonthlyDraw = async () => {
    if (!user) return;

    setDbLoading(true);
    setDbError(null);
    setWinners([]);

    try {
      const periodStart = startOfCurrentMonthISO();

      // Check if draw already exists for this month
      const { data: existingDraw, error: checkError } = await supabase
        .from("draw_events")
        .select("id")
        .eq("period_start", periodStart)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingDraw) {
        throw new Error(`Draw already exists for ${new Date(periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Each month can only have one draw.`);
      }

      const [activeSubsRes, monthScoresRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("user_id")
          .eq("status", true),
        supabase
          .from("scores")
          .select("user_id,points,date")
          .gte("date", periodStart)
          .order("date", { ascending: false })
          .limit(5000),
      ]);

      if (activeSubsRes.error) throw activeSubsRes.error;
      if (monthScoresRes.error) throw monthScoresRes.error;

      const activeUserIds = new Set<string>(
        ((activeSubsRes.data as Array<{ user_id: string }>) ?? []).map((r) => r.user_id),
      );

      const pointsByUser = new Map<string, number>();
      (((monthScoresRes.data as any[]) ?? []) as Array<{ user_id: string; points?: number | null }>).forEach(
        (row) => {
          if (!activeUserIds.has(row.user_id)) return;
          const p = typeof row.points === "number" ? row.points : 0;
          pointsByUser.set(row.user_id, (pointsByUser.get(row.user_id) ?? 0) + p);
        },
      );

      const pool = Array.from(pointsByUser.entries())
        .map(([user_id, points]) => ({ user_id, points, entries: entriesFromPoints(points) }))
        .filter((x) => x.entries > 0);

      if (pool.length === 0) {
        throw new Error("No eligible entries this month. Ensure users have Stableford points saved and active subscriptions.");
      }

      // Create draw event
      const { data: eventRow, error: eventErr } = await supabase
        .from("draw_events")
        .insert({
          period_start: periodStart,
          algorithm: "weighted_by_points",
          params: { entry_points: ENTRY_POINTS, winner_count: WINNER_COUNT },
          created_by: user.id,
        })
        .select()
        .single();

      if (eventErr) throw eventErr;

      const eventId = (eventRow as { id: string }).id;

      // Pick winners without replacement
      const winnersPicked: Array<{ user_id: string; points: number; entries: number; prize: string }> = [];
      const remaining = [...pool];

      for (let i = 0; i < Math.min(WINNER_COUNT, remaining.length); i++) {
        const pick = weightedPickOne(remaining.map((r) => ({ user_id: r.user_id, weight: r.entries })));
        if (!pick) break;
        const pickedRow = remaining.find((r) => r.user_id === pick);
        if (!pickedRow) break;

        const prize = i === 0 ? "GOLD" : i === 1 ? "SILVER" : "BRONZE";
        winnersPicked.push({ user_id: pick, points: pickedRow.points, entries: pickedRow.entries, prize });

        const idx = remaining.findIndex((r) => r.user_id === pick);
        if (idx >= 0) remaining.splice(idx, 1);
      }

      if (winnersPicked.length === 0) {
        throw new Error("Draw failed to select winners.");
      }

      const { error: winnersErr } = await supabase.from("draw_winners").insert(
        winnersPicked.map((w) => ({
          draw_event_id: eventId,
          user_id: w.user_id,
          points: w.points,
          entries: w.entries,
          prize: w.prize,
        })),
      );

      if (winnersErr) throw winnersErr;

      setWinners(
        winnersPicked.map((w) => ({
          user_id: w.user_id,
          user_email: w.user_id,
          points: w.points,
          entries: w.entries,
          prize: w.prize,
        })),
      );

      await loadData();
      setSelectedDrawEventId(eventId);
    } catch (err) {
      setDbError(formatMaybeSupabaseError(err, "Failed to run monthly draw"));
    } finally {
      setDbLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setDbError(null);

    try {
      // Upload to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create verification record
      const { error: insertError } = await supabase
        .from('verifications')
        .insert({
          user_email: 'winner@example.com', // This would come from the actual winner
          file_path: fileName,
          file_name: file.name,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Reload data
      await loadData();
    } catch (err) {
      setDbError(formatMaybeSupabaseError(err, "Failed to upload file"));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('verifications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      setDbError(formatMaybeSupabaseError(err, "Failed to approve verification"));
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('verifications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      setDbError(formatMaybeSupabaseError(err, "Failed to reject verification"));
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Access denied</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage users and draws</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Back to dashboard
            </Link>
          </div>

          {dbLoading ? (
            <div className="rounded-xl border border-black/[.08] bg-white px-4 -py-3 text-sm text-zinc-600 dark:border-white/[.145] dark:bg-black dark:text-zinc-400">
              Loading…
            </div>
          ) : null}

          {dbError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {dbError}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Scores Table */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <h2 className="text-lg font-semibold mb-4">Recent Scores ({scores.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[.08] dark:border-white/[.145]">
                    <th className="text-left py-2 px-2">User Id</th>
                    <th className="text-left py-2 px-2">Score</th>
                    <th className="text-left py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score.id} className="border-b border-black/[.04] dark:border-white/[.08]">
                      <td className="py-2 px-2">{score.user_id}</td>
                      <td className="py-2 px-2">{score.score ?? score.points ?? score.value ?? "—"}</td>
                      <td className="py-2 px-2 text-zinc-600 dark:text-zinc-400">
                        {new Date(score.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Generate Draw Section */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <h2 className="text-lg font-semibold mb-4">Monthly Draw Engine</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Winners are selected with weighted randomness based on Stableford points this month.
            </p>
            
            {/* Check if current month already has a draw */}
            {(() => {
              const currentMonth = startOfCurrentMonthISO();
              const existingDraw = drawEvents.find(event => event.period_start === currentMonth);
              return existingDraw ? (
                <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Draw already completed for {new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Run on {new Date(existingDraw.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
            
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
              onClick={runMonthlyDraw}
              disabled={dbLoading}
            >
              {dbLoading ? "Running draw…" : "Run Monthly Draw"}
            </button>

            {drawEvents.length > 0 ? (
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Recent draw events</div>
                <select
                  className="w-full max-w-md rounded-xl border border-black/[.08] bg-white px-3 py-2 text-sm dark:border-white/[.145] dark:bg-black"
                  value={selectedDrawEventId ?? ""}
                  onChange={(e) => setSelectedDrawEventId(e.target.value)}
                >
                  {drawEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.period_start} · {ev.algorithm}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </section>

          {/* Winner Verification Section */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <h2 className="text-lg font-semibold mb-4">Winner Verification</h2>
            
            <div className="mb-4">
              <label className="inline-flex h-11 items-center justify-center rounded-xl border border-solid border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                {uploadingFile ? "Uploading..." : "Upload Verification File"}
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[.08] dark:border-white/[.145]">
                    <th className="text-left py-2 px-2">User</th>
                    <th className="text-left py-2 px-2">File</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Submitted</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((verification) => (
                    <tr key={verification.id} className="border-b border-black/[.04] dark:border-white/[.08]">
                      <td className="py-2 px-2">{verification.user_email}</td>
                      <td className="py-2 px-2">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            // TODO: Implement file download/view
                          }}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {verification.file_name}
                        </a>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          verification.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          verification.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {verification.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-zinc-600 dark:text-zinc-400">
                        {new Date(verification.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2">
                        {verification.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(verification.id)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(verification.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {verifications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-zinc-600 dark:text-zinc-400">
                        No verification submissions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Winners Section */}
          {winners.length > 0 && (
            <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
              <h2 className="text-lg font-semibold mb-4">Winners ({winners.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[.08] dark:border-white/[.145]">
                      <th className="text-left py-2 px-2">User</th>
                      <th className="text-left py-2 px-2">Points</th>
                      <th className="text-left py-2 px-2">Entries</th>
                      <th className="text-left py-2 px-2">Prize</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.map((winner, idx) => (
                      <tr key={idx} className="border-b border-black/[.04] dark:border-white/[.08]">
                        <td className="py-2 px-2">{winner.user_email}</td>
                        <td className="py-2 px-2">{winner.points}</td>
                        <td className="py-2 px-2">{winner.entries}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            winner.prize === "GOLD" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            winner.prize === "SILVER" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}>
                            {winner.prize}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
