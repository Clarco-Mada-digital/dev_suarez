"use client"

import { useState } from "react"
import { Menu, X, Home, Briefcase, Users, DollarSign, User } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "./ui/button"

const navLinks = [
  { 
    href: "/", 
    label: "Accueil",
    icon: <Home className="h-4 w-4 mr-2" />
  },
  { 
    href: "/projects", 
    label: "Projets",
    icon: <Briefcase className="h-4 w-4 mr-2" />
  },
  { 
    href: "/freelancers", 
    label: "Freelancers",
    icon: <Users className="h-4 w-4 mr-2" />
  },
  { 
    href: "/pricing", 
    label: "Tarifs",
    icon: <DollarSign className="h-4 w-4 mr-2" />
  },
];

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { status } = useSession()

  return (
    <div className="relative md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent/50"
        aria-label="Menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-popover rounded-lg shadow-lg py-2 border">
          {/* Liens de navigation */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          
          {/* Séparateur */}
          <div className="border-t my-2" />
          
          {/* Liens d'authentification */}
          {status === 'unauthenticated' ? (
            <>
              <Link
                href="/sign-in"
                className="flex items-center px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 mr-2" />
                Connexion
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 mr-2" />
                Inscription
              </Link>
            </>
          ) : status === "authenticated" ? (
            <>
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Profil
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Déconnexion
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}