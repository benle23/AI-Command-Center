export const PERSONAS = [
  "Researcher",
  "Principal Investigator",
  "Lab Administrator",
  "Department Lead",
  "Industry R&D",
  "Other",
] as const;

export const STATUSES = [
  "Targeted",
  "Researched",
  "Qualified",
  "Contacted",
  "Engaged",
  "Interested",
  "Meeting/Demo",
  "Active Opportunity",
  "Not a Fit",
] as const;

export type Persona = (typeof PERSONAS)[number];
export type Status = (typeof STATUSES)[number];
export type Priority = "High" | "Medium" | "Low";

export interface ICP {
  productName: string;
  productDescription: string;
  targetICP: string;
  primaryPersonas: string;
  corePainPoints: string;
  primaryConversionGoal: string;
  keyProofPoints: string;
  thingsNotToClaim: string;
}

export interface Prospect {
  id: string;
  prospectName: string;
  institution: string;
  role: string;
  persona: Persona;
  researchField: string;
  source: string;
  recentContext: string;
  painPoint: string;
  fitScore: number;
  priority: Priority;
  status: Status;
  notes: string;
  lastTouch: string;
  nextAction: string;
  channel: string;
}

export interface SEOExperiment {
  id: string;
  experimentName: string;
  targetQuery: string;
  searchIntent: string;
  contentType: string;
  hypothesis: string;
  publishStatus: string;
  impressions: number;
  clicks: number;
  signups: number;
  earlyAccessRequests: number;
  notes: string;
}

export interface OutreachSequence {
  id: string;
  prospectId: string;
  prospectName: string;
  tone: string;
  goal: string;
  subjectLines: string[];
  email1: string;
  followUp1: string;
  followUp2: string;
  linkedInMessage: string;
  personalizationReason: string;
  riskCheck: string;
  crmNote: string;
  createdAt: string;
}

export interface ContentIdea {
  id: string;
  persona: string;
  researchField: string;
  painPoint: string;
  format: string;
  targetKeyword: string;
  cta: string;
  title: string;
  hook: string;
  outline: string[];
  keyPoints: string[];
  credibilityWarning: string;
  suggestedMetric: string;
}

export interface AppData {
  icp: ICP;
  prospects: Prospect[];
  seoExperiments: SEOExperiment[];
  outreach: OutreachSequence[];
  contentIdeas: ContentIdea[];
}

export interface ProspectAnalysis {
  prospect: Omit<Prospect, "id" | "lastTouch" | "nextAction" | "channel">;
  analysis: {
    whyGoodFit: string;
    likelyObjection: string;
    bestOutreachAngle: string;
    recommendedCTA: string;
    confidence: string;
    missingInfo: string[];
  };
  crmNote: string;
  nextAction: string;
}

export interface CommandOutput {
  icpUpdates: string[];
  prospects: Array<Partial<Prospect>>;
  outreachAngles: string[];
  seoExperiments: string[];
  contentIdeas: string[];
  pipelineUpdates: string[];
  recommendations: string[];
  nextBestActions: string[];
  dataQualityWarnings: string[];
  summary: {
    mainInsight: string;
    bestOpportunity: string;
    biggestRisk: string;
    recommendedFocus: string;
    confidenceScore: number;
  };
}
