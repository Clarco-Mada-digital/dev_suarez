"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RateableProject {
  id: string;
  title: string;
}

interface Props {
  freelancerId: string;
  className?: string;
}

export default function RateFreelancerPanel({ freelancerId, className }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState<RateableProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/freelancers/${freelancerId}/rateable-projects`);
        if (!res.ok) {
          // If unauthorized or no access, hide panel by not throwing toasts
          setProjects([]);
          return;
        }
        const data = await res.json();
        setProjects(data || []);
      } catch (e) {
        console.error("Failed to fetch rateable projects", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [freelancerId]);

  const submit = async () => {
    if (!selectedProjectId || rating < 1 || rating > 5) {
      toast.error("Sélectionnez un projet et une note (1-5)");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerRating: rating }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Échec de l'envoi de la note");
      }
      toast.success("Note enregistrée");
      // Remove project from list
      setProjects((prev) => prev.filter((p) => p.id !== selectedProjectId));
      setSelectedProjectId(null);
      setRating(0);
      // Refresh page to reflect updated rating and count
      router.refresh();
    } catch (e: any) {
      console.error(e);
      toast.error("Impossible d'enregistrer la note");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (projects.length === 0) return null;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Donner une note</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Projet</label>
              <select
                className="w-full border rounded px-3 py-2 bg-background"
                value={selectedProjectId || ""}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
              >
                <option value="">Choisir un projet</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Note</label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1"
                    aria-label={`Donner ${s} étoile(s)`}
                  >
                    <Star className={`h-5 w-5 ${rating >= s ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                  </button>
                ))}
                {rating > 0 && (
                  <button type="button" className="ml-2 text-xs underline" onClick={() => setRating(0)}>
                    Effacer
                  </button>
                )}
              </div>
            </div>
            <Button onClick={submit} disabled={submitting || !selectedProjectId || rating === 0}>
              {submitting ? 'Envoi...' : 'Enregistrer la note'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
