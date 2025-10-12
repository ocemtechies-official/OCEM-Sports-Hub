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
import { Search, MoreVertical, Download, Edit, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { UpdateScoreDialog } from "@/components/admin/update-score-dialog"
import { RescheduleFixtureDialog } from "@/components/admin/reschedule-fixture-dialog"
import { notifications } from "@/lib/notifications"

interface Fixture {
  id: string
  scheduled_at: string
  venue: string | null
  status: string
  team_a_score: number
  team_b_score: number
  sport: { name: string; icon: string } | null
  team_a: { name: string } | null
  team_b: { name: string } | null
}

interface EnhancedFixtureTableProps {
  fixtures: Fixture[]
}

export function EnhancedFixtureTable({ fixtures }: EnhancedFixtureTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sportFilter, setSportFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "sport" | "status">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedFixtures, setSelectedFixtures] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deletingFixture, setDeletingFixture] = useState<string | null>(null)

  // Get unique sports for filter
  const sports = useMemo(() => {
    const uniqueSports = new Set(fixtures.map(f => f.sport?.name).filter(Boolean))
    return Array.from(uniqueSports)
  }, [fixtures])

  // Filter and sort fixtures
  const filteredAndSortedFixtures = useMemo(() => {
    let filtered = fixtures.filter(fixture => {
      const matchesSearch = 
        fixture.team_a?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fixture.team_b?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fixture.venue?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || fixture.status === statusFilter
      const matchesSport = sportFilter === "all" || fixture.sport?.name === sportFilter

      return matchesSearch && matchesStatus && matchesSport
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
          break
        case "sport":
          comparison = (a.sport?.name || "").localeCompare(b.sport?.name || "")
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [fixtures, searchTerm, statusFilter, sportFilter, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFixtures.length / itemsPerPage)
  const paginatedFixtures = filteredAndSortedFixtures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats
  const scheduledCount = fixtures.filter(f => f.status === 'scheduled').length
  const liveCount = fixtures.filter(f => f.status === 'live').length
  const completedCount = fixtures.filter(f => f.status === 'completed').length

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedFixtures.size === paginatedFixtures.length) {
      setSelectedFixtures(new Set())
    } else {
      setSelectedFixtures(new Set(paginatedFixtures.map(f => f.id)))
    }
  }

  const toggleSelectFixture = (fixtureId: string) => {
    const newSelected = new Set(selectedFixtures)
    if (newSelected.has(fixtureId)) {
      newSelected.delete(fixtureId)
    } else {
      newSelected.add(fixtureId)
    }
    setSelectedFixtures(newSelected)
  }

  // Bulk export
  const handleBulkExport = () => {
    const selectedFixtureData = fixtures.filter(f => selectedFixtures.has(f.id))
    const csv = [
      ["Sport", "Team A", "Team B", "Date", "Venue", "Status", "Score"],
      ...selectedFixtureData.map(f => [
        f.sport?.name || "N/A",
        f.team_a?.name || "N/A",
        f.team_b?.name || "N/A",
        format(new Date(f.scheduled_at), "PPp"),
        f.venue || "N/A",
        f.status,
        f.status !== "scheduled" ? `${f.team_a_score} - ${f.team_b_score}` : "N/A"
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fixtures-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    notifications.showSuccess(`Exported ${selectedFixtures.size} fixtures`)
    setSelectedFixtures(new Set())
  }

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    live: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-slate-100 text-slate-800 border-slate-200",
  }

  // Delete fixture handler
  const handleDeleteFixture = async (fixtureId: string) => {
    if (!confirm('Are you sure you want to delete this fixture? This action cannot be undone.')) {
      return
    }

    setDeletingFixture(fixtureId)
    try {
      const response = await fetch(`/api/admin/fixtures/${fixtureId}`, {
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

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      console.error('Error deleting fixture:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to delete fixture"
      })
    } finally {
      setDeletingFixture(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{scheduledCount}</p>
          <p className="text-sm text-slate-600 mt-1">Scheduled</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-2xl font-bold text-red-600">{liveCount}</p>
          <p className="text-sm text-slate-600 mt-1">Live</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-sm text-slate-600 mt-1">Completed</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          {selectedFixtures.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected ({selectedFixtures.size})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFixtures(new Set())}
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
            placeholder="Search by team or venue..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value)
          setCurrentPage(1)
        }}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sportFilter} onValueChange={(value) => {
          setSportFilter(value)
          setCurrentPage(1)
        }}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {sports.map(sport => (
              <SelectItem key={sport} value={sport}>{sport}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="sport">Sport</SelectItem>
            <SelectItem value="status">Status</SelectItem>
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
                  checked={selectedFixtures.size === paginatedFixtures.length && paginatedFixtures.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFixtures.length > 0 ? (
              paginatedFixtures.map((fixture) => (
                <TableRow key={fixture.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedFixtures.has(fixture.id)}
                      onCheckedChange={() => toggleSelectFixture(fixture.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {fixture.sport?.icon} {fixture.sport?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {fixture.team_a?.name} vs {fixture.team_b?.name}
                    </div>
                    {fixture.venue && (
                      <div className="text-sm text-slate-600">{fixture.venue}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(fixture.scheduled_at), "PPp")}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[fixture.status as keyof typeof statusColors]}>
                      {fixture.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {fixture.status !== "scheduled" ? (
                      <span className="font-semibold">
                        {fixture.team_a_score} - {fixture.team_b_score}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <UpdateScoreDialog fixture={fixture} />
                      <RescheduleFixtureDialog 
                        fixture={fixture} 
                        onSuccess={() => window.location.reload()} 
                      />
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
                            <Link href={`/admin/fixtures/${fixture.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Fixture
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteFixture(fixture.id)}
                            disabled={deletingFixture === fixture.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingFixture === fixture.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No fixtures found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredAndSortedFixtures.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedFixtures.length)} of{" "}
              {filteredAndSortedFixtures.length} fixtures
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
