"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", { redirect: false, email, password });
    setMessage(res?.error ? "Login failed" : "Login successful!");
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setMessage("Logged out successfully!");
  };

  return (
    <div style={{ maxWidth: 400, margin: 50 }}>
      <h1>Authentication</h1>

      {session ? (
        <div>
          <p>Logged in as {session.user?.email} ({session.user?.role})</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email" 
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password" 
          />
          <button type="submit">Login</button>
        </form>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
