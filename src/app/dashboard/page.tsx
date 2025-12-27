"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading session...</p>
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



  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="max-w-md w-full p-6 border border-gray-300 rounded-lg shadow-md text-center bg-white">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {session.user.name || session.user.email}
        </h1>

        <p className="text-gray-700 mb-6">Role: {session.user.role}</p>

        <div className="flex flex-col gap-4">
          {/* USER TASKS */}
          {session.user.role === "USER" && (
            <button
              onClick={handleViewTasks}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              View Tasks
            </button>
          )}

          {/* ADMIN */}
          {session.user.role === "ADMIN" && (
            <button
              onClick={handleGoToAdmin}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Go to Admin Panel
            </button>
          )}

          {session.user.role === "ADMIN" && (
            <button
            onClick={handleGoToTaskManagement}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
  >
              Manage Tasks
            </button>
        )}

          <button
            onClick={() => router.push("/dashboard/projects")}
            className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Projects
          </button>

        </div>
      </div>
    </div>
  );
}