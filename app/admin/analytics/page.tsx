import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BarChart3, Users, Calendar, Trophy, Brain, TrendingUp, Activity, Clock } from "lucide-react"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import AdminPageWrapper from "../admin-page-wrapper"

export default async function AnalyticsPage() {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <AdminPageWrapper>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Insights and performance metrics for your sports platform
            </p>
          </div>
        </div>
        {/* Analytics Dashboard */}
        <AnalyticsDashboard />
      </div>
    </AdminPageWrapper>
  )
}