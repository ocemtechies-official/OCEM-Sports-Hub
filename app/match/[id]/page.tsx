import { getSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, MapPin, Trophy, ArrowLeft, Users, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LiveMatchUpdates } from '@/components/match/live-match-updates'
import { CricketScoreDisplay } from '@/components/cricket/cricket-score-display'

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
    .is('deleted_at', null) // Filter out deleted fixtures
    .single()

  if (!fixture) notFound()

  // Fetch initial updates for the live component
  const { data: updatesRaw } = await supabase
    .from('match_updates')
    .select('*')
    .eq('fixture_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  const updates = (updatesRaw || []).filter((u: any) => {
    const note = typeof u?.note === 'string' ? u.note.trim() : ''
    const media = typeof u?.media_url === 'string' ? u.media_url.trim() : ''
    return note.length > 0 || media.length > 0
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-green-400/20 to-teal-400/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-yellow-300/15 to-orange-300/15 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-gradient-to-br from-pink-300/15 to-rose-300/15 blur-3xl animate-float" style={{ animationDelay: '6s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 relative z-10">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="relative p-6 md:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-bold">Match</span>
                  </div>
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
                <Button variant="outline" asChild className="border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-lg transition-all duration-300">
                  <Link href="/fixtures">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    All Matches
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Match Stats */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Teams</p>
                  <p className="text-lg font-bold text-blue-900">2</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">Sport</p>
                  <p className="text-lg font-bold text-purple-900">{fixture.sport?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-600">Scheduled</p>
                  <p className="text-lg font-bold text-amber-900">
                    {new Date(fixture.scheduled_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cricket Score Display for Cricket matches */}
        {fixture.sport?.name?.toLowerCase() === 'cricket' && (
          <CricketScoreDisplay
            fixture={fixture}
            teamAData={fixture.extra?.cricket?.team_a}
            teamBData={fixture.extra?.cricket?.team_b}
            isLive={fixture.status === 'live'}
          />
        )}

        {/* Top Section: Live Controls + Score (Left) and Match Info (Right) */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Left Column: Live Updates + Score Display */}
          <div className="md:w-2/3 flex flex-col h-full">
            <LiveMatchUpdates 
              fixtureId={id} 
              initialFixture={fixture} 
              initialUpdates={updates}
              showTimelineOnly={false}
            />
          </div>
          
          {/* Right Column: Match Info */}
          <div className="md:w-1/3 md:sticky md:top-8 h-fit">
            <Card className="bg-white border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-500" />
                  Match Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-300">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Sport
                  </span>
                  <span className="font-semibold text-slate-900">{fixture.sport?.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-300">
                  <span className="text-slate-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Venue
                  </span>
                  <span className="font-semibold text-slate-900">{fixture.venue || 'TBD'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-300">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Scheduled
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {new Date(fixture.scheduled_at).toLocaleDateString()}, {new Date(fixture.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Live Match</p>
                      <p className="font-bold text-blue-900 text-lg">Real-time Updates</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">
                    This page automatically refreshes with the latest scores and highlights. 
                    You can control the refresh rate using the controls above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Width Timeline Section */}
        <div>
          <LiveMatchUpdates 
            fixtureId={id} 
            initialFixture={fixture} 
            initialUpdates={updates}
            showTimelineOnly={true}
          />
        </div>
      </div>
    </div>
  )
}