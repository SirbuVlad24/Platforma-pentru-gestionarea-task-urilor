"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

type Task = {
  id: number;
  title: string;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  assignedUsers: {
    id: number;
    userId: string;
    taskId: number;
    user: {
      id: string;
      email: string;
    };
  }[];
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // 🔄 Fetch users
  useEffect(() => {
    if (!session) return;

    async function fetchUsers() {
      try {
        const res = await fetch("/api/user/list");
        const data = await res.json();

        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    }

    fetchUsers();
  }, [session]);

  // 🔄 Fetch tasks
  useEffect(() => {
    if (!session) return;

    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks/full");
        if (!res.ok) throw new Error("Failed to fetch tasks");
        
        const data = await res.json();
        setTasks(data || []);
      } catch (err) {
        console.error(err);
        setTasks([]);
      }
    }

    fetchTasks();
  }, [session]);

  // 🔼 Make Admin
  const makeAdmin = async (userId: string) => {
    try {
      const res = await fetch("/api/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: "ADMIN" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        setMessage(`Error: ${errorData.error}`);
        return;
      }

      const data = await res.json();

      setMessage(`User ${data.user.email} is now ADMIN`);

      setUsers((prev) =>
        prev.map((u) => (u.id === data.user.id ? { ...u, role: "ADMIN" } : u))
      );
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  // 🔄 Toggle expanded user
  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // ➕ Assign task to user
  const assignTask = async (userId: string, taskId: number) => {
    try {
      const res = await fetch("/api/tasks/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, taskId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        setMessage(`Error: ${errorData.error}`);
        return;
      }

      setMessage("Task assigned successfully");

      // Refresh tasks
      const tasksRes = await fetch("/api/tasks/full");
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData || []);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  // ➖ Unassign task from user
  const unassignTask = async (userId: string, taskId: number) => {
    try {
      const res = await fetch("/api/tasks/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, taskId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        setMessage(`Error: ${errorData.error}`);
        return;
      }

      setMessage("Task unassigned successfully");

      // Refresh tasks
      const tasksRes = await fetch("/api/tasks/full");
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData || []);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  // Helper: Get assigned tasks for a user
  const getAssignedTasksForUser = (userId: string): Task[] => {
    return tasks.filter((task) =>
      task.assignedUsers.some((assignment) => assignment.userId === userId)
    );
  };

  // Helper: Get unassigned tasks for a user
  const getUnassignedTasksForUser = (userId: string): Task[] => {
    return tasks.filter(
      (task) => !task.assignedUsers.some((assignment) => assignment.userId === userId)
    );
  };

  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Admin Panel – Users</h1>

      {message && (
        <p className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg font-semibold">
          {message}
        </p>
      )}

      <ul className="space-y-3">
        {users.map((user) => {
          const isExpanded = expandedUsers.has(user.id);
          const assignedTasks = getAssignedTasksForUser(user.id);
          const unassignedTasks = getUnassignedTasksForUser(user.id);

          return (
            <li
              key={user.id}
              className="bg-gray-100 rounded-lg overflow-hidden"
            >
              <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleUserExpanded(user.id)}
                    className="text-lg font-semibold hover:text-blue-600 transition-colors"
                  >
                    {isExpanded ? "▼" : "▶"} {user.email}
                  </button>
                  <span className="text-sm text-gray-500">({user.role})</span>
                  {assignedTasks.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {assignedTasks.length} task{assignedTasks.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {user.role === "USER" && (
                  <button
                    onClick={() => makeAdmin(user.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Make Admin
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                  {/* Assigned Tasks */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Assigned Tasks ({assignedTasks.length})
                    </h3>
                    {assignedTasks.length > 0 ? (
                      <ul className="space-y-2">
                        {assignedTasks.map((task) => (
                          <li
                            key={task.id}
                            className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
                          >
                            <div className="flex-1">
                              <span className="font-medium">{task.title}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                (Priority: {task.priority})
                              </span>
                              {task.completed && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Completed
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => unassignTask(user.id, task.id)}
                              className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              Unassign
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        No tasks assigned
                      </p>
                    )}
                  </div>

                  {/* Assign New Task */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Assign New Task
                    </h3>
                    {unassignedTasks.length > 0 ? (
                      <ul className="space-y-2">
                        {unassignedTasks.map((task) => (
                          <li
                            key={task.id}
                            className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
                          >
                            <div className="flex-1">
                              <span className="font-medium">{task.title}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                (Priority: {task.priority})
                              </span>
                              {task.completed && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Completed
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => assignTask(user.id, task.id)}
                              className="ml-2 px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                            >
                              Assign
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        No available tasks to assign
                      </p>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
