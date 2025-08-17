"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

const QuoteSchema = z
  .object({
    title: z.string().min(3, "Titre trop court").max(120, "Titre trop long"),
    description: z
      .string()
      .min(10, "Description trop courte")
      .max(4000, "Description trop longue"),
    budgetMin: z
      .union([z.string().min(0), z.number()])
      .optional()
      .transform((v) => (typeof v === "string" && v.trim() === "" ? undefined : v)),
    budgetMax: z
      .union([z.string().min(0), z.number()])
      .optional()
      .transform((v) => (typeof v === "string" && v.trim() === "" ? undefined : v)),
    deadline: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() === "" ? undefined : v)),
  })
  .refine(
    (data) => {
      const min = typeof data.budgetMin === "string" ? Number(data.budgetMin) : data.budgetMin;
      const max = typeof data.budgetMax === "string" ? Number(data.budgetMax) : data.budgetMax;
      if (min != null && isNaN(min)) return false;
      if (max != null && isNaN(max)) return false;
      if (min != null && max != null) return max >= min;
      return true;
    },
    { path: ["budgetMax"], message: "Le budget maximum doit être ≥ au minimum" }
  );

export function RequestQuoteSheet({
  freelancerId,
  freelancerName,
  triggerClassName,
}: {
  freelancerId: string;
  freelancerName?: string | null;
  triggerClassName?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof QuoteSchema>>({
    resolver: zodResolver(QuoteSchema),
    defaultValues: {
      title: "",
      description: "",
      budgetMin: undefined,
      budgetMax: undefined,
      deadline: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof QuoteSchema>) => {
    const payload = {
      freelancerId,
      title: values.title,
      description: values.description,
      budgetMin:
        typeof values.budgetMin === "string" ? Number(values.budgetMin) : values.budgetMin,
      budgetMax:
        typeof values.budgetMax === "string" ? Number(values.budgetMax) : values.budgetMax,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
    };

    try {
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de l'envoi de la demande");
      }

      toast({
        title: "Demande envoyée",
        description: `Votre demande de devis a été envoyée à ${freelancerName ?? "ce freelance"}.`,
      });
      form.reset();
      setOpen(false);
    } catch (e: any) {
      toast({
        title: "Échec",
        description: e?.message ?? "Impossible d'envoyer la demande",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className={triggerClassName}>Demander un devis</Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Demander un devis</SheetTitle>
          <SheetDescription>
            Envoyez une demande détaillée à {freelancerName ?? "ce freelance"}.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Site vitrine pour restaurant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Décrivez votre besoin, fonctionnalités, contraintes, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Donnez un maximum de détails pour une estimation précise.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budgetMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget min (€)</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="decimal" placeholder="Optionnel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budgetMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget max (€)</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="decimal" placeholder="Optionnel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Échéance souhaitée</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Facultatif. Laissez vide si vous êtes flexible.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Envoi..." : "Envoyer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default RequestQuoteSheet;
