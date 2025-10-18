"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Minus, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Clock,
  User
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { IncidentFeed } from "@/components/moderator/incident-feed"

interface QuickUpdateCardProps {
  fixture: any
  compact?: boolean
}

export function QuickUpdateCard({ fixture, compact = false }: QuickUpdateCardProps) {
  // Normalize fields to handle both flattened and nested fixture shapes
  const fixtureId: string = fixture.fixture_id || fixture.id
  const teamAName: string = fixture.team_a_name || fixture.team_a?.name || "Team A"
  const teamBName: string = fixture.team_b_name || fixture.team_b?.name || "Team B"
  const sportName: string = fixture.sport_name || fixture.sport?.name || ""
  const scheduledAt: string = fixture.scheduled_at

  const [teamAScore, setTeamAScore] = useState(fixture.team_a_score || 0)
  const [teamBScore, setTeamBScore] = useState(fixture.team_b_score || 0)
  const [status, setStatus] = useState(fixture.status)
  const [note, setNote] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasPermission, setHasPermission] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<{ name: string; time: string } | null>(null)
  const [undoAvailable, setUndoAvailable] = useState(false)
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const [extra, setExtra] = useState<any>({})
  const [localVersion, setLocalVersion] = useState<number | undefined>(fixture.version)

  // Highlights state
  const [showHighlights, setShowHighlights] = useState(false)
  const [highlightNote, setHighlightNote] = useState("")
  const [highlightMediaUrl, setHighlightMediaUrl] = useState("")
  const [isPostingHighlight, setIsPostingHighlight] = useState(false)

  // Update local state when fixture changes
  useEffect(() => {
    setTeamAScore(fixture.team_a_score || 0)
    setTeamBScore(fixture.team_b_score || 0)
    setStatus(fixture.status)
  }, [fixture])

  const handleScoreUpdate = async (team: 'a' | 'b', delta: number) => {
    if (!hasPermission) return
    if (isUpdating) return

    const newScoreA = team === 'a' ? Math.max(0, teamAScore + delta) : teamAScore
    const newScoreB = team === 'b' ? Math.max(0, teamBScore + delta) : teamBScore

    setTeamAScore(newScoreA)
    setTeamBScore(newScoreB)

    // Debounced update
    if (undoTimeout) {
      clearTimeout(undoTimeout)
    }

    const timeout = setTimeout(async () => {
      await updateFixture(newScoreA, newScoreB, status)
    }, 500)

    setUndoTimeout(timeout)
    setUndoAvailable(true)

    // Hide undo after 10 seconds
    setTimeout(() => setUndoAvailable(false), 10000)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!hasPermission) return
    if (isUpdating) return
    setStatus(newStatus)
    await updateFixture(teamAScore, teamBScore, newStatus)
  }

  const handleUndo = async () => {
    if (isUpdating || !undoTimeout) return

    clearTimeout(undoTimeout)
    setUndoAvailable(false)
    
    // Revert to original values
    setTeamAScore(fixture.team_a_score || 0)
    setTeamBScore(fixture.team_b_score || 0)
    setStatus(fixture.status)
  }

  const updateFixture = async (scoreA: number, scoreB: number, newStatus: string) => {
    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/moderator/fixtures/${fixtureId}/update-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_a_score: scoreA,
          team_b_score: scoreB,
          status: newStatus,
          expected_version: typeof localVersion === 'number' ? localVersion : undefined,
          note: note.trim() || undefined,
          extra: Object.keys(extra).length ? extra : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok || !data?.fixture) {
        if (response.status === 401 || response.status === 403) {
          setHasPermission(false)
          toast({
            title: "Not authorized",
            description: data.error || "You are not authorized to update this fixture.",
            variant: "destructive",
          })
          return
        }
        throw new Error(data.error || 'Failed to update fixture')
      }

      // Sync local state from server response to avoid stale UI
      const fx = data.fixture
      if (typeof fx.team_a_score === 'number') setTeamAScore(fx.team_a_score)
      if (typeof fx.team_b_score === 'number') setTeamBScore(fx.team_b_score)
      if (typeof fx.status === 'string') setStatus(fx.status)
      if (typeof fx.version === 'number') setLocalVersion(fx.version)

      // Update last update info
      const updaterName = fx?.updated_by_profile?.full_name || fx?.updated_by_name || 'Unknown'
      setLastUpdate({
        name: updaterName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      toast({
        title: "Success",
        description: "Score updated successfully!",
      })

      // Clear note after successful update
      if (note.trim()) {
        setNote("")
      }

    } catch (error: any) {
      console.error('Error updating fixture:', error)
      
      // Revert optimistic updates
      setTeamAScore(fixture.team_a_score || 0)
      setTeamBScore(fixture.team_b_score || 0)
      setStatus(fixture.status)

      // Enhanced error handling with specific messages
      let errorTitle = "Update Failed"
      let errorDescription = error.message || "Failed to update score"

      if (error.message?.includes('permission') || error.message?.includes('authorized')) {
        errorTitle = "Permission Denied"
        errorDescription = "You don't have permission to update this fixture. Check your sport assignments or contact an administrator."
        setHasPermission(false)
      } else if (error.message?.includes('concurrent') || error.message?.includes('progress')) {
        errorTitle = "Update Conflict"
        errorDescription = "Another update is in progress. Please wait a moment and try again."
        // Auto-retry after a short delay
        setTimeout(() => {
          updateFixture(teamAScore, teamBScore, status)
        }, 2000)
      } else if (error.message?.includes('not found')) {
        errorTitle = "Fixture Not Found"
        errorDescription = "This fixture may have been deleted or moved. Please refresh the page."
      } else if (error.message?.includes('network') || !navigator.onLine) {
        errorTitle = "Network Error"
        errorDescription = "Check your internet connection and try again."
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const postHighlight = async () => {
    if (!highlightNote.trim() && !highlightMediaUrl.trim()) {
      toast({ title: "Nothing to post", description: "Add a note or media URL.", variant: "destructive" })
      return
    }
    setIsPostingHighlight(true)
    try {
      const res = await fetch(`/api/moderator/fixtures/${fixtureId}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: highlightNote.trim() || null, media_url: highlightMediaUrl.trim() || null })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to post highlight')
      toast({ title: "Posted", description: "Highlight added." })
      setHighlightNote("")
      setHighlightMediaUrl("")
      if (!showHighlights) setShowHighlights(true)
    } catch (e: any) {
      toast({ title: "Error", description: e.message || 'Failed to post highlight', variant: 'destructive' })
    } finally {
      setIsPostingHighlight(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Play className="h-4 w-4" />
      case 'completed': return <Square className="h-4 w-4" />
      case 'cancelled': return <Pause className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  if (compact) {
    return (
      <div className="p-4 border rounded-lg bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="font-medium text-sm">
              {teamAName} vs {teamBName}
            </div>
            <div className="text-xs text-slate-500">
              {sportName}
            </div>
          </div>
          <Badge className={getStatusColor(status)}>
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status}</span>
          </Badge>
        </div>

        {status !== 'scheduled' && (
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('a', -1)}
                disabled={!hasPermission || isUpdating || teamAScore <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">{teamAScore}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('a', 1)}
                disabled={!hasPermission || isUpdating}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <span className="text-slate-400">-</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('b', -1)}
                disabled={!hasPermission || isUpdating || teamBScore <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">{teamBScore}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('b', 1)}
                disabled={!hasPermission || isUpdating}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {undoAvailable && (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleUndo}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Undo
            </Button>
          </div>
        )}

        {lastUpdate && (
          <div className="text-xs text-slate-500 text-center mt-2">
            <User className="h-3 w-3 inline mr-1" />
            Updated by {lastUpdate.name} at {lastUpdate.time}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {teamAName} vs {teamBName}
          </CardTitle>
          <Badge className={getStatusColor(status)}>
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status}</span>
          </Badge>
        </div>
        <div className="text-sm text-slate-500">
          {sportName} • {scheduledAt ? new Date(scheduledAt).toLocaleString() : ""}
        </div>
        {!hasPermission && (
          <div className="text-xs text-red-600 mt-1">
            You are not authorized to update this fixture.
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display and Controls */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{teamAScore}</div>
            <div className="text-sm text-slate-600">{teamAName}</div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('a', -1)}
                disabled={!hasPermission || isUpdating || teamAScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('a', 1)}
                disabled={!hasPermission || isUpdating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-2xl font-bold text-slate-400">-</div>
          
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{teamBScore}</div>
            <div className="text-sm text-slate-600">{teamBName}</div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('b', -1)}
                disabled={!hasPermission || isUpdating || teamBScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('b', 1)}
                disabled={!hasPermission || isUpdating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Select value={status} onValueChange={handleStatusChange} disabled={!hasPermission || isUpdating}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sport-specific extra inputs */}
        {sportName?.toLowerCase() === 'cricket' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">{teamAName} Runs</label>
              <Input type="number" min={0} onChange={(e) => setExtra((p: any) => ({ ...p, runs_a: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">{teamBName} Runs</label>
              <Input type="number" min={0} onChange={(e) => setExtra((p: any) => ({ ...p, runs_b: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">{teamAName} Overs</label>
              <Input type="number" step={0.1} min={0} onChange={(e) => setExtra((p: any) => ({ ...p, overs_a: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">{teamBName} Overs</label>
              <Input type="number" step={0.1} min={0} onChange={(e) => setExtra((p: any) => ({ ...p, overs_b: Number(e.target.value) }))} />
            </div>
          </div>
        )}
        {(sportName?.toLowerCase() === 'volleyball' || sportName?.toLowerCase() === 'tennis' || sportName?.toLowerCase() === 'badminton') && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">{teamAName} Sets Won</label>
              <Input type="number" min={0} onChange={(e) => setExtra((p: any) => ({ ...p, sets_a: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">{teamBName} Sets Won</label>
              <Input type="number" min={0} onChange={(e) => setExtra((p: any) => ({ ...p, sets_b: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Set Scores (comma-separated pairs, e.g. 25-18,25-22,22-25)</label>
              <Input placeholder="e.g. 25-18,25-22,22-25" onChange={(e) => {
                const txt = e.target.value.trim()
                const parts = txt.length ? txt.split(',') : []
                const parsed = parts.map(p => p.split('-').map(n => Number(n)))
                setExtra((prev: any) => ({ ...prev, set_scores: parsed }))
              }} />
            </div>
          </div>
        )}
        {sportName?.toLowerCase() === 'football' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex items-center gap-2">
              <input id="went_to_penalties_${fixtureId}" type="checkbox" onChange={(e) => setExtra((p: any) => ({ ...p, went_to_penalties: e.target.checked }))} />
              <label htmlFor={`went_to_penalties_${fixtureId}`} className="text-sm text-slate-700">Decided by penalties</label>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">{teamAName} Pens</label>
              <Input type="number" min={0} onChange={(e) => setExtra((p: any) => ({ ...p, pens_a: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">{teamBName} Pens</label>
              <Input type="number" min={0} onChange={(e) => setExtra((p: any) => ({ ...p, pens_b: Number(e.target.value) }))} />
            </div>
          </div>
        )}

        {/* Note Input */}
        <div>
          <Textarea
            placeholder="Add a note (optional, max 500 characters)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="resize-none"
            rows={2}
          />
          <div className="text-xs text-slate-500 mt-1">
            {note.length}/500 characters
          </div>
        </div>

        {/* Highlights composer */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Highlights</div>
            <Button variant="outline" size="sm" onClick={() => setShowHighlights(s => !s)}>
              {showHighlights ? 'Hide' : 'Show'} Feed
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="Add a note (optional)" value={highlightNote} onChange={(e) => setHighlightNote(e.target.value)} />
            <Input placeholder="Media URL (optional)" value={highlightMediaUrl} onChange={(e) => setHighlightMediaUrl(e.target.value)} />
          </div>
          <div>
            <Button size="sm" onClick={postHighlight} disabled={isPostingHighlight}>
              {isPostingHighlight ? 'Posting…' : 'Post Highlight'}
            </Button>
          </div>
          {showHighlights && (
            <div className="mt-2">
              <IncidentFeed fixtureId={fixtureId} />
            </div>
          )}
        </div>

        {/* Undo Button */}
        {undoAvailable && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={isUpdating}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Undo Last Change
            </Button>
          </div>
        )}

        {/* Last Update Info */}
        {lastUpdate && (
          <div className="text-sm text-slate-500 text-center">
            <User className="h-4 w-4 inline mr-1" />
            Last updated by {lastUpdate.name} at {lastUpdate.time}
          </div>
        )}

        {/* Loading State */}
        {isUpdating && (
          <div className="text-center text-sm text-slate-500">
            Updating...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
