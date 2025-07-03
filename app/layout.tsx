import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { frFR } from "@clerk/localizations";
import Footer from "@/components/Footer";

const comfortaa = Comfortaa({ subsets: ["latin"], variable: "--font-comfortaa" });

export const metadata: Metadata = {
  title: "D.S by MADA-Digital",
  description: "Application de rencontre entrer les entreprise qui avait des projet digital et les jeunes de Diego qui lance dans le digital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }} localization={frFR} >
      <html lang="fr">
        <body className={cn(comfortaa.variable)}>
          <ThemeProvider defaultTheme="dark" attribute="class" enableSystem>
            {/* Header */}
            <Header />
            {children}
            {/* Footer */}
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
