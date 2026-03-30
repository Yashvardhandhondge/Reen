import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reen dev&apos;s Productivity Tracker",
  description: "Track developer punch in/out times",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        {children}
      </body>
    </html>
  );
}
