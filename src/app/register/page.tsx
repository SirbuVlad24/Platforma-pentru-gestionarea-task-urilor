"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const res = await fetch("/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error || "Failed to sign the articles, sailor! Try again!");
      return;
    }

    router.push("/register-success");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 px-4" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23DC2626\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}>
      <div className="w-full max-w-sm bg-red-100 shadow-2xl rounded-xl p-8 border-4 border-black">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-4xl">🚢</span>
          <h1 className="text-3xl font-bold text-center text-red-900" style={{ fontFamily: "'Pirata One', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
            Join the Crew!
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-red-900 mb-1 flex items-center gap-1">
              <span>👤</span>
              Crew Member Name
            </label>
            <input
              type="text"
              placeholder="Enter yer name, matey!"
              className="w-full border-2 border-black rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500 bg-white font-semibold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-red-900 mb-1 flex items-center gap-1">
              <span>📧</span>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter yer email, sailor!"
              className="w-full border-2 border-black rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500 bg-white font-semibold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-red-900 mb-1 flex items-center gap-1">
              <span>🔐</span>
              Secret Password
            </label>
            <input
              type="password"
              placeholder="Keep it secret, keep it safe!"
              className="w-full border-2 border-black rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500 bg-white font-semibold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl font-bold border-4 border-black shadow-xl relative bg-white text-red-900" style={{ fontFamily: "'Pirata One', cursive" }}>
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
                  <div className="text-xl">"{errorMsg}"</div>
                </div>
              </div>
              {/* Speech bubble tail */}
              <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black"></div>
            </div>
          )}

          <button
            type="submit"
            className="bg-red-800 hover:bg-red-900 text-yellow-400 py-3 rounded-lg transition font-bold text-lg border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{ fontFamily: "'Pirata One', cursive" }}
          >
            Sign the Articles!
          </button>
        </form>
      </div>
    </div>
  );
}
