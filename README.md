# ResearchGTM AI Command Center

ResearchGTM AI Command Center is an AI-assisted demand generation workspace for researcher-focused GTM teams. It turns messy prospect, campaign, SEO, and CRM notes into structured actions while keeping a human review step between AI output and execution.

The app is designed as a polished internal-tool prototype for an AI research startup selling to researchers, principal investigators, lab administrators, department leads, and research institutions.

## Why This Fits an AI Demand Gen Role

This project demonstrates how an AI Demand Gen practitioner can build a learning system, not just run disconnected campaigns:

- Multi-step AI workflows with structured JSON output
- Secure OpenAI API usage through Vercel Functions
- Prospect segmentation by persona, fit, pain point, and stage
- Credible academic outreach personalization
- Pipeline tracking and conversion analysis
- SEO experiment design tied to qualified demand
- Programmatic content planning with human review
- Rule-based recommendations and next-best actions
- Meaningful engagement metrics instead of vanity metrics

## Features

- **GTM Overview:** funnel KPIs, pipeline visualization, bottleneck insight, and editable Product + ICP setup
- **Prospect Intelligence:** filters, manual prospect creation, and AI-assisted analysis of messy research notes
- **AI Outreach Builder:** editable email and LinkedIn sequences with credibility and quality checks
- **Pipeline Tracker:** Kanban-style stage view with status movement and conversion metrics
- **SEO Experiments:** hypothesis tracking, CTR, and early-access conversion measurement
- **Content Engine:** structured academic content planning with credibility warnings
- **AI Command Center:** converts unstructured GTM notes into a reviewed action plan
- **Recommendation Engine:** connects funnel signals to focused next actions
- **Prompt Library:** reusable prompts plus a visible bad-prompt vs. good-prompt comparison
- **AI Diagnostics:** health and OpenAI connection tests
- **Local Workspace:** localStorage persistence, demo reset, clear, and JSON export
- **Graceful Fallbacks:** useful rule-based output when no OpenAI key is configured

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Recharts
- localStorage
- Vercel Functions
- OpenAI API

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Use `npm run dev` (`vercel dev`) when testing API routes. `npm run dev:vite` runs only the frontend and will not serve `/api/*`.

Other commands:

```bash
npm run build
npm run preview
```

## OpenAI API Setup

1. Copy `.env.example` to `.env`.
2. Add a server-side `OPENAI_API_KEY`.
3. Optionally set `OPENAI_MODEL`; it defaults to `gpt-4.1-mini`.
4. Run `npm run dev` to test the frontend and Vercel Functions together.
5. Add the same environment variables in the Vercel project dashboard before deployment.

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

The key is read only inside `api/analyze-gtm-data.ts`. It is never exposed to frontend code or stored in localStorage.

## API Routes

### `GET /api/health`

Returns route and environment status:

```json
{
  "status": "ok",
  "apiRouteWorking": true,
  "openaiConfigured": false
}
```

### `POST /api/analyze-gtm-data`

Accepts structured workflow context with a required `rawInput` string. Supported workflows are `prospect`, `outreach`, `content`, and `command`.

## 5-Minute Recruiter Demo Script

> ResearchGTM AI Command Center is a prototype of the kind of internal tool I would build for an AI demand generation role. The goal is to help a GTM team go from messy notes to structured action. I built sections for ICP setup, prospect intelligence, AI-assisted outreach, pipeline tracking, SEO experiments, programmatic content planning, and recommendations. The AI workflow lets a user paste messy prospect or campaign notes, then ChatGPT organizes them into structured GTM data. The key idea is that demand gen is not just sending emails. It is building a learning system that tests personas, messages, channels, and conversion points.

Suggested walkthrough:

1. Start on **GTM Overview** and explain the Qualified → Contacted bottleneck.
2. Open **Prospect Intelligence**, paste messy notes, and review the structured prospect output.
3. Use **AI Outreach Builder** to create a credible, low-friction sequence.
4. Move the prospect in **Pipeline Tracker**.
5. Show how **SEO Experiments** measure early-access conversion, not only impressions.
6. End in **AI Command Center** by turning a campaign note into a reviewed GTM plan.

## Troubleshooting API 404 Errors

- Confirm `api/health.ts` exists.
- Confirm `api/analyze-gtm-data.ts` exists.
- Confirm the frontend fetch path is exactly `/api/analyze-gtm-data`.
- Use `vercel dev` locally, not only `vite`.
- Confirm `vercel.json` does not rewrite `/api` routes to `index.html`.
- Check the Vercel **Functions** tab after deployment.
- Redeploy after adding environment variables.

Friendly app diagnostics also distinguish between an unreachable route, a missing key, and an OpenAI request error.

## Future Improvements

- CRM integration with HubSpot or Salesforce
- Live email engagement tracking
- Google Search Console integration
- LinkedIn campaign data
- Research database enrichment
- RAG-based researcher context
- Automated weekly experiment summary
- A/B testing module
- Team collaboration and approval workflows

## Privacy

Workspace data is stored locally in the browser. Data is only sent to OpenAI when a user explicitly clicks an AI analysis button.
