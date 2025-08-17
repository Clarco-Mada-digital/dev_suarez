import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateChat } from "@/lib/ai/providers";
import type { ChatCompletionMessageParam, AIAdviceResponse } from "@/lib/ai/types";

const schema = z.object({
  description: z.string().min(10, "Veuillez détailler votre projet."),
  technologies: z.string().optional().default(""),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  deadline: z.string().optional(),
  // Provider/model/temperature are globally managed; request values are ignored
  provider: z.enum(["mock", "openai", "openrouter"]).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

function extractJson(text: string): any | null {
  try {
    // Direct parse
    return JSON.parse(text);
  } catch (_) {
    // Try fenced code block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
  }
  return null;
}

function classifyDomain(text: string): "SEO" | "TRADUCTION" | "DESIGN" | "MARKETING" | "DÉVELOPPEMENT" {
  const lc = text.toLowerCase();
  if (/\bseo\b|référencement|search\s+engine|mots[- ]clés|backlink/.test(lc)) return "SEO";
  if (/traduction|traduire|localisation|translate|linguistique|langue/.test(lc)) return "TRADUCTION";
  if (/design|ui\/?ux|maquette|prototype|wireframe|logo|charte\s+graphique/.test(lc)) return "DESIGN";
  if (/marketing|campagne|publicité|ads|social|newsletter|crm|acquisition|kpi/.test(lc)) return "MARKETING";
  return "DÉVELOPPEMENT";
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    const { description, technologies, budgetMin, budgetMax, deadline } = parsed.data;

    const combined = [description, technologies].filter(Boolean).join("\n");
    const domain = classifyDomain(combined);

    const system: ChatCompletionMessageParam = {
      role: "system",
      content:
        "Tu es un assistant expert en cadrage de besoins (SEO, traduction, design, marketing, développement, etc.) et en recommandation de freelances. Adapte tes conseils au DOMAINE du besoin. Si le besoin n'est pas du développement, ne propose PAS du développement. Réponds STRICTEMENT au format JSON avec les clés: advice (string), plan (string[]), questions (string[]), tags (string[]). Les tags doivent être pertinents pour le domaine (compétences, outils, techniques).",
    };
    const user: ChatCompletionMessageParam = {
      role: "user",
      content: [
        `Domaine détecté: ${domain}`,
        `\nDescription du besoin/projet: ${description}`,
        technologies ? `\nTechnologies souhaitées: ${technologies}` : "",
        budgetMin != null ? `\nBudget min: ${budgetMin}` : "",
        budgetMax != null ? `\nBudget max: ${budgetMax}` : "",
        deadline ? `\nÉchéance: ${deadline}` : "",
      ].join(""),
    };

    // Read global AI settings (singleton). Fallbacks to env/defaults if missing.
    const global = await prisma.aiSettings.findUnique({ where: { id: "global" } });
    const effectiveProvider = (global?.provider || process.env.AI_PROVIDER || "mock") as "mock" | "openai" | "openrouter";
    const effectiveModel = global?.model || process.env.AI_MODEL || undefined;
    const effectiveTemperature = (global?.temperature ?? 0.4);

    const content = await generateChat({
      provider: effectiveProvider,
      model: effectiveModel,
      temperature: effectiveTemperature,
      messages: [system, user],
    });

    const ai: AIAdviceResponse | null = extractJson(content);
    if (!ai) {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 502 });
    }

    const tags = (ai.tags || []).map((t) => String(t || "").toLowerCase());

    // Domain-specific keywords to strengthen matching
    const domainKeywords = (() => {
      switch (domain) {
        case "DESIGN":
          return ["design", "ui", "ux", "maquette", "prototype", "figma", "sketch", "adobe", "photoshop", "illustrator", "wireframe", "charte", "graphique", "branding", "brand"];
        case "SEO":
          return ["seo", "référencement", "on-page", "netlinking", "semrush", "ahrefs", "search console", "mots-clés", "kw"];
        case "TRADUCTION":
          return ["traduction", "localisation", "linguistique", "relecture", "qa", "glossaire", "memoq", "trados", "native"];
        case "MARKETING":
          return ["marketing", "acquisition", "content", "ads", "google ads", "meta ads", "social", "newsletter", "crm", "ga4", "kpi", "roas", "cac"];
        default:
          return ["dev", "développement", "frontend", "backend", "fullstack", "architecture", "mvp", "react", "next", "node", "prisma"];
      }
    })();

    const keywordSet = Array.from(new Set([...tags, ...domainKeywords])).filter(Boolean);

    // Fetch candidate freelancers (with a profile). Do not require prior bids to avoid biasing against designers/marketers/etc.
    const candidates = await prisma.user.findMany({
      where: { profile: { isNot: null } },
      include: { profile: true },
      take: 100,
    });

    type Scored = typeof candidates[number] & { score: number; reason: string; matchCount: number; domainMatch: boolean };
    const scored: Scored[] = candidates.map((u) => {
      const baseText = [u.profile?.skills || "", u.profile?.jobTitle || ""].join(" ").toLowerCase();
      const matches = keywordSet.filter((k) => k && baseText.includes(k));
      const matchCount = matches.length;

      // Domain boost if job title strongly indicates the domain
      let domainBoost = 0;
      const domainMatch = (
        (domain === "DESIGN" && /\b(designer|design|ui|ux|figma|sketch|maquette|prototype|wireframe)\b/.test(baseText)) ||
        (domain === "SEO" && /\b(seo|référencement|search\s+console|semrush|ahrefs)\b/.test(baseText)) ||
        (domain === "TRADUCTION" && /\b(traducteur|traduction|localisation|linguistique)\b/.test(baseText)) ||
        (domain === "MARKETING" && /\b(marketing|growth|ads|acquisition|social|crm)\b/.test(baseText)) ||
        (domain === "DÉVELOPPEMENT" && /\b(dev|développement|frontend|backend|fullstack|react|next|node)\b/.test(baseText))
      );
      if (domain === "DESIGN" && domainMatch) domainBoost += 30;
      if (domain === "SEO" && domainMatch) domainBoost += 30;
      if (domain === "TRADUCTION" && domainMatch) domainBoost += 30;
      if (domain === "MARKETING" && domainMatch) domainBoost += 30;

      const rating = u.profile?.rating ?? 0;
      const score = matchCount * 12 + domainBoost + rating; // stronger weight on matches + domain boost + rating
      const reason = matchCount > 0
        ? `Compétences correspondantes: ${matches.slice(0, 6).join(", ")}`
        : (domainBoost > 0 ? `Correspondance domaine (${domain.toLowerCase()})` : `Profil général/rating: ${rating}`);
      return Object.assign({}, u, { score, reason, matchCount, domainMatch });
    });

    // Only keep candidates with clear domain relevance. For non-dev requests, require domainMatch.
    const relevant = scored.filter((s) => {
      const hasRelevance = s.matchCount > 0 || s.score >= 30;
      if (domain !== "DÉVELOPPEMENT") return hasRelevance && s.domainMatch;
      return hasRelevance;
    });

    relevant.sort((a, b) => b.score - a.score);
    const top = relevant.slice(0, 3).map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image,
      profile: {
        skills: u.profile?.skills,
        rating: u.profile?.rating,
        hourlyRate: u.profile?.hourlyRate,
      },
      reason: u.reason,
    }));

    return NextResponse.json({ ok: true, advice: ai.advice, plan: ai.plan || [], questions: ai.questions || [], tags, freelancers: top });
  } catch (e) {
    console.error("POST /api/ai/advice error", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
