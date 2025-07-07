'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

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

interface ProjectData extends ProjectFormValues {
  id: string;
  skills: string[];
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { userId } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [project, setProject] = useState<ProjectData | null>(null);

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

  useEffect(() => {
    if (!userId) {
      router.push('/sign-in');
      return;
    }

    const fetchData = async () => {
      try {
        // Récupérer les catégories
        const categoriesRes = await fetch('/api/projects/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        // Récupérer les détails du projet
        const projectRes = await fetch(`/api/projects/${params.id}`);
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProject(projectData);
          
          // Mettre à jour le formulaire avec les données du projet
          form.reset({
            title: projectData.title,
            description: projectData.description,
            budget: projectData.budget,
            deadline: new Date(projectData.deadline).toISOString().split('T')[0],
            categoryId: projectData.categoryId,
            skills: projectData.skills?.map((s: any) => s.name).join(', ') || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors du chargement des données',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, router, params.id, form, toast]);

  async function onSubmit(values: ProjectFormValues) {
    if (!userId || !project) return;

    try {
      setIsSubmitting(true);
      
      const skillsArray = values.skills
        ? values.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];

      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
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
        throw new Error(errorText || 'Une erreur est survenue lors de la mise à jour du projet');
      }
      
      toast({
        title: 'Projet mis à jour',
        description: 'Votre projet a été mis à jour avec succès',
      });

      // Rediriger vers la page du projet
      router.push(`/projects/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Chargement...</div>;
  }

  if (!project) {
    return <div className="container mx-auto px-4 py-8">Projet non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Modifier le projet</h1>
        
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
                onClick={() => router.push(`/projects/${params.id}`)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
