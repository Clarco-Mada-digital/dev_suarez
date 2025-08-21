import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import ThemeProvider from "@/components/theme/ThemeProvider";
import Footer from "@/components/Footer";
import { comfortaa, inter } from "@/lib/fonts";
import Provider from "./Provider";
import { Toaster } from "@/components/ui/toaster";
import { AnalyticsProvider } from "@/components/analytics-provider";

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
    <html 
      lang="fr" 
      className={`${inter.variable} ${comfortaa.variable} font-sans`} 
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen bg-background">
        <Provider>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem={false}
            disableTransitionOnChange
          >
            {/* Header */}
            <Header />
            <AnalyticsProvider>
              <main className="pt-16">
                {children}
              </main>
            </AnalyticsProvider>
            {/* Footer */}
            <Footer />
          </ThemeProvider>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
