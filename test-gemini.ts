import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // force load .env.local

import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent("Say hello in JSON: {\"hello\": true}");
    console.log("✅ API key works! Gemini replied:");
    console.log(result.response.text());
  } catch (err) {
    console.error("❌ API key test failed:", err);
  }
}

main();
