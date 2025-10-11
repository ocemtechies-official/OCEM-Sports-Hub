"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Shield, UserCheck, UserCog } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

interface UserNavProps {
  profile: {
    id: string
    email: string
    full_name: string | null
    role: string
    avatar_url: string | null
  }
}

export function UserNav({ profile }: UserNavProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      console.log("UserNav: Starting sign out process")
      await signOut()
      console.log("UserNav: Sign out completed")
    } catch (error) {
      console.error("UserNav: Sign out error:", error)
      notifications.showError({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again."
      })
    }
  }

  const initials =
    profile.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || profile.email[0].toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100 transition-colors duration-300">
          <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-blue-500 transition-all duration-300">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || profile.email} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 border border-slate-200 shadow-lg rounded-lg" align="end" forceMount>
        <DropdownMenuLabel className="font-normal py-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{profile.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
            {profile.role === "admin" && (
              <div className="flex items-center mt-2">
                <Shield className="h-3 w-3 text-blue-600 mr-1" />
                <span className="text-xs leading-none text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
            )}
            {profile.role === "moderator" && (
              <div className="flex items-center mt-2">
                <UserCog className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs leading-none text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                  Moderator
                </span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => router.push("/profile")}
            className="cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-blue-50 py-2 transition-colors duration-300 focus:bg-blue-50 focus:text-blue-700"
        >
          <User className="mr-2 h-4 w-4 hover:text-blue-800" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/profile/registrations")}
            className="cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-blue-50 py-2 transition-colors duration-300 focus:bg-blue-50 focus:text-blue-700"
        >
          <UserCheck className="mr-2 h-4 w-4 hover:text-blue-800" />
          My Registrations
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/settings")}
            className="cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-blue-50 py-2 transition-colors duration-300 focus:bg-blue-50 focus:text-blue-700"
        >
          <Settings className="mr-2 h-4 w-4 hover:text-blue-800" />
          Settings
        </DropdownMenuItem>
        {(profile.role === "moderator" || profile.role === "admin") && (
          <DropdownMenuItem 
            onClick={() => router.push("/moderator")}
            className="cursor-pointer text-slate-700 hover:text-green-600 hover:bg-green-50 py-2 transition-colors duration-300 focus:bg-green-50 focus:text-green-700"
          >
            <UserCog className="mr-2 h-4 w-4 hover:text-green-800"/>
            Moderator Dashboard
          </DropdownMenuItem>
        )}
        {profile.role === "admin" && (
          <DropdownMenuItem 
            onClick={() => router.push("/admin")}
            className="cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-blue-50 py-2 transition-colors duration-300 focus:bg-blue-50 focus:text-blue-700"
          >
            <Shield className="mr-2 h-4 w-4 hover:text-blue-800 "/>
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 py-2 transition-colors duration-200 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}