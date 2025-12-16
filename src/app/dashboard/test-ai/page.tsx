"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TestAIPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Test examples
  const examples = [
    { text: "Urgent bug fix needed immediately", expected: "HIGH" },
    { text: "Critical deadline approaching, must finish today", expected: "HIGH" },
    { text: "Important feature implementation", expected: "HIGH" },
    { text: "Update documentation when you have time", expected: "LOW" },
    { text: "Nice to have feature for future", expected: "LOW" },
    { text: "Regular maintenance task", expected: "MEDIUM" },
  ];

  const testPriority = async (testDescription?: string) => {
    const desc = testDescription || description;
    if (!desc.trim()) {
      setError("Please enter a description");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/test-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to test AI");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🧪 Test AI Priority Detection</h1>

      <div className="bg-white shadow p-6 rounded mb-6">
        <h2 className="text-xl font-semibold mb-4">Test AI Priority Detection</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description:
          </label>
          <textarea
            placeholder="Enter a task description to test AI priority detection..."
            className="w-full border p-3 rounded min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          onClick={() => testPriority()}
          disabled={loading || !description.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Testing..." : "Test AI Priority"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            ❌ Error: {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800 mb-2">✅ Result:</h3>
            <p className="text-sm text-gray-700 mb-1">
              <strong>Description:</strong> {result.description}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <strong>Detected Priority:</strong>{" "}
              <span className="font-bold text-lg text-green-700">
                {result.detectedPriority}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Processing time: {result.processingTime}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white shadow p-6 rounded">
        <h2 className="text-xl font-semibold mb-4">📝 Test Examples</h2>
        <p className="text-sm text-gray-600 mb-4">
          Click on any example to test it:
        </p>
        <div className="space-y-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDescription(example.text);
                testPriority(example.text);
              }}
              className="w-full text-left p-3 border rounded hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">{example.text}</span>
                <span className="text-xs text-gray-500">
                  Expected: {example.expected}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/dashboard/manage_admin")}
          className="text-blue-600 hover:underline"
        >
          ← Back to Task Management
        </button>
      </div>
    </div>
  );
}

