"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <Link href="/login">Login</Link> |{" "}
        <Link href="/register">Register</Link>{" "}
      </nav>
    </div>
  );
}
