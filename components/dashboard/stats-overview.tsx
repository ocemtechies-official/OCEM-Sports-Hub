import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Calendar, Users, Target } from "lucide-react"

export async function StatsOverview() {
  const supabase = await getSupabaseServerClient()

  // Fetch stats - filter out deleted fixtures
  const [{ count: totalFixtures }, { count: liveMatches }, { count: totalTeams }, { count: completedMatches }] =
    await Promise.all([
      supabase.from("fixtures").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("fixtures").select("*", { count: "exact", head: true }).eq("status", "live").is("deleted_at", null),
      supabase.from("teams").select("*", { count: "exact", head: true }),
      supabase.from("fixtures").select("*", { count: "exact", head: true }).eq("status", "completed").is("deleted_at", null),
    ])

  const stats = [
    {
      label: "Total Fixtures",
      value: totalFixtures || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Live Matches",
      value: liveMatches || 0,
      icon: Target,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Teams",
      value: totalTeams || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Completed",
      value: completedMatches || 0,
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
