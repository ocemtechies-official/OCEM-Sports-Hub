import { getSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, MapPin, Zap, Clock, Trophy } from 'lucide-react'

export default async function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { data: fixture } = await supabase
    .from('fixtures')
    .select(`
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (!fixture) notFound()

  const { data: incidents } = await supabase
    .from('match_updates')
    .select('*')
    .eq('fixture_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/70 border border-indigo-100 text-slate-700 capitalize">
                {fixture.status === 'live' ? <Zap className="h-3 w-3 text-red-500" /> : <Clock className="h-3 w-3" />}
                {fixture.status}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {fixture.team_a?.name} <span className="text-slate-400">vs</span> {fixture.team_b?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1"><Trophy className="h-4 w-4 text-amber-600" /> {fixture.sport?.name}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-rose-600" /> {fixture.venue || 'TBD'}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4 text-indigo-600" /> {new Date(fixture.scheduled_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <Link href="/match" className="text-sm text-indigo-700 hover:text-indigo-900 underline">All Matches</Link>
            </div>
          </div>
          {/* Big Score */}
          <div className="mt-6 grid grid-cols-3 items-center">
            <div className="text-center">
              <div className="text-sm text-slate-600 font-medium">{fixture.team_a?.name}</div>
              <div className="text-5xl md:text-6xl font-extrabold text-slate-900">{fixture.team_a_score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-slate-500">Status</div>
              <div className="text-lg md:text-xl font-semibold capitalize text-slate-800">{fixture.status}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-600 font-medium">{fixture.team_b?.name}</div>
              <div className="text-5xl md:text-6xl font-extrabold text-slate-900">{fixture.team_b_score}</div>
            </div>
          </div>
        </div>

        {/* Highlights / Timeline */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(incidents || []).map((i) => (
                  <div key={i.id} className="relative border rounded-xl p-4 bg-white/70">
                    <div className="text-xs text-slate-500">
                      {new Date(i.created_at).toLocaleTimeString()}
                    </div>
                    {i.media_url ? (
                      <div className="mt-3 overflow-hidden rounded-lg border bg-slate-50">
                        <img src={i.media_url} alt={i.note || 'highlight'} className="w-full max-h-96 object-cover" />
                      </div>
                    ) : null}
                    {i.note ? <p className="mt-3 text-slate-800">{i.note}</p> : null}
                  </div>
                ))}
                {(incidents || []).length === 0 ? (
                  <div className="text-sm text-slate-500">No highlights yet.</div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar - Match Info */}
          <Card>
            <CardHeader>
              <CardTitle>Match Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sport</span>
                <span className="font-semibold text-slate-900">{fixture.sport?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Venue</span>
                <span className="font-semibold text-slate-900">{fixture.venue || 'TBD'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Scheduled</span>
                <span className="font-semibold text-slate-900">{new Date(fixture.scheduled_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



