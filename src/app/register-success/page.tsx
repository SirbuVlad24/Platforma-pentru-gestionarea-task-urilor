"use client";

import Link from "next/link";

export default function RegistrationSuccess() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-gray-300 rounded-lg text-center">
      <h1 className="text-2xl font-bold mb-4">Registration Complete!</h1>
      <p className="mb-6">Your account has been created successfully.</p>

      <Link href="/login">
        <button className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Go to Login
        </button>
      </Link>
    </div>
  );
}
