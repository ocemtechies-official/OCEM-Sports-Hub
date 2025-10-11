import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReportsDashboard } from "@/components/admin/reports-dashboard"

export default async function ReportsPage() {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <ReportsDashboard />
      </main>
    </div>
  )
}
