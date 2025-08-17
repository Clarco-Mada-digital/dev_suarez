"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const projectFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(50, "La description doit contenir au moins 50 caractères"),
  budget: z.union([z.number(), z.string()]).refine((v) => {
    const n = typeof v === "string" ? parseFloat(v) : v;
    return !isNaN(n) && n >= 0;
  }, { message: "Le budget doit être un nombre positif" }),
  deadline: z.string().min(1, "La date limite est requise"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  skills: z.string().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export type ProjectEditFormValues = z.infer<typeof projectFormSchema>;

type Category = { id: string; name: string };

interface ProjectEditFormProps {
  projectId: string;
  categories: Category[];
  initialValues: {
    title: string;
    description: string;
    budget: number;
    deadline: string; // yyyy-mm-dd
    categoryId: string;
    skills: string; // comma separated
    status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  };
}

export function ProjectEditForm({ projectId, categories, initialValues }: ProjectEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectEditFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: initialValues.title,
      description: initialValues.description,
      budget: initialValues.budget,
      deadline: initialValues.deadline,
      categoryId: initialValues.categoryId,
      skills: initialValues.skills,
      status: initialValues.status,
    },
    mode: "onBlur",
  });

  async function onSubmit(values: ProjectEditFormValues) {
    try {
      setIsSubmitting(true);

      const skillsArray = values.skills
        ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: values.title,
        description: values.description,
        budget: typeof values.budget === "string" ? parseFloat(values.budget) : values.budget,
        deadline: values.deadline,
        categoryId: values.categoryId,
        skills: skillsArray,
        status: values.status,
      };

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Échec de la mise à jour du projet");
      }

      toast.success("Projet mis à jour avec succès");
      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error("[ProjectEditForm] Update error", err);
      toast.error("Erreur lors de la mise à jour du projet");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du projet</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Développement d'une application web" {...field} />
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
              <FormLabel>Description détaillée</FormLabel>
              <FormControl>
                <Textarea rows={8} placeholder="Décrivez en détail votre projet..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 1500"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date limite</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut du projet</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="OPEN">Ouvert</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compétences (séparées par des virgules)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: React, Node.js, Design UI/UX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push(`/projects/${projectId}`)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
