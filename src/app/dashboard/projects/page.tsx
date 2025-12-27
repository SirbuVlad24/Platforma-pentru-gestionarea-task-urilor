"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    fetchUsers();
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
      setMessage("Project name is required");
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
        setMessage(error.error || "Failed to create project");
        return;
      }

      setMessage("Project created successfully");
      setNewProject({ name: "", description: "" });
      setShowCreateForm(false);
      fetchProjects();
    } catch (err) {
      setMessage("Something went wrong");
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
        setMessage(error.error || "Failed to add member");
        return;
      }

      setMessage("Member added successfully");
      fetchProjects();
    } catch (err) {
      setMessage("Something went wrong");
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
        setMessage(error.error || "Failed to add admin");
        return;
      }

      setMessage("Admin added successfully");
      fetchProjects();
    } catch (err) {
      setMessage("Something went wrong");
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
        setMessage(error.error || "Failed to remove member");
        return;
      }

      setMessage("Member removed successfully");
      fetchProjects();
    } catch (err) {
      setMessage("Something went wrong");
    }
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
    return <p className="text-center mt-10">Loading session...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        {session.user.role === "ADMIN" && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showCreateForm ? "Cancel" : "+ Create Project"}
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes("error") || message.includes("Failed")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
          <button
            onClick={() => setMessage("")}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {showCreateForm && session.user.role === "ADMIN" && (
        <div className="bg-white shadow p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-3">Create New Project</h2>
          <input
            type="text"
            placeholder="Project name..."
            className="w-full border p-2 rounded mb-2"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
          />
          <textarea
            placeholder="Description (optional)..."
            className="w-full border p-2 rounded mb-2 min-h-[80px]"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
          />
          <button
            onClick={createProject}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-center">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-500">
          No projects found. {session.user.role === "ADMIN" && "Create your first project!"}
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

            return (
              <div
                key={project.id}
                className="bg-white border rounded-lg shadow-sm overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {project.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>{project._count.tasks} tasks</span>
                        <span>{project._count.members} members</span>
                        <span>{project._count.admins} admins</span>
                      </div>
                    </div>
                    <span className="text-2xl">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t p-4 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Admins:</h4>
                      {project.admins.length === 0 ? (
                        <p className="text-sm text-gray-500">No admins</p>
                      ) : (
                        <div className="space-y-1">
                          {project.admins.map((admin) => (
                            <div
                              key={admin.id}
                              className="flex justify-between items-center text-sm bg-blue-50 p-2 rounded"
                            >
                              <span>{admin.user.email}</span>
                              {canManage && (
                                <button
                                  onClick={() =>
                                    removeMember(project.id, admin.user.id)
                                  }
                                  className="text-red-600 hover:underline text-xs"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Members:</h4>
                      {project.members.length === 0 ? (
                        <p className="text-sm text-gray-500">No members</p>
                      ) : (
                        <div className="space-y-1">
                          {project.members.map((member) => {
                            const isAdmin = project.admins.some(
                              (a) => a.user.id === member.user.id
                            );
                            return (
                              <div
                                key={member.id}
                                className="flex justify-between items-center text-sm bg-white p-2 rounded border"
                              >
                                <span>
                                  {member.user.email}
                                  {isAdmin && (
                                    <span className="ml-2 text-xs text-blue-600">
                                      (Admin)
                                    </span>
                                  )}
                                </span>
                                {canManage && (
                                  <button
                                    onClick={() =>
                                      removeMember(project.id, member.user.id)
                                    }
                                    className="text-red-600 hover:underline text-xs"
                                  >
                                    Remove
                                  </button>
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
                          <label className="block text-sm font-medium mb-1">
                            Add Member:
                          </label>
                          <select
                            className="w-full border p-2 rounded text-sm"
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
                            <label className="block text-sm font-medium mb-1">
                              Make Admin (from members) - Global Admin Only:
                            </label>
                            <select
                              className="w-full border p-2 rounded text-sm"
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

