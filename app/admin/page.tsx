import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Users, Brain, Trophy, Target, CheckCircle } from "lucide-react"

export default async function AdminPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch stats
  const [
    { count: totalFixtures },
    { count: liveMatches },
    { count: totalTeams },
    { count: totalPlayers },
    { count: totalQuizzes },
    { count: completedMatches },
  ] = await Promise.all([
    supabase.from("fixtures").select("*", { count: "exact", head: true }),
    supabase.from("fixtures").select("*", { count: "exact", head: true }).eq("status", "live"),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("quizzes").select("*", { count: "exact", head: true }),
    supabase.from("fixtures").select("*", { count: "exact", head: true }).eq("status", "completed"),
  ])

  const stats = [
    { label: "Total Fixtures", value: totalFixtures || 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Live Matches", value: liveMatches || 0, icon: Target, color: "text-red-600", bg: "bg-red-50" },
    { label: "Teams", value: totalTeams || 0, icon: Users, color: "text-green-600", bg: "bg-green-50" },
    { label: "Players", value: totalPlayers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Quizzes", value: totalQuizzes || 0, icon: Brain, color: "text-yellow-600", bg: "bg-yellow-50" },
    {
      label: "Completed",
      value: completedMatches || 0,
      icon: CheckCircle,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ]

  const adminSections = [
    {
      title: "Fixtures Management",
      description: "Create, edit, and manage sports fixtures and live scores",
      href: "/admin/fixtures",
      icon: Calendar,
      color: "bg-blue-600",
    },
    {
      title: "Teams & Players",
      description: "Manage teams, players, and rosters",
      href: "/admin/teams",
      icon: Users,
      color: "bg-green-600",
    },
    {
      title: "Quiz Management",
      description: "Create and manage quizzes and questions",
      href: "/admin/quizzes",
      icon: Brain,
      color: "bg-purple-600",
    },
    {
      title: "Leaderboards",
      description: "View and manage tournament standings",
      href: "/admin/leaderboards",
      icon: Trophy,
      color: "bg-yellow-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-slate-600">Manage OCEM Sports Hub event</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {adminSections.map((section) => (
            <Card key={section.title} className="overflow-hidden transition-all hover:shadow-lg">
              <CardHeader>
                <div className={`${section.color} p-3 rounded-lg w-fit mb-4`}>
                  <section.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle>{section.title}</CardTitle>
                <p className="text-sm text-slate-600">{section.description}</p>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={section.href}>Manage</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
