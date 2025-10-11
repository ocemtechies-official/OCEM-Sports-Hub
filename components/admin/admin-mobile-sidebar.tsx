"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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

export function AdminMobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b px-4 py-2 shadow-sm">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Menu className="h-4 w-4 mr-2" />
            Admin Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">OS</span>
              </div>
              <span className="font-semibold text-lg">Admin Panel</span>
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-8rem)] px-3">
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

          <Separator className="my-4" />

          {/* Quick Stats Footer */}
          <div className="px-6 pb-6">
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
        </SheetContent>
      </Sheet>
    </div>
  )
}
