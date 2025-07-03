"use client";

import Header from '@/components/Header'
import ThemeProvider from '@/components/theme/ThemeProvider'
import { ClerkProvider } from '@clerk/nextjs'
import { frFR } from "@clerk/localizations";
import { dark, shadesOfPurple } from "@clerk/themes";

import React from 'react'
import { useTheme } from 'next-themes';

const Provider = ({ children }: React.PropsWithChildren<{}>) => {
 
  // const clerkTheme = theme ==='dark' ? dark : shadesOfPurple;
  return (
    <ClerkProvider localization={frFR} appearance={{baseTheme: dark}}>
      <ThemeProvider attribute="class" enableSystem defaultTheme="system">
      <Header />
        {children}
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default Provider
