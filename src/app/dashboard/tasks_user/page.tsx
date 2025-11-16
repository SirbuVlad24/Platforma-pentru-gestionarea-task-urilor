"use client";

import { useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";
import { Task } from "../../../types";
import { useSession } from "next-auth/react";

export default function UserTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;

    const fetchTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/tasks/my-tasks");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load tasks");
          setTasks([]);
        } else {
          setTasks(data.tasks || []);
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Unknown error");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [session]);

  if (!session)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading session...</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">My Tasks</h1>

      {loading && <p className="text-center text-gray-600">Loading tasks...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && tasks.length === 0 && (
        <p className="text-center text-gray-700">No tasks assigned yet.</p>
      )}

      <div className="flex flex-col">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
            priority={task.priority}
            status={task.status}
          />
        ))}
      </div>
    </div>
  );
}
