"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  Calendar, 
  History, 
  Settings,
  LogOut,
  User,
  Menu,
  Trophy
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface ModeratorMobileSidebarProps {
  user: any
  profile: any
}

const navigation = [
  {
    name: "Dashboard",
    href: "/moderator",
    icon: LayoutDashboard,
  },
  {
    name: "Fixtures",
    href: "/moderator/fixtures",
    icon: Calendar,
  },
  {
    name: "Tournaments",
    href: "/moderator/tournaments",
    icon: Trophy,
  },
  {
    name: "History",
    href: "/moderator/history",
    icon: History,
  },
]

export function ModeratorMobileSidebar({ user, profile }: ModeratorMobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || "U"
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed top-20 left-4 z-50 md:hidden bg-white shadow-lg border-slate-200 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 rounded-lg"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-background via-blue-50/30 to-purple-50/20 text-slate-800 border-r border-slate-200">
        <SheetTitle className="sr-only">Moderator Navigation</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-slate-200">
            <Avatar className="h-10 w-10 ring-2 ring-blue-500/30">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || user?.email || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {profile?.role === 'admin' ? 'Admin' : 'Moderator'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start transition-all duration-300",
                      isActive 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/30" 
                        : "text-slate-600 hover:text-blue-700 hover:bg-blue-50/80"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <Link href="/profile" onClick={() => setOpen(false)}>
              <Button 
                variant="ghost" 
                className="w-full justify-start transition-all duration-300 text-slate-600 hover:text-blue-700 hover:bg-blue-50/80"
              >
                <Settings className="mr-3 h-5 w-5" />
                <span className="font-medium">Profile Settings</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start transition-all duration-300 text-red-500 hover:text-red-700 hover:bg-red-50/80"
              onClick={() => {
                setOpen(false)
                signOut()
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}