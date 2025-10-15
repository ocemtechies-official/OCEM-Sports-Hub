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
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105",
          isActive("/")
            ? "nav-active shadow-md"
            : "nav-hover shadow-sm hover:shadow-md"
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
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105",
              isGroupActive(navGroups[0].items)
                ? "dropdown-trigger-active shadow-md"
                : "dropdown-trigger-hover shadow-sm hover:shadow-md"
            )}
          >
            <TrophyIcon className="h-4 w-4" />
            Competitions
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 border border-slate-200 shadow-xl rounded-xl mt-2 p-2">
          {navGroups[0].items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem asChild key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 transform hover:scale-[1.02]",
                    isActive(item.href)
                      ? "dropdown-item-active shadow-sm"
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

      {/* Matches direct link */}
      <Link
        href="/match"
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105",
          isActive("/match")
            ? "nav-active shadow-md"
            : "nav-hover shadow-sm hover:shadow-md"
        )}
      >
        <Calendar className="h-4 w-4" />
        Matches
      </Link>

      <Link
        href="/register"
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105",
          isActive("/register")
            ? "nav-active shadow-md"
            : "nav-hover shadow-sm hover:shadow-md"
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
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105",
              isGroupActive(navGroups[1].items)
                ? "dropdown-trigger-active shadow-md"
                : "dropdown-trigger-hover shadow-sm hover:shadow-md"
            )}
          >
            <Brain className="h-4 w-4" />
            Activities
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 border border-slate-200 shadow-xl rounded-xl mt-2 p-2">
          {navGroups[1].items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem asChild key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 transform hover:scale-[1.02]",
                    isActive(item.href)
                      ? "dropdown-item-active shadow-sm"
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