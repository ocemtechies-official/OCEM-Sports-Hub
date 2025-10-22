"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, Users, Trophy, Filter, Search } from "lucide-react"
import { notifications } from "@/lib/notifications"
import Link from "next/link"
import { Plus } from "lucide-react"

interface Team {
  id: string
  name: string
  team_type: 'official' | 'student_registered'
  source_type: 'admin_created' | 'student_registration'
  sport_id: string
  department?: string
  semester?: string
  gender?: string
  captain_name?: string
  captain_contact?: string
  captain_email?: string
  logo_url?: string
  color?: string
  status: 'active' | 'pending_approval' | 'rejected' | 'inactive'
  approved_by?: string
  approved_at?: string
  original_registration_id?: string
  created_at: string
  updated_at: string
  sports?: {
    id: string
    name: string
    icon?: string
  }
  approved_by_profile?: {
    id: string
    full_name: string
  }
  team_members?: Array<{
    id: string
    member_name: string
    member_contact?: string
    member_position?: string
    member_order: number
    is_captain: boolean
    is_substitute: boolean
  }>
}

interface TeamManagementProps {
  initialTeams?: Team[]
}

export function TeamManagement({ initialTeams = [] }: TeamManagementProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [teamTypeFilter, setTeamTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.captain_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = teamTypeFilter === "all" || team.team_type === teamTypeFilter
    const matchesStatus = statusFilter === "all" || team.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const pendingTeams = teams.filter(team => team.status === 'pending_approval')
  const activeTeams = teams.filter(team => team.status === 'active')
  const rejectedTeams = teams.filter(team => team.status === 'rejected')

  const handleApproveTeam = async (teamId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teams/${teamId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve team')
      }

      // Update local state
      setTeams(teams.map(team => 
        team.id === teamId 
          ? { ...team, status: 'active' as const, approved_at: new Date().toISOString() }
          : team
      ))

      notifications.showSuccess({
        title: "Team Approved ✅",
        description: "Team has been approved and is now active"
      })

    } catch (error) {
      console.error('Approve team error:', error)
      notifications.showError({
        title: "Approval Failed ❌",
        description: "Failed to approve team. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRejectTeam = async (teamId: string, reason?: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teams/${teamId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          reason: reason
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject team')
      }

      // Update local state
      setTeams(teams.map(team => 
        team.id === teamId 
          ? { ...team, status: 'rejected' as const, approved_at: new Date().toISOString() }
          : team
      ))

      notifications.showSuccess({
        title: "Team Rejected ❌",
        description: "Team has been rejected"
      })

    } catch (error) {
      console.error('Reject team error:', error)
      notifications.showError({
        title: "Rejection Failed ❌",
        description: "Failed to reject team. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTeamTypeBadge = (teamType: string) => {
    switch (teamType) {
      case 'official':
        return <Badge variant="outline"><Trophy className="w-3 h-3 mr-1" />Official</Badge>
      case 'student_registered':
        return <Badge variant="outline"><Users className="w-3 h-3 mr-1" />Student</Badge>
      default:
        return <Badge variant="outline">{teamType}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Manage all teams - official and student registrations</p>
          </div>
        <div className="flex flex-col items-start gap-3">
          {/* Create Button */}
          <Button asChild className="mx-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700">
            <Link href="/admin/teams/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Official Team
            </Link>
          </Button>

          {/* Badges Section */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-none bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full shadow-sm"
            >
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              {teams.length} Total Teams
            </Badge>

            <Badge
              variant="outline"
              className="flex items-center gap-1 border-none bg-yellow-100 text-yellow-800 font-medium px-3 py-1 rounded-full shadow-sm"
            >
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              {pendingTeams.length} Pending
            </Badge>
          </div>
        </div>

      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search teams, captains, departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={teamTypeFilter} onValueChange={setTeamTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Team Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="official">Official Teams</SelectItem>
                <SelectItem value="student_registered">Student Teams</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Teams ({teams.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({pendingTeams.length})</TabsTrigger>
          <TabsTrigger value="active">Active Teams ({activeTeams.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedTeams.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TeamTable 
            teams={filteredTeams} 
            onApprove={handleApproveTeam}
            onReject={handleRejectTeam}
            onViewDetails={(team) => {
              setSelectedTeam(team)
              setDialogOpen(true)
            }}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="pending">
          <TeamTable 
            teams={pendingTeams.filter(team => 
              team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              team.captain_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              team.department?.toLowerCase().includes(searchTerm.toLowerCase())
            )} 
            onApprove={handleApproveTeam}
            onReject={handleRejectTeam}
            onViewDetails={(team) => {
              setSelectedTeam(team)
              setDialogOpen(true)
            }}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="active">
          <TeamTable 
            teams={activeTeams.filter(team => 
              team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              team.captain_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              team.department?.toLowerCase().includes(searchTerm.toLowerCase())
            )} 
            onApprove={handleApproveTeam}
            onReject={handleRejectTeam}
            onViewDetails={(team) => {
              setSelectedTeam(team)
              setDialogOpen(true)
            }}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <TeamTable 
            teams={rejectedTeams.filter(team => 
              team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              team.captain_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              team.department?.toLowerCase().includes(searchTerm.toLowerCase())
            )} 
            onApprove={handleApproveTeam}
            onReject={handleRejectTeam}
            onViewDetails={(team) => {
              setSelectedTeam(team)
              setDialogOpen(true)
            }}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Team Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Team Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected team
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <TeamDetails team={selectedTeam} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Team Table Component
function TeamTable({ 
  teams, 
  onApprove, 
  onReject, 
  onViewDetails, 
  loading 
}: {
  teams: Team[]
  onApprove: (teamId: string) => void
  onReject: (teamId: string, reason?: string) => void
  onViewDetails: (team: Team) => void
  loading: boolean
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTeamTypeBadge = (teamType: string) => {
    switch (teamType) {
      case 'official':
        return <Badge variant="outline"><Trophy className="w-3 h-3 mr-1" />Official</Badge>
      case 'student_registered':
        return <Badge variant="outline"><Users className="w-3 h-3 mr-1" />Student</Badge>
      default:
        return <Badge variant="outline">{teamType}</Badge>
    }
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-500">No teams match your current filters.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Captain</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{getTeamTypeBadge(team.team_type)}</TableCell>
                <TableCell>{team.sports?.name || 'N/A'}</TableCell>
                <TableCell>{team.captain_name || 'N/A'}</TableCell>
                <TableCell>{team.department || 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(team.status)}</TableCell>
                <TableCell>{team.team_members?.length || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(team)}
                    >
                      View
                    </Button>
                    {team.status === 'pending_approval' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onApprove(team.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onReject(team.id)}
                          disabled={loading}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Team Details Component
function TeamDetails({ team }: { team: Team }) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {team.name}</div>
            <div><span className="font-medium">Type:</span> {team.team_type}</div>
            <div><span className="font-medium">Sport:</span> {team.sports?.name || 'N/A'}</div>
            <div><span className="font-medium">Status:</span> {team.status}</div>
            {team.color && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Color:</span>
                <div 
                  className="w-4 h-4 rounded-full border" 
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-sm">{team.color}</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Captain Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {team.captain_name || 'N/A'}</div>
            <div><span className="font-medium">Contact:</span> {team.captain_contact || 'N/A'}</div>
            <div><span className="font-medium">Email:</span> {team.captain_email || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Student Info (if applicable) */}
      {team.team_type === 'student_registered' && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><span className="font-medium">Department:</span> {team.department || 'N/A'}</div>
            <div><span className="font-medium">Semester:</span> {team.semester || 'N/A'}</div>
            <div><span className="font-medium">Gender:</span> {team.gender || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Team Members */}
      {team.team_members && team.team_members.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Team Members ({team.team_members.length})</h4>
          <div className="space-y-2">
            {team.team_members
              .sort((a, b) => a.member_order - b.member_order)
              .map((member, index) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {member.member_order}
                    </div>
                    <div>
                      <div className="font-medium">{member.member_name}</div>
                      {member.member_position && (
                        <div className="text-sm text-gray-500">{member.member_position}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.is_captain && (
                      <Badge className="bg-blue-100 text-blue-800">Captain</Badge>
                    )}
                    {member.is_substitute && (
                      <Badge variant="outline">Substitute</Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Approval Info */}
      {team.approved_by_profile && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Approval Information</h4>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Approved by:</span> {team.approved_by_profile.full_name}</div>
            <div><span className="font-medium">Approved at:</span> {new Date(team.approved_at || '').toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  )
}
