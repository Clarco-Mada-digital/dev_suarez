"use client";

import Link from "next/link";
import { auth } from "@/auth";
import MyUserButton from "./MyUserButton";
import { Briefcase } from 'lucide-react';

const Nav = () => {
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

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

      {/* When not authenticated */}
      {!email ? (
        <>
          <Link href="/sign-in" className="capitalize font-medium hover:text-blue-500 transition-all">
            se connecter
          </Link>
          <Link href="/sign-up" className="capitalize font-medium hover:text-blue-500 transition-all">
            S'inscrire gratuitement
          </Link>
        </>
      ) : (
        <>
          <MyUserButton />
        </>
      )}
    </nav>
  );
};

export default Nav;