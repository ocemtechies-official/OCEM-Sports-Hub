"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, User, Trash2, Mail } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface Team {
  id: string
  name: string
  color: string | null
}

interface Player {
  id: string
  team_id: string
  profile_id: string
  position: string | null
  jersey_number: number | null
  created_at: string
  profile: {
    id: string
    full_name: string | null
    email: string
  }
}

interface TeamPlayersTableProps {
  team: Team
  players: Player[]
}

export function TeamPlayersTable({ team, players }: TeamPlayersTableProps) {
  const [removingPlayer, setRemovingPlayer] = useState<string | null>(null)

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to remove this player from the team?')) {
      return
    }

    setRemovingPlayer(playerId)
    try {
      const response = await fetch(`/api/admin/teams/${team.id}/players/${playerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove player')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Player removed from team successfully"
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      console.error('Error removing player:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to remove player"
      })
    } finally {
      setRemovingPlayer(null)
    }
  }

  const getPositionBadgeColor = (position: string | null) => {
    if (!position) return "bg-slate-100 text-slate-800"
    
    const positionLower = position.toLowerCase()
    if (positionLower.includes('captain') || positionLower.includes('leader')) {
      return "bg-purple-100 text-purple-800"
    }
    if (positionLower.includes('defender') || positionLower.includes('defense')) {
      return "bg-blue-100 text-blue-800"
    }
    if (positionLower.includes('midfielder') || positionLower.includes('midfield')) {
      return "bg-green-100 text-green-800"
    }
    if (positionLower.includes('forward') || positionLower.includes('striker') || positionLower.includes('attack')) {
      return "bg-red-100 text-red-800"
    }
    if (positionLower.includes('goalkeeper') || positionLower.includes('keeper')) {
      return "bg-yellow-100 text-yellow-800"
    }
    return "bg-slate-100 text-slate-800"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Jersey Number</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.length > 0 ? (
            players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {player.profile.full_name || 'No name'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {player.profile.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {player.position ? (
                    <Badge className={getPositionBadgeColor(player.position)}>
                      {player.position}
                    </Badge>
                  ) : (
                    <span className="text-sm text-slate-500">Not specified</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {player.jersey_number ? (
                    <Badge variant="outline">
                      #{player.jersey_number}
                    </Badge>
                  ) : (
                    <span className="text-sm text-slate-500">Not assigned</span>
                  )}
                </TableCell>
                
                <TableCell className="text-sm text-slate-500">
                  {new Date(player.created_at).toLocaleDateString()}
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleRemovePlayer(player.id)}
                        disabled={removingPlayer === player.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {removingPlayer === player.id ? "Removing..." : "Remove from Team"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                No players found for this team.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
