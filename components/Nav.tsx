"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import MyUserButton from "./MyUserButton";
import { Button } from "./ui/button";
import { Briefcase } from 'lucide-react';

const Nav = () => {
  const { status } = useSession();

  return (
    <nav className="flex gap-8 flex-col justify-center items-center xl:flex-row">
      <Link 
        href="/projects" 
        className="flex items-center gap-2 font-medium hover:text-blue-500 transition-all"
      >
        <Briefcase className="h-5 w-5" />
        Projets
      </Link>

      {status === "unauthenticated" ? (
        <>
          <Link href="/sign-in" className="capitalize font-medium hover:text-blue-500 transition-all">
            Se connecter
          </Link>
          <Link href="/sign-up" className="capitalize font-medium hover:text-blue-500 transition-all">
            S'inscrire gratuitement
          </Link>
        </>
      ) : status === "authenticated" ? (
        <>
          <Link href="/profile" className="capitalize font-medium hover:text-blue-500 transition-all">
            Profil
          </Link>
          <MyUserButton />
        </>
      ) : null}
    </nav>
  );
};

export default Nav;
