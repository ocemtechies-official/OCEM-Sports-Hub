"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  Target,
  UserPlus,
  LogOut,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth/auth-provider"
import { useState, useEffect, useRef } from "react"
import { useSidebar } from "@/components/moderator/sidebar-context"

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
        icon: BarChart3
      },
    ],
  },
  {
    title: "User Management",
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
        name: "Team Changes", 
        href: "/admin/team-change-requests", 
        icon: UserPlus 
      },
    ],
  },
  {
    title: "Event Management",
    items: [
      { 
        name: "Registrations", 
        href: "/admin/registrations", 
        icon: UserCheck 
      },
      { 
        name: "Reg. Settings", 
        href: "/admin/registrations/settings", 
        icon: Settings 
      },
      { 
        name: "Tournaments", 
        href: "/admin/tournaments", 
        icon: Trophy 
      },
      { 
        name: "Fixtures", 
        href: "/admin/fixtures", 
        icon: Calendar 
      },
    ],
  },
  {
    title: "Content Management",
    items: [
      { 
        name: "Teams", 
        href: "/admin/teams", 
        icon: Shield 
      },
      { 
        name: "Sports", 
        href: "/admin/sports", 
        icon: Target 
      },
      { 
        name: "Quizzes", 
        href: "/admin/quizzes", 
        icon: Brain 
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

interface AdminSidebarProps {
  user: any
  profile: any
}

export function AdminSidebar({ user, profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { collapsed, setCollapsed, isHovering, setIsHovering } = useSidebar()
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Set default state to collapsed
  useEffect(() => {
    setCollapsed(true)
  }, [setCollapsed])

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

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
      return pathname === href;
    }
    
    // Special handling for registration pages to avoid conflicts
    if (href === "/admin/registrations") {
      // Only match exact path, not subpaths
      return pathname === "/admin/registrations";
    }
    
    if (href === "/admin/registrations/settings") {
      // Match exact path for settings
      return pathname === "/admin/registrations/settings";
    }
    
    return pathname.startsWith(href);
  }

  return (
    <div 
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "hidden lg:flex lg:flex-col h-full bg-gradient-to-b from-background via-blue-50/30 to-purple-50/20 text-slate-800 border-r border-slate-200 transition-all duration-300 ease-in-out shadow-lg",
        collapsed && !isHovering ? "lg:w-20" : "lg:w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-slate-200 transition-all duration-300",
        collapsed && !isHovering ? "justify-center px-2" : "justify-between"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && !isHovering ? "ml-2" : ""
        )}>
          <Avatar className="h-10 w-10 ring-2 ring-blue-500/30 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || user?.email || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {!(collapsed && !isHovering) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-slate-500 truncate">
                Admin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-6 py-4">
          {navigation.map((section) => (
            <div key={section.title}>
              {!(collapsed && !isHovering) ? (
                <h3 className="mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              ) : (
                // Placeholder space in collapsed state to maintain similar layout feel
                <div className="h-6"></div>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href, item.exact)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                        active
                          ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/30"
                          : "text-slate-800 hover:text-blue-700 hover:bg-blue-50/80",
                        (collapsed && !isHovering) ? "justify-center px-2 py-2" : "px-3 py-2"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0",
                          active ? "text-white" : "text-slate-800 group-hover:text-blue-600",
                          (collapsed && !isHovering) ? "" : "mr-3"
                        )} />
                        {!(collapsed && !isHovering) && <span>{item.name}</span>}
                      </div>
                      {item.badge && !(collapsed && !isHovering) && (
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
          className={cn(
            "w-full justify-start transition-all duration-300",
            "text-slate-800 hover:text-red-700 hover:bg-red-50/80",
            (collapsed && !isHovering) ? "justify-center px-2 py-2" : "px-4 py-2"
          )}
          onClick={() => signOut()}
        >
          <LogOut className={cn("h-5 w-5", (collapsed && !isHovering) ? "" : "mr-3")} />
          {!(collapsed && !isHovering) && <span className="font-medium">Sign Out</span>}
        </Button>
      </div>
    </div>
  )
}