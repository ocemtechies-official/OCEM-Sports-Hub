import { getSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, MapPin, Zap, Clock, Trophy, ArrowLeft, Users, Target, Play, Pause, CheckCircle, AlertCircle, Bell, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  // Fetch all types of updates for better categorization
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

  // Determine winner for styling
  const winner = fixture.status === 'completed' 
    ? (fixture.team_a_score > fixture.team_b_score ? fixture.team_a : fixture.team_b) 
    : null

  // Function to get update style based on type
  const getUpdateStyle = (update: any) => {
    // All updates now have update_type: 'incident' but different change_type values
    const changeType = update.change_type || 'manual';
    
    switch (changeType) {
      case 'score_increase':
        return {
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          icon: <Trophy className="h-5 w-5 text-green-600" />,
          title: 'Score Update',
          titleColor: 'text-green-700'
        }
      case 'status_change':
        return {
          bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          icon: update.note?.includes('completed') ? <CheckCircle className="h-5 w-5 text-blue-600" /> : 
                update.note?.includes('live') ? <Zap className="h-5 w-5 text-red-500" /> : 
                <Clock className="h-5 w-5 text-blue-600" />,
          title: 'Status Change',
          titleColor: 'text-blue-700'
        }
      case 'winner':
        return {
          bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50',
          borderColor: 'border-amber-200',
          icon: <Star className="h-5 w-5 text-amber-500 fill-amber-500" />,
          title: 'Winner Announced',
          titleColor: 'text-amber-700'
        }
      case 'result':
        return {
          bgColor: 'bg-gradient-to-r from-purple-50 to-indigo-50',
          borderColor: 'border-purple-200',
          icon: <Trophy className="h-5 w-5 text-purple-600" />,
          title: 'Match Result',
          titleColor: 'text-purple-700'
        }
      case 'manual':
      default:
        // Manual highlights
        return {
          bgColor: 'bg-gradient-to-r from-slate-50 to-gray-50',
          borderColor: 'border-slate-200',
          icon: <AlertCircle className="h-5 w-5 text-slate-600" />,
          title: 'Highlight',
          titleColor: 'text-slate-700'
        }
    }
  }

  // Function to get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'live':
        return {
          bgColor: 'bg-gradient-to-r from-red-500 to-orange-500',
          textColor: 'text-white',
          icon: <Zap className="h-3 w-3 text-white animate-pulse" />,
          pulse: true
        }
      case 'completed':
        return {
          bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-white',
          icon: <CheckCircle className="h-3 w-3 text-white" />,
          pulse: false
        }
      case 'scheduled':
        return {
          bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          textColor: 'text-white',
          icon: <Clock className="h-3 w-3 text-white" />,
          pulse: false
        }
      case 'cancelled':
        return {
          bgColor: 'bg-gradient-to-r from-gray-500 to-slate-600',
          textColor: 'text-white',
          icon: <Pause className="h-3 w-3 text-white" />,
          pulse: false
        }
      default:
        return {
          bgColor: 'bg-gradient-to-r from-gray-500 to-slate-500',
          textColor: 'text-white',
          icon: <Clock className="h-3 w-3 text-white" />,
          pulse: false
        }
    }
  }

  const statusBadgeStyle = getStatusBadgeStyle(fixture.status)

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
          {/* Header with gradient background */}
          <div className="relative p-6 md:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-bold">Match</span>
                  </div>
                  <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${statusBadgeStyle.bgColor} ${statusBadgeStyle.textColor} shadow-lg ${statusBadgeStyle.pulse ? 'animate-pulse' : ''}`}>
                    {statusBadgeStyle.icon}
                    {fixture.status}
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
                  <Link href="/match">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    All Matches
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Big Score */}
            <div className="mt-8 grid grid-cols-3 items-center">
              <div className="text-center">
                <div className="text-sm text-slate-600 font-medium mb-1">{fixture.team_a?.name}</div>
                <div className={`text-5xl md:text-6xl font-extrabold ${
                  winner?.id === fixture.team_a?.id ? 'text-green-600' : 'text-slate-900'
                }`}>
                  {fixture.team_a_score}
                </div>
                {winner?.id === fixture.team_a?.id && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    <Trophy className="h-3 w-3" /> Winner
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Status</div>
                <div className="text-lg md:text-xl font-semibold capitalize text-slate-800">{fixture.status}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600 font-medium mb-1">{fixture.team_b?.name}</div>
                <div className={`text-5xl md:text-6xl font-extrabold ${
                  winner?.id === fixture.team_b?.id ? 'text-green-600' : 'text-slate-900'
                }`}>
                  {fixture.team_b_score}
                </div>
                {winner?.id === fixture.team_b?.id && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    <Trophy className="h-3 w-3" /> Winner
                  </div>
                )}
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

        {/* Highlights / Timeline */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-500" />
                Match Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Scrollable highlights container */}
              <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                <div className="space-y-4 pb-2">
                  {(updates || []).map((update: any, index: number) => {
                    const style = getUpdateStyle(update)
                    return (
                      <div 
                        key={update.id} 
                        className={`relative border rounded-xl p-4 ${style.bgColor} ${style.borderColor} hover:shadow-md transition-all duration-300 hover:scale-[1.01]`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {style.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-semibold ${style.titleColor}`}>
                                {style.title}
                              </span>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(update.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                            
                            {update.media_url ? (
                              <div className="my-3 overflow-hidden rounded-lg border bg-slate-50">
                                <img 
                                  src={update.media_url} 
                                  alt={update.note || 'highlight'} 
                                  className="w-full max-h-64 object-cover hover:scale-105 transition-transform duration-300" 
                                />
                              </div>
                            ) : null}
                            
                            {update.note ? (
                              <p className="text-slate-800">
                                {update.note.length > 200 ? `${update.note.substring(0, 200)}...` : update.note}
                              </p>
                            ) : null}
                            
                            {update.note && update.note.length > 200 ? (
                              <button 
                                onClick={() => {
                                  // In a real implementation, this would expand the note
                                  console.log('Show full note');
                                }}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Read more
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {(updates || []).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No Updates Yet</h3>
                      <p className="text-slate-600 max-w-md mx-auto">Match updates will appear here as the game progresses. Stay tuned for live scores, highlights, and important moments!</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Live updates will appear automatically</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar - Match Info (Sticky) */}
          <div className="md:sticky md:top-8 h-fit">
            <Card className="bg-white border-0 shadow-lg">
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
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-300">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Status
                  </span>
                  <span className={`font-semibold text-slate-900 px-2 py-1 rounded-full text-xs ${statusBadgeStyle.bgColor} ${statusBadgeStyle.textColor}`}>
                    {fixture.status}
                  </span>
                </div>
                {fixture.status === 'completed' && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl mt-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg shadow">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Match Completed</p>
                        <p className="font-bold text-amber-900 text-lg">Final Result</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-amber-600">Final Score</span>
                        <span className="font-bold text-amber-900 text-lg">
                          {fixture.team_a_score} - {fixture.team_b_score}
                        </span>
                      </div>
                      {winner && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-amber-600">Winner</span>
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            {winner.name}
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}