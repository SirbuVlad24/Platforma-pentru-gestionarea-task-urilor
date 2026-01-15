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
      setMessage("Incorrect credentials, sailor! Check yer email and password!");
    } else {
      setMessage("Welcome aboard, Captain!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 px-4" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23DC2626\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}>
      <div className="w-full max-w-sm bg-red-100 shadow-2xl rounded-xl p-8 border-4 border-black">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/pirate-logo.svg" alt="Pirate Flag" className="w-12 h-12" />
          <h1 className="text-3xl font-bold text-center text-red-900" style={{ fontFamily: "'Pirata One', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
            Board the Ship!
          </h1>
        </div>

        {!session ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-red-900 mb-1 flex items-center gap-1">
                <span>📧</span>
                Crew Member Email
              </label>
              <input
                type="email"
                className="w-full border-2 border-black rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter yer email, matey!"
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
                className="w-full border-2 border-black rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Shiver me timbers!"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-red-800 hover:bg-red-900 text-yellow-400 py-3 rounded-lg transition font-bold text-lg border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ fontFamily: "'Pirata One', cursive" }}
            >
              Set Sail!
            </button>
          </form>
        ) : (
          <p className="text-center text-red-900 font-bold flex items-center justify-center gap-2">
            <span className="animate-spin">⚓</span>
            Hoisting anchor, Captain!
          </p>
        )}

        {message && (
          <div
            className={`mt-4 p-4 rounded-xl font-bold border-4 border-black shadow-xl relative bg-white ${
              message.startsWith("❌") || message.toLowerCase().includes("error") || message.toLowerCase().includes("incorrect")
                ? "text-red-900"
                : "text-green-900"
            }`}
            style={{ fontFamily: "'Pirata One', cursive" }}
          >
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
                <div className="text-xl">"{message.replace("❌", "").replace("✅", "").trim()}"</div>
              </div>
            </div>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        )}
      </div>
    </div>
  );
}
