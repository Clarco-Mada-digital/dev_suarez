"use client"

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { Link } from 'next/link'
import { auth } from '@/auth'

export default function MobileNav() {
  const pathName = usePathname()
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null

  return (
    <div className="flex items-center gap-3">
      {/* When not authenticated */}
      {!email ? (
        <>
          <Link href="/sign-in" className="capitalize font-medium hover:text-blue-500 transition-all">
            se connecter
          </Link>
          <Link href="/sign-up" className="capitalize font-medium hover:text-blue-500 transition-all">
            S'inscrire gratuitement
          </Link>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={() => {
              auth.removeEmail()
              window.location.href = '/sign-in'
            }}
            className="text-sm"
          >
            Déconnexion
          </Button>
        </>
      )}

      <Button variant="outline">
        <Menu />
      </Button>
    </div>
  )
}
