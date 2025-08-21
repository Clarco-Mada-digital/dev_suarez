import { Comfortaa, Inter } from 'next/font/google';

// Configuration de la police Inter
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Configuration de la police Comfortaa
export const comfortaa = Comfortaa({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-comfortaa',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal'],
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});
