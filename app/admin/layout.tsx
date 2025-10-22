import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider } from "@/components/moderator/sidebar-context"
import { Footer } from "@/components/layout/footer"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, isAdmin } = await requireAdmin()

  if (!user || !profile || !isAdmin) {
    redirect("/auth/login?redirect=/admin")
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex md:flex-col flex-shrink-0">
            <AdminSidebar user={user} profile={profile} />
          </div>

          {/* Mobile Sidebar */}
          <div className="md:hidden">
            <AdminMobileSidebar user={user} profile={profile} />
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <Footer />
      </div>
      <Toaster position="top-right" duration={2500} />
    </SidebarProvider>
  )
}