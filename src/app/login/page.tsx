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

  // Redirect dacă e logat
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", { redirect: false, email, password });

    if (res?.error) {
      setMessage("❌ Incorrect credentials");
    } else {
      setMessage("✅ Login successful!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {!session ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />

            <input
              type="password"
              className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              Login
            </button>
          </form>
        ) : (
          <p className="text-center text-gray-600">Redirecting...</p>
        )}

        {message && (
          <p
            className={`mt-4 text-center font-semibold ${
              message.startsWith("❌") ? "text-red-500" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
