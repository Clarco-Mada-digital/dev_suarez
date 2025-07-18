'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, Lock, User, Briefcase, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Category {
  id: string;
  name: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  confirmPassword: z.string(),
  role: z.enum(["CLIENT", "FREELANCER"], { message: "Veuillez sélectionner un rôle." }),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  skills: z.string().optional(), // Pour les compétences du freelance
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  if (data.role === "FREELANCER") {
    if (!data.jobTitle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le titre du poste est requis pour les freelances.",
        path: ["jobTitle"],
      });
    }
    if (!data.skills) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez spécifier vos compétences (ex: React, Design UX).",
        path: ["skills"],
      });
    }
  }
  if (data.role === "CLIENT" && !data.company) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le nom de l'entreprise est requis pour les clients.",
      path: ["company"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      jobTitle: '',
      company: '',
      skills: '',
    },
  });

  const selectedRole = form.watch('role');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories/list');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setError('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
          jobTitle: data.jobTitle,
          company: data.company,
          skills: data.skills,
        }),
      });

      if (response.ok) {
        toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        router.push('/sign-in');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Une erreur est survenue lors de l\'inscription.');
        toast.error(errorData.message || 'Une erreur est survenue lors de l\'inscription.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>Inscrivez-vous pour commencer votre aventure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  {...form.register('name')}
                  className="pl-10"
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  {...form.register('email')}
                  className="pl-10"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...form.register('password')}
                  className="pl-10"
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  {...form.register('confirmPassword')}
                  className="pl-10"
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vous êtes ?</Label>
              <Select onValueChange={(value) => form.setValue('role', value as "CLIENT" | "FREELANCER")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="FREELANCER">Freelance</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
              )}
            </div>

            {selectedRole === "FREELANCER" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Titre du poste</Label>
                  <Select onValueChange={(value) => form.setValue('jobTitle', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.jobTitle && (
                    <p className="text-sm text-red-500">{form.formState.errors.jobTitle.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Vos compétences (séparées par des virgules)</Label>
                  <Textarea
                    id="skills"
                    placeholder="Ex: React, Node.js, Design UX/UI, Marketing Digital"
                    {...form.register('skills')}
                    rows={3}
                  />
                  {form.formState.errors.skills && (
                    <p className="text-sm text-red-500">{form.formState.errors.skills.message}</p>
                  )}
                </div>
              </>
            )}

            {selectedRole === "CLIENT" && (
              <div className="space-y-2">
                <Label htmlFor="company">Nom de l'entreprise</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Ex: Ma Super Entreprise"
                    {...form.register('company')}
                    className="pl-10"
                  />
                </div>
                {form.formState.errors.company && (
                  <p className="text-sm text-red-500">{form.formState.errors.company.message}</p>
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full">
              S'inscrire
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}