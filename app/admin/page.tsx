"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthProvider";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_EMAIL = "admin@golfclub.com";

type UserRow = {
  id: string;
  email: string;
  created_at: string;
};

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
  user_email: string;
  matches: number;
  prize: string;
  draw_numbers: number[];
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

  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [drawNumbers, setDrawNumbers] = useState<number[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [verifications, setVerifications] = useState<VerificationSubmission[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }
    
    if (user.email !== ADMIN_EMAIL) {
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
      const [usersRes, scoresRes, verificationsRes] = await Promise.all([
        supabase.auth.admin.listUsers(),
        supabase
          .from("scores")
          .select(`
            *,
            user:auth.users(email)
          `)
          .order("date", { ascending: false })
          .limit(50),
        supabase
          .from("verifications")
          .select("*")
          .order("submitted_at", { ascending: false })
          .limit(20),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (scoresRes.error) throw scoresRes.error;
      if (verificationsRes.error) throw verificationsRes.error;

      const usersList = usersRes.data.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
      }));

      const scoresList = (scoresRes.data as any[]).map(s => ({
        ...s,
        user_email: s.user?.email,
      }));

      setUsers(usersList);
      setScores(scoresList);
      setVerifications((verificationsRes.data as VerificationSubmission[]) ?? []);
    } catch (err) {
      setDbError(formatMaybeSupabaseError(err, "Failed to load admin data"));
    } finally {
      setDbLoading(false);
    }
  };

  const generateDraw = () => {
    const draw = Array.from({length:5}, () => Math.floor(Math.random()*45)+1);
    setDrawNumbers(draw);
    
    // Calculate winners
    const userScoresMap = new Map<string, number[]>();
    
    scores.forEach(score => {
      const scoreValue = score.score ?? score.points ?? score.value ?? 0;
      if (scoreValue > 0 && score.user_email) {
        if (!userScoresMap.has(score.user_email)) {
          userScoresMap.set(score.user_email, []);
        }
        userScoresMap.get(score.user_email)?.push(scoreValue);
      }
    });

    const newWinners: Winner[] = [];
    
    userScoresMap.forEach((userScores, userEmail) => {
      const matches = userScores.filter(score => draw.includes(score)).length;
      
      if (matches >= 3) {
        let prize = "";
        if (matches === 5) prize = "JACKPOT";
        else if (matches === 4) prize = "MID PRIZE";
        else if (matches === 3) prize = "SMALL PRIZE";
        
        newWinners.push({
          user_email: userEmail,
          matches,
          prize,
          draw_numbers: draw,
        });
      }
    });

    setWinners(newWinners.sort((a, b) => b.matches - a.matches));
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

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Access denied</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl">
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
          {/* Users Table */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <h2 className="text-lg font-semibold mb-4">Users ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[.08] dark:border-white/[.145]">
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-black/[.04] dark:border-white/[.08]">
                      <td className="py-2 px-2">{user.email}</td>
                      <td className="py-2 px-2 text-zinc-600 dark:text-zinc-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Scores Table */}
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
            <h2 className="text-lg font-semibold mb-4">Recent Scores ({scores.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[.08] dark:border-white/[.145]">
                    <th className="text-left py-2 px-2">User</th>
                    <th className="text-left py-2 px-2">Score</th>
                    <th className="text-left py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score.id} className="border-b border-black/[.04] dark:border-white/[.08]">
                      <td className="py-2 px-2">{score.user_email || "Unknown"}</td>
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
            <h2 className="text-lg font-semibold mb-4">Generate Draw</h2>
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
              onClick={generateDraw}
            >
              Generate New Draw
            </button>

            {drawNumbers.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Draw Numbers:</div>
                <div className="flex gap-2 flex-wrap">
                  {drawNumbers.map((num, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium dark:bg-white dark:text-black">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                      <th className="text-left py-2 px-2">Matches</th>
                      <th className="text-left py-2 px-2">Prize</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.map((winner, idx) => (
                      <tr key={idx} className="border-b border-black/[.04] dark:border-white/[.08]">
                        <td className="py-2 px-2">{winner.user_email}</td>
                        <td className="py-2 px-2">{winner.matches}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            winner.prize === "JACKPOT" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            winner.prize === "MID PRIZE" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
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
