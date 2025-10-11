"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Activity, 
  Clock, 
  Trophy, 
  Plus, 
  Minus, 
  Play, 
  Pause,
  RefreshCw,
  Settings
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import { createClient } from "@/lib/supabase/client"

interface Fixture {
  id: string
  scheduled_at: string
  venue: string | null
  status: string
  team_a_score: number
  team_b_score: number
  sport: { name: string; icon: string } | null
  team_a: { name: string; color: string | null } | null
  team_b: { name: string; color: string | null } | null
}

interface LiveMonitorDashboardProps {
  liveFixtures: Fixture[]
  upcomingFixtures: Fixture[]
  recentCompleted: Fixture[]
}

export function LiveMonitorDashboard({ 
  liveFixtures: initialLiveFixtures, 
  upcomingFixtures, 
  recentCompleted 
}: LiveMonitorDashboardProps) {
  const [liveFixtures, setLiveFixtures] = useState(initialLiveFixtures)
  const [updatingFixture, setUpdatingFixture] = useState<string | null>(null)
  const [scoreDialog, setScoreDialog] = useState<{ open: boolean; fixture: Fixture | null }>({
    open: false,
    fixture: null
  })
  const [newScores, setNewScores] = useState({ team_a: 0, team_b: 0 })
  const supabase = createClient()

  // Set up real-time subscription for live fixtures
  useEffect(() => {
    const channel = supabase
      .channel('live-fixtures')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixtures',
          filter: 'status=eq.live'
        },
        (payload) => {
          console.log('Live fixture update:', payload)
          
          if (payload.eventType === 'UPDATE') {
            setLiveFixtures(prev => 
              prev.map(fixture => 
                fixture.id === payload.new.id 
                  ? { ...fixture, ...payload.new }
                  : fixture
              )
            )
          } else if (payload.eventType === 'INSERT') {
            setLiveFixtures(prev => [...prev, payload.new as Fixture])
          } else if (payload.eventType === 'DELETE') {
            setLiveFixtures(prev => prev.filter(fixture => fixture.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleScoreUpdate = async (fixtureId: string, team: 'team_a' | 'team_b', action: 'increment' | 'decrement') => {
    if (!fixture) return

    setUpdatingFixture(fixtureId)
    try {
      const currentScore = team === 'team_a' ? 
        liveFixtures.find(f => f.id === fixtureId)?.team_a_score || 0 :
        liveFixtures.find(f => f.id === fixtureId)?.team_b_score || 0

      const newScore = action === 'increment' ? currentScore + 1 : Math.max(0, currentScore - 1)

      const response = await fetch(`/api/admin/fixtures/${fixtureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport_id: liveFixtures.find(f => f.id === fixtureId)?.sport?.id,
          team_a_id: liveFixtures.find(f => f.id === fixtureId)?.team_a?.id,
          team_b_id: liveFixtures.find(f => f.id === fixtureId)?.team_b?.id,
          scheduled_at: liveFixtures.find(f => f.id === fixtureId)?.scheduled_at,
          venue: liveFixtures.find(f => f.id === fixtureId)?.venue,
          status: 'live',
          team_a_score: team === 'team_a' ? newScore : liveFixtures.find(f => f.id === fixtureId)?.team_a_score,
          team_b_score: team === 'team_b' ? newScore : liveFixtures.find(f => f.id === fixtureId)?.team_b_score,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update score')
      }

      notifications.showSuccess({
        title: "Score Updated",
        description: `${team === 'team_a' ? 'Team A' : 'Team B'} score updated to ${newScore}`
      })
    } catch (error: any) {
      console.error('Error updating score:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to update score"
      })
    } finally {
      setUpdatingFixture(null)
    }
  }

  const handleManualScoreUpdate = async () => {
    if (!scoreDialog.fixture) return

    setUpdatingFixture(scoreDialog.fixture.id)
    try {
      const response = await fetch(`/api/admin/fixtures/${scoreDialog.fixture.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport_id: scoreDialog.fixture.sport?.id,
          team_a_id: scoreDialog.fixture.team_a?.id,
          team_b_id: scoreDialog.fixture.team_b?.id,
          scheduled_at: scoreDialog.fixture.scheduled_at,
          venue: scoreDialog.fixture.venue,
          status: 'live',
          team_a_score: newScores.team_a,
          team_b_score: newScores.team_b,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update scores')
      }

      notifications.showSuccess({
        title: "Scores Updated",
        description: "Match scores updated successfully"
      })

      setScoreDialog({ open: false, fixture: null })
      setNewScores({ team_a: 0, team_b: 0 })
    } catch (error: any) {
      console.error('Error updating scores:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to update scores"
      })
    } finally {
      setUpdatingFixture(null)
    }
  }

  const handleStatusChange = async (fixtureId: string, newStatus: 'live' | 'completed') => {
    setUpdatingFixture(fixtureId)
    try {
      const fixture = liveFixtures.find(f => f.id === fixtureId)
      if (!fixture) return

      const response = await fetch(`/api/admin/fixtures/${fixtureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport_id: fixture.sport?.id,
          team_a_id: fixture.team_a?.id,
          team_b_id: fixture.team_b?.id,
          scheduled_at: fixture.scheduled_at,
          venue: fixture.venue,
          status: newStatus,
          team_a_score: fixture.team_a_score,
          team_b_score: fixture.team_b_score,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }

      notifications.showSuccess({
        title: "Status Updated",
        description: `Match status changed to ${newStatus}`
      })
    } catch (error: any) {
      console.error('Error updating status:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to update status"
      })
    } finally {
      setUpdatingFixture(null)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Live Fixtures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            Live Fixtures
            <Badge variant="destructive" className="ml-2">
              {liveFixtures.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveFixtures.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {liveFixtures.map((fixture) => (
                <Card key={fixture.id} className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{fixture.sport?.icon}</span>
                        <span className="font-medium">{fixture.sport?.name}</span>
                      </div>
                      <Badge className={getStatusColor(fixture.status)}>
                        {fixture.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      {fixture.venue && `${fixture.venue} • `}
                      {formatTime(fixture.scheduled_at)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Teams and Score */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: fixture.team_a?.color || "#3b82f6" }}
                          >
                            {fixture.team_a?.name?.charAt(0)}
                          </div>
                          <span className="font-medium">{fixture.team_a?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScoreUpdate(fixture.id, 'team_a', 'decrement')}
                            disabled={updatingFixture === fixture.id}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-2xl font-bold w-8 text-center">
                            {fixture.team_a_score}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScoreUpdate(fixture.id, 'team_a', 'increment')}
                            disabled={updatingFixture === fixture.id}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: fixture.team_b?.color || "#3b82f6" }}
                          >
                            {fixture.team_b?.name?.charAt(0)}
                          </div>
                          <span className="font-medium">{fixture.team_b?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScoreUpdate(fixture.id, 'team_b', 'decrement')}
                            disabled={updatingFixture === fixture.id}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-2xl font-bold w-8 text-center">
                            {fixture.team_b_score}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScoreUpdate(fixture.id, 'team_b', 'increment')}
                            disabled={updatingFixture === fixture.id}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Dialog 
                        open={scoreDialog.open && scoreDialog.fixture?.id === fixture.id}
                        onOpenChange={(open) => setScoreDialog({ open, fixture: open ? fixture : null })}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Settings className="h-3 w-3 mr-1" />
                            Manual
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manual Score Update</DialogTitle>
                            <DialogDescription>
                              Set exact scores for {fixture.team_a?.name} vs {fixture.team_b?.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="team_a_score">{fixture.team_a?.name} Score</Label>
                              <Input
                                id="team_a_score"
                                type="number"
                                min="0"
                                value={newScores.team_a}
                                onChange={(e) => setNewScores({ ...newScores, team_a: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="team_b_score">{fixture.team_b?.name} Score</Label>
                              <Input
                                id="team_b_score"
                                type="number"
                                min="0"
                                value={newScores.team_b}
                                onChange={(e) => setNewScores({ ...newScores, team_b: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleManualScoreUpdate}
                              disabled={updatingFixture === fixture.id}
                            >
                              Update Scores
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(fixture.id, 'completed')}
                        disabled={updatingFixture === fixture.id}
                        className="flex-1"
                      >
                        <Trophy className="h-3 w-3 mr-1" />
                        Finish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No live fixtures at the moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Fixtures */}
      {upcomingFixtures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Upcoming Fixtures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingFixtures.map((fixture) => (
                <div key={fixture.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{fixture.sport?.icon}</span>
                    <div>
                      <div className="font-medium">
                        {fixture.team_a?.name} vs {fixture.team_b?.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {fixture.venue && `${fixture.venue} • `}
                        {formatTime(fixture.scheduled_at)}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(fixture.id, 'live')}
                    disabled={updatingFixture === fixture.id}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Completed */}
      {recentCompleted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCompleted.map((fixture) => (
                <div key={fixture.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{fixture.sport?.icon}</span>
                    <div>
                      <div className="font-medium">
                        {fixture.team_a?.name} vs {fixture.team_b?.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {fixture.venue && `${fixture.venue} • `}
                        {formatTime(fixture.scheduled_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold">
                    {fixture.team_a_score} - {fixture.team_b_score}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
