"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import MyUserButton from "./MyUserButton"
import { Briefcase } from 'lucide-react';

const Nav = () => {
  const { user } = useUser();

  return (
    <nav className="flex gap-8 flex-col justify-center items-center xl:flex-row">
      {/* Lien vers les projets */}
      <Link 
        href="/projects" 
        className="flex items-center gap-2 font-medium hover:text-blue-500 transition-all"
      >
        <Briefcase className="h-5 w-5" />
        Projets
      </Link>

      {/* Quand l'utilisateur n'est pas authentifié */}
      <SignedOut>
        <SignInButton mode='modal' >
          <Link href="/sign-in" className={"capitalize font-medium hover:text-blue-500 transition-all"}> se connecter </Link>
        </SignInButton>
        <SignUpButton mode="modal" >
          <Link href="/sign-in" className={"capitalize font-medium hover:text-blue-500 transition-all"}> S'inscrire gratuitement </Link>
        </SignUpButton>
      </SignedOut>

      {/* Quand l'utilisateur est authentifié */}
      <SignedIn>
        <span className="text-foreground">{user?.fullName}</span>
        <MyUserButton />
      </SignedIn>
    </nav>
  )
}

export default Nav