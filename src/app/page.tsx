"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome</h1>

      <nav className="flex gap-6 text-lg">
        <Link
          href="/login"
          className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
        >
          Register
        </Link>
      </nav>
    </div>
  );
}
