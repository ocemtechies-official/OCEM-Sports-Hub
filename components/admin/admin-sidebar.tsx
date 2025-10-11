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

const navigation = [
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
                  const active = isActive(item.href, (item as any).exact)

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

      {/* Quick Stats Footer */}
      <div className="px-6 py-4 border-t flex-shrink-0">
        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 p-4 border border-indigo-100">
          <div className="text-xs font-medium text-slate-600 mb-3">
            Quick Stats
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Active Users</span>
              <span className="text-sm font-bold text-slate-900">1,234</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Live Fixtures</span>
              <span className="text-sm font-bold text-green-600">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Pending</span>
              <span className="text-sm font-bold text-orange-600">12</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}