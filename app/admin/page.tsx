import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Calendar, 
  Trophy, 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Shield,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AdminPageWrapper from "./admin-page-wrapper"

export default async function AdminPage() {
  const { user, profile, isAdmin } = await requireAdmin()
  
  if (!user || !profile || !isAdmin) {
    redirect("/auth/login?redirect=/admin")
  }

  const supabase = await getSupabaseServerClient()
  
  // Fetch comprehensive stats
  const [
    { count: totalUsers },
    { count: totalFixtures },
    { count: totalTournaments },
    { count: totalQuizzes },
    { count: totalTeams },
    { count: liveFixtures },
    { count: activeTournaments },
    { count: scheduledFixtures },
    { count: completedFixtures },
    { data: recentUsers },
    { data: upcomingFixtures },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("fixtures").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("tournaments").select("*", { count: "exact", head: true }),
    supabase.from("quizzes").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("fixtures").select("*", { count: "exact", head: true }).eq("status", "live").is("deleted_at", null),
    supabase.from("tournaments").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("fixtures").select("*", { count: "exact", head: true }).eq("status", "scheduled").is("deleted_at", null),
    supabase.from("fixtures").select("*", { count: "exact", head: true }).eq("status", "completed").is("deleted_at", null),
    supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("fixtures").select("*, sport:sports(name), team_a:teams!fixtures_team_a_id_fkey(name), team_b:teams!fixtures_team_b_id_fkey(name)").eq("status", "scheduled").is("deleted_at", null).order("scheduled_at", { ascending: true }).limit(5),
  ])
  
  const stats = [
    {
      title: "Total Users",
      value: totalUsers || 0,
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "indigo",
      href: "/admin/users",
    },
    {
      title: "Total Fixtures",
      value: totalFixtures || 0,
      change: "+8.2%",
      trend: "up",
      icon: Calendar,
      color: "green",
      href: "/admin/fixtures",
    },
    {
      title: "Tournaments",
      value: totalTournaments || 0,
      change: "+5.1%",
      trend: "up",
      icon: Trophy,
      color: "yellow",
      href: "/admin/tournaments",
    },
    {
      title: "Active Quizzes",
      value: totalQuizzes || 0,
      change: "+15.3%",
      trend: "up",
      icon: Brain,
      color: "purple",
      href: "/admin/quizzes",
    },
    {
      title: "Teams",
      value: totalTeams || 0,
      change: "+3.7%",
      trend: "up",
      icon: Shield,
      color: "blue",
      href: "/admin/teams",
    },
    {
      title: "Live Now",
      value: liveFixtures || 0,
      change: null,
      trend: null,
      icon: Activity,
      color: "red",
      href: "/admin/live",
      pulse: true,
    },
  ]

  const colorClasses = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
    green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  }

  return (
    <AdminPageWrapper>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-600 mt-2">
            Welcome back, {profile.full_name || "Admin"}! Here's what's happening with your platform.
          </p>
        </div>

        {/* Alert for live fixtures */}
        {liveFixtures && liveFixtures > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <Activity className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{liveFixtures}</strong> fixture{liveFixtures > 1 ? 's are' : ' is'} currently live.{" "}
              <Link href="/admin/live" className="underline font-medium">
                Monitor now →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            const colors = colorClasses[stat.color as keyof typeof colorClasses]

            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-600 mb-1">
                          {stat.title}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-slate-900">
                            {stat.value.toLocaleString()}
                          </p>
                          {stat.pulse && stat.value > 0 && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                        </div>
                        {stat.change && (
                          <div className="flex items-center gap-1 mt-2">
                            {stat.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                              {stat.change}
                            </span>
                            <span className="text-sm text-slate-500">vs last month</span>
                        </div>
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${colors.bg} group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/users">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-slate-900">{user.full_name || "No name"}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4">No recent users</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Fixtures */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Fixtures</CardTitle>
                  <CardDescription>Next scheduled matches</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/fixtures">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingFixtures && upcomingFixtures.length > 0 ? (
                  upcomingFixtures.map((fixture) => (
                    <div key={fixture.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">
                          {fixture.team_a?.name} vs {fixture.team_b?.name}
                        </p>
                        <p className="text-xs text-slate-500">{fixture.sport?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {new Date(fixture.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4">No upcoming fixtures</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Fixture Status Overview</CardTitle>
            <CardDescription>Current status of all fixtures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{scheduledFixtures || 0}</p>
                <p className="text-sm text-slate-600 mt-1">Scheduled</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-600">{liveFixtures || 0}</p>
                <p className="text-sm text-slate-600 mt-1">Live</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-600">{completedFixtures || 0}</p>
                <p className="text-sm text-slate-600 mt-1">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  )
}