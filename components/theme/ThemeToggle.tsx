"use client";

import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { MoonStar, SunMedium } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();


  return (
    <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'light'? 'dark' : 'light')}>
      {theme === 'light'? <SunMedium size={20} className='transition-all' /> : <MoonStar size={20} className='transition-all' />}
    </Button>
  )
}

export default ThemeToggle;
