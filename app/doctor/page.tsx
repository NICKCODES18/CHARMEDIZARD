// app/doctor/page.tsx
"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [age, setAge] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendToTriage = async () => {
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
          age: parseInt(age, 10) || undefined,
          sex: "male", // Keeping sex hardcoded for now
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unknown error");
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
      <h1 className="text-3xl font-bold">AI Healthcare Triage Chatbot</h1>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          type="number"
          id="age"
          className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter patient's age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>

      <textarea
        className="w-full border rounded p-3"
        rows={6}
        placeholder="Describe your symptoms here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={sendToTriage}
        disabled={loading || !input.trim()}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Symptoms"}
      </button>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {report && (
        <section className="p-4 border rounded bg-gray-50 space-y-3">
          <h2 className="text-xl font-semibold">Triage Report</h2>
          <p>
            <strong>Age:</strong> {report.age}
          </p>
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
            <strong>Summary for Doctor:</strong> {report.summaryForDoctor}
          </p>

          {report.vitals && (
            <div>
              <h4 className="font-semibold">Vitals:</h4>
              <ul className="list-disc list-inside">
                {report.vitals.temperature && (
                  <li>Temperature: {report.vitals.temperature}</li>
                )}
                {report.vitals.heartRate && (
                  <li>Heart Rate: {report.vitals.heartRate}</li>
                )}
                {report.vitals.bloodPressure && (
                  <li>Blood Pressure: {report.vitals.bloodPressure}</li>
                )}
                {report.vitals.oxygenSaturation && (
                  <li>
                    Oxygen Saturation: {report.vitals.oxygenSaturation}
                  </li>
                )}
              </ul>
            </div>
          )}

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
