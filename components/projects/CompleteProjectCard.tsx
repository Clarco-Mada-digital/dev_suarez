"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star } from "lucide-react";

interface CompleteProjectCardProps {
  projectId: string;
}

export function CompleteProjectCard({ projectId }: CompleteProjectCardProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState<number | null>(null); // optionnel

  async function onComplete() {
    try {
      setSubmitting(true);
      const payload: any = { status: "COMPLETED" };
      if (typeof rating === "number") payload.freelancerRating = rating;

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Échec de la finalisation");
      }
      toast.success("Projet marqué comme terminé");
      router.refresh();
    } catch (e) {
      console.error("[CompleteProjectCard]", e);
      toast.error("Impossible de marquer le projet comme terminé");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finaliser le projet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Note du freelance (optionnel)</Label>
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Note du freelance">
            {[1,2,3,4,5].map((star) => {
              const active = (rating ?? 0) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1"
                  aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={active ? "h-6 w-6 text-yellow-500 fill-yellow-500" : "h-6 w-6 text-gray-300"}
                  />
                </button>
              );
            })}
            <button
              type="button"
              className="ml-3 text-xs text-muted-foreground underline"
              onClick={() => setRating(null)}
            >
              Effacer
            </button>
          </div>
          {typeof rating === "number" && (
            <p className="text-xs text-muted-foreground">Vous avez sélectionné {rating} / 5</p>
          )}
        </div>
        <Button onClick={onComplete} disabled={submitting} className="w-full">
          {submitting ? "En cours..." : "Marquer comme terminé"}
        </Button>
      </CardContent>
    </Card>
  );
}
