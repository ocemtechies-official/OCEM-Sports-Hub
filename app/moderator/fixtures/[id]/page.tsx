import { requireModerator } from '@/lib/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScoreboardControls } from '@/components/moderator/scoreboard-controls'
import { IncidentComposer } from '@/components/moderator/incident-composer'
import { IncidentFeed } from '@/components/moderator/incident-feed'
import { UndoSnackbar } from '@/components/moderator/undo-snackbar'
import Link from 'next/link'

export default async function ModeratorFixtureControlPage({ params }: { params: { id: string } }) {
  const { user, isModerator } = await requireModerator()
  if (!user || !isModerator) notFound()

  const supabase = await getSupabaseServerClient()
  const { data: fixture } = await supabase
    .from('fixtures')
    .select(`
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `)
    .eq('id', params.id)
    .single()

  if (!fixture) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{fixture.team_a?.name} vs {fixture.team_b?.name}</h1>
          <p className="text-slate-600 text-sm">{fixture.sport?.name} · {fixture.venue || 'TBD'} · {new Date(fixture.scheduled_at).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/match/${fixture.id}`} className="text-sm underline">Public view</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scoreboard Controls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Scoreboard</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreboardControls
              fixtureId={fixture.id}
              teamAName={fixture.team_a?.name}
              teamBName={fixture.team_b?.name}
              teamAScore={fixture.team_a_score}
              teamBScore={fixture.team_b_score}
              status={fixture.status}
              sportName={fixture.sport?.name}
            />
          </CardContent>
        </Card>

        {/* Incident Composer */}
        <Card>
          <CardHeader>
            <CardTitle>Add Incident</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentComposer fixtureId={fixture.id} />
          </CardContent>
        </Card>
      </div>

      {/* History Feed placeholder - client realtime component later */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentFeed fixtureId={fixture.id} />
        </CardContent>
      </Card>

      <UndoSnackbar fixtureId={fixture.id} />
    </div>
  )
}



