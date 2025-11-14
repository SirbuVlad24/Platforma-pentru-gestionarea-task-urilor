"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type User = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  // Fetch all users
  useEffect(() => {
    if (!session) return;

    async function fetchUsers() {
      try {
        const res = await fetch("/api/user/list");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    }

    fetchUsers();
  }, [session]);

  const makeAdmin = async (userId: string) => {
    try {
      const res = await fetch("/api/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: "ADMIN" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(`User ${data.user.email} is now ADMIN`);
        setUsers((prev) =>
          prev.map((u) => (u.id === data.user.id ? { ...u, role: "ADMIN" } : u))
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  if (!session) return <p>Loading...</p>;
  if (session.user.role !== "ADMIN") return <p>Access denied. Only admins can view this page.</p>;

  return (
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <h1>Admin Panel - Users</h1>
      {message && <p>{message}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id} style={{ marginBottom: 10 }}>
            {user.email} - {user.role}{" "}
            {user.role === "USER" && (
              <button onClick={() => makeAdmin(user.id)}>Make Admin</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
