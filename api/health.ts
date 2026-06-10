import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  return res.status(200).json({
    status: "ok",
    apiRouteWorking: true,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
  });
}
