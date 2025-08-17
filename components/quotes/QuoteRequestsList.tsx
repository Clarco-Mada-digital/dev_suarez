"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Quote = {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  deadline: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COUNTERED";
  createdAt: string;
  clientId: string;
  freelancerId: string;
  counterBudgetMin?: number | null;
  counterBudgetMax?: number | null;
  counterDeadline?: string | null;
  counterMessage?: string | null;
};

export default function QuoteRequestsList({
  sent,
  received,
  userId,
}: {
  sent: Quote[];
  received: Quote[];
  userId: string;
}) {
  const { toast } = useToast();
  const [list, setList] = useState({ sent, received });
  const [counterOpenForId, setCounterOpenForId] = useState<string | null>(null);
  const counterQuote = useMemo(() => list.received.find((q) => q.id === counterOpenForId) || null, [counterOpenForId, list.received]);
  const [counterForm, setCounterForm] = useState<{
    min?: string;
    max?: string;
    deadline?: string;
    message?: string;
    submitting?: boolean;
  }>({});

  // Filters & pagination
  const [statusFilter, setStatusFilter] = useState<"ALL" | Quote["status"]>("ALL");
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageReceived, setPageReceived] = useState<number>(1);
  const [pageSent, setPageSent] = useState<number>(1);

  const filteredReceived = useMemo(() => {
    const arr = statusFilter === "ALL" ? list.received : list.received.filter((q) => q.status === statusFilter);
    return arr;
  }, [list.received, statusFilter]);
  const filteredSent = useMemo(() => {
    const arr = statusFilter === "ALL" ? list.sent : list.sent.filter((q) => q.status === statusFilter);
    return arr;
  }, [list.sent, statusFilter]);

  const totalPagesReceived = Math.max(1, Math.ceil(filteredReceived.length / pageSize));
  const totalPagesSent = Math.max(1, Math.ceil(filteredSent.length / pageSize));
  const pageItemsReceived = useMemo(() => filteredReceived.slice((pageReceived - 1) * pageSize, pageReceived * pageSize), [filteredReceived, pageReceived, pageSize]);
  const pageItemsSent = useMemo(() => filteredSent.slice((pageSent - 1) * pageSize, pageSent * pageSize), [filteredSent, pageSent, pageSize]);

  useEffect(() => {
    // Reset page when filter/page size changes
    setPageReceived(1);
    setPageSent(1);
  }, [statusFilter, pageSize]);

  useEffect(() => {
    // Clamp pages when list sizes shrink (e.g., after delete)
    if (pageReceived > totalPagesReceived) setPageReceived(totalPagesReceived);
    if (pageSent > totalPagesSent) setPageSent(totalPagesSent);
  }, [pageReceived, pageSent, totalPagesReceived, totalPagesSent]);

  // Initialize form when opening the sheet for a given quote, reset on close
  useEffect(() => {
    if (counterOpenForId && counterQuote) {
      setCounterForm({
        min: counterQuote.budgetMin != null ? String(counterQuote.budgetMin) : "",
        max: counterQuote.budgetMax != null ? String(counterQuote.budgetMax) : "",
        deadline: counterQuote.deadline ? counterQuote.deadline.slice(0, 10) : "",
        message: "",
        submitting: false,
      });
    } else {
      setCounterForm({});
    }
  }, [counterOpenForId, counterQuote]);

  const onAction = async (id: string, action: "accept" | "decline") => {
    try {
      const res = await fetch(`/api/quote-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Action impossible");
      toast({ title: "Succès", description: `Demande ${action === "accept" ? "acceptée" : "refusée"}.` });

      setList((prev) => ({
        sent: prev.sent.map((q) => (q.id === id ? { ...q, status: data.quoteRequest.status } : q)),
        received: prev.received.map((q) => (q.id === id ? { ...q, status: data.quoteRequest.status } : q)),
      }));
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Action échouée" });
    }
  };

  const onDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/quote-requests/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Suppression impossible");
      toast({ title: "Supprimé", description: "La demande a été supprimée." });
      setList((prev) => ({
        sent: prev.sent.filter((q) => q.id !== id),
        received: prev.received.filter((q) => q.id !== id),
      }));
      if (counterOpenForId === id) setCounterOpenForId(null);
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Action échouée" });
    }
  };

  const StatusBadge = ({ status }: { status: Quote["status"] }) => {
    const variant =
      status === "PENDING"
        ? "secondary"
        : status === "ACCEPTED"
        ? "default"
        : status === "COUNTERED"
        ? "secondary"
        : "destructive";
    const label =
      status === "PENDING"
        ? "En attente"
        : status === "ACCEPTED"
        ? "Acceptée"
        : status === "COUNTERED"
        ? "Proposition envoyée"
        : "Refusée";
    return <Badge variant={variant as any}>{label}</Badge>;
  };

  const Section = ({ title, items, isInbox }: { title: string; items: Quote[]; isInbox?: boolean }) => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <Separator className="mb-4" />
      <div className="space-y-4">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Aucune demande.</p>}
        {items.map((q) => (
          <div key={q.id} className="border rounded-md p-4 overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h4 className="font-medium text-base truncate" title={q.title}>{q.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 break-words max-h-24 overflow-hidden">{q.description}</p>
              </div>
              <div className="shrink-0 ml-2"><StatusBadge status={q.status} /></div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground flex flex-wrap gap-3">
              {q.budgetMin != null && <span>Min: {q.budgetMin}€</span>}
              {q.budgetMax != null && <span>Max: {q.budgetMax}€</span>}
              {q.deadline && <span>Échéance: {format(new Date(q.deadline), "PPP", { locale: fr })}</span>}
              <span>Créée: {format(new Date(q.createdAt), "PPP", { locale: fr })}</span>
            </div>
            {(q.counterBudgetMin != null || q.counterBudgetMax != null || q.counterDeadline || q.counterMessage) && (
              <div className="mt-3 text-sm">
                <div className="font-medium">Proposition du freelance:</div>
                <div className="text-muted-foreground flex flex-wrap gap-3 mt-1">
                  {q.counterBudgetMin != null && <span>Min: {q.counterBudgetMin}€</span>}
                  {q.counterBudgetMax != null && <span>Max: {q.counterBudgetMax}€</span>}
                  {q.counterDeadline && (
                    <span>Échéance: {format(new Date(q.counterDeadline), "PPP", { locale: fr })}</span>
                  )}
                </div>
                {q.counterMessage && (
                  <p className="mt-1 whitespace-pre-wrap break-words">{q.counterMessage}</p>
                )}
              </div>
            )}
            {isInbox && q.status === "PENDING" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onAction(q.id, "accept")}>Accepter</Button>
                <Button size="sm" variant="secondary" onClick={() => onAction(q.id, "decline")}>
                  Refuser
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCounterOpenForId(q.id)}>Proposer un ajustement</Button>
              </div>
            )}
            <div className="mt-2">
              <Button size="sm" variant="destructive" onClick={() => onDelete(q.id)}>Supprimer</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrer par statut</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="COUNTERED">Proposition envoyée</SelectItem>
              <SelectItem value="ACCEPTED">Acceptée</SelectItem>
              <SelectItem value="DECLINED">Refusée</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Par page</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Section title="Demandes reçues" items={pageItemsReceived} isInbox />
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {pageReceived} / {totalPagesReceived} • {filteredReceived.length} éléments</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPageReceived((p) => Math.max(1, p - 1))} disabled={pageReceived <= 1}>Précédent</Button>
              <Button size="sm" variant="outline" onClick={() => setPageReceived((p) => Math.min(totalPagesReceived, p + 1))} disabled={pageReceived >= totalPagesReceived}>Suivant</Button>
            </div>
          </div>
        </div>
        <div>
          <Section title="Demandes envoyées" items={pageItemsSent} />
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {pageSent} / {totalPagesSent} • {filteredSent.length} éléments</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPageSent((p) => Math.max(1, p - 1))} disabled={pageSent <= 1}>Précédent</Button>
              <Button size="sm" variant="outline" onClick={() => setPageSent((p) => Math.min(totalPagesSent, p + 1))} disabled={pageSent >= totalPagesSent}>Suivant</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Sheet for counter proposal */}
      <Sheet open={!!counterOpenForId} onOpenChange={(open) => setCounterOpenForId(open ? counterOpenForId : null)}>
        <SheetContent forceMount side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Proposer un ajustement</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Budget min (€)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={counterForm.min ?? ""}
                  onChange={(e) => setCounterForm((s) => ({ ...s, min: e.target.value }))}
                  placeholder="Optionnel"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Budget max (€)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={counterForm.max ?? ""}
                  onChange={(e) => setCounterForm((s) => ({ ...s, max: e.target.value }))}
                  placeholder="Optionnel"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Nouvelle échéance</label>
              <Input
                type="date"
                value={counterForm.deadline ?? ""}
                onChange={(e) => setCounterForm((s) => ({ ...s, deadline: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                rows={5}
                value={counterForm.message ?? ""}
                onChange={(e) => setCounterForm((s) => ({ ...s, message: e.target.value }))}
                placeholder="Expliquez vos conditions, éléments à ajuster, etc."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setCounterOpenForId(null)}
              >
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  const id = counterOpenForId;
                  if (!id) return;
                  const min = counterForm.min?.trim() ? Number(counterForm.min) : undefined;
                  const max = counterForm.max?.trim() ? Number(counterForm.max) : undefined;
                  if ((min != null && isNaN(min)) || (max != null && isNaN(max))) {
                    toast({ title: "Erreur", description: "Budgets invalides" });
                    return;
                  }
                  if (min != null && max != null && max < min) {
                    toast({ title: "Erreur", description: "Le budget max doit être ≥ au min" });
                    return;
                  }
                  try {
                    setCounterForm((s) => ({ ...s, submitting: true }));
                    const res = await fetch(`/api/quote-requests/${id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "counter",
                        counterBudgetMin: min,
                        counterBudgetMax: max,
                        counterDeadline: counterForm.deadline ? new Date(counterForm.deadline).toISOString() : undefined,
                        counterMessage: counterForm.message?.trim() ? counterForm.message : undefined,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error || "Action impossible");
                    toast({ title: "Proposition envoyée", description: "Votre contre-proposition a été transmise." });
                    setList((prev) => ({
                      sent: prev.sent.map((it) => (it.id === id ? { ...it, ...data.quoteRequest } : it)),
                      received: prev.received.map((it) => (it.id === id ? { ...it, ...data.quoteRequest } : it)),
                    }));
                    setCounterOpenForId(null);
                  } catch (e: any) {
                    toast({ title: "Erreur", description: e?.message ?? "Action échouée" });
                  } finally {
                    setCounterForm((s) => ({ ...s, submitting: false }));
                  }
                }}
                disabled={!!counterForm.submitting}
              >
                {counterForm.submitting ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
