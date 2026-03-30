"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TodayRecord {
  _id: string;
  date: string;
  punchIn: string;
  punchOut: string | null;
}

export default function DevDashboardPage() {
  const router = useRouter();
  const [record, setRecord] = useState<TodayRecord | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadToday = useCallback(async () => {
    const res = await fetch("/api/dev/today");
    const data = await res.json();
    if (res.status === 401 || res.status === 403) {
      router.push("/login");
      return;
    }
    if (!res.ok) {
      setError(data.error || "Failed to load");
      setRecord(null);
      return;
    }
    setError("");
    setRecord(data.record ?? null);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadToday();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadToday]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handlePunchIn() {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dev/punch-in", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Punch in failed");
        return;
      }
      await loadToday();
    } catch {
      setError("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePunchOut() {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dev/punch-out", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Punch out failed");
        return;
      }
      await loadToday();
    } catch {
      setError("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString();
  }

  if (loading || record === undefined) {
    return <p className="mt-8 text-center text-gray-500">Loading...</p>;
  }

  const punchedIn = !!record;
  const punchedOut = !!record?.punchOut;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">Reen dev&apos;s Productivity Tracker</span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </nav>
      <main className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-6">Today</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {!punchedIn && (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">You have not punched in today.</p>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handlePunchIn}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? "Working..." : "Punch In"}
            </button>
          </div>
        )}

        {punchedIn && !punchedOut && (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-2">Punched in at</p>
            <p className="font-medium mb-4">{formatTime(record!.punchIn)}</p>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handlePunchOut}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? "Working..." : "Punch Out"}
            </button>
          </div>
        )}

        {punchedIn && punchedOut && (
          <div className="bg-white shadow rounded-lg p-6 space-y-3">
            <p className="text-gray-600 text-sm">You are done for today.</p>
            <div>
              <p className="text-sm text-gray-500">Punch in</p>
              <p className="font-medium">{formatTime(record!.punchIn)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Punch out</p>
              <p className="font-medium">{formatTime(record!.punchOut!)}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
