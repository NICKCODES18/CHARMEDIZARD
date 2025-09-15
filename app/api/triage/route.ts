import "dotenv/config"; // ensure .env.local is loaded
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TriageReportSchema } from "../../../lib/triage.schema"; // relative import unless alias set up

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// System instructions: enforce JSON-only output
const SYSTEM = `
You are a healthcare triage assistant.
DO NOT explain, DO NOT use Markdown, DO NOT add extra text.
Return ONLY valid JSON strictly matching this schema:

{
  "patientId": "string",
  "triageDate": "string",
  "age": number,
  "sex": "male" | "female" | "other" | "unknown",
  "vitals": {
    "temperature": "string",
    "heartRate": "string",
    "bloodPressure": "string",
    "oxygenSaturation": "string"
  },
  "symptoms": [
    { "name": "string", "onset": "string", "severity": "mild|moderate|severe", "notes": "string" }
  ],
  "redFlags": ["string"],
  "possibleConditions": [
    { "name": "string", "confidence": 0.0 }
  ],
  "urgency": "low" | "medium" | "high",
  "recommendedAction": "string",
  "recommendedActionReason": "string",
  "instantRemedies": ["string"],
  "followUps": ["string"],
  "summaryForDoctor": "string",
  "disclaimers": ["string"]
}

Rules for High-Quality Recommendations:
1.  **Actionable & Specific:** The "recommendedAction" MUST be concrete and directly related to the patient's symptoms.
    -   **BAD:** "See a doctor."
    -   **GOOD:** "Schedule an appointment with a primary care physician to evaluate your persistent cough and fever."

2.  **Justified:** The "recommendedActionReason" MUST explain *why* the action is recommended, referencing specific symptoms.
    -   **Example:** "A persistent cough lasting over a week, combined with a fever, requires a professional evaluation to rule out conditions like bronchitis or pneumonia."

3.  **Instant Remedies:** For "low" or "medium" urgency cases, provide a list of specific, safe, at-home "instantRemedies". For "high" urgency, this MUST be an empty array.
    -   **BAD:** "Stay hydrated."
    -   **GOOD:** "Gargle with warm salt water 4-5 times a day to soothe a sore throat."
    -   **GOOD:** "Apply a cold compress to your forehead for 15-minute intervals to help reduce fever."

4.  **JSON Only:** Never output text before or after the JSON object. Never use Markdown.
5.  **Disclaimers:** Always include the disclaimer field, like this: "disclaimers": ["This is not medical advice"].
6.  **Vitals:** ONLY include the "vitals" object if the patient explicitly provides vital signs in the transcript. Otherwise, omit the key.
7.  **Doctor Summary:** Do NOT include the patient's sex in the "summaryForDoctor" field.
`;

export async function POST(req: NextRequest) {
  try {
    const { patientId, transcript, age, sex } = await req.json();

    console.log("Received age:", age);

    if (!patientId || !transcript) {
      return NextResponse.json(
        { error: "Missing required fields: patientId, transcript" },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = `
${SYSTEM}

PatientId: ${patientId}
Age: ${age ?? "unknown"}
Sex: ${sex ?? "unknown"}

Transcript:
${transcript}
`;

    // Call Gemini
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Debug log
    console.log("🔎 Gemini raw response:", text);

    // Try parsing JSON directly
    let parsed;
    try {
      parsed = TriageReportSchema.parse(JSON.parse(text));
    } catch {
      // Fallback: extract JSON substring if Gemini adds extra text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = TriageReportSchema.parse(JSON.parse(match[0]));
        } catch {
          return NextResponse.json(
            { error: "Model output invalid JSON matching schema", raw: text },
            { status: 502 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Model did not return JSON", raw: text },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Triage generation failed", details: err?.message },
      { status: 500 }
    );
  }
}
