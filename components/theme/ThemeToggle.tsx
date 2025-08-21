"use client";

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { MoonStar, SunMedium } from 'lucide-react';

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Effet uniquement côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Évite le rendu côté serveur
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-10 px-0">
        <div className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <SunMedium size={20} className="transition-all" />
      ) : (
        <MoonStar size={20} className="transition-all" />
      )}
    </Button>
  );
};

export default ThemeToggle;
