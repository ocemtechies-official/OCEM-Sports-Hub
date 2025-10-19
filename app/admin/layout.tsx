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
          {/* Mobile menu */}
          <div className="md:hidden">
            <AdminMobileSidebar user={user} profile={profile} />
          </div>
          
          {/* Desktop layout with sidebar */}
          <div className="hidden md:flex md:flex-col flex-shrink-0">
            <AdminSidebar user={user} profile={profile} />
          </div>
          
          {/* Main content */}
          <div className="flex flex-1 flex-col">
            <main className="flex-1 pt-14 md:pt-0">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                {children}
              </div>
            </main>
          </div>
        </div>        
        <Toaster position="top-right" duration={2500} />
      </div>
      <Footer />
    </SidebarProvider>
  )
}