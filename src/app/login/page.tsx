"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", { redirect: false, email, password });

    if (res?.error) {
      setMessage("Login failed");
    } else {
      setMessage("Login successful!");
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 50 }}>
      <h1>Authentication</h1>

      {}
      {!session ? (
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
      ) : (
        <p>Redirecting...</p>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
