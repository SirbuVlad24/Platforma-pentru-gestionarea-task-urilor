"use client";

import { useState, useEffect } from "react";

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  deadline?: string | null;
  project?: {
    id: number;
    name: string;
  } | null;
  onComplete?: () => void;
}

export default function TaskCard({
  id,
  title,
  description,
  priority,
  status,
  deadline,
  project,
  onComplete,
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every 10 seconds for live deadline tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleComplete = async () => {
    if (currentStatus === "DONE" || currentStatus === "Done") return;

    setIsCompleting(true);
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to complete mission, sailor!");
        return;
      }

      setCurrentStatus("DONE");
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong on the ship, sailor!");
    } finally {
      setIsCompleting(false);
    }
  };
  const priorityColor =
    priority === "High"
      ? "bg-red-200 text-red-800"
      : priority === "Low"
      ? "bg-green-200 text-green-800"
      : "bg-yellow-200 text-yellow-800";

  const displayStatus = currentStatus || status;
  const isDone = displayStatus === "DONE" || displayStatus === "Done";
  
  // Check if task is missed (deadline passed but not completed)
  const isMissed = deadline && new Date(deadline) < currentTime && !isDone;

  const statusColor = isDone
      ? "bg-green-100 text-green-800"
      : isMissed
      ? "bg-red-200 text-red-900"
      : displayStatus === "IN_PROGRESS" || displayStatus === "In Progress"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className={`border-4 border-black rounded-lg shadow-lg p-4 mb-4 ${isDone ? "bg-gray-200 opacity-75" : isMissed ? "bg-red-200 opacity-75" : "bg-red-100"} hover:shadow-xl transition-all`}>
      <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isDone ? "text-gray-700" : isMissed ? "text-red-900" : "text-red-900"}`} style={{ fontFamily: "'Pirata One', cursive" }}>
        <span className="text-xl">📜</span>
        {title}
      </h3>
      {description && <p className={`mb-3 font-semibold ${isDone ? "text-gray-600" : isMissed ? "text-red-800" : "text-red-800"}`}>{description}</p>}

      {project && (
        <div className="mb-3">
          <span className="inline-block px-3 py-2 rounded-lg text-base font-bold border-2 border-blue-400 bg-blue-200 text-blue-900 shadow-md">
            🚢 {project.name}
          </span>
        </div>
      )}

      {deadline && (() => {
        const deadlineDate = new Date(deadline);
        const isOverdue = deadlineDate < currentTime;
        const timeUntilDeadline = deadlineDate.getTime() - currentTime.getTime();
        const isDueSoon = timeUntilDeadline > 0 && timeUntilDeadline < 24 * 60 * 60 * 1000; // Less than 24 hours
        
        return (
          <div className="mb-2">
            <span className={`px-2 py-1 rounded text-sm font-bold border border-black ${
              isOverdue
                ? "bg-red-300 text-red-900" 
                : isDueSoon
                ? "bg-yellow-200 text-yellow-900"
                : "bg-blue-200 text-blue-900"
            } flex items-center gap-1`}>
              <span>⏰</span>
              Deadline: {deadlineDate.toLocaleString()}
              {isOverdue && <span className="ml-1">⚠️ OVERDUE!</span>}
              {isDueSoon && !isOverdue && <span className="ml-1">⚠️ Due Soon!</span>}
            </span>
          </div>
        );
      })()}

      <div className="flex gap-2 items-center flex-wrap">
        <span className={`px-2 py-1 rounded text-sm font-bold border border-black ${priorityColor} flex items-center gap-1`}>
          <span>⚓</span>
          Danger Level: {priority || "Medium"}
        </span>
        <span className={`px-2 py-1 rounded text-sm font-bold border border-black ${statusColor} flex items-center gap-1`}>
          <span>{isDone ? "✅" : isMissed ? "❌" : displayStatus === "IN_PROGRESS" || displayStatus === "In Progress" ? "⚓" : "📜"}</span>
          {isDone ? "Completed Voyage" : isMissed ? "Mission Missed" : displayStatus === "IN_PROGRESS" || displayStatus === "In Progress" ? "Underway" : "To Do (Awaiting Orders)"}
        </span>
        {!isDone && !isMissed && (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition font-bold text-sm border-2 border-black shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Pirata One', cursive" }}
          >
            {isCompleting ? "⏳ Completing..." : "✅ Mark as Complete"}
          </button>
        )}
      </div>
    </div>
  );
}
