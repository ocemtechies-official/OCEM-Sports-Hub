"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Trophy, Plus, X, Users, Calendar } from "lucide-react"

interface Sport {
  id: string
  name: string
  icon?: string
}

interface Team {
  id: string
  name: string
  color?: string
  sport_id?: string // Add sport_id to the Team interface
}

interface CreateTournamentFormProps {
  sports: Sport[]
  teams: Team[]
}

export function CreateTournamentForm({ sports, teams }: CreateTournamentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sport_id: "",
    tournament_type: "single_elimination",
    max_teams: 16,
    start_date: ""
  })
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const tournamentTypes = [
    { value: "single_elimination", label: "Single Elimination" },
    { value: "double_elimination", label: "Double Elimination" },
    { value: "round_robin", label: "Round Robin" }
  ]

  const maxTeamsOptions = [4, 8, 16, 32, 64]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedTeams.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 teams for the tournament.",
        variant: "destructive"
      })
      return
    }

    if (selectedTeams.length > formData.max_teams) {
      toast({
        title: "Error", 
        description: `Cannot select more than ${formData.max_teams} teams.`,
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selected_teams: selectedTeams
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create tournament')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Tournament created successfully!"
      })

      router.push(`/admin/tournaments`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tournament. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTeamSelection = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId))
    } else if (selectedTeams.length < formData.max_teams) {
      setSelectedTeams([...selectedTeams, teamId])
    } else {
      toast({
        title: "Error",
        description: `Cannot select more than ${formData.max_teams} teams.`,
        variant: "destructive"
      })
    }
  }

  // Filter teams by selected sport
  const filteredTeams = teams.filter(team => !formData.sport_id || team.sport_id === formData.sport_id)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Tournament Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. 2024 Football Championship"
                required
              />
            </div>
            <div>
              <Label htmlFor="sport">Sport *</Label>
              <Select
                value={formData.sport_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, sport_id: value })
                  // Clear selected teams when sport changes
                  setSelectedTeams([])
                }}
                required
              >
                <SelectTrigger>
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
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the tournament"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="tournament_type">Tournament Type</Label>
              <Select
                value={formData.tournament_type}
                onValueChange={(value) => setFormData({ ...formData, tournament_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tournamentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max_teams">Max Teams</Label>
              <Select
                value={formData.max_teams.toString()}
                onValueChange={(value) => setFormData({ ...formData, max_teams: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maxTeamsOptions.map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} teams
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Select Teams
            <Badge variant="secondary">
              {selectedTeams.length} / {formData.max_teams}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.sport_id ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTeams.includes(team.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleTeamSelection(team.id)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: team.color || "#6b7280" }}
                  >
                    {team.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-900 flex-1 min-w-0 truncate">
                    {team.name}
                  </span>
                  {selectedTeams.includes(team.id) && (
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Plus className="h-3 w-3 text-white rotate-45" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p>Please select a sport first to view available teams</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || selectedTeams.length < 2}>
          {isLoading ? "Creating..." : "Create Tournament"}
        </Button>
      </div>
    </form>
  )
}