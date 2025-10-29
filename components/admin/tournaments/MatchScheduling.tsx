"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, ExternalLink, RefreshCw, Trophy } from "lucide-react"
import { notifications } from "@/lib/notifications"
import Link from "next/link"

interface Team {
  id: string
  name: string
}

interface Match {
  id: string
  teamA: string | null
  teamB: string | null
  scheduledAt: Date | null
  venue: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled'
}

interface Round {
  id: string
  name: string
  roundNumber: number // Add roundNumber field
  matches: Match[]
}

interface Schedule {
  rounds: Round[]
}

interface MatchSchedulingProps {
  tournament: {
    id: string
    tournament_rounds: Array<{
      id: string
      round_name: string
      fixtures: Array<{
        id: string
        team_a?: { id: string; name: string } | null
        team_b?: { id: string; name: string } | null
        scheduled_at: string | null
        venue?: string | null
        status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled'
      }>
    }>
  }
}

export function MatchScheduling({ tournament }: MatchSchedulingProps) {
  const [loading, setLoading] = useState(true) // Start with loading state
  const [schedule, setSchedule] = useState<Schedule>({
    rounds: [],
  })
  const [initialLoad, setInitialLoad] = useState(true)

  // Refresh data when component is mounted
  useEffect(() => {
    refreshScheduleData()
    
    // Set up periodic refresh every 2 minutes (don't show notifications for periodic refresh)
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/tournaments/${tournament.id}`)
        if (response.ok) {
          const result = await response.json()
          const updatedTournament = result.data
          
          if (updatedTournament && updatedTournament.tournament_rounds) {
            setSchedule({
              rounds: updatedTournament.tournament_rounds.map((round: any) => ({
                id: round.id,
                name: round.round_name,
                roundNumber: round.round_number, // Add round_number for sorting
                matches: round.fixtures?.map((match: any) => ({
                  id: match.id,
                  teamA: match.team_a?.name || null,
                  teamB: match.team_b?.name || null,
                  scheduledAt: match.scheduled_at ? new Date(match.scheduled_at) : null,
                  venue: match.venue || "",
                  status: match.status,
                })) || [],
              })) || [],
            })
          }
        }
      } catch (error) {
        // Don't show notifications for periodic refresh errors
      }
    }, 120000)
    
    // Listen for bracket updates
    const handleBracketUpdate = (event: CustomEvent) => {
      if (event.detail.tournamentId === tournament.id) {
        refreshScheduleData()
      }
    }
    
    window.addEventListener('tournamentBracketUpdated', handleBracketUpdate as EventListener)
    
    // Clean up interval and event listener on component unmount
    return () => {
      clearInterval(interval)
      window.removeEventListener('tournamentBracketUpdated', handleBracketUpdate as EventListener)
    }
  }, [tournament.id])

  const refreshScheduleData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/tournaments/${tournament.id}`)
      if (response.ok) {
        const result = await response.json()
        const updatedTournament = result.data
        
        if (updatedTournament && updatedTournament.tournament_rounds) {
          setSchedule({
            rounds: updatedTournament.tournament_rounds.map((round: any) => ({
              id: round.id,
              name: round.round_name,
              roundNumber: round.round_number, // Add round_number for sorting
              matches: round.fixtures?.map((match: any) => ({
                id: match.id,
                teamA: match.team_a?.name || null,
                teamB: match.team_b?.name || null,
                scheduledAt: match.scheduled_at ? new Date(match.scheduled_at) : null,
                venue: match.venue || "",
                status: match.status,
              })) || [],
            })) || [],
          })
          
          // Show success notification only when manually refreshing
          if (!initialLoad) {
            notifications.showSuccess({
              title: "Success",
              description: "Schedule data refreshed successfully"
            })
          }
        }
      }
    } catch (error) {
      if (!initialLoad) {
        notifications.showError({
          title: "Error",
          description: "Failed to refresh schedule data"
        })
      }
    } finally {
      setLoading(false)
      if (initialLoad) {
        setInitialLoad(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Collect all the modified fixtures
      const updatedFixtures: Array<{id: string, scheduledAt: Date | null, venue: string, status: string}> = []
      
      schedule.rounds.forEach(round => {
        round.matches.forEach(match => {
          updatedFixtures.push({
            id: match.id,
            scheduledAt: match.scheduledAt,
            venue: match.venue,
            status: match.status
          })
        })
      })

      // Update each fixture individually using the new API endpoint
      const updatePromises = updatedFixtures.map(async (fixture) => {
        // Prepare the data for the API call
        const updateData: any = {
          fixtureId: fixture.id
        }
        
        // Only include fields that have actually changed
        if (fixture.scheduledAt !== undefined) {
          updateData.scheduledAt = fixture.scheduledAt ? fixture.scheduledAt.toISOString() : null
        }
        
        if (fixture.venue !== undefined) {
          updateData.venue = fixture.venue || null
        }
        
        if (fixture.status !== undefined) {
          updateData.status = fixture.status || 'scheduled'
        }

        const response = await fetch(`/api/admin/tournaments/${tournament.id}/fixtures/update-details`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to update fixture ${fixture.id}`)
        }

        return response.json()
      })

      // Wait for all updates to complete
      await Promise.all(updatePromises)

      notifications.showSuccess({
        title: "Success",
        description: "Match schedule updated successfully"
      })
      
      // Refresh the data to ensure consistency
      await refreshScheduleData()
    } catch (error: any) {
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to update match schedule"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateMatchSchedule = (roundId: string, matchId: string, field: string, value: any) => {
    setSchedule(prev => ({
      ...prev,
      rounds: prev.rounds.map((round: Round) => {
        if (round.id === roundId) {
          return {
            ...round,
            matches: round.matches.map((match: Match) => {
              if (match.id === matchId) {
                return { ...match, [field]: value }
              }
              return match
            }),
          }
        }
        return round
      }),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Match Scheduling</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshScheduleData} disabled={loading}>
            {loading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/fixtures">
              <ExternalLink className="mr-2 h-4 w-4" />
              Full Fixture Management
            </Link>
          </Button>
        </div>
      </div>
      
      <Alert>
        <AlertTitle>Individual Fixture Management</AlertTitle>
        <AlertDescription>
          You can update individual fixtures here. For more advanced fixture management, 
          including result entry and fixture creation, please use the full fixture management page.
        </AlertDescription>
      </Alert>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {loading && initialLoad ? (
          // Show loading state for initial load
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-600">Loading schedule data...</p>
            </div>
          </div>
        ) : schedule.rounds.length > 0 ? (
          [...schedule.rounds].sort((a, b) => a.roundNumber - b.roundNumber).map((round: any) => (
            <Card key={round.id}>
              <CardHeader>
                <CardTitle>{round.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Match</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {round.matches?.map((match: any) => (
                      <TableRow key={match.id}>
                        <TableCell>
                          {match.teamA || 'TBD'} vs {match.teamB || 'TBD'}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="datetime-local"
                            value={match.scheduledAt ? new Date(match.scheduledAt).toISOString().slice(0, 16) : ''}
                            onChange={(e) => updateMatchSchedule(round.id, match.id, 'scheduledAt', new Date(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={match.venue}
                            onChange={(e) => updateMatchSchedule(round.id, match.id, 'venue', e.target.value)}
                            placeholder="Enter venue"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={match.status}
                            onValueChange={(value) => updateMatchSchedule(round.id, match.id, 'status', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="postponed">Postponed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        ) : (
          // Show empty state when no rounds exist
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Schedule Data</h3>
              <p className="text-slate-500 mb-4">
                No tournament rounds have been created yet. Generate a bracket to create schedule data.
              </p>
              <Button asChild>
                <Link href={`/admin/tournaments/${tournament.id}`}>
                  Go to Bracket Management
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading || schedule.rounds.length === 0}>
            {loading && !initialLoad ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Schedule
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}