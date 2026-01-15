"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Task = {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status?: string;
  completed: boolean;
  projectId?: number;
  project?: { id: number; name: string };
  deadline?: string | null;
};

export default function ManageAdminTasksPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    projectId: "",
    deadline: "",
    useAI: false,
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!session) return;
    // Allow global admins and project admins (will be checked by API)
    // We don't block project admins here, API will filter tasks
  }, [session, router]);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks/full");
      if (!res.ok) {
        console.error("Failed to fetch tasks");
        setTasks([]);
        return;
      }
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects/list");
      if (!res.ok) {
        console.error("Failed to fetch projects");
        setProjects([]);
        return;
      }
      const data = await res.json();
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchTasks();
      await fetchProjects();
    };
    load();
  }, []);

  // Create task
  const createTask = async () => {
    if (!form.title.trim()) return;

    const payload: any = {
      title: form.title,
      description: form.description,
      useAI: form.useAI,
    };
    
    // Only send priority if AI is not being used
    if (!form.useAI) {
      payload.priority = form.priority;
    }

    // Add projectId if selected
    if (form.projectId && form.projectId !== "") {
      const projectIdNum = parseInt(form.projectId);
      if (!isNaN(projectIdNum)) {
        payload.projectId = projectIdNum;
      }
    }

    // Add deadline if provided
    if (form.deadline && form.deadline.trim() !== "") {
      payload.deadline = form.deadline;
    }

    try {
      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error creating task:", error);
        alert(error.error || "Failed to log mission in the Captain's Log, Captain!");
        return;
      }

      const data = await res.json();

      setForm({ title: "", description: "", priority: "MEDIUM", projectId: "", deadline: "", useAI: false });
      await fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Something went wrong on the ship, Captain! Check the logs!");
    }
  };

  // Delete
  const deleteTask = async (id: number) => {
    await fetch("/api/tasks/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchTasks();
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingTask) return;

    await fetch("/api/tasks/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingTask),
    });

    setEditingTask(null);
    fetchTasks();
  };

  if (!session) {
    return <div className="bg-red-50 min-h-screen flex items-center justify-center"><p className="text-center text-red-900 flex items-center gap-2"><span className="animate-spin">⚓</span>Loading yer ship, Captain...</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-900 flex items-center justify-center gap-3" style={{ fontFamily: "'Pirata One', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
        <span className="text-4xl">🏴‍☠️</span>
        Captain's Log
        <span className="text-4xl">📋</span>
      </h1>

      {/* Create mission */}
      <div className="bg-red-100 shadow-xl p-4 rounded-lg mb-6 border-4 border-black">
        <h2 className="text-xl font-semibold mb-3 text-red-900 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
          <span>📜</span>
          Log New Mission
        </h2>

        <input
          type="text"
          placeholder="Mission Name (e.g., 'Plunder the Spanish Galleon')..."
          className="w-full border-2 border-black bg-white p-2 rounded mb-2 text-red-900 placeholder-red-500 font-semibold"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <textarea
          placeholder="Mission Details (priority will be auto-detected from danger level)..."
          className="w-full border-2 border-black bg-white p-2 rounded mb-2 min-h-[100px] text-red-900 placeholder-red-500"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <select
          className="w-full border-2 border-purple-400 bg-purple-50 p-2 rounded mb-2 text-purple-900"
          value={form.projectId}
          onChange={(e) =>
            setForm({ ...form, projectId: e.target.value })
          }
        >
          <option value="">No Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <div className="mb-2">
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.useAI}
              onChange={(e) =>
                setForm({ ...form, useAI: e.target.checked })
              }
              className="w-5 h-5 border-2 border-black text-red-900 focus:ring-2 focus:ring-red-900"
            />
            <span className="text-sm font-bold text-red-900 flex items-center gap-2">
              <span>🤖</span>
              Use AI to detect priority from mission details
            </span>
          </label>
          <label className="block text-sm font-bold text-red-900 mb-1 flex items-center gap-2">
            <span>⚓</span>
            Mission Priority
          </label>
          <select
            className="w-full border-2 border-black bg-white p-2 rounded text-red-900 font-semibold"
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value })
            }
            disabled={form.useAI}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          {form.useAI && (
            <p className="text-xs text-yellow-700 mt-1 font-bold bg-yellow-100 p-2 rounded border border-black">
              ⚓ Priority will be auto-detected from mission details using the Captain's wisdom!
            </p>
          )}
          {!form.useAI && (
            <p className="text-xs text-red-800 mt-1 font-semibold">
              Select priority manually, or enable AI detection above, Captain!
            </p>
          )}
        </div>

        <div className="mb-2">
          <label className="block text-sm font-bold text-red-900 mb-1 flex items-center gap-2">
            <span>⏰</span>
            Mission Deadline (when must this be completed?)
          </label>
          <input
            type="datetime-local"
            className="w-full border-2 border-black bg-white p-2 rounded text-red-900 font-semibold"
            value={form.deadline}
            onChange={(e) =>
              setForm({ ...form, deadline: e.target.value })
            }
          />
          <p className="text-xs text-red-800 mt-1 font-semibold">
            Leave empty if there's no deadline, Captain!
          </p>
        </div>

        <button
          onClick={createTask}
          className="bg-red-800 text-yellow-400 px-4 py-2 rounded hover:bg-red-900 transition font-bold shadow-lg hover:shadow-xl flex items-center gap-2 justify-center border-2 border-black"
          style={{ fontFamily: "'Pirata One', cursive" }}
        >
          <span>📜</span>
          Log Mission!
        </button>
      </div>

      {/* Missions list */}
      {loading ? (
        <p className="text-center text-red-900 flex items-center justify-center gap-2 font-bold">
          <span className="animate-spin">⚓</span>
          Scouring the logbook, Captain...
        </p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-red-900 bg-red-200 p-4 rounded border-2 border-black flex items-center justify-center gap-2 font-bold">
          <span>📜</span>
          No missions logged yet! Time to set sail, Captain!
        </p>
      ) : (
        <div className="space-y-6">
          {(() => {
            // Group tasks by project
            const tasksByProject = new Map<number | "none", Task[]>();
            
            tasks.forEach(task => {
              const key = task.projectId || "none";
              if (!tasksByProject.has(key)) {
                tasksByProject.set(key, []);
              }
              tasksByProject.get(key)!.push(task);
            });

            const renderTaskItem = (task: Task) => (
              <li
                key={task.id}
                className="bg-red-100 p-4 rounded-lg shadow-lg border-4 border-black flex justify-between"
              >
                <div className="flex-1">
                  <p className="font-bold text-red-900 text-lg flex items-center gap-2">
                    <span>📜</span>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-red-800 mt-1 mb-1 font-semibold">{task.description}</p>
                  )}
                  <p className="text-sm text-red-900 font-bold">
                    <span>⚓ Priority:</span> {task.priority} | <span>Status:</span> {task.status || "TODO"}
                    {task.deadline && (
                      <span className="ml-2 text-red-900 font-bold">| ⏰ Deadline: {new Date(task.deadline).toLocaleString()}</span>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingTask({ ...task, status: task.status || "TODO" })}
                    className="px-3 py-1 bg-yellow-500 text-red-900 rounded hover:bg-yellow-600 transition font-bold shadow border-2 border-black"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1 bg-red-800 text-yellow-400 rounded hover:bg-red-900 transition font-bold shadow border-2 border-black"
                  >
                    ❌ Delete
                  </button>
                </div>
              </li>
            );

            return (
              <>
                {/* Render tasks with projects */}
                {projects.map(project => {
                  const projectTasks = tasksByProject.get(project.id) || [];
                  if (projectTasks.length === 0) return null;
                  
                  return (
                    <div key={project.id} className="bg-blue-50 rounded-lg border-4 border-blue-600 p-4 shadow-lg">
                      <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
                        <span>🚢</span>
                        {project.name}
                      </h2>
                      <ul className="space-y-3">
                        {projectTasks.map(renderTaskItem)}
                      </ul>
                    </div>
                  );
                })}

                {/* Render tasks without project */}
                {(() => {
                  const tasksWithoutProject = tasksByProject.get("none") || [];
                  if (tasksWithoutProject.length === 0) return null;
                  
                  return (
                    <div className="bg-gray-100 rounded-lg border-4 border-gray-500 p-4 shadow-lg">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
                        <span>📜</span>
                        Missions Without Ship
                      </h2>
                      <ul className="space-y-3">
                        {tasksWithoutProject.map(renderTaskItem)}
                      </ul>
                    </div>
                  );
                })()}
              </>
            );
          })()}
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50">
          <div className="bg-red-100 p-6 rounded-lg shadow-2xl max-w-md w-full border-4 border-black">
            <h2 className="text-xl font-bold mb-4 text-red-900 flex items-center gap-2" style={{ fontFamily: "'Pirata One', cursive" }}>
              <span>📜</span>
              Edit Mission Log
            </h2>

            <input
              type="text"
              placeholder="Mission Name"
              className="w-full border-2 border-black bg-white p-2 rounded mb-2 text-red-900 placeholder-red-500 font-semibold"
              value={editingTask.title}
              onChange={(e) =>
                setEditingTask({ ...editingTask, title: e.target.value })
              }
            />

            <textarea
              placeholder="Mission Details (priority will be auto-updated if changed)..."
              className="w-full border-2 border-black bg-white p-2 rounded mb-2 min-h-[100px] text-red-900 placeholder-red-500"
              value={editingTask.description || ""}
              onChange={(e) =>
                setEditingTask({ ...editingTask, description: e.target.value })
              }
            />

            <select
              className="w-full border-2 border-purple-400 bg-purple-50 p-2 rounded mb-2 text-purple-900"
              value={editingTask.projectId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setEditingTask({
                  ...editingTask,
                  projectId: value && value !== "" ? parseInt(value) : undefined,
                });
              }}
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              className="w-full border-2 border-purple-400 bg-purple-50 p-2 rounded mb-2 text-purple-900"
              value={editingTask.priority}
              onChange={(e) =>
                setEditingTask({ ...editingTask, priority: e.target.value })
              }
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <p className="text-xs text-red-800 mb-2 font-semibold bg-yellow-100 p-2 rounded border border-black">
              ⚓ Priority will be auto-updated from mission details if description changes, Captain!
            </p>

            <select
              className="w-full border-2 border-purple-400 bg-purple-50 p-2 rounded mb-2 text-purple-900"
              value={editingTask.status || "TODO"}
              onChange={(e) =>
                setEditingTask({ ...editingTask, status: e.target.value })
              }
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>

            <div className="mb-4">
              <label className="block text-sm font-bold text-red-900 mb-1 flex items-center gap-2">
                <span>⏰</span>
                Mission Deadline
              </label>
              <input
                type="datetime-local"
                className="w-full border-2 border-black bg-white p-2 rounded text-red-900 font-semibold"
                value={editingTask.deadline ? new Date(editingTask.deadline).toISOString().slice(0, 16) : ""}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, deadline: e.target.value || null })
                }
              />
              <p className="text-xs text-red-800 mt-1 font-semibold">
                Leave empty to remove deadline, Captain!
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-3 py-1 bg-gray-600 text-yellow-400 rounded hover:bg-gray-700 transition font-bold border-2 border-black"
                onClick={() => setEditingTask(null)}
              >
                ❌ Abandon
              </button>

              <button
                className="px-3 py-1 bg-red-800 text-yellow-400 rounded hover:bg-red-900 transition font-bold border-2 border-black"
                onClick={saveEdit}
              >
                💾 Save Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
