'use client';

import { Check, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const features = [
  { name: 'Projets actifs simultanés', free: '2', premium: 'Illimités' },
  { name: 'Propositions mensuelles', free: '5', premium: 'Illimitées' },
  { name: 'Profil vérifié', free: false, premium: true },
  { name: 'Support prioritaire', free: false, premium: true },
  { name: 'Mise en avant des propositions', free: false, premium: true },
  { name: 'Statistiques avancées', free: false, premium: true },
  { name: 'Accès aux projets premium', free: false, premium: true },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleUpgrade = () => {
    if (!session) {
      router.push('/auth/signin');
    } else {
      // Rediriger vers la page de paiement
      // router.push('/checkout');
      alert('Fonctionnalité de paiement à venir !');
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 sm:py-20">
      <div className="container px-4 mx-auto">
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Choisissez la formule qui vous convient
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Démarrez gratuitement et passez à la vitesse supérieure quand vous êtes prêt.
            Annulez à tout moment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Formule gratuite */}
          <div className="flex flex-col p-8 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">Gratuit</h2>
              <p className="mt-4 text-muted-foreground">
                Parfait pour commencer à explorer la plateforme
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">0€</span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">/mois</span>
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-foreground">
                {features.map((feature) => (
                  <li key={feature.name} className="flex gap-x-3">
                    {feature.free === true ? (
                      <CheckCircle className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                    ) : feature.free ? (
                      <span className="font-medium">{feature.free}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    <span className={!feature.free ? 'text-muted-foreground' : ''}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Button className="mt-8" variant="outline">
              {session ? 'Votre forfait actuel' : 'Commencer gratuitement'}
            </Button>
          </div>

          {/* Formule premium */}
          <div className="flex flex-col p-8 rounded-2xl bg-primary/5 border border-primary/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-red-500 text-xs font-semibold px-3 py-1 rounded-bl-lg">
              Populaire
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">Premium</h2>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-xs font-medium">RECOMMANDÉ</span>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">
                Pour les professionnels sérieux qui veulent maximiser leurs opportunités
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">29€</span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">/mois</span>
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-foreground">
                {features.map((feature) => (
                  <li key={feature.name} className="flex gap-x-3">
                    {feature.premium === true ? (
                      <CheckCircle className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                    ) : feature.premium ? (
                      <span className="font-medium">{feature.premium}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button 
              className="mt-8 bg-primary hover:bg-primary/90"
              onClick={handleUpgrade}
            >
              {session ? 'Passer à Premium' : 'Essayer Premium'}
            </Button>
          </div>
        </div>

        {/* Section FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                question: 'Puis-je changer de formule à tout moment ?',
                answer: 'Oui, vous pouvez passer de la formule gratuite à la formule premium à tout moment. Le changement sera effectif immédiatement.'
              },
              {
                question: 'Y a-t-il un engagement ?',
                answer: 'Non, vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires.'
              },
              {
                question: 'Quels modes de paiement acceptez-vous ?',
                answer: 'Nous acceptons les cartes de crédit/débit (Visa, MasterCard, American Express) et PayPal.'
              },
              {
                question: 'Puis-je obtenir un remboursement ?',
                answer: 'Oui, nous offrons un remboursement intégral dans les 14 jours suivant votre achat si vous n\'êtes pas satisfait.'
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-border pb-4">
                <h3 className="font-medium text-foreground">{faq.question}</h3>
                <p className="mt-1 text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
