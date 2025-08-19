"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Briefcase, Home, Users, DollarSign, Shield, FileText, Info, Mail } from 'lucide-react';
import MyUserButton from "@/components/MyUserButton";
import { SimpleNotificationBell } from "@/components/notifications/SimpleNotificationBell";

export default function MainNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

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
    { 
      href: "/contact", 
      label: "Contact",
      icon: <Mail className="h-4 w-4 mr-2" />
    },
  ];

  return (
    <nav className="flex-1 flex items-center justify-center px-4">
      <div className="hidden md:flex items-center space-x-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === link.href
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground'
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith('/admin')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground'
            }`}
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin
          </Link>
        )}
        
      </div>

      <div className="flex-1 flex items-center justify-end space-x-4">
        {status === 'authenticated' ? (
          <>
            <Link 
              href="/quotes" 
              className="hidden md:flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-foreground/70 hover:bg-accent/50 hover:text-foreground"
            >
              <FileText className="h-4 w-4 mr-2" />
              Mes devis
            </Link>
            <Link 
              href="/profile" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Mon profil
            </Link>
            <MyUserButton />
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Connexion
            </Link>
            <Button asChild variant="default" size="sm">
              <Link href="/sign-up">
                S'inscrire
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
