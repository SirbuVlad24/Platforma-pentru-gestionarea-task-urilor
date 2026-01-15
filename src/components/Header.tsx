"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "boring-avatars";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Don't show header on public pages
  const publicPages = ["/", "/login", "/register", "/register-success"];
  if (publicPages.includes(pathname)) return null;

  if (!session) return null;

  const email = session.user?.email || "user";
  const name = session.user?.name || email;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="w-full bg-red-900 shadow-lg px-6 py-4 flex justify-between items-center relative border-b-4 border-black">
      
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-3 text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition transform hover:scale-105"
        style={{ fontFamily: "'Pirata One', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
      >
        <span className="text-4xl">🏴‍☠️</span>
        Captain's Log
      </button>

      <div className="relative flex items-center gap-4">
       
        <Avatar
          size={40}
          name={email}
          variant="beam"
          colors={["#DC2626", "#991B1B", "#FCD34D", "#78350F", "#1F2937"]}
        />

        <span className="text-yellow-400 font-semibold text-lg flex items-center gap-2">
          {name}
          {session.user?.role === "ADMIN" ? (
            <span className="text-xs bg-yellow-500 text-red-900 px-2 py-1 rounded-full font-bold border-2 border-black">🏴‍☠️ Captain</span>
          ) : (
            <span className="text-xs bg-red-700 text-yellow-300 px-2 py-1 rounded-full font-bold border-2 border-black">⚓ Crew</span>
          )}
        </span>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-red-900 text-yellow-400 rounded-lg hover:bg-red-950 hover:text-yellow-300 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-yellow-400 hover:border-yellow-300"
          style={{ fontFamily: "'Pirata One', cursive", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
        >
          ⚓ Abandon Ship
        </button>
      </div>
    </header>
  );
}
