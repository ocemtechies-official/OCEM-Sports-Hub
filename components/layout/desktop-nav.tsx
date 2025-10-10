"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Home,
  TrophyIcon,
  Users2,
  Brain,
  Calendar,
  Award,
  Users,
  BarChart3,
  Crown,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

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

export function DesktopNav() {
  const pathname = usePathname()

  // Function to check if a route is active
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // Function to check if any item in a group is active
  const isGroupActive = (items: { href: string }[]) => {
    return items.some(item => isActive(item.href))
  }

  return (
    <div className="hidden md:flex items-center gap-1 ml-auto mr-6">
      <Link
        href="/"
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300",
          isActive("/")
            ? "nav-active"
            : "nav-hover"
        )}
      >
        <Home className="h-4 w-4" />
        Home
      </Link>

      {/* Competitions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300",
              isGroupActive(navGroups[0].items)
                ? "dropdown-trigger-active"
                : "dropdown-trigger-hover"
            )}
          >
            <TrophyIcon className="h-4 w-4" />
            Competitions
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 border border-slate-200 shadow-lg rounded-lg mt-1">
          {navGroups[0].items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem asChild key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors duration-200",
                    isActive(item.href)
                      ? "dropdown-item-active"
                      : "dropdown-item-hover"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Link
        href="/register"
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300",
          isActive("/register")
            ? "nav-active"
            : "nav-hover"
        )}
      >
        <Users2 className="h-4 w-4" />
        Register
      </Link>

      {/* Activities Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300",
              isGroupActive(navGroups[1].items)
                ? "dropdown-trigger-active"
                : "dropdown-trigger-hover"
            )}
          >
            <Brain className="h-4 w-4" />
            Activities
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 border border-slate-200 shadow-lg rounded-lg mt-1">
          {navGroups[1].items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem asChild key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors duration-200",
                    isActive(item.href)
                      ? "dropdown-item-active"
                      : "dropdown-item-hover"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}