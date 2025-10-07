import Link from "next/link"
import { getCurrentProfile } from "@/lib/auth"
import { UserNav } from "@/components/layout/user-nav"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Calendar, 
  Users, 
  Brain, 
  Crown, 
  BarChart3
} from "lucide-react"
import { MobileNav } from "@/components/layout/mobile-nav"

export async function Navbar() {
  const profile = await getCurrentProfile()

  const navItems = [
    { href: "/", label: "Fixtures", icon: Calendar },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
    { href: "/quiz", label: "Quiz", icon: Brain },
    { href: "/chess", label: "Chess", icon: Crown },
  ]

  return (
    <nav className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sports Week
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Navigation */}
          <div className="flex items-center gap-2">
            {profile ? (
              <UserNav profile={profile} />
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
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
