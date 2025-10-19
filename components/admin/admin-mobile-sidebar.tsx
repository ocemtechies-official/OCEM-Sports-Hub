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
  Users,
  Calendar,
  Trophy,
  Brain,
  Shield,
  BarChart3,
  Activity,
  FileText,
  Settings,
  UserCheck,
  UserCog,
  UserPlus,
  Menu,
  LogOut,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth/auth-provider"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  exact?: boolean
  badge?: string
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const navigation: NavigationSection[] = [
  {
    title: "Dashboard",
    items: [
      { 
        name: "Overview", 
        href: "/admin", 
        icon: LayoutDashboard,
        exact: true 
      },
      { 
        name: "Analytics", 
        href: "/admin/analytics", 
        icon: BarChart3,
        badge: "Soon" 
      },
    ],
  },
  {
    title: "Management",
    items: [
      { 
        name: "Users", 
        href: "/admin/users", 
        icon: Users 
      },
      { 
        name: "Moderators", 
        href: "/admin/moderators", 
        icon: UserCog 
      },
      { 
        name: "Registrations", 
        href: "/admin/registrations", 
        icon: UserCheck 
      },
      { 
        name: "Fixtures", 
        href: "/admin/fixtures", 
        icon: Calendar 
      },
      { 
        name: "Tournaments", 
        href: "/admin/tournaments", 
        icon: Trophy 
      },
      { 
        name: "Quizzes", 
        href: "/admin/quizzes", 
        icon: Brain 
      },
      { 
        name: "Teams", 
        href: "/admin/teams", 
        icon: Shield 
      },
      { 
        name: "Team Changes", 
        href: "/admin/team-change-requests", 
        icon: UserPlus 
      },
    ],
  },
  {
    title: "System",
    items: [
      { 
        name: "Live Monitor", 
        href: "/admin/live", 
        icon: Activity,
        badge: "Live" 
      },
      { 
        name: "Reports", 
        href: "/admin/reports", 
        icon: FileText 
      },
      { 
        name: "Settings", 
        href: "/admin/settings", 
        icon: Settings 
      },
    ],
  },
]

interface AdminMobileSidebarProps {
  user: any
  profile: any
}

export function AdminMobileSidebar({ user, profile }: AdminMobileSidebarProps) {
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

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
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
        <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
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
                Admin
              </p>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-6 py-4">
              {navigation.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <nav className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.href, item.exact)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                            active
                              ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/30"
                              : "text-slate-800 hover:text-blue-700 hover:bg-blue-100",
                            "px-3 py-2"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={cn(
                              "h-5 w-5 flex-shrink-0",
                              active ? "text-white" : "text-slate-800 group-hover:text-blue-600",
                              "mr-3"
                            )} />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <Badge 
                              variant={item.badge === "Live" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start transition-all duration-300 text-slate-800 hover:text-red-700 hover:bg-red-100 px-4 py-2"
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