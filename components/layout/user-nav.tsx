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
import { User, Settings, LogOut, Shield, UserCheck, UserCog, Crown } from "lucide-react"
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
      await signOut()
    } catch (error) {
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
        <Button variant="ghost" className="relative h-11 w-11 rounded-xl hover:bg-slate-100 transition-all duration-300 transform hover:scale-105">
          <Avatar className="h-11 w-11 ring-2 ring-transparent hover:ring-blue-500 transition-all duration-300">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || profile.email} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 border border-slate-200 shadow-xl rounded-xl p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal py-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col space-y-2">
            <p className="text-lg font-bold leading-none">{profile.full_name || "User"}</p>
            <p className="text-sm leading-none text-muted-foreground">{profile.email}</p>
            {profile.role === "admin" && (
              <div className="flex items-center mt-2">
                <Shield className="h-4 w-4 text-blue-600 mr-1.5" />
                <span className="text-sm leading-none text-blue-600 font-semibold bg-blue-100 px-2.5 py-1 rounded-full">
                  Admin
                </span>
              </div>
            )}
            {profile.role === "moderator" && (
              <div className="flex items-center mt-2">
                <UserCog className="h-4 w-4 text-green-600 mr-1.5" />
                <span className="text-sm leading-none text-green-600 font-semibold bg-green-100 px-2.5 py-1 rounded-full">
                  Moderator
                </span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem 
          onClick={() => router.push("/profile")}
            className="cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-blue-50 py-3 rounded-lg transition-all duration-300 focus:bg-blue-50 focus:text-blue-700 transform hover:scale-[1.02]"
        >
          <User className="mr-3 h-5 w-5 hover:text-blue-800" />
          <span className="font-medium">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/profile/registrations")}
            className="cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-blue-50 py-3 rounded-lg transition-all duration-300 focus:bg-blue-50 focus:text-blue-700 transform hover:scale-[1.02]"
        >
          <UserCheck className="mr-3 h-5 w-5 hover:text-blue-800" />
          <span className="font-medium">My Registrations</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/profile/my-team")}
            className="cursor-pointer text-slate-700 hover:text-yellow-600 hover:bg-yellow-50 py-3 rounded-lg transition-all duration-300 focus:bg-yellow-50 focus:text-yellow-700 transform hover:scale-[1.02]"
        >
          <Crown className="mr-3 h-5 w-5 hover:text-yellow-800" />
          <span className="font-medium">My Team</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/settings")}
            className="cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-blue-50 py-3 rounded-lg transition-all duration-300 focus:bg-blue-50 focus:text-blue-700 transform hover:scale-[1.02]"
        >
          <Settings className="mr-3 h-5 w-5 hover:text-blue-800" />
          <span className="font-medium">Settings</span>
        </DropdownMenuItem>
        {(profile.role === "moderator" || profile.role === "admin") && (
          <DropdownMenuItem 
            onClick={() => router.push("/moderator")}
            className="cursor-pointer text-slate-700 hover:text-green-600 hover:bg-green-50 py-3 rounded-lg transition-all duration-300 focus:bg-green-50 focus:text-green-700 transform hover:scale-[1.02]"
          >
            <UserCog className="mr-3 h-5 w-5 hover:text-green-800"/>
            <span className="font-medium">Moderator Dashboard</span>
          </DropdownMenuItem>
        )}
        {profile.role === "admin" && (
          <DropdownMenuItem 
            onClick={() => router.push("/admin")}
            className="cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-blue-50 py-3 rounded-lg transition-all duration-300 focus:bg-blue-50 focus:text-blue-700 transform hover:scale-[1.02]"
          >
            <Shield className="mr-3 h-5 w-5 hover:text-blue-800 "/>
            <span className="font-medium">Admin Panel</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 py-3 rounded-lg transition-all duration-200 focus:bg-red-50 focus:text-red-700 transform hover:scale-[1.02]"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}