"use client";

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import ThemeToggle from './theme/ThemeToggle';
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Logo from './Logo';
import MyUserButton from './MyUserButton';


const MobileNav = () => {
  const pathName = usePathname();
  const {user} = useUser();

  // console.log(user);

  return (
    <div className="flex items-center gap-3">

      {/* Quand l'utilisateur n'est pas authentifier */}
      <SignedOut >
        <SignInButton mode='modal' >
          <Button className='bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-md px-1 py-1 text-accent-foreground hover:scale-95 hover:text-white transition-all'> <span className='block bg-background rounded-md px-5 py-2 hover:bg-background/70'>Connexion</span> </Button>
        </SignInButton>
        <SignUpButton mode='modal' >
          <Button variant={'gradient'}>Inscription</Button>
        </SignUpButton>
      </SignedOut>

      {/* Quand l'utilisateur est authentifier */}
      <SignedIn >
        <div className="flex items-center gap-6">
          <span className="text-foreground">{user?.fullName}</span>
          <MyUserButton />
        </div>
      </SignedIn>

      {/* Button de theme */}
      <ThemeToggle />

      {/* Menu hamburger */}
      <Sheet >
        <SheetTrigger>
          <Menu />
        </SheetTrigger>
        <SheetContent>

          {/* Logo */}
          <div className="mt-20 mb-14 text-center">
            <Logo />
          </div>

          {/* Navigation */}
          {/* <Nav /> */}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MobileNav
