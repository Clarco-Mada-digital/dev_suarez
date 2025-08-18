"use client";

import CardUser from "@/components/CardUser";
import CategorieCard from "@/components/CategorieCard";
import Presentation from "@/components/Presentation";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, ArrowRightCircle, CupSodaIcon, GoalIcon, MedalIcon, NotebookPen, SendIcon, StarIcon, WorkflowIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UserProfile } from "@/services/userService";

export default function Home() {
  const listCatRef = useRef<HTMLDivElement>(null);
  const [freelancers, setFreelancers] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ScrollRightHandler = (type: 'cat' | 'user', direction: 'left' | 'right') => {
    if (type === "cat") {
      if (listCatRef.current) {
        listCatRef.current.scrollBy({
          left: direction === "left" ? 200 : -200,
          behavior: 'smooth'
        });
      }
    }
  };

  const fetchFreelancers = async (pageNum: number) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const response = await fetch(`/api/users/top-freelancers?page=${pageNum}&limit=8`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des freelancers');
      }
      const data = await response.json();
      
      setFreelancers(prev => pageNum === 1 ? data.freelancers : [...prev, ...data.freelancers]);
      setHasMore(data.freelancers.length > 0 && (pageNum * data.limit) < data.total);

    } catch (err) {
      console.error('Error fetching freelancers:', err);
      setError('Impossible de charger les freelancers. Veuillez réessayer plus tard.');
    } finally {
      if (pageNum === 1) setIsLoading(false);
      else setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchFreelancers(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFreelancers(nextPage);
  };

  return (
    <section>
      <Presentation />      

      {/* ... (Slide des categories - pas de changement ici) */}
      <div className="-mt-14 flex justify-center relative">
        <ArrowLeftCircle className="absolute left-[5%] top-10 cursor-pointer bg-gray-50 text-blue-400 rounded-full h-8 w-8" onClick={() => { ScrollRightHandler('cat', 'right') }} />
        <div className="flex gap-3 max-w-[75%] items-center overflow-x-auto scrollbar-hide xl:justify-center text-center" ref={listCatRef}>
          <CategorieCard catImg="/dev-icon.png" catName="Site & Développement" link="/categories/1" />
          <CategorieCard catImg="/man.png" catName="Community" link="/categories/2" />
          <CategorieCard catImg="/designe.png" catName="Design & Graphisme" link="/categories/3" />
          <CategorieCard catImg="/seo.png" catName="SEO & Communication" link="/categories/4" />
          <CategorieCard catImg="/reseau.png" catName="Réseaux sociaux" link="/categories/5" />
          <CategorieCard catImg="/redacteur.png" catName="Rédaction" link="/categories/6" />
          <CategorieCard catImg="/audioVisuel.png" catName="AudioVisuel" link="/categories/7" />
          <CategorieCard catImg="/formation.png" catName="Formation & Coaching" link="/categories/8" />
        </div>
        <ArrowRightCircle className="absolute right-[5%] top-10 cursor-pointer bg-gray-50 text-blue-400 rounded-full h-8 w-8" onClick={() => { ScrollRightHandler('cat', 'left') }} />
      </div>

      {/* ... (Presentation des services - pas de changement ici) */}
      <div className="flex items-center gap-8 mt-20 mx-10 xl:mx-40">
        <div className="flex items-center justify-center w-[75%] h-auto rounded-md">
          <Image src={"/code-image-presentation.png"} alt="image code presentation" width={400} height={400} />
        </div>
        <div className="flex flex-col gap-3">
          <section className="flex items-center gap-4 border border-blue-200 p-5 rounded-md">
            <NotebookPen color="#5B9CEE" width={30} height={30} className="w-16" />
            <div className="flex flex-col flex-1">
              <h2 className="capitalize text-blue-400 text-xl">Réaliste</h2>
              <p className="text-xs">Transformez vos idées numérique en réalité collective</p>
            </div>
          </section>
          <section className="translate-x-6 flex items-center gap-4 border border-blue-200 p-5 rounded-md">
            <SendIcon color="#5B9CEE" width={30} height={30} className="w-16" />
            <div className="flex flex-col flex-1">
              <h2 className="capitalize text-blue-400 text-xl">Rapide</h2>
              <p className="text-xs">Unissez vos visions avec nos freelances experts.</p>
            </div>
          </section>
          <section className="flex items-center gap-4 border border-blue-200 p-5 rounded-md">
            <WorkflowIcon color="#5B9CEE" width={30} height={30} className="w-16" />
            <div className="flex flex-col flex-1">
              <h2 className="capitalize text-blue-400 text-xl">Parfaite</h2>
              <p className="text-xs">Du projet à la perfection numérique.</p>
            </div>
          </section>
        </div>
      </div>

      {/* ... (Section call to action - pas de changement ici) */}
      <div className="mx-10 border border-dashed p-5 border-blue-200 rounded-lg mt-10 flex flex-col items-center justify-center gap-4 xl:mx-40">
        <Image src={"/contact.png"} alt="contact icon" width={100} height={100} />
        <div className="text-xl text-center text-blue-400 uppercase">Plus de 200 freelence pour réaliser votre reve numerique.</div>
        <span className="text-muted-foreground text-sm">
          Contactez nous des maintenant pour recevoir des devis pour votre projets.
        </span>
        <Link href="/contact" className='w-36 m-auto'>
          <Button variant="gradient">Demander des devies</Button>
        </Link>
      </div>

      {/* Section Demande de devis par IA */}
      <section className="py-16 bg-gradient-to-b from-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-card rounded-2xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Un projet en tête ?
                  <span className="block text-primary mt-2">Obtenez un devis en 2 minutes</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Notre assistant IA vous aide à définir votre projet et vous met en relation avec les meilleurs freelancers.
                  Simple, rapide et sans engagement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link href="/assistant">
                      <NotebookPen className="mr-2 h-4 w-4" />
                      Demander un devis
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/pricing">
                      Voir nos tarifs
                    </Link>
                  </Button>
                </div>
                <div className="mt-6 flex items-center text-sm text-muted-foreground">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        {i}
                      </div>
                    ))}
                  </div>
                  <span>Étapes rapides et faciles</span>
                </div>
              </div>
              <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 relative">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-center opacity-10"></div>
                <div className="relative h-full flex items-center justify-center p-8">
                  <div className="bg-white dark:bg-card p-6 rounded-xl shadow-lg max-w-xs">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                        <NotebookPen className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Assistant IA</h4>
                        <p className="text-xs text-muted-foreground">En ligne</p>
                      </div>
                    </div>
                    <p className="text-sm mb-4">
                      Bonjour ! Je peux vous aider à définir votre projet et à trouver le bon freelance. Par où commençons-nous ?
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        Site web
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        Application
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        Design
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section top 50 de leur domaine */}
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-blue-400">Nos freelence</span>
          <h2 className="text-muted-foreground">Les meilleurs experts dans leur domaine</h2>
        </div>
        <div className="relative w-full mt-8">
          {isLoading ? (
            <div className="flex items-center justify-center w-full py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10">{error}</div>
          ) : freelancers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {freelancers.map((freelancer) => (
                  <CardUser 
                    key={freelancer.id}
                    id={freelancer.id}
                    name={freelancer.name}
                    jobTitle={freelancer.jobTitle || 'Freelance'}
                    skills={freelancer.skills || []}
                    avatarUrl={freelancer.image || '/placeholder-user.png'}
                    availability={freelancer.availability || false}
                    rating={freelancer.rating || 0}
                    ratingCount={freelancer.ratingCount || 0}
                    hourlyRate={freelancer.hourlyRate || 0}
                    location={freelancer.location || 'Non spécifié'}
                    completedProjects={freelancer.completedProjectsCount || 0}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 text-center">
                  <Button onClick={handleLoadMore} disabled={isFetchingMore} variant="outline">
                    {isFetchingMore ? 'Chargement...' : 'Voir plus de freelances'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-center py-10">Aucun freelance disponible pour le moment.</div>
          )}
        </div>
      </div>
    </section>
  );
}
