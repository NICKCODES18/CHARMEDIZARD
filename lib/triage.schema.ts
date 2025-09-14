// lib/triage.schema.ts
import { z } from "zod";

export const TriageReportSchema = z.object({
  patientId: z.string(),
  age: z.number().int().min(0).max(120).optional(),
  sex: z.enum(["female", "male", "other", "unknown"]).optional(),

  symptoms: z
    .array(
      z.object({
        name: z.string(),
        onset: z.string().optional(), // e.g., "3 days"
        severity: z.enum(["mild", "moderate", "severe"]).optional(),
        notes: z.string().optional(),
      })
    )
    .optional(),

  redFlags: z.array(z.string()).optional(),

  possibleConditions: z
    .array(
      z.object({
        name: z.string(),
        confidence: z.number().min(0).max(1),
      })
    )
    .max(5)
    .optional(),

  urgency: z.enum(["low", "medium", "high"]),

  recommendedAction: z.string(),
  followUps: z.array(z.string()).optional(),

  summaryForDoctor: z.string(),

  disclaimers: z.array(z.string()),
});

export type TriageReport = z.infer<typeof TriageReportSchema>;
