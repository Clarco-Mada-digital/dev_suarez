"use client"

import { Menu } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function MobileNav() {
  const { status } = useSession()

  return (
    <div className="flex items-center gap-3">
      {/* When not authenticated */}
      {status !== 'authenticated' ? (
        <>
          <Link href="/assistant" className="capitalize font-medium hover:text-blue-500 transition-all">
            Assistant
          </Link>
          <Link href="/sign-in" className="capitalize font-medium hover:text-blue-500 transition-all">
            se connecter
          </Link>
          <Link href="/sign-up" className="capitalize font-medium hover:text-blue-500 transition-all">
            S'inscrire gratuitement
          </Link>
        </>
      ) : (
        <>
          <Link href="/assistant" className="capitalize font-medium hover:text-blue-500 transition-all">
            Assistant
          </Link>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: '/sign-in' })}
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
