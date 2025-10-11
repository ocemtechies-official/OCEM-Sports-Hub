"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DynamicSidebarStats } from "@/components/admin/dynamic-sidebar-stats"

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

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-4rem)] lg:border-r lg:bg-white lg:z-30 lg:overflow-hidden">
      <ScrollArea className="flex-1 px-3 h-full">
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
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0",
                          active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
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

      {/* Dynamic Stats Footer */}
      <DynamicSidebarStats />
    </aside>
  )
}