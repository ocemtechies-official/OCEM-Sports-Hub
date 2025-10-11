"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Save, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { notifications } from "@/lib/notifications"

interface Sport {
  id: string
  name: string
  icon: string
}

interface Team {
  id: string
  name: string
  color: string | null
}

interface Fixture {
  id: string
  sport_id: string
  team_a_id: string
  team_b_id: string
  scheduled_at: string
  venue: string | null
  status: string
  team_a_score: number
  team_b_score: number
  sport: Sport
  team_a: Team
  team_b: Team
}

interface EditFixtureFormProps {
  fixture: Fixture
  sports: Sport[]
  teams: Team[]
}

export function EditFixtureForm({ fixture, sports, teams }: EditFixtureFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    sport_id: fixture.sport_id,
    team_a_id: fixture.team_a_id,
    team_b_id: fixture.team_b_id,
    scheduled_at: new Date(fixture.scheduled_at).toISOString().slice(0, 16),
    venue: fixture.venue || "",
    status: fixture.status,
    team_a_score: fixture.team_a_score,
    team_b_score: fixture.team_b_score,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/fixtures/${fixture.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update fixture')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Fixture updated successfully"
      })

      router.push('/admin/fixtures')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating fixture:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to update fixture"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this fixture? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/fixtures/${fixture.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete fixture')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Fixture deleted successfully"
      })

      router.push('/admin/fixtures')
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting fixture:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to delete fixture"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'live':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(fixture.status)}>
              {fixture.status.charAt(0).toUpperCase() + fixture.status.slice(1)}
            </Badge>
            <span className="text-sm text-slate-600">
              {fixture.team_a?.name} vs {fixture.team_b?.name}
            </span>
            {fixture.status !== 'scheduled' && (
              <span className="text-sm font-medium">
                {fixture.team_a_score} - {fixture.team_b_score}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sport_id">Sport *</Label>
          <Select
            value={formData.sport_id}
            onValueChange={(value) => setFormData({ ...formData, sport_id: value })}
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

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="team_a_id">Team A *</Label>
          <Select
            value={formData.team_a_id}
            onValueChange={(value) => setFormData({ ...formData, team_a_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Team A" />
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
          <Label htmlFor="team_b_id">Team B *</Label>
          <Select
            value={formData.team_b_id}
            onValueChange={(value) => setFormData({ ...formData, team_b_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Team B" />
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
      </div>

      {/* Validation for same teams */}
      {formData.team_a_id === formData.team_b_id && formData.team_a_id && formData.team_b_id && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Team A and Team B must be different teams.
          </AlertDescription>
        </Alert>
      )}

      {/* Date and Venue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduled_at">Date & Time *</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder="Enter venue name"
          />
        </div>
      </div>

      {/* Scores (only show if not scheduled) */}
      {formData.status !== 'scheduled' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="team_a_score">Team A Score</Label>
            <Input
              id="team_a_score"
              type="number"
              min="0"
              value={formData.team_a_score}
              onChange={(e) => setFormData({ ...formData, team_a_score: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_b_score">Team B Score</Label>
            <Input
              id="team_b_score"
              type="number"
              min="0"
              value={formData.team_b_score}
              onChange={(e) => setFormData({ ...formData, team_b_score: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          Delete Fixture
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/fixtures')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || formData.team_a_id === formData.team_b_id}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Fixture
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
