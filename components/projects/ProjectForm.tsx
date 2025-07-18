'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';

const projectFormSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  budget: z.number().min(1, 'Le budget est requis').positive('Le budget doit être positif'),
  deadline: z.string().min(1, 'La date limite est requise'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  skills: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface Category {
  id: string;
  name: string;
}

interface ProjectFormProps {
  categories: Category[];
}

export function ProjectForm({ categories }: ProjectFormProps) {
  const router = useRouter();
  const { user, loading: userLoading, isAuthenticated } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: 0,
      deadline: '',
      categoryId: '',
      skills: '',
    },
  });

  async function onSubmit(values: ProjectFormValues) {
    if (!isAuthenticated || user?.role !== 'CLIENT') {
      toast.error('Vous devez être connecté en tant que client pour publier un projet.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const skillsArray = values.skills
        ? values.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          skills: skillsArray,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Une erreur est survenue lors de la création du projet: ' + errorText);
      }

      const data = await response.json();
      
      toast.success('Projet créé avec succès', {
        description: 'Votre projet a été publié et est maintenant visible par les freelances.',
      });

      router.push(`/projects/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (userLoading) {
    return <div className="container mx-auto px-4 py-8">Chargement du profil...</div>;
  }

  if (!isAuthenticated || user?.role !== 'CLIENT') {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>Vous devez être connecté en tant que client pour publier un projet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Publier un nouveau projet</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Textarea
                      placeholder="Décrivez en détail votre projet, vos attentes, les fonctionnalités souhaitées..."
                      rows={8}
                      {...field}
                    />
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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    <FormLabel>Date limite de soumission</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        {...field}
                      />
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
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compétences requises (séparées par des virgules)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: React, Node.js, Design UI/UX"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/projects')}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Publication en cours...' : 'Publier le projet'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
