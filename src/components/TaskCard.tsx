"use client";

import { useState } from "react";

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  onComplete?: () => void;
}

export default function TaskCard({
  id,
  title,
  description,
  priority,
  status,
  onComplete,
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

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

  const statusColor = isDone
      ? "bg-green-100 text-green-800"
      : displayStatus === "IN_PROGRESS" || displayStatus === "In Progress"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className={`border-4 border-black rounded-lg shadow-lg p-4 mb-4 ${isDone ? "bg-gray-200 opacity-75" : "bg-red-100"} hover:shadow-xl transition-all`}>
      <h3 className="text-lg font-bold mb-2 text-red-900 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
        <span className="text-xl">📜</span>
        {title}
        {isDone && <span className="text-sm bg-green-200 text-green-900 px-2 py-1 rounded border border-black">✅ Completed Voyage</span>}
      </h3>
      {description && <p className="text-red-800 mb-2 font-semibold">{description}</p>}

      <div className="flex gap-2 items-center flex-wrap">
        <span className={`px-2 py-1 rounded text-sm font-bold border border-black ${priorityColor} flex items-center gap-1`}>
          <span>⚓</span>
          Danger Level: {priority || "Medium"}
        </span>
        <span className={`px-2 py-1 rounded text-sm font-bold border border-black ${statusColor} flex items-center gap-1`}>
          <span>{isDone ? "✅" : displayStatus === "IN_PROGRESS" || displayStatus === "In Progress" ? "⚓" : "📜"}</span>
          {isDone ? "Completed Voyage" : displayStatus === "IN_PROGRESS" || displayStatus === "In Progress" ? "Underway" : "To Do (Awaiting Orders)"}
        </span>
        {!isDone && (
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
