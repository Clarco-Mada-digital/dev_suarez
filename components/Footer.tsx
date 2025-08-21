import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-background border-t z-40 mt-8 relative">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between text-muted-foreground">
        <span>©️ {new Date().getFullYear()} Bryan. All rights reserved</span>
        <span className="hidden sm:inline">Made with ❤️ by Bryan Clark</span>
      </div>
    </footer>
  )
}

export default Footer
