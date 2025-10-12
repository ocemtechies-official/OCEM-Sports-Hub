import { requireModerator } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ModeratorSidebar } from "@/components/moderator/moderator-sidebar"
import { ModeratorMobileSidebar } from "@/components/moderator/moderator-mobile-sidebar"

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
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <ModeratorSidebar user={user} profile={profile} />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <ModeratorMobileSidebar user={user} profile={profile} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
