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

interface QuickUpdateCardProps {
  fixture: any
  compact?: boolean
}

export function QuickUpdateCard({ fixture, compact = false }: QuickUpdateCardProps) {
  const [teamAScore, setTeamAScore] = useState(fixture.team_a_score || 0)
  const [teamBScore, setTeamBScore] = useState(fixture.team_b_score || 0)
  const [status, setStatus] = useState(fixture.status)
  const [note, setNote] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<{ name: string; time: string } | null>(null)
  const [undoAvailable, setUndoAvailable] = useState(false)
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Update local state when fixture changes
  useEffect(() => {
    setTeamAScore(fixture.team_a_score || 0)
    setTeamBScore(fixture.team_b_score || 0)
    setStatus(fixture.status)
  }, [fixture])

  const handleScoreUpdate = async (team: 'a' | 'b', delta: number) => {
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
      const response = await fetch(`/api/moderator/fixtures/${fixture.fixture_id}/update-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_a_score: scoreA,
          team_b_score: scoreB,
          status: newStatus,
          expected_version: fixture.version,
          note: note.trim() || undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update fixture')
      }

      // Update last update info
      setLastUpdate({
        name: data.fixture.updated_by_name || 'Unknown',
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

      toast({
        title: "Error",
        description: error.message || "Failed to update score",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
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
              {fixture.team_a_name} vs {fixture.team_b_name}
            </div>
            <div className="text-xs text-slate-500">
              {fixture.sport_name}
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
                disabled={isUpdating || teamAScore <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">{teamAScore}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('a', 1)}
                disabled={isUpdating}
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
                disabled={isUpdating || teamBScore <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">{teamBScore}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('b', 1)}
                disabled={isUpdating}
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
            {fixture.team_a_name} vs {fixture.team_b_name}
          </CardTitle>
          <Badge className={getStatusColor(status)}>
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status}</span>
          </Badge>
        </div>
        <div className="text-sm text-slate-500">
          {fixture.sport_name} • {new Date(fixture.scheduled_at).toLocaleString()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display and Controls */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{teamAScore}</div>
            <div className="text-sm text-slate-600">{fixture.team_a_name}</div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('a', -1)}
                disabled={isUpdating || teamAScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('a', 1)}
                disabled={isUpdating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-2xl font-bold text-slate-400">-</div>
          
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{teamBScore}</div>
            <div className="text-sm text-slate-600">{fixture.team_b_name}</div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('b', -1)}
                disabled={isUpdating || teamBScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('b', 1)}
                disabled={isUpdating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
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
