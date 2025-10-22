import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReportsDashboard } from "@/components/admin/reports-dashboard"
import AdminPageWrapper from "../admin-page-wrapper"

export default async function ReportsPage() {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <AdminPageWrapper>
      <div className="p-4 sm:p-6 lg:p-8">
        <ReportsDashboard />
      </div>
    </AdminPageWrapper>
  )
}