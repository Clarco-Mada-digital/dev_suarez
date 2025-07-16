"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { auth } from "@/auth"

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2">
          <Link
            href="/projects"
            className="block px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Projets
          </Link>
          
          {!email ? (
            <>
              <Link
                href="/sign-in"
                className="block px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Connexion
              </Link>
              <Link
                href="/sign-up"
                className="block px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Inscription
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                auth.removeEmail()
                window.location.href = '/sign-in'
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Déconnexion
            </button>
          )}
        </div>
      )}
    </div>
  )
}
