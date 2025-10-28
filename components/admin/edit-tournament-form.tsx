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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Trash2, Trophy, Calendar, Users } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { ConfirmationModal } from "@/components/admin/ConfirmationModal"

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

interface Tournament {
  id: string
  name: string
  description: string | null
  sport_id: string
  tournament_type: string
  start_date: string | null
  end_date: string | null
  status: string
  winner_id: string | null
  sport: Sport
  winner: Team | null
  tournament_teams: Array<{
    team: Team
  }>
}

interface EditTournamentFormProps {
  tournament: Tournament
  sports: Sport[]
  teams: Team[]
}

export function EditTournamentForm({ tournament, sports, teams }: EditTournamentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  // Helper function to format date for input
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) return ""
      return date.toISOString().slice(0, 16)
    } catch (e) {
      console.error('Error formatting date:', e)
      return ""
    }
  }
  
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: tournament.description || "",
    sport_id: tournament.sport_id,
    tournament_type: tournament.tournament_type,
    start_date: formatDateForInput(tournament.start_date),
    end_date: formatDateForInput(tournament.end_date),
    status: tournament.status,
    winner_id: tournament.winner_id || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Tournament name is required')
      }
      
      if (!formData.sport_id) {
        throw new Error('Sport is required')
      }
      
      if (!formData.tournament_type) {
        throw new Error('Tournament type is required')
      }

      // Validate and format dates
      let startDateIso = null
      let endDateIso = null
      
      if (formData.start_date) {
        try {
          startDateIso = new Date(formData.start_date).toISOString()
        } catch (dateError) {
          console.error('Invalid start date format:', formData.start_date)
          throw new Error('Invalid start date format')
        }
      }
      
      if (formData.end_date) {
        try {
          endDateIso = new Date(formData.end_date).toISOString()
        } catch (dateError) {
          console.error('Invalid end date format:', formData.end_date)
          throw new Error('Invalid end date format')
        }
      }
      
      // Ensure end date is after start date if both are provided
      if (startDateIso && endDateIso) {
        const start = new Date(startDateIso)
        const end = new Date(endDateIso)
        if (end < start) {
          throw new Error('End date must be after start date')
        }
      }

      // Log the data being sent for debugging
      const requestData = {
        ...formData,
        start_date: startDateIso,
        end_date: endDateIso,
        winner_id: formData.winner_id || null
      }
      
      console.log('Sending tournament update request:', requestData)

      const response = await fetch(`/api/admin/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        const errorMessage = errorData.error || errorData.details || `Failed to update tournament (${response.status})`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Tournament update successful:', result)

      notifications.showSuccess({
        title: "Success",
        description: "Tournament updated successfully"
      })

      router.push('/admin/tournaments')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating tournament:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to update tournament"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    // Instead of using confirm(), we'll open the modal
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/tournaments/${tournament.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete tournament')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Tournament deleted successfully"
      })

      router.push('/admin/tournaments')
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting tournament:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to delete tournament"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
      case 'completed':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md'
    }
  }

  const getTournamentTypeColor = (type: string) => {
    switch (type) {
      case 'single_elimination':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
      case 'double_elimination':
        return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
      case 'round_robin':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
      case 'swiss':
        return 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md'
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tournament Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Status</div>
                <Badge className={`${getStatusColor(tournament.status)} px-3 py-1.5 rounded-full text-xs font-bold border-0 shadow-sm`}>
                  {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Teams</div>
                <div className="font-medium">{tournament.tournament_teams?.length || 0}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Type</div>
                <Badge className={`${getTournamentTypeColor(tournament.tournament_type)} px-3 py-1.5 rounded-full text-xs font-bold border-0 shadow-sm`}>
                  {tournament.tournament_type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tournament Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter tournament name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter tournament description"
              rows={3}
            />
          </div>

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
              <Label htmlFor="tournament_type">Tournament Type *</Label>
              <Select
                value={formData.tournament_type}
                onValueChange={(value) => setFormData({ ...formData, tournament_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_elimination">Single Elimination</SelectItem>
                  <SelectItem value="double_elimination">Double Elimination</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="swiss">Swiss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates and Status */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winner Selection (only for completed tournaments) */}
      {formData.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Winner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="winner_id">Tournament Winner</Label>
              <Select
                value={formData.winner_id}
                onValueChange={(value) => setFormData({ ...formData, winner_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select winner" />
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
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Tournament
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/tournaments')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.name.trim()}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Tournament
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tournament"
        description={`Are you sure you want to delete the tournament "${tournament.name}"? This action cannot be undone.`}
        confirmText="Delete Tournament"
        cancelText="Cancel"
        isLoading={loading}
      />
    </form>
  )
}
