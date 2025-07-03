import React from 'react'

const Footer = () => {
  return (
    <div className="border-t mt-10 pt-2 px-4 flex items-center justify-between text-muted-foreground xl:px-32">
      ©️ {new Date().getFullYear()} Bryan. All rights reserved
      <span>Made with ❤️ by Bryan Clark</span>
    </div>
  )
}

export default Footer
