import Link from "next/link"
import Nav from "./Nav"
import { Button } from "./ui/button"
import ThemeToggle from "./theme/ThemeToggle"
import MobileNav from "./MobileNav"
import Logo from "./Logo"

const Header = () => {
  return (
    <header className="py-4 xl:py-4 fixed top-0 left-0 w-full shadow-md backdrop-blur-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Logo />

        {/* Desktop nav and hire me button */}
        <div className="hidden xl:flex items-center gap-8">
          <Nav />
          <Link href="/contact">
            <Button variant="gradient">Contactez-nous</Button>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile nav */}
        <div className="xl:hidden">
          <MobileNav />
        </div>

      </div>
    </header>
  )
}

export default Header