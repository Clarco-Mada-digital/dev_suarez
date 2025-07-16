"use client"

import Link from "next/link"
import Nav from "./Nav"
import ThemeToggle from "./theme/ThemeToggle"
import Logo from "./Logo"
import HamburgerMenu from "./HamburgerMenu"

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-transparent backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="hidden sm:block">
              <Nav />
            </div>
            <div className="sm:hidden">
              <HamburgerMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header