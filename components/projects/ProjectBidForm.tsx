'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const bidFormSchema = z.object({
  amount: z.number().min(1, 'Le montant est requis').positive('Le montant doit être positif'),
  proposal: z.string().min(20, 'Votre proposition doit contenir au moins 20 caractères'),
});

type BidFormValues = z.infer<typeof bidFormSchema>;

interface ProjectBidFormProps {
  projectId: string;
}

export function ProjectBidForm({ projectId }: ProjectBidFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      amount: 0,
      proposal: '',
    },
  });

  async function onSubmit(values: BidFormValues) {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/projects/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          amount: values.amount,
          proposal: values.proposal,
        }),
      });

      if (!response.ok) {
        throw new Error('Une erreur est survenue lors de la soumission de votre offre');
      }

      toast({
        title: 'Offre soumise avec succès',
        description: 'Votre offre a été envoyée au client.',
      });

      // Refresh the page to show the updated UI
      router.refresh();
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre offre (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Montant de votre offre"
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
          name="proposal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre proposition</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez votre approche, votre expérience et pourquoi vous êtes le meilleur choix pour ce projet..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Envoi en cours...' : 'Soumettre mon offre'}
        </Button>
      </form>
    </Form>
  );
}
