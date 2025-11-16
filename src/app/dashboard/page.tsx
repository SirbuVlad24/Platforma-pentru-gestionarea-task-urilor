"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const goToAdmin = () => router.push("/admin/users");

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="max-w-md w-full p-6 border border-gray-300 rounded-lg shadow-md text-center bg-white">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {session.user.name || session.user.email}
        </h1>

        <p className="text-gray-700 mb-6">Role: {session.user.role}</p>

        <div className="flex flex-col gap-4">

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>

          {/* ADMIN BUTTON */}
          {session.user.role === "ADMIN" && (
            <button
              onClick={goToAdmin}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go to Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
