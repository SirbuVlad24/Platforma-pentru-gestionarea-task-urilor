"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Task = {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  status: string;
  deadline?: string | null;
  assignedUsers: Array<{
    id: number;
    userId: string;
    user: { id: string; email: string };
  }>;
};

type Project = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  members: Array<{
    id: number;
    user: { id: string; email: string; name?: string };
  }>;
  admins: Array<{
    id: number;
    user: { id: string; email: string; name?: string };
  }>;
  tasks: Task[];
  _count: {
    tasks: number;
    members: number;
    admins: number;
  };
};

type User = {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ADMIN";
};

export default function ProjectsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every 10 seconds for live deadline tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    fetchProjects();
    // Only fetch users if user is a global ADMIN (required for user list API)
    if (session.user.role === "ADMIN") {
      fetchUsers();
    }
  }, [session, router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects/list");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/user/list");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const createProject = async () => {
    if (!newProject.name.trim()) {
      setMessage("Every ship needs a name, Captain! What shall we call it?");
      return;
    }

    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!res.ok) {
        const error = await res.json();
        setMessage(error.error || "Failed to commission the ship, Captain!");
        return;
      }

      setMessage("Ship commissioned successfully! Welcome to the fleet!");
      setNewProject({ name: "", description: "" });
      setShowCreateForm(false);
      fetchProjects();
    } catch (err) {
      setMessage("Something went wrong on the ship, Captain! Check the logs!");
    }
  };

  const addMember = async (projectId: number, userId: string) => {
    try {
      const res = await fetch("/api/projects/add-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, userId }),
      });

      if (!res.ok) {
        const error = await res.json();
        setMessage(error.error || "Failed to recruit crew member, Captain!");
        return;
      }

      setMessage("Crew member recruited successfully! Welcome aboard!");
      fetchProjects();
    } catch (err) {
      setMessage("Something went wrong on the ship, Captain! Check the logs!");
    }
  };

  const addAdmin = async (projectId: number, userId: string) => {
    try {
      const res = await fetch("/api/projects/add-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, userId }),
      });

      if (!res.ok) {
        const error = await res.json();
        setMessage(error.error || "Failed to promote to Captain, Captain!");
        return;
      }

      setMessage("Crew member promoted to Captain successfully! They now command this ship!");
      fetchProjects();
    } catch (err) {
      setMessage("Something went wrong on the ship, Captain! Check the logs!");
    }
  };

  const removeMember = async (projectId: number, userId: string) => {
    try {
      const res = await fetch("/api/projects/remove-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, userId }),
      });

      if (!res.ok) {
        const error = await res.json();
        setMessage(error.error || "Failed to maroon crew member, Captain!");
        return;
      }

      setMessage("Crew member marooned successfully! They've been left behind!");
      fetchProjects();
    } catch (err) {
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
        const error = await res.json();
        setMessage(error.error || "Failed to unassign mission, Captain!");
        return;
      }

      setMessage("Mission unassigned successfully! The crew member has been relieved of duty!");
      fetchProjects();
    } catch (err) {
      setMessage("Something went wrong on the ship, Captain! Check the logs!");
    }
  };

  const getTasksForMember = (project: Project, memberId: string): Task[] => {
    // Get only tasks that belong to this project and are assigned to the member
    const memberTasks = project.tasks.filter((task) =>
      task.assignedUsers.some((assignment) => assignment.userId === memberId)
    );

    // Priority order: HIGH > MEDIUM > LOW
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

    // Sort: first by priority (HIGH first), then alphabetically by title
    return memberTasks.sort((a, b) => {
      // Compare by priority
      const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99) -
                          (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      // If same priority, sort alphabetically by title
      return a.title.localeCompare(b.title);
    });
  };

  const toggleExpand = (projectId: number) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const isProjectAdmin = (project: Project) => {
    if (session?.user.role === "ADMIN") return true;
    return project.admins.some((admin) => admin.user.id === session?.user.id);
  };

  if (!session) {
    return <div className="bg-red-50 min-h-screen flex items-center justify-center"><p className="text-center text-red-900 flex items-center gap-2"><span className="animate-spin">⚓</span>Loading yer fleet, matey...</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-900 flex items-center gap-3" style={{ fontFamily: "'Pirata One', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
          <span className="text-4xl">🚢</span>
          The Fleet
        </h1>
        {session.user.role === "ADMIN" && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-red-800 text-yellow-400 rounded hover:bg-red-900 transition font-bold shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-black"
            style={{ fontFamily: "'Pirata One', cursive" }}
          >
            {showCreateForm ? "❌ Abandon" : "🚢 Commission Ship"}
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-xl font-bold border-4 border-black shadow-xl relative bg-white ${
            message.includes("error") || message.includes("Failed") || message.includes("not eligible")
              ? "text-red-900"
              : "text-green-900"
          }`}
          style={{ fontFamily: "'Pirata One', cursive" }}
        >
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
              <div className="text-xl">"{message}"</div>
            </div>
            <button
              onClick={() => setMessage("")}
              className="text-2xl hover:scale-125 transition-transform"
              title="Dismiss"
            >
              ❌
            </button>
          </div>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black"></div>
        </div>
      )}

      {showCreateForm && session.user.role === "ADMIN" && (
        <div className="bg-red-100 shadow-xl p-4 rounded-lg mb-6 border-4 border-black">
          <h2 className="text-xl font-semibold mb-3 text-red-900 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
            <span>🚢</span>
            Commission New Ship
          </h2>
          <input
            type="text"
            placeholder="Ship name (e.g., 'The Black Pearl')..."
            className="w-full border-2 border-black bg-white p-2 rounded mb-2 text-red-900 placeholder-red-500 font-semibold"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
          />
          <textarea
            placeholder="Ship description (optional)..."
            className="w-full border-2 border-black bg-white p-2 rounded mb-2 min-h-[80px] text-red-900 placeholder-red-500"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
          />
          <button
            onClick={createProject}
            className="bg-red-800 text-yellow-400 px-4 py-2 rounded hover:bg-red-900 transition font-bold shadow-lg flex items-center gap-2 justify-center border-2 border-black"
            style={{ fontFamily: "'Pirata One', cursive" }}
          >
            <span>🚢</span>
            Commission Ship!
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-red-900 flex items-center justify-center gap-2 font-bold">
          <span className="animate-spin">⚓</span>
          Scouring the seas for ships...
        </p>
      ) : projects.length === 0 ? (
        <p className="text-center text-red-900 bg-red-200 p-4 rounded border-2 border-black flex items-center justify-center gap-2 font-bold">
          <span>🚢</span>
          No ships in the fleet yet. {session.user.role === "ADMIN" && "Time to commission yer first ship, Captain!"}
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const isExpanded = expandedProjects.has(project.id);
            const canManage = isProjectAdmin(project);
            const availableUsers = users.filter(
              (user) =>
                !project.members.some((m) => m.user.id === user.id) &&
                user.id !== session.user.id
            );

            // Check if all tasks in the project are completed
            const allTasksCompleted = project.tasks.length > 0 && 
              project.tasks.every((task) => task.status === "DONE");
            
            // Check if project has missed tasks (deadline passed but not completed)
            const hasMissedTasks = project.tasks.some((task) => {
              if (!task.deadline) return false;
              const deadlineDate = new Date(task.deadline);
              return deadlineDate < currentTime && task.status !== "DONE";
            });
            
            const isProjectClosed = hasMissedTasks;

            return (
              <div
                key={project.id}
                className={`${allTasksCompleted ? "bg-gray-300 opacity-75 border-gray-600" : isProjectClosed ? "bg-red-300 opacity-75 border-red-600" : "bg-red-100 border-black"} border-4 rounded-lg shadow-xl overflow-hidden`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-red-200 transition"
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${allTasksCompleted ? "text-gray-800" : isProjectClosed ? "text-red-900" : "text-red-900"}`} style={{ fontFamily: "'Pirata One', cursive" }}>
                        <span>🚢</span>
                        {project.name}
                        {allTasksCompleted && (
                          <span className="text-sm bg-gray-500 text-yellow-200 px-3 py-1 rounded-full border-2 border-black font-bold">
                            ⚓ Voyage Completed - All Treasure Plundered! ⚓
                          </span>
                        )}
                        {isProjectClosed && !allTasksCompleted && (
                          <span className="text-sm bg-red-500 text-yellow-200 px-3 py-1 rounded-full border-2 border-black font-bold">
                            ❌ Ship Closed - Mission Failed! ❌
                          </span>
                        )}
                      </h3>
                      {project.description && (
                        <p className={`text-sm mt-1 font-semibold ${allTasksCompleted ? "text-gray-700" : isProjectClosed ? "text-red-900" : "text-red-800"}`}>
                          {project.description}
                        </p>
                      )}
                      {allTasksCompleted && (
                        <p className="text-sm mt-2 font-bold text-gray-800 italic" style={{ fontFamily: "'Pirata One', cursive" }}>
                          "This ship has completed all its missions! The crew has returned victorious with all the treasure!"
                        </p>
                      )}
                      {isProjectClosed && !allTasksCompleted && (
                        <p className="text-sm mt-2 font-bold text-red-900 italic" style={{ fontFamily: "'Pirata One', cursive" }}>
                          "This ship has failed its mission! A task deadline has passed without completion. The ship is closed!"
                        </p>
                      )}
                      <div className={`flex gap-4 mt-2 text-xs font-bold ${allTasksCompleted ? "text-gray-700" : isProjectClosed ? "text-red-900" : "text-red-900"}`}>
                        <span>📜 {project._count.tasks} missions</span>
                        <span>⚓ {project._count.members} crew</span>
                        <span>🏴‍☠️ {project._count.admins} captains</span>
                      </div>
                    </div>
                    <span className={`text-2xl ${allTasksCompleted ? "text-gray-700" : isProjectClosed ? "text-red-900" : "text-red-900"}`}>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className={`border-t-4 ${allTasksCompleted ? "border-gray-600 bg-gray-100" : isProjectClosed ? "border-red-600 bg-red-200" : "border-black bg-red-50"} p-4`}>
                    <div className="mb-4">
                      <h4 className="font-bold mb-2 text-red-900 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
                        <span>🏴‍☠️</span>
                        Captains:
                      </h4>
                      {project.admins.length === 0 ? (
                        <p className="text-sm text-red-800 font-semibold">No captains aboard</p>
                      ) : (
                        <div className="space-y-1">
                          {project.admins.map((admin) => (
                            <div
                              key={admin.id}
                              className="flex justify-between items-center text-sm bg-yellow-100 p-2 rounded border-2 border-black"
                            >
                              <span className="text-red-900 font-bold">{admin.user.email}</span>
                              {canManage && (
                                <button
                                  onClick={() =>
                                    removeMember(project.id, admin.user.id)
                                  }
                                  className="text-red-800 hover:text-red-900 text-xs font-bold border border-black px-2 py-1 rounded bg-red-200"
                                >
                                  ⚓ Maroon
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <h4 className="font-bold mb-2 text-red-900 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
                        <span>⚓</span>
                        Crew Members:
                      </h4>
                      {project.members.length === 0 ? (
                        <p className="text-sm text-red-800 font-semibold">No crew aboard</p>
                      ) : (
                        <div className="space-y-3">
                          {project.members.map((member) => {
                            const isAdmin = project.admins.some(
                              (a) => a.user.id === member.user.id
                            );
                            const memberTasks = getTasksForMember(project, member.user.id);
                            return (
                              <div
                                key={member.id}
                                className="bg-white p-3 rounded border-2 border-black"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-bold text-red-900">
                                    {member.user.email}
                                    {isAdmin && (
                                      <span className="ml-2 text-xs text-yellow-700 font-bold bg-yellow-200 px-2 py-1 rounded border border-black">
                                        🏴‍☠️ (Captain)
                                      </span>
                                    )}
                                    {memberTasks.length > 0 && (
                                      <span className="ml-2 text-xs bg-yellow-400 text-red-900 px-2 py-1 rounded-full font-bold border border-black">
                                        📜 {memberTasks.length} mission{memberTasks.length !== 1 ? "s" : ""}
                                      </span>
                                    )}
                                  </span>
                                  {canManage && (
                                    <button
                                      onClick={() =>
                                        removeMember(project.id, member.user.id)
                                      }
                                      className="text-red-800 hover:text-red-900 text-xs font-bold border border-black px-2 py-1 rounded bg-red-200"
                                    >
                                      ⚓ Maroon
                                    </button>
                                  )}
                                </div>
                                {memberTasks.length > 0 && (
                                  <div className="ml-2 mt-2 space-y-1 border-l-2 border-black pl-3">
                                    <p className="text-xs font-bold text-red-900 mb-1">
                                      📜 Assigned Missions:
                                    </p>
                                    {memberTasks.map((task) => {
                                      const isTaskDone = task.status === "DONE";
                                      const isTaskMissed = task.deadline && new Date(task.deadline) < currentTime && !isTaskDone;
                                      return (
                                        <div
                                          key={task.id}
                                          className={`flex justify-between items-start p-3 rounded-lg border-2 border-black shadow-md mb-2 ${isTaskDone ? "bg-gray-200 opacity-75" : isTaskMissed ? "bg-red-200 opacity-75" : "bg-red-100"}`}
                                        >
                                          <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-bold mb-1 ${isTaskDone ? "text-gray-700" : isTaskMissed ? "text-red-900" : "text-red-900"}`} style={{ fontFamily: "'Pirata One', cursive" }}>
                                              {task.title}
                                            </h4>
                                            {task.description && (
                                              <p className={`text-xs mb-2 ${isTaskDone ? "text-gray-600" : isTaskMissed ? "text-red-800" : "text-red-800"}`}>
                                                {task.description.substring(0, 80)}
                                                {task.description.length > 80 ? "..." : ""}
                                              </p>
                                            )}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                              {task.deadline && (() => {
                                                const deadlineDate = new Date(task.deadline);
                                                const isOverdue = deadlineDate < currentTime;
                                                const timeUntilDeadline = deadlineDate.getTime() - currentTime.getTime();
                                                const isDueSoon = timeUntilDeadline > 0 && timeUntilDeadline < 24 * 60 * 60 * 1000; // Less than 24 hours
                                                
                                                return (
                                                  <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 ${
                                                    isOverdue
                                                      ? "bg-red-300 text-red-900 border-red-400" 
                                                      : isDueSoon
                                                      ? "bg-yellow-200 text-yellow-900 border-yellow-400"
                                                      : "bg-blue-200 text-blue-900 border-blue-400"
                                                  }`}>
                                                    ⏰ {deadlineDate.toLocaleString()}
                                                    {isOverdue && " ⚠️ OVERDUE!"}
                                                    {isDueSoon && !isOverdue && " ⚠️ Due Soon!"}
                                                  </span>
                                                );
                                              })()}
                                              <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 ${
                                                task.priority === "HIGH" ? "bg-red-200 text-red-900 border-red-400" :
                                                task.priority === "MEDIUM" ? "bg-yellow-200 text-yellow-900 border-yellow-400" :
                                                "bg-green-200 text-green-900 border-green-400"
                                              }`}>
                                                ⚓ {task.priority}
                                              </span>
                                              <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 ${
                                                isTaskDone ? "bg-green-200 text-green-900 border-green-400" :
                                                isTaskMissed ? "bg-red-300 text-red-900 border-red-400" :
                                                task.status === "IN_PROGRESS" ? "bg-blue-200 text-blue-900 border-blue-400" :
                                                "bg-gray-200 text-gray-900 border-gray-400"
                                              }`}>
                                                {isTaskDone ? "✅ Completed Voyage" :
                                                 isTaskMissed ? "❌ Mission Missed" :
                                                 task.status === "IN_PROGRESS" ? "⚓ Underway" :
                                                 "📜 To Do"}
                                              </span>
                                              {!isTaskDone && !isTaskMissed && (
                                                <button
                                                  onClick={async () => {
                                                    try {
                                                      const res = await fetch("/api/tasks/complete", {
                                                        method: "PUT",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ taskId: task.id }),
                                                      });
                                                      if (res.ok) {
                                                        setMessage("Mission completed successfully! Well done, sailor!");
                                                        fetchProjects();
                                                      } else {
                                                        const error = await res.json();
                                                        setMessage(error.error || "Failed to complete mission, sailor!");
                                                      }
                                                    } catch (err) {
                                                      setMessage("Something went wrong on the ship, sailor!");
                                                    }
                                                  }}
                                                  className="text-xs font-bold bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 border border-black"
                                                  style={{ fontFamily: "'Pirata One', cursive" }}
                                                >
                                                  ✅ Complete
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {canManage && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-bold mb-1 text-red-900 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
                            <span>⚓</span>
                            Recruit Crew Member:
                          </label>
                          <select
                            className="w-full border-2 border-black bg-white p-2 rounded text-sm text-red-900 font-semibold"
                            onChange={(e) => {
                              if (e.target.value) {
                                addMember(project.id, e.target.value);
                                e.target.value = "";
                              }
                            }}
                          >
                            <option value="">Select user...</option>
                            {availableUsers.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.email}
                              </option>
                            ))}
                          </select>
                        </div>
                        {session.user.role === "ADMIN" && (
                          <div>
                            <label className="block text-sm font-bold mb-1 text-red-900 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
                              <span>🏴‍☠️</span>
                              Promote to Captain (from crew) - Grand Captain Only:
                            </label>
                            <select
                              className="w-full border-2 border-black bg-white p-2 rounded text-sm text-red-900 font-semibold"
                              onChange={(e) => {
                                if (e.target.value) {
                                  addAdmin(project.id, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                            >
                              <option value="">Select member...</option>
                              {project.members
                                .filter(
                                  (m) =>
                                    !project.admins.some(
                                      (a) => a.user.id === m.user.id
                                    )
                                )
                                .map((member) => (
                                  <option key={member.id} value={member.user.id}>
                                    {member.user.email}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

