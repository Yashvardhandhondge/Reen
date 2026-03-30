"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">Reen dev's Productivity Tracker</span>
          <Link
            href="/admin/dashboard"
            className={`text-sm ${pathname === "/admin/dashboard" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/profile"
            className={`text-sm ${pathname === "/admin/profile" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
          >
            Edit Admin
          </Link>
        </div>
        <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">
          Logout
        </button>
      </nav>
      <main className="p-4 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
