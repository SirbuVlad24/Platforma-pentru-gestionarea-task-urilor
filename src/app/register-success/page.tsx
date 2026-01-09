"use client";

import Link from "next/link";

export default function RegistrationSuccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 px-4" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23DC2626\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}>
      <div className="max-w-md w-full bg-red-100 shadow-2xl rounded-xl p-8 border-4 border-black text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-5xl">🎉</span>
          <h1 className="text-3xl font-bold text-red-900" style={{ fontFamily: "'Pirata One', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
            Welcome Aboard!
          </h1>
          <span className="text-5xl">🏴‍☠️</span>
        </div>
        <p className="mb-6 text-red-900 font-semibold text-lg">
          Yer account has been created successfully, ye new crew member!
        </p>
        <p className="mb-8 text-red-800 font-semibold">
          Time to set sail and board the ship!
        </p>

        <Link href="/login">
          <button className="px-8 py-3 bg-red-800 text-yellow-400 rounded-lg hover:bg-red-900 transition font-bold text-lg border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-105" style={{ fontFamily: "'Pirata One', cursive" }}>
            ⚓ Board the Ship!
          </button>
        </Link>
      </div>
    </div>
  );
}
