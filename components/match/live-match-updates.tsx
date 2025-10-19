'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Calendar, 
  MapPin, 
  Zap, 
  Clock, 
  Trophy, 
  Users, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Bell, 
  Star,
  Pause,
  Play,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LiveMatchUpdatesProps {
  fixtureId: string
  initialFixture: any
  initialUpdates: any[]
  showTimelineOnly?: boolean
}

export function LiveMatchUpdates({ fixtureId, initialFixture, initialUpdates, showTimelineOnly = false }: LiveMatchUpdatesProps) {
  const [fixture, setFixture] = useState(initialFixture)
  const [updates, setUpdates] = useState(initialUpdates)
  const [isLive, setIsLive] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [refreshInterval, setRefreshInterval] = useState(15000) // 15 seconds default
  const [isConnected, setIsConnected] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  // Function to fetch latest fixture data
  const fetchFixtureData = useCallback(async (forceRefresh = false) => {
    if (isRefreshing && !forceRefresh) return
    
    try {
      setIsRefreshing(true)
      console.log('Fetching latest match data...', { fixtureId, timestamp: new Date().toISOString() })
      
      const { data: fixtureData, error: fixtureError } = await supabase
        .from('fixtures')
        .select(`
          *,
          sport:sports(*),
          team_a:teams!fixtures_team_a_id_fkey(*),
          team_b:teams!fixtures_team_b_id_fkey(*)
        `)
        .eq('id', fixtureId)
        .single()

      if (fixtureError) {
        console.error('Error fetching fixture:', fixtureError)
        throw fixtureError
      }

      const { data: updatesData, error: updatesError } = await supabase
        .from('match_updates')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (updatesError) {
        console.error('Error fetching updates:', updatesError)
        throw updatesError
      }

      const filteredUpdates = (updatesData || []).filter((u: any) => {
        const note = typeof u?.note === 'string' ? u.note.trim() : ''
        const media = typeof u?.media_url === 'string' ? u.media_url.trim() : ''
        return note.length > 0 || media.length > 0
      })

      console.log('Fetched data:', { 
        fixture: fixtureData, 
        updatesCount: filteredUpdates.length,
        previousUpdatesCount: updates.length 
      })

      // Check if there are new updates
      const hasNewUpdates = filteredUpdates.length !== updates.length ||
        (filteredUpdates.length > 0 && updates.length > 0 && 
         filteredUpdates[0]?.id !== updates[0]?.id)

      // Check if score has changed
      const scoreChanged = fixtureData.team_a_score !== fixture.team_a_score ||
        fixtureData.team_b_score !== fixture.team_b_score

      // Check if cricket data has changed (for cricket matches)
      const cricketDataChanged = fixtureData.sport?.name?.toLowerCase() === 'cricket' &&
        JSON.stringify(fixtureData.extra?.cricket) !== JSON.stringify(fixture.extra?.cricket)

      // Check if status has changed
      const statusChanged = fixtureData.status !== fixture.status

      // Always update the data, regardless of changes
      setFixture(fixtureData)
      setUpdates(filteredUpdates)
        
      // Show notification for new updates
      if (hasNewUpdates) {
        toast({
          title: "New Match Update!",
          description: `Latest highlight added to ${fixtureData.team_a?.name} vs ${fixtureData.team_b?.name}`,
        })
      }
      
      if (scoreChanged) {
        toast({
          title: "Score Update!",
          description: `${fixtureData.team_a?.name} ${fixtureData.team_a_score} - ${fixtureData.team_b_score} ${fixtureData.team_b?.name}`,
        })
      }

      if (cricketDataChanged) {
        console.log('Cricket data updated, refreshing display...')
      }
      
      if (statusChanged) {
        toast({
          title: "Status Change!",
          description: `Match is now ${fixtureData.status}`,
        })
      }

      setLastRefresh(new Date())
      setIsConnected(true)
      
    } catch (error) {
      console.error('Error fetching match data:', error)
      setIsConnected(false)
      toast({
        title: "Connection Error",
        description: "Failed to fetch latest match updates. Retrying...",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [fixtureId, supabase, updates, fixture, toast, isRefreshing])

  // Set up polling for live updates
  useEffect(() => {
    if (!isLive) return

    console.log('Setting up polling interval:', refreshInterval)
    const interval = setInterval(() => {
      console.log('Polling for updates...')
      fetchFixtureData()
    }, refreshInterval)
    
    return () => {
      console.log('Clearing polling interval')
      clearInterval(interval)
    }
  }, [fetchFixtureData, refreshInterval, isLive])

  // Initial load
  useEffect(() => {
    console.log('Initial data load')
    fetchFixtureData(true)
  }, []) // Only run once on mount

  // Countdown timer
  useEffect(() => {
    if (!isLive) return

    const timer = setInterval(() => {
      const timeSinceLastRefresh = Date.now() - lastRefresh.getTime()
      const nextRefreshIn = Math.max(0, refreshInterval - timeSinceLastRefresh)
      setCountdown(Math.ceil(nextRefreshIn / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [lastRefresh, refreshInterval, isLive])

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered')
    await fetchFixtureData(true) // Force refresh
  }

  // Determine winner for styling
  const winner = fixture.status === 'completed' 
    ? (fixture.team_a_score > fixture.team_b_score ? fixture.team_a : fixture.team_b) 
    : null

  // Function to get update style based on type
  const getUpdateStyle = (update: any) => {
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
      case 'incident':
        return {
          bgColor: 'bg-gradient-to-r from-rose-50 to-pink-50',
          borderColor: 'border-rose-200',
          icon: <Bell className="h-5 w-5 text-rose-600" />,
          title: 'Incident Reported',
          titleColor: 'text-rose-700'
        }
      case 'manual':
      default:
        return {
          bgColor: 'bg-gradient-to-r from-indigo-50 to-purple-50',
          borderColor: 'border-indigo-200',
          icon: <AlertCircle className="h-5 w-5 text-indigo-600" />,
          title: 'Manual Highlight',
          titleColor: 'text-indigo-700'
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
          bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
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

  // Function to get sport-specific scoring label
  const getScoringLabel = (sport: any) => {
    if (!sport?.scoring_rules) return 'Points';
    
    try {
      const scoringRules = typeof sport.scoring_rules === 'string' 
        ? JSON.parse(sport.scoring_rules) 
        : sport.scoring_rules;
        
      const metric = scoringRules.scoring_metric || 'points';
      
      switch (metric) {
        case 'goals':
          return 'Goals';
        case 'points':
          return 'Points';
        case 'sets':
          return 'Sets';
        case 'runs':
          return 'Runs';
        case 'result':
          return 'Result';
        case 'score':
          return 'Score';
        default:
          return 'Points';
      }
    } catch (e) {
      return 'Points';
    }
  };

  const statusBadgeStyle = getStatusBadgeStyle(fixture.status)

  // If showTimelineOnly is true, only render the timeline section
  if (showTimelineOnly) {
    return (
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-500" />
            Live Match Timeline
            {updates.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {updates.length} updates
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <div className="space-y-4 pb-2">
              {updates.map((update: any, index: number) => {
                const style = getUpdateStyle(update)
                return (
                  <div 
                    key={update.id} 
                    className={`relative border rounded-xl p-4 ${style.bgColor} ${style.borderColor} hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-fade-in`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`absolute left-0 top-0 h-full w-1.75 rounded-l-xl ${
                      update.change_type === 'score_increase' ? 'bg-gradient-to-b from-green-500 to-green-600' :
                      update.change_type === 'status_change' ? 'bg-gradient-to-b from-blue-500 to-blue-600' :
                      update.change_type === 'winner' ? 'bg-gradient-to-b from-amber-500 to-orange-500' :
                      update.change_type === 'result' ? 'bg-gradient-to-b from-purple-500 to-purple-600' :
                      update.change_type === 'incident' ? 'bg-gradient-to-b from-rose-500 to-rose-600' :
                      'bg-gradient-to-b from-indigo-500 to-indigo-600'
                    }`}></div>
                    
                    <div className="flex items-start gap-3 pl-3">
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
                        
                        {update.media_url && (
                          <div className="my-3 overflow-hidden rounded-lg border bg-slate-50">
                            <img 
                              src={update.media_url} 
                              alt={update.note || 'highlight'} 
                              className="w-full max-h-64 object-cover hover:scale-105 transition-transform duration-300" 
                            />
                          </div>
                        )}
                        
                        {update.note && (
                          <p className="text-slate-800">
                            {update.note.length > 200 ? `${update.note.substring(0, 200)}...` : update.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {updates.length === 0 && (
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Otherwise, render only the Live Updates Control Panel and Score Display (without timeline)
  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Live Updates Control Panel */}
      <Card className="bg-white border-0 shadow-lg flex-grow basis-1/2 min-h-[200px]">
        <CardContent className="p-6 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="live-updates"
                  checked={isLive}
                  onCheckedChange={setIsLive}
                />
                <Label htmlFor="live-updates" className="flex items-center gap-2">
                  {isLive ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live Updates
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Paused
                    </>
                  )}
                </Label>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span>
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
                {isRefreshing && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Updating...</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-sm border rounded px-3 py-2"
                disabled={isRefreshing}
              >
                <option value={5000}>5 sec</option>
                <option value={10000}>10 sec</option>
                <option value={15000}>15 sec</option>
                <option value={30000}>30 sec</option>
                <option value={60000}>1 min</option>
              </select>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 px-4 py-2"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                {isRefreshing ? 'Updating...' : 'Refresh Now'}
              </Button>
            </div>
          </div>
          
          {/* Quick info bar */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                Updates: {updates.length} • 
                Score: {fixture.team_a_score} - {fixture.team_b_score} • 
                Status: {fixture.status}
              </span>
              <span>
                {isLive ? `Next refresh in: ${countdown}s` : 'Auto refresh paused'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="bg-white border-0 shadow-lg flex-grow basis-1/2 min-h-[200px]">
        <CardContent className="p-8 h-full flex items-center">
          <div className="grid grid-cols-3 items-center w-full">
            <div className="text-center">
              <div className="text-sm text-slate-600 font-medium mb-3">{fixture.team_a?.name}</div>
              <div className={`text-5xl md:text-6xl font-extrabold ${
                winner?.id === fixture.team_a?.id ? 'text-green-600' : 'text-slate-900'
              }`}>
                {fixture.team_a_score}
              </div>
              {winner?.id === fixture.team_a?.id && (
                <div className="mt-3 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  <Trophy className="h-3 w-3" /> Winner
                </div>
              )}
              <div className="mt-2 text-xs text-slate-500">
                {getScoringLabel(fixture.sport)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Status</div>
              <div className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full ${statusBadgeStyle.bgColor} ${statusBadgeStyle.textColor} shadow-lg ${statusBadgeStyle.pulse ? 'animate-pulse' : ''}`}>
                {statusBadgeStyle.icon}
                {fixture.status.toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-600 font-medium mb-2">{fixture.team_b?.name}</div>
              <div className={`text-5xl md:text-6xl font-extrabold ${
                winner?.id === fixture.team_b?.id ? 'text-green-600' : 'text-slate-900'
              }`}>
                {fixture.team_b_score}
              </div>
              {winner?.id === fixture.team_b?.id && (
                <div className="mt-3 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  <Trophy className="h-3 w-3" /> Winner
                </div>
              )}
              <div className="mt-2 text-xs text-slate-500">
                {getScoringLabel(fixture.sport)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}