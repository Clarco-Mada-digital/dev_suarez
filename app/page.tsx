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
  const listCatRef = useRef<HTMLDivElement>(null)
  const listUserRef = useRef<HTMLDivElement>(null)
  const [freelancers, setFreelancers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ScrollRightHandler = (type: 'cat' | 'user', direction: 'left' | 'right') => {
    if (type === "cat") {
      if (listCatRef.current) {
        listCatRef.current.scrollBy({
          left: direction === "left" ? 200 : -200,
          behavior: 'smooth'
        })
      }
    }
    else {
      if (listUserRef.current) {
        listUserRef.current.scrollBy({
          left: direction === "left" ? 200 : -200,
          behavior: 'smooth'
        })
      }
    }
  }

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/users/top-freelancers')
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des freelancers')
        }
        const data = await response.json()
        setFreelancers(data)
      } catch (err) {
        console.error('Error fetching freelancers:', err)
        setError('Impossible de charger les freelancers. Veuillez réessayer plus tard.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFreelancers()
  }, [])

  return (
    <section>
      <Presentation />

      {/* Slide des categories */}
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

      {/* Presentation des services */}
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

      {/* Section call to action */}
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

      {/* Section top 50 de leur domaine */}
      <div className="mx-10 mt-10 flex flex-col items-center justify-center xl:mx-40">
        <span className="text-xs text-blue-400">Nos freelence</span>
        <h2 className="text-muted-foreground">Les meilleurs experts dans leur domaine</h2>
        <div className="relative w-full flex justify-center items-center">
          <ArrowLeftCircle 
            className="absolute left-0 top-[50%] cursor-pointer bg-gray-50 text-blue-400 rounded-full h-8 w-8 z-10" 
            onClick={() => ScrollRightHandler('user', 'right')} 
          />
          
          {isLoading ? (
            <div className="flex items-center justify-center w-full py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10">{error}</div>
          ) : freelancers.length > 0 ? (
            <div className="flex items-center gap-8 mx-10 overflow-x-auto scrollbar-hide" ref={listUserRef}>
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
                  hourlyRate={freelancer.hourlyRate || 0}
                  location={freelancer.location || 'Non spécifié'}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-10">Aucun freelance disponible pour le moment.</div>
          )}
          
          <ArrowRightCircle 
            className="absolute right-0 top-[50%] cursor-pointer bg-gray-50 text-blue-400 rounded-full h-8 w-8 z-10" 
            onClick={() => ScrollRightHandler('user', 'left')} 
          />
        </div>
      </div>
    </section>
  );
}
