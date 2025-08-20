"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Briefcase, Home, Users, DollarSign, Mail, Info } from 'lucide-react';
import MyUserButton from "@/components/MyUserButton";
import { SimpleNotificationBell } from "@/components/notifications/SimpleNotificationBell";
import { NotificationBell } from "../notifications/NotificationBell";

export default function MainNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

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
    { 
      href: "/about", 
      label: "À propos",
      icon: <Info className="h-4 w-4 mr-2" />
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
        
      </div>

      <div className="flex-1 flex items-center justify-end">
        {status === 'authenticated' ? (
          <div className="flex items-center space-x-2">
            <SimpleNotificationBell />
            {/* <NotificationBell /> */}
            <MyUserButton />
          </div>
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
