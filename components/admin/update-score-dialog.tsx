"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Target, User, Clock } from "lucide-react"

interface UpdateScoreDialogProps {
  fixture: any
}

export function UpdateScoreDialog({ fixture }: UpdateScoreDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [teamAScore, setTeamAScore] = useState(fixture.team_a_score?.toString() || "0")
  const [teamBScore, setTeamBScore] = useState(fixture.team_b_score?.toString() || "0")
  const [status, setStatus] = useState(fixture.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdatedBy, setLastUpdatedBy] = useState(fixture.updated_by_name || null)

  const handleUpdate = async () => {
    setIsUpdating(true)
    const supabase = getSupabaseBrowserClient()

    const scoreA = Number.parseInt(teamAScore) || 0
    const scoreB = Number.parseInt(teamBScore) || 0

    let winnerId = null
    if (status === "completed") {
      if (scoreA > scoreB) {
        winnerId = fixture.team_a_id
      } else if (scoreB > scoreA) {
        winnerId = fixture.team_b_id
      }
    }

    const { error } = await supabase
      .from("fixtures")
      .update({
        team_a_score: scoreA,
        team_b_score: scoreB,
        status,
        winner_id: winnerId,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        version: (fixture.version || 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fixture.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update score. Please try again.",
        variant: "destructive",
      })
      setIsUpdating(false)
      return
    }

    toast({
      title: "Success",
      description: "Score updated successfully! Real-time updates sent.",
    })

    // Update the last updated by info
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      setLastUpdatedBy(profile?.full_name || user.email || 'Unknown')
    }

    setOpen(false)
    setIsUpdating(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Target className="h-4 w-4 mr-2" />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Match Score</DialogTitle>
          <DialogDescription>
            {fixture.team_a?.name} vs {fixture.team_b?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team-a-score">{fixture.team_a?.name}</Label>
              <Input
                id="team-a-score"
                type="number"
                min="0"
                value={teamAScore}
                onChange={(e) => setTeamAScore(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-b-score">{fixture.team_b?.name}</Label>
              <Input
                id="team-b-score"
                type="number"
                min="0"
                value={teamBScore}
                onChange={(e) => setTeamBScore(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Match Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
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

          <Button onClick={handleUpdate} disabled={isUpdating} className="w-full">
            {isUpdating ? "Updating..." : "Update Score"}
          </Button>

          {/* Last Updated Info */}
          {lastUpdatedBy && (
            <div className="text-sm text-slate-500 text-center pt-2 border-t">
              <div className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                <span>Last updated by {lastUpdatedBy}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
