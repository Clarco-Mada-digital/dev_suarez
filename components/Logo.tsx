import Link from 'next/link'
import React from 'react'

const Logo = () => {
  return (
    <Link href="/">
      <h1 className="text-3xl text-transparent bg-clip-text font-semibold bg-gradient-to-r from-purple-400 to-pink-500">Dev<span className="text-accent text-blue-500">.</span>Suarez</h1>
    </Link>
  )
}

export default Logo
