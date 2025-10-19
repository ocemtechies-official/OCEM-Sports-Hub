import { requireModerator } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ModeratorSidebar } from "@/components/moderator/moderator-sidebar"
import { ModeratorMobileSidebar } from "@/components/moderator/moderator-mobile-sidebar"
import { SidebarProvider } from "@/components/moderator/sidebar-context"

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, isModerator } = await requireModerator()

  if (!user || !isModerator) {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-col flex-shrink-0">
          <ModeratorSidebar user={user} profile={profile} />
        </div>

        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <ModeratorMobileSidebar user={user} profile={profile} />
        </div>

        {/* Main Content - Updated to take full width without padding */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}