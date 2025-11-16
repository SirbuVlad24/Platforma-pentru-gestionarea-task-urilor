"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <Link href="/login">Login</Link> |{" "}
        <Link href="/register">Register</Link>{" "}
        <div className="text-red-500">Test Tailwind</div>
      </nav>
    </div>
  );
}
