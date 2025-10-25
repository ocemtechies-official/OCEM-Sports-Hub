"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { GripVertical, Save, Plus, X } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface Team {
  id: string
  name: string
  color?: string | null
}

interface TournamentTeam {
  id: string
  name: string
  seed: number | null
  bracket_position: number | null
}

interface Tournament {
  id: string
  tournament_teams: Array<{
    team: Team
    seed?: number
    bracket_position?: number
  }>
}

interface TeamManagementProps {
  tournament: Tournament
  availableTeams: Team[]
}

export function TeamManagement({ tournament, availableTeams }: TeamManagementProps) {
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState(
    tournament.tournament_teams?.map((tt: any) => ({
      id: tt.team.id,
      name: tt.team.name,
      seed: tt.seed || null,
      bracket_position: tt.bracket_position || null,
    })) || []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/tournaments/${tournament.id}/teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams }),
      })

      if (!response.ok) {
        throw new Error('Failed to update tournament teams')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Tournament teams updated successfully"
      })
    } catch (error: any) {
      console.error('Error updating tournament teams:', error)
      notifications.showError({
        title: "Error",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(teams)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update seeds based on new order
    const updatedItems = items.map((item: TournamentTeam, index: number) => ({
      ...item,
      seed: index + 1,
    }))

    setTeams(updatedItems)
  }

  const removeTeam = (teamId: string) => {
    setTeams(teams.filter((team: TournamentTeam) => team.id !== teamId))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Team List */}
      <Card>
        <CardHeader>
          <CardTitle>Participating Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="teams">
              {(provided: any) => (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: 40 }}></TableHead>
                      <TableHead>Seed</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                    {teams.map((team: TournamentTeam, index: number) => (
                      <Draggable key={team.id} draggableId={String(team.id)} index={index}>
                        {(provided: any, snapshot: any) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={snapshot.isDragging ? "bg-slate-50" : ""}
                          >
                            <TableCell>
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-slate-400" />
                              </div>
                            </TableCell>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{team.name}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTeam(team.id)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Add Teams */}
      <Card>
        <CardHeader>
          <CardTitle>Add Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {availableTeams
              .filter((team: Team) => !teams.find((t: TournamentTeam) => t.id === team.id))
              .map((team: Team) => (
                <div key={team.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span>{team.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTeams([...teams, {
                      id: team.id,
                      name: team.name,
                      seed: teams.length + 1,
                      bracket_position: null,
                    }])}
                  >
                    <Plus className="h-4 w-4 text-blue-500" />
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Teams
            </>
          )}
        </Button>
      </div>
    </form>
  )
}