import type { ChatCompletionMessageParam } from "./types";

export type AIProvider = "mock" | "openai" | "openrouter";

export interface GenerateOptions {
  provider?: AIProvider;
  model?: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
}

export async function generateChat(opts: GenerateOptions): Promise<string> {
  const provider = (opts.provider || (process.env.AI_PROVIDER as AIProvider) || "mock").toLowerCase() as AIProvider;

  if (provider === "mock") {
    return mockCompletion(opts.messages);
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return mockCompletion(opts.messages);
    const model = opts.model || process.env.AI_MODEL || "gpt-4o-mini";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.max_tokens ?? 800,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "OpenAI error");
    return data.choices?.[0]?.message?.content || "";
  }

  if (provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return mockCompletion(opts.messages);
    const model = opts.model || process.env.AI_MODEL || "openrouter/auto";
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.max_tokens ?? 800,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "OpenRouter error");
    return data.choices?.[0]?.message?.content || "";
  }

  return mockCompletion(opts.messages);
}

function mockCompletion(messages: ChatCompletionMessageParam[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const content = typeof lastUser?.content === "string" ? lastUser?.content : "";
  const lc = content.toLowerCase();

  const isSEO = /\bseo\b|référencement|search\s+engine|mots[- ]clés|backlink/i.test(lc);
  const isTranslation = /traduction|traduire|localisation|translate|linguistique|langue/i.test(lc);
  const isDesign = /design|ui\/?ux|maquette|prototype|wireframe|logo|charte\s+graphique/i.test(lc);
  const isMarketing = /marketing|campagne|publicité|ads|social|newsletter|crm|acquisition|kpi/i.test(lc);

  let advice: string;
  let plan: string[];
  let questions: string[];
  let tags: string[];

  if (isSEO) {
    advice = "Votre demande concerne le SEO. Je propose un audit et une feuille de route SEO adaptés à votre site et vos objectifs.";
    plan = [
      "Audit technique (vitesse, indexation, erreurs, Core Web Vitals)",
      "Recherche de mots-clés et cartographie des intentions",
      "Optimisations on-page (balises, structures Hn, contenus, maillage interne)",
      "Stratégie de contenu éditorial et calendrier",
      "Plan netlinking (qualité et pertinence)",
      "Mesure et itérations (Search Console, Analytics, KPI)"
    ];
    questions = [
      "URL du site et principales pages cibles?",
      "Pays/langue et audience cible?",
      "Objectifs (trafic, leads, ventes) et KPI suivis?",
      "Concurrents principaux et mots-clés visés?"
    ];
    tags = ["seo", "audit seo", "contenu", "on-page", "netlinking"];
  } else if (isTranslation) {
    advice = "Votre demande concerne la traduction/localisation. Je recommande un flux de traduction avec relecture humaine et glossaire pour la cohérence.";
    plan = [
      "Analyse des volumes, formats et domaines (technique, marketing, juridique)",
      "Création de glossaire/guide de style",
      "Traduction par spécialiste du domaine",
      "Relecture (QA linguistique) et validation",
      "Mise en page/format (DTP) si nécessaire",
      "Livraison et retours, mise à jour du glossaire"
    ];
    questions = [
      "Langues source et cibles?",
      "Volumes (mots/pages) et formats des fichiers?",
      "Domaine (technique, marketing, juridique, médical)?",
      "Échéance souhaitée et contraintes de qualité (certifications)?"
    ];
    tags = ["traduction", "localisation", "relecture", "glossaire", "qa linguistique"];
  } else if (isDesign) {
    advice = "Votre demande concerne le design. Je propose un processus UI/UX: de la compréhension du besoin jusqu'aux maquettes finales.";
    plan = [
      "Brief et objectifs (cibles, parcours)",
      "Moodboard et direction artistique",
      "Wireframes basse fidélité",
      "Maquettes UI haute fidélité (design system)",
      "Prototypage et tests utilisateurs",
      "Handover et assets pour intégration"
    ];
    questions = [
      "Y a-t-il une charte graphique/brand existante?",
      "Plateforme cible (web, mobile) et contraintes (accessibilité)?",
      "Exemples de références que vous aimez?",
      "Deadline et niveau de détail attendu (MVP vs complet)?"
    ];
    tags = ["design", "ui", "ux", "maquette", "prototype"];
  } else if (isMarketing) {
    advice = "Votre demande concerne le marketing. Je propose une stratégie d'acquisition et de contenu alignée à vos KPI.";
    plan = [
      "Définir objectifs et KPI (CAC, LTV, ROAS)",
      "Personas et messages clés",
      "Choix des canaux (SEO, SEA, Social, Email, Partenariats)",
      "Calendrier éditorial et assets (créa)",
      "Mise en place tracking & dashboards",
      "Lancement, A/B tests, itérations"
    ];
    questions = [
      "Budget média mensuel et priorités de canaux?",
      "Audience cible et proposition de valeur?",
      "Outils actuels (analytics, CRM, email)?",
      "Délais/événements (lancement produit, saisonnalité)?"
    ];
    tags = ["marketing", "acquisition", "content", "ads", "kpi"];
  } else {
    advice = "Votre demande semble liée à un développement. Voici une approche projet pragmatique (peut s'adapter à un MVP).";
    plan = [
      "Clarifier les objectifs et exigences",
      "Définir l'architecture (frontend, backend, base de données)",
      "Découper en sprints avec jalons clairs",
      "Mettre en place CI/CD, tests et monitoring",
      "Lancer une itération MVP, puis améliorer"
    ];
    questions = [
      "Quel est votre budget cible et échéance souhaitée?",
      "Quelles technologies préférez-vous ou souhaitez-vous éviter?",
      "Des contraintes légales, sécurité, RGPD spécifiques?"
    ];
    tags = ["web", "mvp", "architecture"];
  }

  return `{
  "advice": ${JSON.stringify(advice)},
  "plan": ${JSON.stringify(plan)},
  "questions": ${JSON.stringify(questions)},
  "tags": ${JSON.stringify(tags)},
  "echo": ${JSON.stringify(content)}
}`;
}
