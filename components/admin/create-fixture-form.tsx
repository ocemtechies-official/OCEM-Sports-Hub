"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CreateFixtureFormProps {
  sports: any[]
  teams: any[]
}

export function CreateFixtureForm({ sports, teams }: CreateFixtureFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [sportId, setSportId] = useState("")
  const [teamAId, setTeamAId] = useState("")
  const [teamBId, setTeamBId] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [venue, setVenue] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("fixtures").insert({
      sport_id: sportId,
      team_a_id: teamAId,
      team_b_id: teamBId,
      scheduled_at: scheduledAt,
      venue: venue || null,
      status: "scheduled",
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create fixture. Please try again.",
        variant: "destructive",
      })
      setIsCreating(false)
      return
    }

    toast({
      title: "Success",
      description: "Fixture created successfully!",
    })

    router.push("/admin/fixtures")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="sport">Sport</Label>
        <Select value={sportId} onValueChange={setSportId} required>
          <SelectTrigger id="sport">
            <SelectValue placeholder="Select sport" />
          </SelectTrigger>
          <SelectContent>
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.id}>
                {sport.icon} {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="team-a">Team A</Label>
          <Select value={teamAId} onValueChange={setTeamAId} required>
            <SelectTrigger id="team-a">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-b">Team B</Label>
          <Select value={teamBId} onValueChange={setTeamBId} required>
            <SelectTrigger id="team-b">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id} disabled={team.id === teamAId}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduled-at">Date & Time</Label>
        <Input
          id="scheduled-at"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue (Optional)</Label>
        <Input id="venue" type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Stadium" />
      </div>

      <Button type="submit" disabled={isCreating} className="w-full" size="lg">
        {isCreating ? "Creating..." : "Create Fixture"}
      </Button>
    </form>
  )
}
