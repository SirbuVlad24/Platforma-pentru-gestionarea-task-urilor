"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Task = {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
};

export default function ManageAdminTasksPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [form, setForm] = useState({
    title: "",
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

    await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ title: "", priority: "MEDIUM" });
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

        <select
          className="w-full border p-2 rounded mb-2"
          value={form.priority}
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value })
          }
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

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
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-gray-600">
                  Priority: {task.priority}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditingTask(task)}
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
              className="w-full border p-2 rounded mb-2"
              value={editingTask.title}
              onChange={(e) =>
                setEditingTask({ ...editingTask, title: e.target.value })
              }
            />

            <select
              className="w-full border p-2 rounded mb-4"
              value={editingTask.priority}
              onChange={(e) =>
                setEditingTask({ ...editingTask, priority: e.target.value })
              }
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
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
