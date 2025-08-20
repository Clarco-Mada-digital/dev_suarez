import React from 'react'

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between text-muted-foreground">
        <span>©️ {new Date().getFullYear()} Bryan. All rights reserved</span>
        <span className="hidden sm:inline">Made with ❤️ by Bryan Clark</span>
      </div>
    </footer>
  )
}

export default Footer
