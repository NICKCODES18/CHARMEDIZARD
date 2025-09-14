// app/page.tsx
"use client";

import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: crypto.randomUUID(),
          transcript: input,
          age: 25, // hardcoded for demo; you can add fields later
          sex: "male",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setReport(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">
        Describe Your Symptoms
      </h2>

      <textarea
        className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={6}
        placeholder="Example: I've had a fever for 3 days, sore throat, and body aches."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Symptoms"}
      </button>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {report && (
        <section className="p-4 border rounded bg-white shadow space-y-3">
          <h3 className="text-xl font-semibold">Triage Report</h3>
          <p>
            <strong>Urgency:</strong>{" "}
            <span
              className={`px-2 py-1 rounded ${
                report.urgency === "high"
                  ? "bg-red-500 text-white"
                  : report.urgency === "medium"
                  ? "bg-yellow-400"
                  : "bg-green-500 text-white"
              }`}
            >
              {report.urgency}
            </span>
          </p>
          <p>
            <strong>Recommended Action:</strong> {report.recommendedAction}
          </p>
          <p>
            <strong>Doctor Summary:</strong> {report.summaryForDoctor}
          </p>

          <details>
            <summary className="cursor-pointer text-blue-600">
              Show Full JSON
            </summary>
            <pre className="text-xs bg-black text-green-400 p-3 rounded mt-2 overflow-x-auto">
              {JSON.stringify(report, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}
