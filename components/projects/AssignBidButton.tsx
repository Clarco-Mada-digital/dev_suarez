"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AssignBidButtonProps {
  projectId: string;
  bidId: string;
  disabled?: boolean;
}

export function AssignBidButton({ projectId, bidId, disabled }: AssignBidButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onAssign() {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Échec de l'assignation");
      }
      toast.success("Freelance assigné au projet");
      router.refresh();
    } catch (e) {
      console.error("[AssignBidButton]", e);
      toast.error("Impossible d'assigner ce freelance");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={onAssign} disabled={disabled || loading}>
      {loading ? "Assignation..." : "Assigner ce freelance"}
    </Button>
  );
}
