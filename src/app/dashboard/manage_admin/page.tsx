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
};

export default function ManageAdminTasksPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!session) return;
    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    const res = await fetch("/api/tasks/full");
    const data = await res.json();
    setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      await fetchTasks();
    };
    load();
  }, []);

  // Create task
  const createTask = async () => {
    if (!form.title.trim()) return;

    // Don't send priority if description exists - let AI detect it
    const payload: any = {
      title: form.title,
      description: form.description,
    };
    
    // Only send priority if there's no description
    if (!form.description.trim()) {
      payload.priority = form.priority;
    }

    const res = await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.task) {
      console.log("Task created with priority:", data.task.priority);
    }

    setForm({ title: "", description: "", priority: "MEDIUM" });
    fetchTasks();
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
    return <p className="text-center mt-10">Loading session...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Tasks</h1>

      {/* Create task */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-3">Create Task</h2>

        <input
          type="text"
          placeholder="Title..."
          className="w-full border p-2 rounded mb-2"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <textarea
          placeholder="Description (priority will be auto-detected based on importance)..."
          className="w-full border p-2 rounded mb-2 min-h-[100px]"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority (will be auto-detected from description)
          </label>
          <select
            className="w-full border p-2 rounded"
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value })
            }
            disabled={form.description.trim().length > 0}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          {form.description.trim().length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              ⚡ Priority will be auto-detected from description using AI
            </p>
          )}
          {form.description.trim().length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Add a description to enable AI priority detection
            </p>
          )}
        </div>

        <button
          onClick={createTask}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* Tasks list */}
      {loading ? (
        <p className="text-center">Loading tasks...</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="bg-white p-4 rounded shadow flex justify-between"
            >
              <div className="flex-1">
                <p className="font-semibold">{task.title}</p>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 mb-1">{task.description}</p>
                )}
                <p className="text-sm text-gray-600">
                  Priority: {task.priority} | Status: {task.status || "TODO"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditingTask({ ...task, status: task.status || "TODO" })}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>

            <input
              type="text"
              placeholder="Title"
              className="w-full border p-2 rounded mb-2"
              value={editingTask.title}
              onChange={(e) =>
                setEditingTask({ ...editingTask, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description (priority will be auto-updated if changed)..."
              className="w-full border p-2 rounded mb-2 min-h-[100px]"
              value={editingTask.description || ""}
              onChange={(e) =>
                setEditingTask({ ...editingTask, description: e.target.value })
              }
            />

            <select
              className="w-full border p-2 rounded mb-2"
              value={editingTask.priority}
              onChange={(e) =>
                setEditingTask({ ...editingTask, priority: e.target.value })
              }
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <p className="text-xs text-gray-500 mb-2">
              Priority will be auto-updated from description if description changes
            </p>

            <select
              className="w-full border p-2 rounded mb-4"
              value={editingTask.status || "TODO"}
              onChange={(e) =>
                setEditingTask({ ...editingTask, status: e.target.value })
              }
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                className="px-3 py-1 bg-gray-400 text-white rounded"
                onClick={() => setEditingTask(null)}
              >
                Cancel
              </button>

              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
