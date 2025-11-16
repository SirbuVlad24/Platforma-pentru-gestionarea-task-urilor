"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Task } from "@/components/admin/types";
import AdminUserCard from "@/components/admin/AdminUserCard";
import MessageBanner from "@/components/admin/MessageBanner";

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
      router.push("/");
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

      <MessageBanner message={message} />

      <ul className="space-y-3">
        {users.map((user) => {
          const isExpanded = expandedUsers.has(user.id);
          const assignedTasks = getAssignedTasksForUser(user.id);
          const unassignedTasks = getUnassignedTasksForUser(user.id);

          return (
            <AdminUserCard
              key={user.id}
              user={user}
              isExpanded={isExpanded}
              assignedTasks={assignedTasks}
              unassignedTasks={unassignedTasks}
              onToggleExpand={() => toggleUserExpanded(user.id)}
              onMakeAdmin={() => makeAdmin(user.id)}
              onAssignTask={(taskId) => assignTask(user.id, taskId)}
              onUnassignTask={(taskId) => unassignTask(user.id, taskId)}
            />
          );
        })}
      </ul>
    </div>
  );
}
