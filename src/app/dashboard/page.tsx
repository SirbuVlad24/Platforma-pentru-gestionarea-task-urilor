"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) return <p>Loading...</p>;

  const handleLogout = async () => {
  await signOut({ redirect: false });
  router.push("/");
};

  const goToAdmin = () => router.push("/admin/users");

  return (
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <h1>Welcome, {session.user.name || session.user.email}</h1>
      <p>Role: {session.user.role}</p>

      <button onClick={handleLogout} style={{ marginRight: 10 }}>
        Logout
      </button>

      {session.user.role === "ADMIN" && (
        <button onClick={goToAdmin}>Go to Admin Panel</button>
      )}
    </div>
  );
}
