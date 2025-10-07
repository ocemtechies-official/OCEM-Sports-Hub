import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Target, TrendingUp, TrendingDown } from "lucide-react"

interface TeamStatsProps {
  teamId: string
}

export async function TeamStats({ teamId }: TeamStatsProps) {
  const supabase = await getSupabaseServerClient()

  const { data: stats } = await supabase
    .from("leaderboards")
    .select("*, sport:sports(*)")
    .eq("team_id", teamId)
    .order("points", { ascending: false })

  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-500">No statistics available yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {stats.map((stat) => (
        <Card key={stat.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stat.sport?.icon} {stat.sport?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Trophy className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Points</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.points}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Wins</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.wins}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-3 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Losses</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.losses}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Played</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.matches_played}</p>
                </div>
              </div>
            </div>

            {stat.goals_for !== null && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Goals For / Against</span>
                  <span className="font-semibold text-slate-900">
                    {stat.goals_for} / {stat.goals_against}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-600">Goal Difference</span>
                  <span
                    className={`font-semibold ${
                      stat.goals_for - stat.goals_against > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.goals_for - stat.goals_against > 0 ? "+" : ""}
                    {stat.goals_for - stat.goals_against}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
