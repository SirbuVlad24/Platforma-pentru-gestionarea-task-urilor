"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [missedTasks, setMissedTasks] = useState<any[]>([]);
  const [currentMissedTaskIndex, setCurrentMissedTaskIndex] = useState(0);

  useEffect(() => {
    if (!session) return;

    const checkMissedTasks = async () => {
      try {
        const res = await fetch("/api/tasks/my-tasks");
        const data = await res.json();
        
        if (res.ok && data.tasks) {
          const currentTime = new Date();
          
          const missed = data.tasks.filter((task: any) => {
            if (!task.deadline) return false;
            const deadlineDate = new Date(task.deadline);
            const isOverdue = deadlineDate < currentTime;
            const isNotDone = task.status !== "DONE";
            return isOverdue && isNotDone;
          });
          
          // Sort missed tasks: by deadline (oldest first), then by priority (HIGH > MEDIUM > LOW), then alphabetically
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          missed.sort((a: any, b: any) => {
            const deadlineA = new Date(a.deadline).getTime();
            const deadlineB = new Date(b.deadline).getTime();
            
            // First: by deadline (oldest first)
            if (deadlineA !== deadlineB) {
              return deadlineA - deadlineB;
            }
            
            // Second: by priority (HIGH > MEDIUM > LOW)
            const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
            const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
            if (priorityA !== priorityB) {
              return priorityB - priorityA; // Descending (HIGH first)
            }
            
            // Third: alphabetically by title
            return a.title.localeCompare(b.title);
          });
          
          // Filter out already dismissed tasks
          if (typeof window !== "undefined") {
            const dismissedTaskIds = localStorage.getItem("missedTasksNotificationDismissed");
            const dismissedIds = dismissedTaskIds ? JSON.parse(dismissedTaskIds) : [];
            const notDismissed = missed.filter((task: any) => !dismissedIds.includes(task.id));
            setMissedTasks(notDismissed);
            
            // Reset index if current task was dismissed
            if (currentMissedTaskIndex >= notDismissed.length) {
              setCurrentMissedTaskIndex(0);
            }
          } else {
            setMissedTasks(missed);
          }
        }
      } catch (err) {
        console.error("Error checking missed tasks:", err);
      }
    };

    // Run immediately and then every 30 seconds
    checkMissedTasks();
    const interval = setInterval(checkMissedTasks, 30000);
    return () => clearInterval(interval);
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
  
  const getCurrentMissedTask = () => {
    if (missedTasks.length === 0 || currentMissedTaskIndex >= missedTasks.length) {
      return null;
    }
    return missedTasks[currentMissedTaskIndex];
  };
  
  const getMissedTaskMessage = (task: any) => {
    return `Avast ye, ${getUserName()}! Ye've missed yer mission "${task.title}"! The Captain won't be pleased, sailor!`;
  };
  
  const getNormalMessage = () => {
    if (session.user.role === "ADMIN") {
      return `Ahoy, ${getUserName()}! What be yer command, Captain? Choose yer path wisely!`;
    } else {
      return `Ahoy, ${getUserName()}! What adventure awaits ye today, matey?`;
    }
  };
  
  const handleDismissMissedTask = () => {
    const currentTask = getCurrentMissedTask();
    if (!currentTask) return;
    
    // Save dismissed task ID to localStorage
    if (typeof window !== "undefined") {
      const dismissedTaskIds = localStorage.getItem("missedTasksNotificationDismissed");
      const dismissedIds = dismissedTaskIds ? JSON.parse(dismissedTaskIds) : [];
      const updatedIds = [...new Set([...dismissedIds, currentTask.id])];
      localStorage.setItem("missedTasksNotificationDismissed", JSON.stringify(updatedIds));
    }
    
    // Remove current task from list and show next one
    const remainingTasks = missedTasks.filter((t: any) => t.id !== currentTask.id);
    setMissedTasks(remainingTasks);
    setCurrentMissedTaskIndex(0); // Reset to first remaining task
  };

  return (
    <div className="min-h-screen bg-red-50 px-4 py-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 items-center">
        {/* Skully Message Banner - Missed Task (Priority) */}
        {(() => {
          const currentTask = getCurrentMissedTask();
          if (currentTask) {
            return (
              <div className="w-full mb-4 p-4 bg-red-100 rounded-xl font-bold border-4 border-black shadow-xl relative" style={{ fontFamily: "'Pirata One', cursive" }}>
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
                    <div className="text-xl text-red-900">"{getMissedTaskMessage(currentTask)}"</div>
                  </div>
                  <button
                    onClick={handleDismissMissedTask}
                    className="text-2xl hover:scale-125 transition-transform"
                    title="Dismiss"
                  >
                    ❌
                  </button>
                </div>
                {/* Speech bubble tail */}
                <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black"></div>
              </div>
            );
          }
          return null;
        })()}

        {/* Skully Message Banner - Normal (when no missed tasks) */}
        {!getCurrentMissedTask() && (
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
                <div className="text-xl">"{getNormalMessage()}"</div>
              </div>
            </div>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        )}

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