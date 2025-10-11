"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Calendar, 
  History, 
  Settings,
  LogOut,
  User
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

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

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <User className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {profile?.full_name || user.email}
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
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Link href="/profile">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-3 h-4 w-4" />
            Profile Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut()}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
