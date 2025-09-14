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
  "age": number,
  "sex": "male" | "female" | "other" | "unknown",
  "symptoms": [
    { "name": "string", "onset": "string", "severity": "mild|moderate|severe", "notes": "string" }
  ],
  "redFlags": ["string"],
  "possibleConditions": [
    { "name": "string", "confidence": 0.0 }
  ],
  "urgency": "low" | "medium" | "high",
  "recommendedAction": "string",
  "followUps": ["string"],
  "summaryForDoctor": "string",
  "disclaimers": ["string"]
}

Rules:
- Never output text before or after JSON.
- Never use Markdown.
- Always include: "disclaimers": ["This is not medical advice"].
- If unsure, return empty strings/arrays but keep the schema shape.
`;

export async function POST(req: NextRequest) {
  try {
    const { patientId, transcript, age, sex } = await req.json();

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
