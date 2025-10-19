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
  User,
  Trophy,
  Zap,
  CheckCircle,
  X,
  Info,
  Eye,
  EyeOff
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { IncidentFeed } from "@/components/moderator/incident-feed"
import "@/styles/mobile-moderator.css"

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
  const [showTimeline, setShowTimeline] = useState(false)
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

      // Enhanced error handling with specific error codes
      let errorTitle = "Update Failed"
      let errorDescription = "Failed to update score"
      let shouldRetry = false
      
      // Handle structured error responses from API
      const errorCode = error.errorCode || error.code
      const errorType = error.errorType || 'UNKNOWN'
      
      switch (errorCode) {
        case 'SPORT_NOT_ASSIGNED':
          errorTitle = "Sport Not Assigned"
          errorDescription = error.error || "You're not assigned to moderate this sport. Contact an admin to update your assignments."
          setHasPermission(false)
          break
          
        case 'VENUE_NOT_ASSIGNED':
          errorTitle = "Venue Not Assigned"
          errorDescription = error.error || "You're not assigned to moderate fixtures at this venue. Contact an admin to update your assignments."
          setHasPermission(false)
          break
          
        case 'VERSION_MISMATCH':
          errorTitle = "Conflict Detected"
          errorDescription = error.error || "Another user updated this fixture. Please refresh the page and try again."
          break
          
        case 'CONCURRENT_UPDATE':
          errorTitle = "Update in Progress"
          errorDescription = error.error || "Another update is in progress. Please wait a moment and try again."
          shouldRetry = true
          break
          
        case 'RATE_LIMITED':
          errorTitle = "Too Many Updates"
          errorDescription = error.error || "You're updating too quickly. Please wait a moment before trying again."
          break
          
        case 'INVALID_SCORE':
          errorTitle = "Invalid Score"
          errorDescription = error.error || "Score values must be non-negative numbers."
          break
          
        case 'INVALID_SPORT_DATA':
          errorTitle = "Invalid Sport Data"
          errorDescription = error.error || "Please check your sport-specific input values."
          break
          
        case 'FIXTURE_NOT_FOUND':
          errorTitle = "Fixture Not Found"
          errorDescription = error.error || "This fixture may have been deleted. Please refresh the page."
          break
          
        case 'NETWORK_ERROR':
          errorTitle = "Network Error"
          errorDescription = error.error || "Check your internet connection and try again."
          break
          
        case 'UNAUTHORIZED':
          errorTitle = "Access Denied"
          errorDescription = error.error || "You must be logged in as a moderator to update fixtures."
          setHasPermission(false)
          break
          
        default:
          // Fallback to message-based detection for backward compatibility
          if (error.message?.includes('permission') || error.message?.includes('authorized')) {
            errorTitle = "Permission Denied"
            errorDescription = "You don't have permission to update this fixture. Check your sport assignments or contact an administrator."
            setHasPermission(false)
          } else if (error.message?.includes('concurrent') || error.message?.includes('progress')) {
            errorTitle = "Update Conflict"
            errorDescription = "Another update is in progress. Please wait a moment and try again."
            shouldRetry = true
          } else if (error.message?.includes('not found')) {
            errorTitle = "Fixture Not Found"
            errorDescription = "This fixture may have been deleted or moved. Please refresh the page."
          } else if (error.message?.includes('network') || !navigator.onLine) {
            errorTitle = "Network Error"
            errorDescription = "Check your internet connection and try again."
          } else {
            errorDescription = error.message || error.error || "An unexpected error occurred. Please try again."
          }
      }

      // Auto-retry for transient errors
      if (shouldRetry) {
        setTimeout(() => {
          updateFixture(teamAScore, teamBScore, status)
        }, 2000)
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
      // Show timeline after posting
      setShowTimeline(true)
    } catch (e: any) {
      toast({ title: "Error", description: e.message || 'Failed to post highlight', variant: 'destructive' })
    } finally {
      setIsPostingHighlight(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Zap className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  // Sport-specific scoring systems
  const getSportScoringInfo = () => {
    switch (sportName?.toLowerCase()) {
      case 'cricket':
        return {
          title: "Cricket Scoring",
          description: "Track runs and overs for each team",
          icon: <Trophy className="h-4 w-4" />
        }
      case 'volleyball':
      case 'tennis':
      case 'badminton':
        return {
          title: "Set-Based Scoring",
          description: "Track sets won and individual set scores",
          icon: <Trophy className="h-4 w-4" />
        }
      case 'football':
        return {
          title: "Football Scoring",
          description: "Track goals and penalties if applicable",
          icon: <Trophy className="h-4 w-4" />
        }
      default:
        return {
          title: "Standard Scoring",
          description: "Track points for each team",
          icon: <Trophy className="h-4 w-4" />
        }
    }
  }

  const sportScoringInfo = getSportScoringInfo()

  if (compact) {
    return (
      <div className="mobile-moderator-card mobile-moderator-compact bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="font-medium text-sm">
              {teamAName} vs {teamBName}
            </div>
            <div className="text-xs text-slate-500">
              {sportName}
            </div>
          </div>
          <Badge className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status}</span>
          </Badge>
        </div>

        {status !== 'scheduled' && (
          <div className="mobile-moderator-score-row flex items-center justify-between gap-3 mb-3">
            <div className="mobile-moderator-team-score flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('a', -1)}
                disabled={!hasPermission || isUpdating || teamAScore <= 0}
                className="mobile-touch-target h-8 w-8 p-0 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">{teamAScore}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('a', 1)}
                disabled={!hasPermission || isUpdating}
                className="mobile-touch-target h-8 w-8 p-0 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-slate-400">-</span>
            <div className="mobile-moderator-team-score flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('b', -1)}
                disabled={!hasPermission || isUpdating || teamBScore <= 0}
                className="mobile-touch-target h-8 w-8 p-0 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">{teamBScore}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleScoreUpdate('b', 1)}
                disabled={!hasPermission || isUpdating}
                className="mobile-touch-target h-8 w-8 p-0 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {undoAvailable && (
          <div className="flex justify-center mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleUndo}
              className="text-xs mobile-touch-target h-8"
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
    <Card className="mobile-moderator-card bg-white rounded-xl border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-slate-900">
            Match Management
          </CardTitle>
          <Badge className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            <span className="ml-2 capitalize">{status}</span>
          </Badge>
        </div>
        <p className="text-slate-600 mt-2">
          Update scores, manage match status, and add highlights
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Score Display and Controls - Hidden for cricket (uses EnhancedCricketScorecard instead) */}
        {sportName?.toLowerCase() !== 'cricket' && (
          <div className="mobile-moderator-score-display bg-slate-50 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-6 items-center">
              <div className="mobile-moderator-team-column text-center">
                <div className="text-4xl font-bold mb-4 text-slate-900">{teamAScore}</div>
                <div className="text-base font-semibold text-slate-700 mb-4 truncate px-2">{teamAName}</div>
                <div className="mobile-moderator-score-buttons flex justify-center gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleScoreUpdate('a', -1)}
                    disabled={!hasPermission || isUpdating || teamAScore <= 0}
                    className="mobile-touch-target h-12 w-12 p-0 rounded-full bg-white hover:bg-slate-100 border-2 border-slate-300"
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleScoreUpdate('a', 1)}
                    disabled={!hasPermission || isUpdating}
                    className="mobile-touch-target h-12 w-12 p-0 rounded-full bg-white hover:bg-slate-100 border-2 border-slate-300"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              <div className="text-4xl font-bold text-slate-400 text-center">-</div>
              
              <div className="mobile-moderator-team-column text-center">
                <div className="text-4xl font-bold mb-4 text-slate-900">{teamBScore}</div>
                <div className="text-base font-semibold text-slate-700 mb-4 truncate px-2">{teamBName}</div>
                <div className="mobile-moderator-score-buttons flex justify-center gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleScoreUpdate('b', -1)}
                    disabled={!hasPermission || isUpdating || teamBScore <= 0}
                    className="mobile-touch-target h-12 w-12 p-0 rounded-full bg-white hover:bg-slate-100 border-2 border-slate-300"
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleScoreUpdate('b', 1)}
                    disabled={!hasPermission || isUpdating}
                    className="mobile-touch-target h-12 w-12 p-0 rounded-full bg-white hover:bg-slate-100 border-2 border-slate-300"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Controls */}
        <div className="mobile-moderator-form-group">
          <label className="text-base font-semibold text-slate-700 mb-3 block">Match Status</label>
          <Select value={status} onValueChange={handleStatusChange} disabled={!hasPermission || isUpdating}>
            <SelectTrigger className="mobile-moderator-input bg-white border-slate-300 h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>Scheduled</span>
                </div>
              </SelectItem>
              <SelectItem value="live">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-red-500" />
                  <span>Live</span>
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Completed</span>
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center gap-3">
                  <X className="h-5 w-5 text-gray-500" />
                  <span>Cancelled</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sport-specific scoring information - Hidden for cricket (uses EnhancedCricketScorecard instead) */}
        {sportName?.toLowerCase() !== 'cricket' && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow">
                {sportScoringInfo.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{sportScoringInfo.title}</h3>
                <p className="text-sm text-slate-600">{sportScoringInfo.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cricket Specific Controls - REMOVED: Now using EnhancedCricketScorecard component */}
        {/* Old cricket controls with runs_a, runs_b, overs_a, overs_b are deprecated */}
        {false && sportName?.toLowerCase() === 'cricket' && (
          <div className="mobile-moderator-sport-inputs grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-blue-50 rounded-xl border border-blue-200">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Cricket Specific Controls
              </h3>
            </div>
            <div>
              <label className="mobile-moderator-label text-base font-semibold text-slate-700 mb-2 block">{teamAName} Runs</label>
              <Input 
                type="number" 
                min={0} 
                value={extra.runs_a || ""}
                onChange={(e) => setExtra((p: any) => ({ ...p, runs_a: Number(e.target.value) }))} 
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
                placeholder="Total runs"
              />
            </div>
            <div>
              <label className="mobile-moderator-label text-base font-semibold text-slate-700 mb-2 block">{teamBName} Runs</label>
              <Input 
                type="number" 
                min={0} 
                value={extra.runs_b || ""}
                onChange={(e) => setExtra((p: any) => ({ ...p, runs_b: Number(e.target.value) }))} 
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
                placeholder="Total runs"
              />
            </div>
            <div>
              <label className="mobile-moderator-label text-base font-semibold text-slate-700 mb-2 block">{teamAName} Overs</label>
              <Input 
                type="number" 
                step={0.1} 
                min={0} 
                value={extra.overs_a || ""}
                onChange={(e) => setExtra((p: any) => ({ ...p, overs_a: Number(e.target.value) }))} 
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
                placeholder="Overs bowled"
              />
            </div>
            <div>
              <label className="mobile-moderator-label text-base font-semibold text-slate-700 mb-2 block">{teamBName} Overs</label>
              <Input 
                type="number" 
                step={0.1} 
                min={0} 
                value={extra.overs_b || ""}
                onChange={(e) => setExtra((p: any) => ({ ...p, overs_b: Number(e.target.value) }))} 
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
                placeholder="Overs bowled"
              />
            </div>
          </div>
        )}
        {(sportName?.toLowerCase() === 'volleyball' || sportName?.toLowerCase() === 'tennis' || sportName?.toLowerCase() === 'badminton') && (
          <div className="mobile-moderator-sport-inputs grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-green-50 rounded-xl border border-green-200">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-green-600" />
                Set-Based Scoring Controls
              </h3>
            </div>
            <div>
              <label className="mobile-moderator-label text-base font-semibold text-slate-700 mb-2 block">{teamAName} Sets Won</label>
              <Input 
                type="number" 
                min={0} 
                value={extra.sets_a || ""}
                onChange={(e) => setExtra((p: any) => ({ ...p, sets_a: Number(e.target.value) }))} 
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
                placeholder="Sets won"
              />
            </div>
            <div>
              <label className="mobile-moderator-label text-base font-semibold text-slate-700 mb-2 block">{teamBName} Sets Won</label>
              <Input 
                type="number" 
                min={0} 
                value={extra.sets_b || ""}
                onChange={(e) => setExtra((p: any) => ({ ...p, sets_b: Number(e.target.value) }))} 
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
                placeholder="Sets won"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mobile-moderator-label text-base font-semibold text-slate-700 mb-2 block">Set Scores</label>
              <Input 
                placeholder="e.g. 25-18,25-22,22-25" 
                value={extra.set_scores || ""}
                onChange={(e) => setExtra((p: any) => ({ ...p, set_scores: e.target.value }))} 
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
              />
              <p className="text-sm text-slate-500 mt-1">Enter scores for each set separated by commas</p>
            </div>
          </div>
        )}
        {sportName?.toLowerCase() === 'football' && (
          <div className="mobile-moderator-sport-inputs grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-orange-50 rounded-xl border border-orange-200">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-orange-600" />
                Football Specific Controls
              </h3>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input 
                id={`went_to_penalties_${fixtureId}`} 
                type="checkbox" 
                checked={extra.went_to_penalties || false}
                onChange={(e) => setExtra((p: any) => ({ ...p, went_to_penalties: e.target.checked }))} 
                className="mobile-moderator-checkbox h-6 w-6 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor={`went_to_penalties_${fixtureId}`} className="text-base font-semibold text-slate-700">Match decided by penalties</label>
            </div>
            <div>
              <label className="mobile-moderator-label text-base font-semibold text-slate-700 mb-2 block">{teamAName} Penalties</label>
              <Input 
                type="number" 
                min={0} 
                value={extra.pens_a || ""}
                onChange={(e) => setExtra((p: any) => ({ ...p, pens_a: Number(e.target.value) }))} 
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
                placeholder="Penalty goals"
              />
            </div>
            <div>
              <label className="mobile-moderator-label text-base font-semibold text-slate-700 mb-2 block">{teamBName} Penalties</label>
              <Input 
                type="number" 
                min={0} 
                value={extra.pens_b || ""}
                onChange={(e) => setExtra((p: any) => ({ ...p, pens_b: Number(e.target.value) }))} 
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
                placeholder="Penalty goals"
              />
            </div>
          </div>
        )}

        {/* Note Input */}
        <div>
          <label className="text-base font-semibold text-slate-700 mb-3 block">Add Note (Optional)</label>
          <Textarea
            placeholder="Add a note about this update (max 500 characters)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="resize-none mobile-moderator-input bg-white border-slate-300 min-h-[100px] text-base"
          />
          <div className="text-sm text-slate-500 mt-2">
            {note.length}/500 characters
          </div>
        </div>

        {/* Highlights section with improved design */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              Match Highlights
            </div>
          </div>
          
          {/* Post highlight section and toggle button on same line */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input 
                placeholder="Add a note about this highlight" 
                value={highlightNote} 
                onChange={(e) => setHighlightNote(e.target.value)}
                className="mobile-moderator-input bg-white border-slate-300 h-12 text-base w-full"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                size="lg" 
                onClick={postHighlight} 
                disabled={isPostingHighlight}
                className="mobile-touch-target bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6 text-base whitespace-nowrap"
              >
                {isPostingHighlight ? 'Posting…' : 'Post Highlight'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setShowTimeline(s => !s)}
                className="mobile-touch-target h-12 px-4 text-base whitespace-nowrap"
              >
                {showTimeline ? (
                  <>
                    <EyeOff className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="mb-3">
            <Input 
              placeholder="Media URL (optional)" 
              value={highlightMediaUrl} 
              onChange={(e) => setHighlightMediaUrl(e.target.value)}
              className="mobile-moderator-input bg-white border-slate-300 h-12 text-base"
            />
          </div>
          
          {/* Timeline section - toggleable and scrollable */}
          {showTimeline && (
            <div className="mt-2">
              <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                <IncidentFeed fixtureId={fixtureId} />
              </div>
            </div>
          )}
        </div>

        {/* Undo Button */}
        {undoAvailable && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={isUpdating}
              className="mobile-touch-target bg-white hover:bg-slate-50 border-slate-300 h-12 px-6 text-base"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Undo Last Change
            </Button>
          </div>
        )}

        {/* Last Update Info */}
        {lastUpdate && (
          <div className="text-base text-slate-600 text-center pt-4 border-t border-slate-100">
            <User className="h-5 w-5 inline mr-2" />
            Last updated by {lastUpdate.name} at {lastUpdate.time}
          </div>
        )}

        {/* Loading State */}
        {isUpdating && (
          <div className="text-center text-base text-slate-600 py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mr-3"></div>
            Updating match details...
          </div>
        )}
      </CardContent>
    </Card>
  )
}