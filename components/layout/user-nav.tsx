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
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-xl hover:bg-slate-100 transition-all duration-300"
        >
          <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-blue-500/30 transition-all duration-300">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || profile.email} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 border border-slate-200 shadow-xl rounded-xl p-2 bg-white/95 backdrop-blur-sm" 
        align="end" 
        side="bottom"
        sideOffset={8}
        collisionPadding={{ top: 16, right: 16, bottom: 16, left: 16 }}
        forceMount
      >
        <DropdownMenuLabel className="font-normal py-3.5 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex flex-col space-y-1.5">
            <p className="text-base font-bold leading-none text-slate-900 truncate">{profile.full_name || "User"}</p>
            <p className="text-xs leading-none text-slate-500 truncate">{profile.email}</p>
            {profile.role === "admin" && (
              <div className="flex items-center mt-2">
                <Shield className="h-3.5 w-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
                <span className="text-xs leading-none text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded-full">
                  Admin
                </span>
              </div>
            )}
            {profile.role === "moderator" && (
              <div className="flex items-center mt-2">
                <UserCog className="h-3.5 w-3.5 text-green-600 mr-1.5 flex-shrink-0" />
                <span className="text-xs leading-none text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                  Moderator
                </span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2 bg-slate-200" />
        <DropdownMenuItem 
          onClick={() => router.push("/profile")}
          className="cursor-pointer py-2.5 rounded-lg transition-all duration-200 focus:bg-blue-50 focus:text-blue-700"
        >
          <User className="mr-3 h-4.5 w-4.5 text-slate-500 group-hover:text-blue-600 flex-shrink-0" />
          <span className="font-medium text-slate-700 group-hover:text-blue-600">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/profile/registrations")}
          className="cursor-pointer py-2.5 rounded-lg transition-all duration-200 focus:bg-blue-50 focus:text-blue-700"
        >
          <UserCheck className="mr-3 h-4.5 w-4.5 text-slate-500 group-hover:text-blue-600 flex-shrink-0" />
          <span className="font-medium text-slate-700 group-hover:text-blue-600">My Registrations</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/profile/my-team")}
          className="cursor-pointer py-2.5 rounded-lg transition-all duration-200 focus:bg-yellow-50 focus:text-yellow-700"
        >
          <Crown className="mr-3 h-4.5 w-4.5 text-slate-500 group-hover:text-yellow-600 flex-shrink-0" />
          <span className="font-medium text-slate-700 group-hover:text-yellow-600">My Team</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/settings")}
          className="cursor-pointer py-2.5 rounded-lg transition-all duration-200 focus:bg-blue-50 focus:text-blue-700"
        >
          <Settings className="mr-3 h-4.5 w-4.5 text-slate-500 group-hover:text-blue-600 flex-shrink-0" />
          <span className="font-medium text-slate-700 group-hover:text-blue-600">Settings</span>
        </DropdownMenuItem>
        {(profile.role === "moderator" || profile.role === "admin") && (
          <DropdownMenuItem 
            onClick={() => router.push("/moderator")}
            className="cursor-pointer py-2.5 rounded-lg transition-all duration-200 focus:bg-green-50 focus:text-green-700"
          >
            <UserCog className="mr-3 h-4.5 w-4.5 text-slate-500 group-hover:text-green-600 flex-shrink-0"/>
            <span className="font-medium text-slate-700 group-hover:text-green-600">Moderator Dashboard</span>
          </DropdownMenuItem>
        )}
        {profile.role === "admin" && (
          <DropdownMenuItem 
            onClick={() => router.push("/admin")}
            className="cursor-pointer py-2.5 rounded-lg transition-all duration-200 focus:bg-blue-50 focus:text-blue-700"
          >
            <Shield className="mr-3 h-4.5 w-4.5 text-slate-500 group-hover:text-blue-600 flex-shrink-0"/>
            <span className="font-medium text-slate-700 group-hover:text-blue-600">Admin Panel</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="my-2 bg-slate-200" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer py-2.5 rounded-lg transition-all duration-200 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="mr-3 h-4.5 w-4.5 text-red-500 flex-shrink-0" />
          <span className="font-medium text-red-600">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}