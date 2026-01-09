"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session)
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <p className="text-lg text-red-900 flex items-center gap-2">
          <span className="animate-spin">⚓</span>
          Loading yer ship, matey...
        </p>
      </div>
    );

  const handleViewTasks = () => {
    router.push("/dashboard/tasks_user");
  };

  const handleGoToAdmin = () => {
    router.push("/admin/users");
  };

  const handleGoToTaskManagement = () => {
    router.push("/dashboard/manage_admin");
  };



  const getUserName = () => session.user.name || session.user.email || "Sailor";
  
  const getPirateMessage = () => {
    if (session.user.role === "ADMIN") {
      return `Ahoy, ${getUserName()}! What be yer command, Captain? Choose yer path wisely!`;
    } else {
      return `Ahoy, ${getUserName()}! What adventure awaits ye today, matey?`;
    }
  };

  return (
    <div className="min-h-screen bg-red-50 px-4 py-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 items-center">
        {/* Skully Message Banner */}
        <div className="w-full mb-4 p-4 bg-white rounded-xl font-bold border-4 border-black shadow-xl relative" style={{ fontFamily: "'Pirata One', cursive" }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <img 
                src="/skully.png" 
                alt="Skully the Parrot" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="text-lg mb-1">Skully squawks:</div>
              <div className="text-xl">"{getPirateMessage()}"</div>
            </div>
          </div>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black"></div>
        </div>

        {/* Menu Options - Centered */}
        <div className="w-full flex flex-col gap-6">
          {/* CREW MEMBER MISSIONS */}
          {session.user.role === "USER" && (
            <button
              onClick={handleViewTasks}
              className="w-full py-8 px-8 bg-red-700 text-yellow-400 rounded-xl hover:bg-red-800 transition font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-start gap-4 border-4 border-black text-2xl"
              style={{ fontFamily: "'Pirata One', cursive", minHeight: "120px" }}
            >
              <span className="text-4xl">📜</span>
              <span>View My Missions</span>
            </button>
          )}

          {/* CAPTAIN */}
          {session.user.role === "ADMIN" && (
            <button
              onClick={handleGoToAdmin}
              className="w-full py-8 px-8 bg-red-800 text-yellow-400 rounded-xl hover:bg-red-900 transition font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-start gap-4 border-4 border-black text-2xl"
              style={{ fontFamily: "'Pirata One', cursive", minHeight: "120px" }}
            >
              <span className="text-4xl">🏴‍☠️</span>
              <span>Captain's Quarters</span>
            </button>
          )}

          {session.user.role === "ADMIN" && (
            <button
              onClick={handleGoToTaskManagement}
              className="w-full py-8 px-8 bg-red-700 text-yellow-400 rounded-xl hover:bg-red-800 transition font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-start gap-4 border-4 border-black text-2xl"
              style={{ fontFamily: "'Pirata One', cursive", minHeight: "120px" }}
            >
              <span className="text-4xl">📋</span>
              <span>Manage Missions</span>
            </button>
          )}

          <button
            onClick={() => router.push("/dashboard/projects")}
            className="w-full py-8 px-8 bg-red-900 text-yellow-400 rounded-xl hover:bg-black transition font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-start gap-4 border-4 border-black text-2xl"
            style={{ fontFamily: "'Pirata One', cursive", minHeight: "120px" }}
          >
            <span className="text-4xl">🚢</span>
            <span>The Fleet</span>
          </button>
        </div>
      </div>
    </div>
  );
}