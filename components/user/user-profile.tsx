'use client';

import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save, User, Mail, Shield, MapPin, Link as LinkIcon, Briefcase, Phone, Star, DollarSign, CalendarCheck, Globe, Award } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import React, { useEffect, useState } from 'react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide.' }),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url({ message: 'Veuillez entrer une URL valide.' }).optional().or(z.literal('')),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  phoneNumber: z.string().optional(),
  skills: z.string().optional(),
  languages: z.string().optional(), // Nouveau champ
  awards: z.string().optional(), // Nouveau champ
  availability: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  hourlyRate: z.number().min(0).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function UserProfile() {
  const { user, loading, error, isAuthenticated, mutate } = useUser();
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.image) {
      setCurrentImage(user.image);
    }
  }, [user?.image]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      location: '',
      website: '',
      jobTitle: '',
      company: '',
      phoneNumber: '',
      skills: '',
      languages: '',
      awards: '',
      availability: false,
      rating: 0,
      hourlyRate: 0,
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        website: user.profile?.website || '',
        jobTitle: user.profile?.jobTitle || '',
        company: user.profile?.company || '',
        phoneNumber: user.profile?.phoneNumber || '',
        skills: user.profile?.skills || '',
        languages: user.profile?.languages || '',
        awards: user.profile?.awards || '',
        availability: user.profile?.availability || false,
        rating: user.profile?.rating || 0,
        hourlyRate: user.profile?.hourlyRate || 0,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      if (!user?.id) {
        throw new Error('Utilisateur non identifié');
      }
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          image: currentImage,
          profile: {
            bio: data.bio,
            location: data.location,
            website: data.website,
            jobTitle: data.jobTitle,
            company: data.company,
            phoneNumber: data.phoneNumber,
            skills: data.skills,
            languages: data.languages,
            awards: data.awards,
            availability: data.availability,
            rating: data.rating,
            hourlyRate: data.hourlyRate,
          },
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Échec de la mise à jour du profil');
      }

      // Mettre à jour les données utilisateur avec la réponse de l'API
      if (responseData.user) {
        // Mettre à jour le contexte utilisateur ou recharger les données
        // Cela dépend de la façon dont useUser est implémenté
        // Pour l'instant, on se contente d'afficher un message de succès
        toast.success(responseData.message || 'Profil mis à jour avec succès');
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour du profil');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        <p>Erreur lors du chargement du profil: {error.message}</p>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="text-center">
        <p>Veuillez vous connecter pour voir votre profil</p>
      </div>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="pb-2">
        <div className="flex flex-col items-center space-y-4">
<ImageUpload
            value={currentImage || ''}
            onChange={async (url) => {
              if (url) {
                try {
                  // Mettre à jour l'état local immédiatement pour un retour visuel instantané
                  setCurrentImage(url);
                  
                  // Mettre à jour le serveur
                  const response = await fetch(`/api/users/${user.id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: url }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Échec de la mise à jour de l\'image');
                  }

                  // Mettre à jour les données utilisateur
                  await mutate();
                  toast.success('Photo de profil mise à jour avec succès');
                } catch (error) {
                  console.error('Error updating profile image:', error);
                  // Revenir à l'ancienne image en cas d'erreur
                  setCurrentImage(user.image || null);
                  toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la photo de profil');
                }
              } else {
                // Gérer la suppression de l'image
                try {
                  setCurrentImage(null);
                  const response = await fetch(`/api/users/${user.id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: null }),
                  });

                  if (!response.ok) {
                    throw new Error('Échec de la suppression de la photo de profil');
                  }

                  await mutate();
                  toast.success('Photo de profil supprimée avec succès');
                } catch (error) {
                  console.error('Error removing profile image:', error);
                  setCurrentImage(user.image || null);
                  toast.error('Erreur lors de la suppression de la photo de profil');
                }
              }
            }}
          />
          <div className="text-center">
            <CardTitle className="text-2xl">{user.name || 'Utilisateur'}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Section Informations Générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-10"
                  placeholder="Votre nom"
                  {...form.register('name')}
                  disabled={form.formState.isSubmitting}
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
                  className="pl-10"
                  placeholder="votre@email.com"
                  {...form.register('email')}
                  disabled={true} // L'email ne doit pas être modifiable ici
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  className="pl-10"
                  placeholder="Ville, Pays"
                  {...form.register('location')}
                  disabled={form.formState.isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site Web</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="website"
                  className="pl-10"
                  placeholder="https://votre-site.com"
                  {...form.register('website')}
                  disabled={form.formState.isSubmitting}
                />
              </div>
              {form.formState.errors.website && (
                <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Biographie</Label>
              <Textarea
                id="bio"
                placeholder="Parlez-nous de vous..."
                {...form.register('bio')}
                disabled={form.formState.isSubmitting}
                rows={4}
              />
            </div>
          </div>

          {/* Section Rôle et Informations Spécifiques */}
          <div className="space-y-2">
            <Label>Rôle</Label>
            <div className="flex items-center space-x-2 rounded-md border p-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{user.role?.toLowerCase() || 'Utilisateur'}</span>
            </div>
          </div>

          {user.role === 'FREELANCER' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Titre du poste</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="jobTitle"
                    className="pl-10"
                    placeholder="Développeur Web, Designer UX/UI..."
                    {...form.register('jobTitle')}
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Entreprise (si applicable)</Label>
                <Input
                  id="company"
                  placeholder="Nom de l'entreprise"
                  {...form.register('company')}
                  disabled={form.formState.isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    className="pl-10"
                    placeholder="Ex: +33 6 12 34 56 78"
                    {...form.register('phoneNumber')}
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Taux horaire (€)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    className="pl-10"
                    placeholder="Ex: 50.00"
                    {...form.register('hourlyRate', { valueAsNumber: true })}
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
                <Textarea
                  id="skills"
                  placeholder="Ex: React, Node.js, Design UX/UI, Marketing Digital"
                  {...form.register('skills')}
                  disabled={form.formState.isSubmitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="languages">Langues (séparées par des virgules)</Label>
                <Textarea
                  id="languages"
                  placeholder="Ex: Français, Anglais, Espagnol"
                  {...form.register('languages')}
                  disabled={form.formState.isSubmitting}
                  rows={2}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="awards">Récompenses (séparées par des virgules)</Label>
                <Textarea
                  id="awards"
                  placeholder="Ex: Meilleur Développeur 2023, Prix de l'Innovation"
                  {...form.register('awards')}
                  disabled={form.formState.isSubmitting}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2 md:col-span-2">
                <Switch
                  id="availability"
                  checked={form.watch('availability')}
                  onCheckedChange={(checked) => form.setValue('availability', checked)}
                  disabled={form.formState.isSubmitting}
                />
                <Label htmlFor="availability">Disponible pour de nouveaux projets</Label>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={!form.formState.isDirty || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
