"use client"

import { useSidebar } from "@/components/moderator/sidebar-context"
import { useEffect, useState } from "react"

export default function AdminPageWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed, isHovering } = useSidebar()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // No need for additional margin since the layout now properly handles the sidebar width
  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden w-full">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}