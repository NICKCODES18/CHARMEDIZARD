// app/page.tsx
"use client";

import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("unknown"); // New state for gender
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
          age: parseInt(age, 10) || undefined,
          sex: sex, // Use the selected sex
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

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          type="number"
          id="age"
          className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
          Sex
        </label>
        <select
          id="sex"
          className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sex}
          onChange={(e) => setSex(e.target.value)}
        >
          <option value="unknown">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

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
            <strong>Age:</strong> {report.age}
          </p>
          <p>
            <strong>Sex:</strong> {report.sex}
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
          {report.recommendedActionReason && (
            <p className="text-sm text-gray-600 pl-4 border-l-4 border-blue-200">
              <strong>Reason:</strong> {report.recommendedActionReason}
            </p>
          )}

          {report.instantRemedies && report.instantRemedies.length > 0 && (
            <div>
              <h4 className="font-semibold">Instant Remedies:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {report.instantRemedies.map((remedy: string, index: number) => (
                  <li key={index}>{remedy}</li>
                ))}
              </ul>
            </div>
          )}

          <p>
            <strong>Doctor Summary:</strong> {report.summaryForDoctor}
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
