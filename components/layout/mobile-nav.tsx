"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  Brain, 
  Crown, 
  BarChart3, 
  X,
  Home,
  Award,
  ChevronDown,
  Users2,
  TrophyIcon
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export function MobileNav({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const pathname = usePathname()

  const toggleMenu = (menu: string) => {
    if (openMenus.includes(menu)) {
      setOpenMenus(openMenus.filter(m => m !== menu))
    } else {
      setOpenMenus([...openMenus, menu])
    }
  }

  // Function to check if a route is active
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // Function to check if any item in a group is active
  const isGroupActive = (items: { href: string }[]) => {
    return items.some(item => isActive(item.href))
  }

  // Define navigation items
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/register", label: "Register", icon: Users2 },
  ]

  // Define grouped navigation for dropdowns
  const navGroups = [
    {
      label: "Competitions",
      icon: TrophyIcon,
      items: [
        { href: "/fixtures", label: "Fixtures", icon: Calendar },
        { href: "/tournaments", label: "Tournaments", icon: Award },
        { href: "/teams", label: "Teams", icon: Users },
        { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
      ]
    },
    {
      label: "Activities",
      icon: Brain,
      items: [
        { href: "/quiz", label: "Quiz", icon: Brain },
        { href: "/chess", label: "Chess", icon: Crown },
      ]
    }
  ]

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-300">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 p-0 bg-white border-l border-slate-200">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <Link 
                href="/" 
                className="flex items-center gap-2 font-bold text-xl"
                onClick={() => setIsOpen(false)}
              >
                <div className="bg-white p-1 rounded-lg transition-all duration-300">
                  <img src="/logo.png" alt="OCEM Sports Hub Logo" className="h-8 w-8 object-contain" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  OCEM Sports Hub
                </span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-300"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-300",
                        isActive(item.href)
                          ? "nav-active"
                          : "nav-hover"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}

                {/* Competitions Section */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full flex justify-between items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-300",
                        isGroupActive(navGroups[0].items)
                          ? "dropdown-trigger-active"
                          : "dropdown-trigger-hover"
                      )}
                      onClick={() => toggleMenu('competitions')}
                    >
                      <div className="flex items-center gap-3">
                        <TrophyIcon className="h-5 w-5" />
                        Competitions
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openMenus.includes('competitions') ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 py-2 space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    {navGroups[0].items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200",
                            isActive(item.href)
                              ? "dropdown-item-active"
                              : "dropdown-item-hover"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>

                {/* Activities Section */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full flex justify-between items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-300",
                        isGroupActive(navGroups[1].items)
                          ? "dropdown-trigger-active"
                          : "dropdown-trigger-hover"
                      )}
                      onClick={() => toggleMenu('activities')}
                    >
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5" />
                        Activities
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openMenus.includes('activities') ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 py-2 space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    {navGroups[1].items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200",
                            isActive(item.href)
                              ? "dropdown-item-active"
                              : "dropdown-item-hover"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </nav>
            </div>
            
            {/* Mobile Auth */}
            {!profile && (
              <div className="p-4 border-t border-slate-200">
                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300">
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors duration-300">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}