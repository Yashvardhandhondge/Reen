"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Dev {
  _id: string;
  name: string;
  email: string;
}

interface PunchStatus {
  devId: string;
  punchedIn: boolean;
  punchedOut: boolean;
  punchIn?: string;
  punchOut?: string;
  totalHours: string;
}

export default function AdminDashboard() {
  const [devs, setDevs] = useState<Dev[]>([]);
  const [statuses, setStatuses] = useState<Record<string, PunchStatus>>({});
  const [loading, setLoading] = useState(true);

  function calculateTotalHours(punchIn?: string, punchOut?: string) {
    if (!punchIn) return "—";
    const start = new Date(punchIn).getTime();
    const end = punchOut ? new Date(punchOut).getTime() : Date.now();
    const diffMs = Math.max(0, end - start);
    const hours = diffMs / (1000 * 60 * 60);
    return `${hours.toFixed(2)} h`;
  }

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/devs");
      const data = await res.json();
      setDevs(data.devs || []);

      const today = new Date().toISOString().split("T")[0];
      const statusMap: Record<string, PunchStatus> = {};

      await Promise.all(
        (data.devs || []).map(async (dev: Dev) => {
          const punchRes = await fetch(`/api/admin/devs/${dev._id}/punches`);
          const punchData = await punchRes.json();
          const todayRecord = (punchData.punches || []).find((p: any) => p.date === today);
          statusMap[dev._id] = {
            devId: dev._id,
            punchedIn: !!todayRecord,
            punchedOut: !!todayRecord?.punchOut,
            punchIn: todayRecord?.punchIn,
            punchOut: todayRecord?.punchOut,
            totalHours: calculateTotalHours(todayRecord?.punchIn, todayRecord?.punchOut),
          };
        })
      );

      setStatuses(statusMap);
      setLoading(false);
    }
    load();
  }, []);

  function formatTime(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString();
  }

  if (loading) return <p className="mt-8 text-center text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Today&apos;s Attendance</h1>
      {devs.length === 0 ? (
        <p className="text-gray-500">No developers added yet.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Punch In</th>
                <th className="text-left px-4 py-3">Punch Out</th>
                <th className="text-left px-4 py-3">Total Hours</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {devs.map((dev) => {
                const s = statuses[dev._id];
                let status = "Absent";
                let statusColor = "text-red-600";
                if (s?.punchedIn && !s?.punchedOut) {
                  status = "Working";
                  statusColor = "text-green-600";
                } else if (s?.punchedOut) {
                  status = "Done";
                  statusColor = "text-blue-600";
                }

                return (
                  <tr key={dev._id}>
                    <td className="px-4 py-3 font-medium">{dev.name}</td>
                    <td className={`px-4 py-3 font-medium ${statusColor}`}>{status}</td>
                    <td className="px-4 py-3">{formatTime(s?.punchIn)}</td>
                    <td className="px-4 py-3">{formatTime(s?.punchOut)}</td>
                    <td className="px-4 py-3">{s?.totalHours || "—"}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/devs/${dev._id}`} className="text-blue-600 hover:underline">
                        History
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
