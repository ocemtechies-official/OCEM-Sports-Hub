import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, TrendingUp, TrendingDown, Calendar, Zap } from "lucide-react"
import { Separator } from "@/components/ui/separator"

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
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Statistics Available</h3>
          <p className="text-slate-600">Statistics will appear once the team has played matches.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {stats.map((stat) => (
        <Card key={stat.id} className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 p-5">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow">
                {stat.sport?.icon || <Target className="h-5 w-5 text-blue-600" />}
              </div>
              <span className="text-slate-900">{stat.sport?.name || "General"} Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="p-3 bg-blue-100 rounded-full mb-3">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-blue-600 font-medium">Points</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stat.points}</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="p-3 bg-green-100 rounded-full mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-green-600 font-medium">Wins</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stat.wins}</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                <div className="p-3 bg-red-100 rounded-full mb-3">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-sm text-red-600 font-medium">Losses</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{stat.losses}</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="p-3 bg-purple-100 rounded-full mb-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-purple-600 font-medium">Played</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{stat.matches_played}</p>
              </div>
            </div>

            {stat.goals_for !== null && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Goal Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600">Goals For</span>
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{stat.goals_for}</p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-600">Goals Against</span>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-900 mt-1">{stat.goals_against}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600">Goal Difference</span>
                      <Trophy className="h-4 w-4 text-green-600" />
                    </div>
                    <p className={`text-2xl font-bold mt-1 ${
                      stat.goals_for - stat.goals_against > 0 
                        ? "text-green-600" 
                        : stat.goals_for - stat.goals_against < 0 
                          ? "text-red-600" 
                          : "text-slate-600"
                    }`}>
                      {stat.goals_for - stat.goals_against > 0 ? "+" : ""}
                      {stat.goals_for - stat.goals_against}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}