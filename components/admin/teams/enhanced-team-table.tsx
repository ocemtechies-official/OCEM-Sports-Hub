"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Download, Edit, Trash2, Users, Eye, UserPlus } from "lucide-react"
import Link from "next/link"
import { notifications } from "@/lib/notifications"

interface Team {
  id: string
  name: string
  color: string | null
  logo_url: string | null
  created_at: string
  players?: { count: number }[]
}

interface EnhancedTeamTableProps {
  teams: Team[]
}

export function EnhancedTeamTable({ teams }: EnhancedTeamTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "players" | "date">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deletingTeam, setDeletingTeam] = useState<string | null>(null)

  // Filter and sort teams
  const filteredAndSortedTeams = useMemo(() => {
    let filtered = teams.filter(team => 
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "players":
          comparison = (a.players?.[0]?.count || 0) - (b.players?.[0]?.count || 0)
          break
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [teams, searchTerm, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTeams.length / itemsPerPage)
  const paginatedTeams = filteredAndSortedTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats
  const totalPlayers = teams.reduce((sum, t) => sum + (t.players?.[0]?.count || 0), 0)
  const avgPlayersPerTeam = teams.length > 0 ? Math.round(totalPlayers / teams.length) : 0

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedTeams.size === paginatedTeams.length) {
      setSelectedTeams(new Set())
    } else {
      setSelectedTeams(new Set(paginatedTeams.map(t => t.id)))
    }
  }

  const toggleSelectTeam = (teamId: string) => {
    const newSelected = new Set(selectedTeams)
    if (newSelected.has(teamId)) {
      newSelected.delete(teamId)
    } else {
      newSelected.add(teamId)
    }
    setSelectedTeams(newSelected)
  }

  // Bulk export
  const handleBulkExport = () => {
    const selectedTeamData = teams.filter(t => selectedTeams.has(t.id))
    const csv = [
      ["Team Name", "Players", "Color", "Created"],
      ...selectedTeamData.map(t => [
        t.name,
        t.players?.[0]?.count || 0,
        t.color || "N/A",
        new Date(t.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `teams-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    notifications.showSuccess(`Exported ${selectedTeams.size} teams`)
    setSelectedTeams(new Set())
  }

  // Delete team handler
  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone and will fail if the team is used in any fixtures.')) {
      return
    }

    setDeletingTeam(teamId)
    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete team')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Team deleted successfully"
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      console.error('Error deleting team:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to delete team"
      })
    } finally {
      setDeletingTeam(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{teams.length}</p>
          <p className="text-sm text-slate-600 mt-1">Total Teams</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">{totalPlayers}</p>
          <p className="text-sm text-slate-600 mt-1">Total Players</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">{avgPlayersPerTeam}</p>
          <p className="text-sm text-slate-600 mt-1">Avg Players/Team</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          {selectedTeams.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected ({selectedTeams.size})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTeams(new Set())}
              >
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="players">Players</SelectItem>
            <SelectItem value="date">Date Created</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTeams.size === paginatedTeams.length && paginatedTeams.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTeams.length > 0 ? (
              paginatedTeams.map((team) => {
                const playerCount = team.players?.[0]?.count || 0

                return (
                  <TableRow key={team.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTeams.has(team.id)}
                        onCheckedChange={() => toggleSelectTeam(team.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: team.color || "#3b82f6" }}
                        >
                          {team.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border" 
                          style={{ backgroundColor: team.color || "#3b82f6" }} 
                        />
                        <span className="text-sm text-slate-600 font-mono">
                          {team.color || "#3b82f6"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-600" />
                        <span className="font-medium">{playerCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(team.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/teams/${team.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Team
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/teams/${team.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Team
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/teams/${team.id}/players`}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Manage Players
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTeam(team.id)}
                            disabled={deletingTeam === team.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingTeam === team.id ? "Deleting..." : "Delete Team"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No teams found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredAndSortedTeams.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedTeams.length)} of{" "}
              {filteredAndSortedTeams.length} teams
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
