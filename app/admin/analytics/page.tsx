import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Trophy, 
  Brain, 
  TrendingUp,
  Activity,
  Clock
} from "lucide-react"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"

export default async function AnalyticsPage() {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Insights and performance metrics for your sports platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  )
}
