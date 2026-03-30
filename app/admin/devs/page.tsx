"use client";

import { useCallback, useEffect, useState } from "react";

interface Dev {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function devsToCsv(devs: Dev[]) {
  const header = "Name,Email,Password";
  const rows = devs.map((d) =>
    [escapeCsvCell(d.name), escapeCsvCell(d.email), escapeCsvCell(d.password)].join(",")
  );
  return [header, ...rows].join("\r\n");
}

export default function AdminDevsPage() {
  const [devs, setDevs] = useState<Dev[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadDevs = useCallback(async () => {
    const res = await fetch("/api/admin/devs");
    const data = await res.json();
    if (!res.ok) {
      setDevs([]);
      return;
    }
    setDevs(data.devs || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadDevs();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDevs]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/devs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create developer");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      await loadDevs();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function downloadCsv() {
    const csv = devsToCsv(devs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "developers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
  }

  if (loading) return <p className="mt-8 text-center text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Developers</h1>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={devs.length === 0}
          className="text-sm bg-gray-100 border border-gray-300 px-3 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Download CSV
        </button>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white shadow rounded-lg p-4 mb-6 space-y-3 max-w-md"
      >
        <h2 className="font-medium text-gray-800">Add developer</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create"}
        </button>
      </form>

      {devs.length === 0 ? (
        <p className="text-gray-500">No developers yet.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {devs.map((dev) => (
                <tr key={dev._id}>
                  <td className="px-4 py-3 font-medium">{dev.name}</td>
                  <td className="px-4 py-3">{dev.email}</td>
                  <td className="px-4 py-3">{formatDate(dev.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
