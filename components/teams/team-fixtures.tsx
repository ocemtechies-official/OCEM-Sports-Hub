import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, MapPin, Zap, Trophy, Target, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface TeamFixturesProps {
  teamId: string
}

export async function TeamFixtures({ teamId }: TeamFixturesProps) {
  const supabase = await getSupabaseServerClient()

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(
      `
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `,
    )
    .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
    .order("scheduled_at", { ascending: false })

  if (!fixtures || fixtures.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Fixtures Scheduled</h3>
          <p className="text-slate-600">Fixtures will appear once they are scheduled for this team.</p>
        </CardContent>
      </Card>
    )
  }

  // Group fixtures by status
  const liveFixtures = fixtures.filter(f => f.status === "live")
  const upcomingFixtures = fixtures.filter(f => f.status === "scheduled")
  const pastFixtures = fixtures.filter(f => f.status === "completed")

  return (
    <div className="space-y-6">
      {/* Live Fixtures */}
      {liveFixtures.length > 0 && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 p-5">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Zap className="h-5 w-5" />
              Live Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {liveFixtures.map((fixture) => {
                const isTeamA = fixture.team_a_id === teamId
                const opponent = isTeamA ? fixture.team_b : fixture.team_a
                const teamScore = isTeamA ? fixture.team_a_score : fixture.team_b_score
                const opponentScore = isTeamA ? fixture.team_b_score : fixture.team_a_score

                return (
                  <div key={fixture.id} className="p-5 hover:bg-red-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow">
                          {fixture.sport?.icon || <Target className="h-4 w-4 text-white" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">vs {opponent?.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Live Now</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">
                            {teamScore} - {opponentScore}
                          </p>
                          <Badge variant="destructive" className="mt-1 animate-pulse">
                            LIVE
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Fixtures */}
      {upcomingFixtures.length > 0 && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 p-5">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="h-5 w-5" />
              Upcoming Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {upcomingFixtures.map((fixture) => {
                const isTeamA = fixture.team_a_id === teamId
                const opponent = isTeamA ? fixture.team_b : fixture.team_a

                return (
                  <div key={fixture.id} className="p-5 hover:bg-blue-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow">
                          {fixture.sport?.icon || <Target className="h-4 w-4 text-white" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">vs {opponent?.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(fixture.scheduled_at), "PPp")}</span>
                          </div>
                          {fixture.venue && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{fixture.venue}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="border-2 border-blue-200 text-blue-700">
                          Upcoming
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Fixtures */}
      {pastFixtures.length > 0 && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 p-5">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Trophy className="h-5 w-5" />
              Match History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {pastFixtures.map((fixture) => {
                const isTeamA = fixture.team_a_id === teamId
                const opponent = isTeamA ? fixture.team_b : fixture.team_a
                const teamScore = isTeamA ? fixture.team_a_score : fixture.team_b_score
                const opponentScore = isTeamA ? fixture.team_b_score : fixture.team_a_score

                return (
                  <div key={fixture.id} className="p-5 hover:bg-green-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow">
                          {fixture.sport?.icon || <Target className="h-4 w-4 text-white" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">vs {opponent?.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(fixture.scheduled_at), "PP")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">
                            {teamScore} - {opponentScore}
                          </p>
                          {fixture.winner_id === teamId && (
                            <Badge variant="default" className="mt-1 bg-green-600">
                              Won
                            </Badge>
                          )}
                          {fixture.winner_id === opponent?.id && (
                            <Badge variant="destructive" className="mt-1">
                              Lost
                            </Badge>
                          )}
                          {!fixture.winner_id && (
                            <Badge variant="secondary" className="mt-1">
                              Draw
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}