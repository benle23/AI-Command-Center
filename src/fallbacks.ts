import { makeId } from "./demo";
import type {
  CommandOutput,
  ContentIdea,
  ICP,
  OutreachSequence,
  Prospect,
  ProspectAnalysis,
} from "./types";

export function fallbackProspectAnalysis(
  rawInput: string,
  persona: string,
): ProspectAnalysis {
  const lower = rawInput.toLowerCase();
  const painPoint = lower.includes("literature")
    ? "Literature overload and staying current"
    : lower.includes("team") || lower.includes("lab")
      ? "Coordinating research knowledge"
      : "Finding and synthesizing relevant research";
  const fitScore = Math.min(
    94,
    58 +
      (lower.includes("research") ? 12 : 0) +
      (lower.includes("paper") || lower.includes("literature") ? 14 : 0) +
      (rawInput.length > 160 ? 8 : 0),
  );
  return {
    prospect: {
      prospectName: "Review needed",
      institution: "Not provided",
      role: persona,
      persona: (persona || "Researcher") as Prospect["persona"],
      researchField: "Not provided",
      source: "AI Prospect Analyzer",
      recentContext: rawInput.slice(0, 180),
      painPoint,
      fitScore,
      priority: fitScore >= 80 ? "High" : fitScore >= 65 ? "Medium" : "Low",
      status: "Researched",
      notes: "Rule-based draft. Verify identity and recent context before outreach.",
    },
    analysis: {
      whyGoodFit: `The notes suggest a credible need around ${painPoint.toLowerCase()}.`,
      likelyObjection: "May need proof that the workflow is accurate and saves meaningful time.",
      bestOutreachAngle: `Lead with the ${painPoint.toLowerCase()} workflow, not generic AI capability.`,
      recommendedCTA: "Ask for a 15-minute research workflow feedback call.",
      confidence: rawInput.length > 160 ? "Medium" : "Low",
      missingInfo: ["Prospect name", "Institution", "Recent research context"],
    },
    crmNote: `Potential ${persona} fit. Primary signal: ${painPoint}. Verify details before contact.`,
    nextAction: "Research one recent publication and personalize a low-friction outreach note.",
  };
}

export function fallbackOutreach(
  prospect: Prospect,
  tone: string,
  goal: string,
  customNotes: string,
): OutreachSequence {
  const cta =
    goal === "Product demo"
      ? "Would a short, workflow-focused demo be useful?"
      : `Would you be open to a brief conversation about how you handle this today?`;
  return {
    id: makeId(),
    prospectId: prospect.id,
    prospectName: prospect.prospectName,
    tone,
    goal,
    subjectLines: [
      `${prospect.researchField} literature workflow`,
      `A question about ${prospect.painPoint.toLowerCase()}`,
      `Research workflow feedback`,
    ],
    email1: `Hi ${prospect.prospectName.split(" ").slice(-1)},\n\nI’m reaching out because your work in ${prospect.researchField} suggests that ${prospect.painPoint.toLowerCase()} may be a meaningful part of the research workflow. We’re building a research-focused AI tool to help organize and work across scientific literature without overpromising what AI can do.\n\n${cta}\n\nBest,\nResearchGTM`,
    followUp1: `Hi ${prospect.prospectName.split(" ").slice(-1)},\n\nFollowing up with a simpler question: what part of finding and synthesizing relevant research takes the most time for your team today? Even a short reply would help shape the workflow.\n\nBest,\nResearchGTM`,
    followUp2: `Closing the loop for now. If improving ${prospect.painPoint.toLowerCase()} becomes a priority, I’d be glad to share what we’re learning from other research teams.`,
    linkedInMessage: `Hi ${prospect.prospectName.split(" ").slice(-1)} — I’m learning how ${prospect.persona.toLowerCase()}s manage ${prospect.painPoint.toLowerCase()}. Open to a brief workflow feedback conversation?`,
    personalizationReason: `Uses only provided context: role, ${prospect.researchField}, and ${prospect.painPoint.toLowerCase()}. ${customNotes}`,
    riskCheck:
      "Review the recent-context reference before sending. No unsupported product or scientific claims included.",
    crmNote: `Generated a ${tone.toLowerCase()} outreach sequence for ${goal.toLowerCase()}.`,
    createdAt: new Date().toISOString(),
  };
}

export function fallbackContent(
  persona: string,
  researchField: string,
  painPoint: string,
  format: string,
  keyword: string,
  cta: string,
): ContentIdea {
  return {
    id: makeId(),
    persona,
    researchField,
    painPoint,
    format,
    targetKeyword: keyword,
    cta,
    title: `A practical ${painPoint.toLowerCase()} workflow for ${researchField} teams`,
    hook: `Most AI content starts with the model. Researchers need content that starts with the actual workflow.`,
    outline: [
      `Define the ${painPoint.toLowerCase()} problem`,
      `Map the current ${researchField} workflow`,
      "Show a credible AI-assisted workflow",
      "Explain limitations and human review",
      `Invite readers to ${cta.toLowerCase()}`,
    ],
    keyPoints: [
      "Prioritize verifiable workflow improvements over hype",
      `Use examples specific to ${persona.toLowerCase()} responsibilities`,
      "Track qualified conversations, not only traffic",
    ],
    credibilityWarning:
      "Validate technical examples with a domain expert and never fabricate citations.",
    suggestedMetric: "Qualified researcher conversations generated",
  };
}

export function fallbackCommand(rawInput: string, icp: ICP): CommandOutput {
  const sentences = rawInput
    .split(/[.\n]+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    icpUpdates: sentences.filter((s) => /persona|ICP|audience/i.test(s)).slice(0, 3),
    prospects: [],
    outreachAngles: [
      `Lead with ${icp.corePainPoints.split(",")[0].toLowerCase()} and ask a workflow question.`,
      "Use recent research context only after it is verified.",
    ],
    seoExperiments: sentences.filter((s) => /search|SEO|keyword|query/i.test(s)).slice(0, 3),
    contentIdeas: sentences.filter((s) => /content|guide|post|newsletter/i.test(s)).slice(0, 3),
    pipelineUpdates: sentences.filter((s) => /contact|reply|meeting|demo/i.test(s)).slice(0, 3),
    recommendations: [
      "Prioritize high-fit researchers with explicit workflow pain.",
      "Turn the strongest learning into one measurable experiment.",
    ],
    nextBestActions: [
      "Verify the highest-priority prospect context.",
      "Launch one focused outreach test.",
      "Review conversion quality after the first 20 contacts.",
    ],
    dataQualityWarnings: [
      "Rule-based output: verify names, metrics, and claims before applying.",
    ],
    summary: {
      mainInsight:
        sentences[0] || "The notes need more specific prospect and campaign context.",
      bestOpportunity: "Convert the clearest researcher pain point into a focused GTM test.",
      biggestRisk: "Acting on unverified or overly broad notes.",
      recommendedFocus: "One persona, one pain point, one measurable conversion goal.",
      confidenceScore: Math.min(85, 40 + sentences.length * 5),
    },
  };
}
