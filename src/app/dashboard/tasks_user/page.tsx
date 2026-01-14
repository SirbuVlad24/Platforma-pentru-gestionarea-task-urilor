"use client";

import { useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";
import { Task } from "../../../types";
import { useSession } from "next-auth/react";

type SortOption = "deadline" | "priority" | "alphabetical" | "project";

export default function UserTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("deadline");

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

      {!loading && tasks.length > 0 && (
        <div className="mb-4 flex justify-end">
          <div className="flex items-center gap-2">
            <label className="text-red-900 font-bold text-sm" style={{ fontFamily: "'Pirata One', cursive" }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-white border-2 border-black rounded-lg text-red-900 font-bold cursor-pointer hover:bg-red-50 transition"
              style={{ fontFamily: "'Pirata One', cursive" }}
            >
              <option value="deadline">⏰ Deadline</option>
              <option value="priority">⚓ Priority</option>
              <option value="project">🚢 Project</option>
              <option value="alphabetical">🔤 Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        {(() => {
          const sortedTasks = [...tasks].sort((a, b) => {
            if (sortBy === "deadline") {
              // Sort by deadline: tasks without deadline go to the end
              if (!a.deadline && !b.deadline) return 0;
              if (!a.deadline) return 1;
              if (!b.deadline) return -1;
              return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
            } else if (sortBy === "priority") {
              // Sort by priority: HIGH > MEDIUM > LOW
              const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
              const priorityA = priorityOrder[(a.priority?.toUpperCase() as keyof typeof priorityOrder) || "MEDIUM"] || 2;
              const priorityB = priorityOrder[(b.priority?.toUpperCase() as keyof typeof priorityOrder) || "MEDIUM"] || 2;
              if (priorityA !== priorityB) {
                return priorityB - priorityA; // Descending (HIGH first)
              }
              // If same priority, sort by deadline, then alphabetically
              if (a.deadline && b.deadline) {
                const deadlineDiff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                if (deadlineDiff !== 0) return deadlineDiff;
              }
              return (a.title || "").localeCompare(b.title || "");
            } else if (sortBy === "project") {
              // Sort by project: tasks without project go to the end
              const projectA = (a as any).project?.name || "";
              const projectB = (b as any).project?.name || "";
              if (!projectA && !projectB) return 0;
              if (!projectA) return 1;
              if (!projectB) return -1;
              // If both have projects, sort alphabetically by project name
              const projectCompare = projectA.localeCompare(projectB);
              if (projectCompare !== 0) return projectCompare;
              // If same project, sort by deadline, then alphabetically
              if (a.deadline && b.deadline) {
                const deadlineDiff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                if (deadlineDiff !== 0) return deadlineDiff;
              }
              return (a.title || "").localeCompare(b.title || "");
            } else {
              // Sort alphabetically by title
              return (a.title || "").localeCompare(b.title || "");
            }
          });

          return sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              priority={task.priority}
              status={task.status}
              deadline={task.deadline}
              project={(task as any).project || null}
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
          ));
        })()}
      </div>
    </div>
  );
}
