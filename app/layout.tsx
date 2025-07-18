import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import ThemeProvider from "@/components/theme/ThemeProvider";
import Footer from "@/components/Footer";
import { comfortaa } from "@/lib/fonts";
import Provider from "./Provider";

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
    <html lang="fr">
      <body style={comfortaa.style} className={comfortaa.variable}>
        <Provider>
          <ThemeProvider defaultTheme="dark" attribute="class" enableSystem>
            {/* Header */}
            <Header />
            {children}
            {/* Footer */}
            <Footer />
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
