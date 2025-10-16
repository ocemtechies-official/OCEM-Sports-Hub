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
          "flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300",
          isActive("/")
            ? "text-blue-600 bg-blue-50 shadow-sm"
            : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
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
              "flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300",
              isGroupActive(navGroups[0].items)
                ? "text-blue-600 bg-blue-50 shadow-sm"
                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
            )}
          >
            <TrophyIcon className="h-4 w-4" />
            Competitions
            <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56 border border-slate-200 shadow-xl rounded-xl mt-1.5 p-1.5 bg-white/95 backdrop-blur-sm data-[state=open]:animate-dropdown"
        >
          {navGroups[0].items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem asChild key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50/50"
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
          "flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300",
          isActive("/match")
            ? "text-blue-600 bg-blue-50 shadow-sm"
            : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
        )}
      >
        <Calendar className="h-4 w-4" />
        Matches
      </Link>

      <Link
        href="/register"
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300",
          isActive("/register")
            ? "text-blue-600 bg-blue-50 shadow-sm"
            : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
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
              "flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300",
              isGroupActive(navGroups[1].items)
                ? "text-blue-600 bg-blue-50 shadow-sm"
                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
            )}
          >
            <Brain className="h-4 w-4" />
            Activities
            <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56 border border-slate-200 shadow-xl rounded-xl mt-1.5 p-1.5 bg-white/95 backdrop-blur-sm data-[state=open]:animate-dropdown"
        >
          {navGroups[1].items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem asChild key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50/50"
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