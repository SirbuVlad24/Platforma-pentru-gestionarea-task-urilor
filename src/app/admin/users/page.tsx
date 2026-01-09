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

      setMessage(`${data.user.email} has been promoted to Captain!`);

      setUsers((prev) =>
        prev.map((u) => (u.id === data.user.id ? { ...u, role: "ADMIN" } : u))
      );
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong on the ship, Captain! Check the logs!");
    }
  };

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

      setMessage("Mission assigned successfully! The crew member has been given their orders!");


      const tasksRes = await fetch("/api/tasks/full");
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData || []);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong on the ship, Captain! Check the logs!");
    }
  };


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

      setMessage("Mission unassigned successfully! The crew member has been relieved of duty!");

    
      const tasksRes = await fetch("/api/tasks/full");
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData || []);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong on the ship, Captain! Check the logs!");
    }
  };

  
  const getAssignedTasksForUser = (userId: string): Task[] => {
    return tasks.filter((task) =>
      task.assignedUsers.some((assignment) => assignment.userId === userId)
    );
  };

  const getUnassignedTasksForUser = (userId: string): Task[] => {
    return tasks.filter(
      (task) => !task.assignedUsers.some((assignment) => assignment.userId === userId)
    );
  };

  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-red-900 flex items-center gap-3" style={{ fontFamily: "'Pirata One', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
        <span className="text-3xl">🏴‍☠️</span>
        Captain's Quarters
        <span className="text-3xl">⚓</span>
      </h1>

      <MessageBanner 
        message={message} 
        type={message.toLowerCase().includes("error") || message.toLowerCase().includes("not eligible") ? "error" : "success"}
      />

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
