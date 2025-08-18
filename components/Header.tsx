"use client"

import Link from "next/link"
import ThemeToggle from "./theme/ThemeToggle"
import Logo from "./Logo"
import HamburgerMenu from "./HamburgerMenu"
import MainNav from "./navigation/MainNav"

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>
          </div>
          
          <MainNav />
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <div className="md:hidden ml-2">
              <HamburgerMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header