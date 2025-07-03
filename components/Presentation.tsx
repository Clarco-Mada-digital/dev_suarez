'use client';

import { useTheme } from 'next-themes'
import React from 'react'
import { Button } from './ui/button';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

const Presentation = ({text, img, btnText, btnLink}:{text?:string, img?:string, btnText?:string, btnLink?:string}) => {

  const { theme } = useTheme();

  return (
    <div className={clsx(theme === 'light' ? "bg-[url('/hero.jpg')]" : "bg-[url('/hero-dark.jpg')]", " bg-bottom bg-auto bg-no-repeat h-[60vh] w-full flex items-center px-20 shadow-lg")}>
      <div className="flex justify-center items-center w-full xl:justify-between">
        <section className='flex flex-col gap-8 text-4xl text-center xl:w-[30%] xl:text-left'>
          <span>
           { text ? text : "Présentez-nous votre rêve numérique, on va le réalisé !"}
          </span>
          <Link href={btnLink ? btnLink : "/contact"} className='xl:hidden w-36 m-auto'>
            <Button variant="gradient">{btnText ? btnText : "Contactez-nous"}</Button>
          </Link>
        </section>
        <section className='text-right hidden xl:block'>
          <Image src={img ? img : "/img-hero-presentation.png"} alt='image Hero' width={550} height={550} className='w-[30vw]' />          
        </section>
      </div>
    </div>
  )
}

export default Presentation
