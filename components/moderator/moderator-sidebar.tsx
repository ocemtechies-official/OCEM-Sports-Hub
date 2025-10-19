"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  Calendar, 
  History, 
  Settings,
  LogOut,
  User,
  PanelLeft,
  PanelRight
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useState, useEffect, useRef } from "react"
import { useSidebar } from "@/components/moderator/sidebar-context"

interface ModeratorSidebarProps {
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
    name: "History",
    href: "/moderator/history",
    icon: History,
  },
]

export function ModeratorSidebar({ user, profile }: ModeratorSidebarProps) {
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

  // When collapsed, show expanded on hover
  const isExpandedOnHover = collapsed && isHovering

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
    <div 
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "flex flex-col h-full bg-gradient-to-b from-background via-blue-50/30 to-purple-50/20 text-slate-800 border-r border-slate-200 transition-all duration-300 ease-in-out shadow-lg",
        collapsed && !isHovering ? "md:w-20" : "md:w-64"
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
                {profile?.role === 'admin' ? 'Admin' : 'Moderator'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/30" 
                    : "text-slate-600 hover:text-blue-700 hover:bg-blue-50/80",
                  (collapsed && !isHovering) ? "justify-center px-2 py-6" : "px-4 py-6"
                )}
              >
                <item.icon className={cn("h-5 w-5", (collapsed && !isHovering) ? "" : "mr-3")} />
                {!(collapsed && !isHovering) && <span className="font-medium">{item.name}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Link href="/profile">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start transition-all duration-300",
              "text-slate-600 hover:text-blue-700 hover:bg-blue-50/80",
              (collapsed && !isHovering) ? "justify-center px-2 py-6" : "px-4 py-6"
            )}
          >
            <Settings className={cn("h-5 w-5", (collapsed && !isHovering) ? "" : "mr-3")} />
            {!(collapsed && !isHovering) && <span className="font-medium">Profile Settings</span>}
          </Button>
        </Link>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start transition-all duration-300",
            "text-red-500 hover:text-red-700 hover:bg-red-50/80",
            (collapsed && !isHovering) ? "justify-center px-2 py-6" : "px-4 py-6"
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