import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

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
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-500">No fixtures scheduled</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {fixtures.map((fixture) => {
        const isTeamA = fixture.team_a_id === teamId
        const opponent = isTeamA ? fixture.team_b : fixture.team_a
        const teamScore = isTeamA ? fixture.team_a_score : fixture.team_b_score
        const opponentScore = isTeamA ? fixture.team_b_score : fixture.team_a_score

        return (
          <Card key={fixture.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Badge variant="secondary">{fixture.sport?.icon}</Badge>
                  <div>
                    <p className="font-semibold text-slate-900">vs {opponent?.name}</p>
                    <p className="text-sm text-slate-600">{format(new Date(fixture.scheduled_at), "PPp")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {fixture.status === "completed" && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        {teamScore} - {opponentScore}
                      </p>
                      {fixture.winner_id === teamId && (
                        <Badge variant="default" className="bg-green-600">
                          Won
                        </Badge>
                      )}
                      {fixture.winner_id === opponent?.id && <Badge variant="destructive">Lost</Badge>}
                      {!fixture.winner_id && <Badge variant="secondary">Draw</Badge>}
                    </div>
                  )}
                  {fixture.status === "live" && (
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE
                    </Badge>
                  )}
                  {fixture.status === "scheduled" && <Badge variant="outline">Upcoming</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
