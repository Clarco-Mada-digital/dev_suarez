"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUser } from "@/hooks/use-user";

type AIResult = {
  advice: string;
  plan: string[];
  questions: string[];
  tags: string[];
  freelancers: Array<{
    id: string;
    name: string | null;
    image?: string | null;
    profile?: { skills?: string | null; rating?: number | null; hourlyRate?: number | null };
    reason: string;
  }>;
};

export default function AssistantForm() {
  const { toast } = useToast();
  const { user } = useUser();
  const isAdmin = user?.role === "ADMIN";
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [provider, setProvider] = useState<string>("mock");
  const [model, setModel] = useState<string>("");
  const [temperature, setTemperature] = useState<string>("0.4");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch global AI settings
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/ai/settings", { cache: "no-store" });
        if (!res.ok) return; // keep defaults
        const data = await res.json();
        if (!active) return;
        setProvider(data.provider || "mock");
        setModel(data.model || "");
        setTemperature(String(data.temperature ?? 0.4));
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async () => {
    if (!description || description.trim().length < 10) {
      toast({ title: "Description insuffisante", description: "Ajoutez plus de détails (au moins 10 caractères)." });
      return;
    }
    const min = budgetMin.trim() ? Number(budgetMin) : undefined;
    const max = budgetMax.trim() ? Number(budgetMax) : undefined;
    if ((min != null && isNaN(min)) || (max != null && isNaN(max))) {
      toast({ title: "Budget invalide", description: "Vérifiez les montants saisis." });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          technologies: technologies.trim(),
          budgetMin: min,
          budgetMax: max,
          deadline: deadline || undefined,
          // AI parameters are globally managed; no per-request overrides
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Impossible d'obtenir l'analyse IA");
      setResult(data);
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Échec de la requête" });
    } finally {
      setLoading(false);
    }
  };

  const onSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/ai/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model: model || undefined,
          temperature: Number(temperature),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Échec de la mise à jour");
      toast({ title: "Paramètres IA mis à jour" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Impossible d'enregistrer les paramètres" });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="text-sm font-medium">Décrivez votre projet</label>
            <Textarea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Objectifs, fonctionnalités, public cible, contraintes..." />
          </div>
          <div>
            <label className="text-sm font-medium">Technologies souhaitées (optionnel)</label>
            <Input value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="Ex: Next.js, Prisma, PostgreSQL, TailwindCSS" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Budget min (€)</label>
              <Input type="number" inputMode="decimal" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Optionnel" />
            </div>
            <div>
              <label className="text-sm font-medium">Budget max (€)</label>
              <Input type="number" inputMode="decimal" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Optionnel" />
            </div>
            <div>
              <label className="text-sm font-medium">Échéance</label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {isAdmin ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Paramètres IA globaux (admin)</label>
                </div>
                <div className="mt-2 space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Fournisseur</label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mock">Gratuit (mock)</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="openrouter">OpenRouter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Modèle (optionnel)</label>
                    <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="ex: gpt-4o-mini, openrouter/auto" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Température</label>
                    <Input type="number" min={0} max={2} step={0.1} value={temperature} onChange={(e) => setTemperature(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">0=réponses précises, 2=réponses créatives</p>
                  </div>
                  <div>
                    <Button variant="secondary" className="w-full" onClick={onSaveSettings} disabled={savingSettings}>
                      {savingSettings ? (
                        <span className="inline-flex items-center gap-2"><LoadingSpinner className="h-4 w-4" /> Enregistrement...</span>
                      ) : (
                        "Sauvegarder les paramètres"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Paramètres IA utilisés</label>
              <div className="rounded-md border p-3 text-sm text-muted-foreground">
                <div><span className="font-medium text-foreground">Fournisseur:</span> {provider}</div>
                <div><span className="font-medium text-foreground">Modèle:</span> {model || "(par défaut)"}</div>
                <div><span className="font-medium text-foreground">Température:</span> {temperature}</div>
                <p className="mt-2">Ces paramètres sont configurés par un administrateur.</p>
              </div>
            </div>
          )}
          <div>
            <Button className="w-full" onClick={onSubmit} disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2"><LoadingSpinner className="h-4 w-4" /> Analyse en cours...</span>
              ) : (
                "Obtenir des recommandations"
              )}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {result && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Conseil de l'assistant</h3>
            <p className="mt-2 whitespace-pre-wrap">{result.advice}</p>
          </div>
          {result.plan?.length > 0 && (
            <div>
              <h4 className="font-medium">Plan proposé</h4>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {result.plan.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}
          {result.questions?.length > 0 && (
            <div>
              <h4 className="font-medium">Questions pour clarifier</h4>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {result.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          {(result.tags?.length ?? 0) > 0 && (
            <div>
              <h4 className="font-medium">Tags</h4>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                {result.tags.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md border">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div>
            <h4 className="font-medium">Freelances recommandés</h4>
            {result.freelancers.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-1">Aucun profil recommandé pour le moment.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {result.freelancers.map((f) => (
                  <li key={f.id} className="border rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/profile/${f.id}`}
                          className="font-medium text-primary hover:underline"
                          aria-label={`Voir le profil de ${f.name || "Freelance"}`}
                        >
                          {f.name || "Freelance"}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {f.profile?.skills || "Compétences non renseignées"}
                        </div>
                      </div>
                      {f.profile?.rating != null && (
                        <div className="text-sm">⭐ {f.profile.rating?.toFixed(1)}</div>
                      )}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Raison: </span>
                      <span className="text-muted-foreground">{f.reason}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
