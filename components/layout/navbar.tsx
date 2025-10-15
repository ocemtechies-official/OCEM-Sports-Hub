import Link from "next/link"
import { getCurrentProfile } from "@/lib/auth"
import { UserNav } from "@/components/layout/user-nav"
import { Button } from "@/components/ui/button"
import { 
  Users2,
} from "lucide-react"
import { MobileNav } from "@/components/layout/mobile-nav"
import { DesktopNav } from "@/components/layout/desktop-nav"

export async function Navbar() {
  const profile = await getCurrentProfile()

  return (
    <nav className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
            <div className="bg-white p-1 rounded-lg group-hover:bg-gray-50 transition-all duration-300 transform group-hover:scale-105 shadow-sm">
              <img src="/logo.png" alt="OCEM Sports Hub Logo" className="h-10 w-10 object-contain" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">
              OCEM Sports Hub
            </span>
          </Link>

          {/* Desktop Navigation - Moved to right side */}
          <DesktopNav />

          {/* User Navigation - Positioned on the far right */}
          <div className="flex items-center gap-2">
            {profile ? (
              <UserNav profile={profile} />
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300 rounded-lg px-4">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg rounded-lg px-4">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
            
            {/* Mobile Menu */}
            <MobileNav profile={profile} />
          </div>
        </div>
      </div>
    </nav>
  )
}