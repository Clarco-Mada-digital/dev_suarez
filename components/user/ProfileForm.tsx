'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/auth';

export interface UserProfileData {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  website?: string;
  jobTitle?: string;
  company?: string;
}

export function ProfileForm() {
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    location: '',
    website: '',
    jobTitle: '',
    company: ''
  });
  
  // Fonction pour charger les données du profil
  const loadProfile = async () => {
    if (!email) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur du serveur:', errorData);
        throw new Error(errorData.error || 'Erreur lors du chargement du profil');
      }
      
      const profile = await response.json();
      
      if (profile) {
        // Extraire le prénom et le nom du nom complet
        const nameParts = profile.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setFormData({
          ...profile,
          firstName,
          lastName,
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          bio: profile.bio || '',
          location: profile.location || '',
          website: profile.website || '',
          jobTitle: profile.jobTitle || '',
          company: profile.company || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations du profil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données du profil
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Aucun utilisateur connecté',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mettre à jour le profil via l'API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Reconstruire le nom complet à partir du prénom et du nom
          name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          jobTitle: formData.jobTitle,
          company: formData.company
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur du serveur:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil');
      }
      
      const updatedProfile = await response.json();
      
      toast({
        title: 'Succès',
        description: 'Votre profil a été mis à jour avec succès',
      });
      
      // Recharger les données du profil
      await loadProfile();
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour du profil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Profil public</h2>
        <p className="text-sm text-muted-foreground">
          Ces informations seront visibles par les autres utilisateurs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Poste</Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle || ''}
            onChange={handleChange}
            placeholder="Développeur Full Stack"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Entreprise</Label>
          <Input
            id="company"
            name="company"
            value={formData.company || ''}
            onChange={handleChange}
            placeholder="Nom de l'entreprise"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bio">Biographie</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            rows={4}
            placeholder="Parlez-nous un peu de vous..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Informations de contact</h3>
          <p className="text-sm text-muted-foreground">
            Ces informations ne sont visibles que par vous.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Pour modifier votre email, veuillez contacter le support.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Téléphone</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              placeholder="Ville, Pays"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website || ''}
              onChange={handleChange}
              placeholder="https://votresite.com"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
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
  );
}
