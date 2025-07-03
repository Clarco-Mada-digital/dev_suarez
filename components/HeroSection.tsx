'use client';

import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title: string;
  description: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

export function HeroSection({
  title,
  description,
  imageUrl = '/img-hero-presentation.png',
  ctaText = 'Explorer',
  ctaLink = '/projects',
  className = '',
}: HeroSectionProps) {
  const { theme } = useTheme();

  return (
    <div className={cn(
      theme === 'light' 
        ? "bg-[url('/hero.jpg')]" 
        : "bg-[url('/hero-dark.jpg')]",
      "bg-cover bg-center bg-no-repeat w-full py-20 md:py-28 lg:py-36",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {description}
          </p>
          <Link href={ctaLink}>
            <Button size="lg" className="px-8 py-6 text-lg">
              {ctaText}
            </Button>
          </Link>
        </div>
        
        {imageUrl && (
          <div className="mt-12 flex justify-center">
            <div className="relative w-full max-w-2xl h-64 md:h-80 lg:h-96">
              <Image 
                src={imageUrl} 
                alt={title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
