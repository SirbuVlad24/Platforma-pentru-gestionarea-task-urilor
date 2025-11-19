"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Avatar from "boring-avatars";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!session) return null;

  const email = session.user?.email || "user";
  const name = session.user?.name || email;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center relative">
      
      {/* 🔵 Task Manager → Link to /dashboard */}
      <button
        onClick={() => router.push("/dashboard")}
        className="text-xl font-bold hover:text-blue-600 transition"
      >
        Task Manager
      </button>

      <div className="relative flex items-center gap-4">
        {/* Avatar cartoon */}
        <div className="cursor-pointer" onClick={() => setOpen(!open)}>
          <Avatar
            size={40}
            name={email}
            variant="beam"
            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
          />
        </div>

        {/* Numele userului */}
        <span
          className="text-gray-700 font-medium cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {name}
        </span>

        {/* Logout permanent */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-12 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => handleNavigate("/dashboard")}
            >
              Dashboard
            </button>

            {session.user.role === "USER" && (
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => handleNavigate("/dashboard/tasks_user")}
              >
                View Tasks
              </button>
            )}

            {session.user.role === "ADMIN" && (
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => handleNavigate("/admin/users")}
              >
                Admin Panel
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
