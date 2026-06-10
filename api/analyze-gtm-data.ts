import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are a senior GTM analyst for an AI research startup. Analyze messy GTM input and turn it into structured demand generation data. Focus on researcher pain points, persona fit, credible academic messaging, and next-best GTM action. Do not fabricate facts. If data is missing, say what is missing. Outreach must be concise, credible, non-salesy, and only reference provided context. Return only valid JSON.`;

function workflowInstructions(workflow: string) {
  if (workflow === "outreach") {
    return `Return JSON with: subjectLines (string array), email1, followUp1, followUp2, linkedInMessage, personalizationReason, riskCheck, crmNote.`;
  }
  if (workflow === "content") {
    return `Return JSON with: title, hook, outline (string array), keyPoints (string array), cta, credibilityWarning, suggestedMetric. Position this as content planning, not mass publishing.`;
  }
  if (workflow === "command") {
    return `Return JSON with: icpUpdates, prospects, outreachAngles, seoExperiments, contentIdeas, pipelineUpdates, recommendations, nextBestActions, dataQualityWarnings (all arrays), and summary containing mainInsight, bestOpportunity, biggestRisk, recommendedFocus, confidenceScore.`;
  }
  return `Return JSON with prospect containing prospectName, institution, role, persona, researchField, source, recentContext, painPoint, fitScore, priority, status, notes; analysis containing whyGoodFit, likelyObjection, bestOutreachAngle, recommendedCTA, confidence, missingInfo; plus crmNote and nextAction.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { rawInput, workflow = "prospect", persona, icp, context, options } = req.body || {};
  if (!rawInput || typeof rawInput !== "string") {
    return res.status(400).json({ error: "rawInput is required." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OpenAI is not configured. Add OPENAI_API_KEY to .env and Vercel environment variables.",
    });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            task: workflowInstructions(workflow),
            workflow,
            rawInput,
            persona,
            icp,
            context,
            options,
          }),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned an empty response.");
    return res.status(200).json(JSON.parse(content));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI error";
    return res.status(500).json({
      error: "AI analysis could not be completed. Check API key, model name, and server logs.",
      detail: message,
    });
  }
}
