"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle, Edit, Trash2, Search, Filter, Trophy, Users, Target } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface Sport {
  id: string
  name: string
  icon: string | null
  is_team_sport: boolean
  min_players: number | null
  max_players: number | null
  description: string | null
  rules: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface SportsManagementProps {
  initialSports?: Sport[]
}

export function SportsManagement({ initialSports = [] }: SportsManagementProps) {
  const [sports, setSports] = useState<Sport[]>(initialSports)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const filteredSports = sports.filter(sport => {
    const matchesSearch = sport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sport.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === "all" || 
                       (typeFilter === "team" && sport.is_team_sport) ||
                       (typeFilter === "individual" && !sport.is_team_sport)
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && sport.is_active) ||
                         (statusFilter === "inactive" && !sport.is_active)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const teamSports = sports.filter(sport => sport.is_team_sport)
  const individualSports = sports.filter(sport => !sport.is_team_sport)
  const activeSports = sports.filter(sport => sport.is_active)
  const inactiveSports = sports.filter(sport => !sport.is_active)

  const handleDeleteSport = async (sportId: string) => {
    if (!confirm('Are you sure you want to delete this sport? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/sports/${sportId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete sport')
      }

      // Update local state
      setSports(sports.filter(sport => sport.id !== sportId))

      notifications.showSuccess({
        title: "Sport Deleted ✅",
        description: "Sport has been deleted successfully"
      })

    } catch (error) {
      console.error('Delete sport error:', error)
      notifications.showError({
        title: "Deletion Failed ❌",
        description: error instanceof Error ? error.message : 'Failed to delete sport'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (sportId: string, isActive: boolean) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sports/${sportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !isActive
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update sport status')
      }

      // Update local state
      setSports(sports.map(sport => 
        sport.id === sportId 
          ? { ...sport, is_active: !isActive }
          : sport
      ))

      notifications.showSuccess({
        title: "Sport Updated ✅",
        description: `Sport has been ${!isActive ? 'activated' : 'deactivated'}`
      })

    } catch (error) {
      console.error('Toggle sport status error:', error)
      notifications.showError({
        title: "Update Failed ❌",
        description: "Failed to update sport status"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge> :
      <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>
  }

  const getTypeBadge = (isTeamSport: boolean) => {
    return isTeamSport ? 
      <Badge variant="outline"><Users className="w-3 h-3 mr-1" />Team</Badge> :
      <Badge variant="outline"><Target className="w-3 h-3 mr-1" />Individual</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Sports</p>
                <p className="text-2xl font-bold">{sports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Team Sports</p>
                <p className="text-2xl font-bold">{teamSports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Individual Sports</p>
                <p className="text-2xl font-bold">{individualSports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Sports</p>
                <p className="text-2xl font-bold">{activeSports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search sports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sport Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="team">Team Sports</SelectItem>
                <SelectItem value="individual">Individual Sports</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sports</CardTitle>
          <CardDescription>
            Manage all sports in the system. You can edit, activate/deactivate, or delete sports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSports.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sports found</h3>
              <p className="text-gray-500">No sports match your current filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSports.map((sport) => (
                  <TableRow key={sport.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {sport.icon && <span className="text-lg">{sport.icon}</span>}
                        {sport.name}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(sport.is_team_sport)}</TableCell>
                    <TableCell>
                      {sport.is_team_sport ? (
                        <span className="text-sm text-gray-600">
                          {sport.min_players}-{sport.max_players} players
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">Individual</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(sport.is_active)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {sport.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSport(sport)
                            setDialogOpen(true)
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSport(sport)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(sport.id, sport.is_active)}
                          disabled={loading}
                        >
                          {sport.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSport(sport.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sport Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sport Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected sport
            </DialogDescription>
          </DialogHeader>
          {selectedSport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-600">{selectedSport.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Icon</Label>
                  <p className="text-sm text-gray-600">{selectedSport.icon || 'No icon'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSport.is_team_sport ? 'Team Sport' : 'Individual Sport'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSport.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              {selectedSport.is_team_sport && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Min Players</Label>
                    <p className="text-sm text-gray-600">{selectedSport.min_players || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Max Players</Label>
                    <p className="text-sm text-gray-600">{selectedSport.max_players || 'Not set'}</p>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600">{selectedSport.description || 'No description'}</p>
              </div>
              {selectedSport.rules && (
                <div>
                  <Label className="text-sm font-medium">Rules</Label>
                  <p className="text-sm text-gray-600">{selectedSport.rules}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Sport Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sport</DialogTitle>
            <DialogDescription>
              Update the sport information
            </DialogDescription>
          </DialogHeader>
          {selectedSport && (
            <EditSportForm 
              sport={selectedSport} 
              onClose={() => setEditDialogOpen(false)}
              onUpdate={(updatedSport) => {
                setSports(sports.map(s => s.id === updatedSport.id ? updatedSport : s))
                setEditDialogOpen(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Edit Sport Form Component
function EditSportForm({ 
  sport, 
  onClose, 
  onUpdate 
}: { 
  sport: Sport
  onClose: () => void
  onUpdate: (sport: Sport) => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: sport.name,
    icon: sport.icon || '',
    is_team_sport: sport.is_team_sport,
    min_players: sport.min_players || 1,
    max_players: sport.max_players || 1,
    description: sport.description || '',
    rules: sport.rules || '',
    is_active: sport.is_active
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/sports/${sport.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update sport')
      }

      const { sport: updatedSport } = await response.json()
      onUpdate(updatedSport)

      notifications.showSuccess({
        title: "Sport Updated ✅",
        description: "Sport has been updated successfully"
      })

    } catch (error) {
      console.error('Update sport error:', error)
      notifications.showError({
        title: "Update Failed ❌",
        description: error instanceof Error ? error.message : 'Failed to update sport'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Sport Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="icon">Icon (Emoji)</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="🏏"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_team_sport"
          checked={formData.is_team_sport}
          onCheckedChange={(checked) => setFormData({ ...formData, is_team_sport: checked })}
        />
        <Label htmlFor="is_team_sport">Team Sport</Label>
      </div>

      {formData.is_team_sport && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_players">Min Players</Label>
            <Input
              id="min_players"
              type="number"
              min="1"
              value={formData.min_players}
              onChange={(e) => setFormData({ ...formData, min_players: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="max_players">Max Players</Label>
            <Input
              id="max_players"
              type="number"
              min="1"
              value={formData.max_players}
              onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="rules">Rules</Label>
        <Textarea
          id="rules"
          value={formData.rules}
          onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Sport'}
        </Button>
      </div>
    </form>
  )
}
