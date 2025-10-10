import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar"

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
    <>
      {/* Mobile menu */}
      <AdminMobileSidebar />
      
      {/* Desktop layout with sidebar */}
      <div className="lg:flex lg:gap-0 bg-slate-50">
        {/* Sidebar for desktop */}
        <AdminSidebar />
        
        {/* Main content */}
        <div className="flex-1 pt-14 lg:pt-0">
          <main className="py-8 lg:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
