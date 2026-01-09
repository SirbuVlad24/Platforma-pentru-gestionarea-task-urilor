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
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <p className="text-lg text-red-900 flex items-center gap-2">
          <span className="animate-spin">⚓</span>
          Loading yer ship, matey...
        </p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-900 flex items-center justify-center gap-3" style={{ fontFamily: "'Pirata One', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
        <span className="text-4xl">📜</span>
        My Missions
        <span className="text-4xl">⚓</span>
      </h1>

      {loading && <p className="text-center text-red-800 flex items-center justify-center gap-2 font-bold">
        <span className="animate-spin">⚓</span>
        Scouring the logbook, matey...
      </p>}
      {error && (
        <div className="mb-4 p-4 rounded-xl font-bold border-4 border-black shadow-xl relative bg-white text-red-900" style={{ fontFamily: "'Pirata One', cursive" }}>
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
              <div className="text-xl">"{error}"</div>
            </div>
          </div>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black"></div>
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <p className="text-center text-red-900 bg-red-200 p-4 rounded border-2 border-black flex items-center justify-center gap-2 font-bold">
          <span>📜</span>
          No missions assigned yet, sailor! Check back later!
        </p>
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
            onComplete={() => {
              // Refresh tasks after completion
              fetch("/api/tasks/my-tasks")
                .then((res) => res.json())
                .then((data) => {
                  if (data.tasks) {
                    setTasks(data.tasks);
                  }
                })
                .catch(console.error);
            }}
          />
        ))}
      </div>
    </div>
  );
}
