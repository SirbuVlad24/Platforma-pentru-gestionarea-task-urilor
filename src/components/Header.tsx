"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Avatar from "boring-avatars";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) return null;

  const email = session.user?.email || "user";
  const name = session.user?.name || email;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center relative">
      
      <button
        onClick={() => router.push("/dashboard")}
        className="text-xl font-bold hover:text-blue-600 transition"
      >
        Task Manager
      </button>

      <div className="relative flex items-center gap-4">
       
        <Avatar
          size={40}
          name={email}
          variant="beam"
          colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
        />

        <span className="text-gray-700 font-medium">
          {name}
        </span>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
