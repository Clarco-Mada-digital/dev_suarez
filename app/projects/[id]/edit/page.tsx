'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const projectFormSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  budget: z.number().min(1, 'Le budget est requis').positive('Le budget doit être positif'),
  deadline: z.string().min(1, 'La date limite est requise'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  skills: z.string().optional(),
});

export default function ProjectEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: 0,
      deadline: '',
      categoryId: '',
      skills: ''
    },
  });

  const session = auth.getSession();

  if (!session?.id) {
    router.push('/sign-in');
    return null;
  }

  useEffect(() => {
    // Récupérer les catégories et compétences
    Promise.all([
      prisma.projectCategory.findMany(),
      prisma.skill.findMany()
    ]).then(([categoriesData, skillsData]) => {
      setCategories(categoriesData);
      setSkills(skillsData);
    });

    // Récupérer le projet
    prisma.project.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        skills: true
      }
    }).then(projectData => {
      if (!projectData) {
        router.push('/projects');
        return;
      }

      if (projectData.clientId !== session.id) {
        router.push('/projects');
        return;
      }

      setProject(projectData);
      form.setValue('title', projectData.title);
      form.setValue('description', projectData.description);
      form.setValue('budget', projectData.budget);
      form.setValue('deadline', projectData.deadline);
      form.setValue('categoryId', projectData.categoryId);
      setSelectedSkills(projectData.skills.map(skill => skill.id));
    });
  }, [params.id, session.id, form, router]);

  const onSubmit = async (data: z.infer<typeof projectFormSchema>) => {
    if (!project) return;

    try {
      setLoading(true);
      
      // Mettre à jour le projet
      await prisma.project.update({
        where: { id: project.id },
        data: {
          title: data.title,
          description: data.description,
          budget: data.budget,
          deadline: data.deadline,
          categoryId: data.categoryId,
          skills: {
            set: [], // Désassigner toutes les compétences existantes
            connect: selectedSkills.map(skillId => ({ id: skillId }))
          }
        }
      });

      toast({
        title: 'Succès',
        description: 'Le projet a été mis à jour avec succès'
      });

      router.push('/projects');
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du projet'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return <div className="container mx-auto px-4 py-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez en détail votre projet..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1000"
                      step="1"
                      min="0"
                      {...field}
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
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                  <FormLabel>Compétences requises</FormLabel>
                  <div className="space-y-2">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSkills([...selectedSkills, skill.id]);
                            } else {
                              setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{skill.name}</span>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
