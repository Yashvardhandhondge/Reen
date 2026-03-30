"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Dev {
  _id: string;
  name: string;
  email: string;
}

interface Punch {
  _id: string;
  date: string;
  punchIn: string;
  punchOut: string | null;
}

function getWorkedMs(punchIn: string, punchOut: string | null) {
  if (!punchOut) return 0;
  const start = new Date(punchIn).getTime();
  const end = new Date(punchOut).getTime();
  return Math.max(0, end - start);
}

function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export default function DevPunchHistoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [dev, setDev] = useState<Dev | null>(null);
  const [punches, setPunches] = useState<Punch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [devsRes, punchesRes] = await Promise.all([
          fetch("/api/admin/devs"),
          fetch(`/api/admin/devs/${id}/punches`),
        ]);

        if (!devsRes.ok || !punchesRes.ok) {
          const errBody = !punchesRes.ok ? await punchesRes.json() : await devsRes.json();
          if (!cancelled) setError(errBody.error || "Failed to load");
          return;
        }

        const devsData = await devsRes.json();
        const punchData = await punchesRes.json();

        const found = (devsData.devs || []).find((d: Dev) => d._id === id) || null;
        if (!cancelled) {
          setDev(found);
          setPunches(punchData.punches || []);
          if (!found) setError("Developer not found");
        }
      } catch {
        if (!cancelled) setError("Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function formatTime(iso?: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
  }

  const totalWorkedMs = punches.reduce((sum, p) => sum + getWorkedMs(p.punchIn, p.punchOut), 0);

  if (loading) return <p className="mt-8 text-center text-gray-500">Loading...</p>;

  if (error || !dev) {
    return (
      <div>
        <p className="text-red-600 mb-4">{error || "Developer not found"}</p>
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-xl font-bold mb-1">{dev.name}</h1>
      <p className="text-gray-600 text-sm mb-6">{dev.email}</p>
      <p className="text-sm font-medium mb-6">Total hours: {formatDuration(totalWorkedMs)}</p>

      <h2 className="font-medium mb-3">Punch history</h2>
      {punches.length === 0 ? (
        <p className="text-gray-500">No punch records yet.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Punch in</th>
                <th className="text-left px-4 py-3">Punch out</th>
                <th className="text-left px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {punches.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 font-medium">{p.date}</td>
                  <td className="px-4 py-3">{formatTime(p.punchIn)}</td>
                  <td className="px-4 py-3">{formatTime(p.punchOut)}</td>
                  <td className="px-4 py-3">{formatDuration(getWorkedMs(p.punchIn, p.punchOut))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
