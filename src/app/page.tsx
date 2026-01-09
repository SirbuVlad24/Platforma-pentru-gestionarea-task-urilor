"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-red-50" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23DC2626\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}>
      <div className="bg-red-100 p-12 rounded-xl border-4 border-black shadow-2xl">
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-6xl">🏴‍☠️</span>
          <h1 className="text-5xl font-bold text-red-900" style={{ fontFamily: "'Pirata One', cursive", textShadow: "3px 3px 6px rgba(0,0,0,0.4)" }}>
            Captain's Log
          </h1>
          <span className="text-6xl">🏴‍☠️</span>
        </div>

        <p className="text-xl text-red-800 mb-8 font-semibold">
          Welcome aboard, sailor! Choose yer path:
        </p>

        <nav className="flex gap-6 text-lg justify-center">
          <Link
            href="/login"
            className="px-8 py-4 rounded-lg bg-red-800 text-yellow-400 hover:bg-red-900 transition font-bold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-black"
            style={{ fontFamily: "'Pirata One', cursive" }}
          >
            Board the Ship
          </Link>

          <Link
            href="/register"
            className="px-8 py-4 rounded-lg bg-red-700 text-yellow-400 hover:bg-red-800 transition font-bold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-black"
            style={{ fontFamily: "'Pirata One', cursive" }}
          >
            Join the Crew
          </Link>
        </nav>
      </div>
    </div>
  );
}
