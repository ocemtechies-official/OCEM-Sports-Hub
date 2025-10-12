"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  Users, 
  Calendar, 
  Brain, 
  Trophy, 
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Filter,
  Search
} from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"

interface ReportsData {
  users: {
    reports: Array<{
      id: string
      full_name: string
      email: string
      created_at: string
      updated_at: string
      deleted_at: string | null
    }>
    registrations: Array<{ created_at: string }>
  }
  fixtures: {
    reports: Array<{
      id: string
      sport_id: string
      status: string
      scheduled_at: string
      created_at: string
      updated_at: string
      sports: { name: string } | null
      team_a: { name: string } | null
      team_b: { name: string } | null
    }>
    stats: Array<{ status: string; created_at: string; sport_id: string; sports: { name: string } | null }>
  }
  quizzes: {
    reports: Array<{
      id: string
      title: string
      description: string
      difficulty: string
      created_at: string
      updated_at: string
      deleted_at: string | null
    }>
    attempts: Array<{
      id: string
      quiz_id: string
      user_id: string
      score: number
      completed: boolean
      completed_at: string
      created_at: string
      quizzes: { title: string } | null
      profiles: { full_name: string } | null
    }>
  }
  tournaments: {
    reports: Array<{
      id: string
      name: string
      description: string
      tournament_type: string
      status: string
      start_date: string
      end_date: string
      created_at: string
      updated_at: string
      deleted_at: string | null
    }>
    stats: Array<{ status: string; tournament_type: string; created_at: string }>
  }
  teams: {
    reports: Array<{
      id: string
      name: string
      logo_url: string | null
      color: string | null
      created_at: string
    }>
    registrations: Array<{
      id: string
      user_id: string
      sport_id: string
      team_name: string
      status: string
      created_at: string
      official_team_id: string | null
      sports: { name: string } | null
      profiles: { full_name: string } | null
    }>
  }
  registrations: {
    individual: Array<{
      id: string
      user_id: string
      sport_id: string
      status: string
      created_at: string
      profiles: { full_name: string } | null
      sports: { name: string } | null
    }>
  }
}

interface ReportsDashboardProps {
  data?: ReportsData
}

export function ReportsDashboard({ data: initialData }: ReportsDashboardProps) {
  const [data, setData] = useState<ReportsData | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  useEffect(() => {
    if (!initialData) {
      fetchReportsData()
    }
  }, [initialData])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/reports')
      if (!response.ok) {
        throw new Error('Failed to fetch reports data')
      }
      
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Process data for reports
  const processedData = useMemo(() => {
    if (!data) {
      return {
        userStats: { total: 0, recent: 0, active: 0, inactive: 0 },
        fixtureStats: { total: 0, scheduled: 0, live: 0, completed: 0, cancelled: 0 },
        quizStats: { total: 0, attempts: 0, completed: 0, averageScore: 0 },
        tournamentStats: { total: 0, active: 0, completed: 0, draft: 0 },
        teamStats: { total: 0, registrations: 0, active: 0 },
        registrationStats: { individual: 0, team: 0, total: 0 }
      }
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Filter data based on date range
    const filterByDateRange = (items: any[], dateField: string = 'created_at') => {
      if (dateRange === 'all') return items
      if (dateRange === '7days') {
        return items.filter(item => new Date(item[dateField]) >= sevenDaysAgo)
      }
      if (dateRange === '30days') {
        return items.filter(item => new Date(item[dateField]) >= thirtyDaysAgo)
      }
      return items
    }

    // User analytics
    const userStats = {
      total: data.users?.reports?.length || 0,
      recent: filterByDateRange(data.users?.registrations || []).length,
      active: data.users?.reports?.filter(user => !user.deleted_at).length || 0,
      inactive: data.users?.reports?.filter(user => user.deleted_at).length || 0
    }

    // Fixture analytics
    const fixtureStats = {
      total: data.fixtures?.reports?.length || 0,
      scheduled: data.fixtures?.reports?.filter(f => f.status === 'scheduled').length || 0,
      live: data.fixtures?.reports?.filter(f => f.status === 'live').length || 0,
      completed: data.fixtures?.reports?.filter(f => f.status === 'completed').length || 0,
      cancelled: data.fixtures?.reports?.filter(f => f.status === 'cancelled').length || 0
    }

    // Quiz analytics
    const quizStats = {
      total: data.quizzes?.reports?.length || 0,
      attempts: data.quizzes?.attempts?.length || 0,
      completed: data.quizzes?.attempts?.filter(a => a.completed).length || 0,
      averageScore: data.quizzes?.attempts?.length > 0 
        ? Math.round(data.quizzes.attempts.reduce((sum, a) => sum + a.score, 0) / data.quizzes.attempts.length)
        : 0
    }

    // Tournament analytics
    const tournamentStats = {
      total: data.tournaments?.reports?.length || 0,
      active: data.tournaments?.reports?.filter(t => t.status === 'active').length || 0,
      completed: data.tournaments?.reports?.filter(t => t.status === 'completed').length || 0,
      draft: data.tournaments?.reports?.filter(t => t.status === 'draft').length || 0
    }

    // Team analytics
    const teamStats = {
      total: data.teams?.reports?.length || 0,
      registrations: data.teams?.registrations?.length || 0,
      active: data.teams?.reports?.filter(t => !t.deleted_at).length || 0
    }

    // Registration analytics
    const registrationStats = {
      individual: data.registrations?.individual?.length || 0,
      team: data.teams?.registrations?.length || 0,
      total: (data.registrations?.individual?.length || 0) + (data.teams?.registrations?.length || 0)
    }

    return {
      userStats,
      fixtureStats,
      quizStats,
      tournamentStats,
      teamStats,
      registrationStats
    }
  }, [data, dateRange])

  // Filter data based on search and category
  const filteredData = useMemo(() => {
    if (!data) {
      return {
        users: { reports: [], registrations: [] },
        fixtures: { reports: [], stats: [] },
        quizzes: { reports: [], attempts: [] },
        tournaments: { reports: [], stats: [] },
        teams: { reports: [], registrations: [] },
        registrations: { individual: [] }
      }
    }

    let filtered = { ...data }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      
      filtered.users.reports = filtered.users?.reports?.filter(user =>
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      ) || []
      
      filtered.fixtures.reports = filtered.fixtures?.reports?.filter(fixture =>
        fixture.title?.toLowerCase().includes(searchLower) ||
        fixture.sports?.name?.toLowerCase().includes(searchLower)
      ) || []
      
      filtered.quizzes.reports = filtered.quizzes?.reports?.filter(quiz =>
        quiz.title?.toLowerCase().includes(searchLower) ||
        quiz.description?.toLowerCase().includes(searchLower)
      ) || []
      
      filtered.tournaments.reports = filtered.tournaments?.reports?.filter(tournament =>
        tournament.name?.toLowerCase().includes(searchLower) ||
        tournament.description?.toLowerCase().includes(searchLower)
      ) || []
      
      filtered.teams.reports = filtered.teams?.reports?.filter(team =>
        team.name?.toLowerCase().includes(searchLower) ||
        team.description?.toLowerCase().includes(searchLower)
      ) || []
    }

    return filtered
  }, [data, searchTerm])

  // Early returns after all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingButton loading={true} disabled>
          Loading reports data...
        </LoadingButton>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-red-600 text-center">
          <p className="font-medium">Failed to load reports data</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <LoadingButton onClick={fetchReportsData} loading={loading}>
          Retry
        </LoadingButton>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No reports data available</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'live':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-slate-100 text-slate-800'
      case 'draft':
        return 'bg-slate-100 text-slate-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
          return `"${String(value || '').replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-500" />
            Reports Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Comprehensive reports and analytics for your sports platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <BarChart3 className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search across all data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="fixtures">Fixtures</SelectItem>
                <SelectItem value="quizzes">Quizzes</SelectItem>
                <SelectItem value="tournaments">Tournaments</SelectItem>
                <SelectItem value="teams">Teams</SelectItem>
                <SelectItem value="registrations">Registrations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {processedData.userStats.total}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {processedData.fixtureStats.total}
                </div>
                <div className="text-sm text-gray-600">Total Fixtures</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {processedData.quizStats.total}
                </div>
                <div className="text-sm text-gray-600">Total Quizzes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {processedData.tournamentStats.total}
                </div>
                <div className="text-sm text-gray-600">Tournaments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Target className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {processedData.teamStats.total}
                </div>
                <div className="text-sm text-gray-600">Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100">
                <CheckCircle className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600">
                  {processedData.registrationStats.total}
                </div>
                <div className="text-sm text-gray-600">Registrations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      {(selectedCategory === 'all' || selectedCategory === 'users') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Reports
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(filteredData.users.reports, 'users-report')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{processedData.userStats.total}</div>
                  <div className="text-sm text-blue-600">Total Users</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{processedData.userStats.active}</div>
                  <div className="text-sm text-green-600">Active Users</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{processedData.userStats.recent}</div>
                  <div className="text-sm text-yellow-600">Recent ({dateRange})</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{processedData.userStats.inactive}</div>
                  <div className="text-sm text-red-600">Inactive</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.users.reports.slice(0, 10).map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2 font-medium">{user.full_name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge className={user.deleted_at ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {user.deleted_at ? 'Inactive' : 'Active'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(selectedCategory === 'all' || selectedCategory === 'fixtures') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fixture Reports
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(filteredData.fixtures.reports, 'fixtures-report')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{processedData.fixtureStats.total}</div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{processedData.fixtureStats.scheduled}</div>
                  <div className="text-sm text-yellow-600">Scheduled</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{processedData.fixtureStats.live}</div>
                  <div className="text-sm text-red-600">Live</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{processedData.fixtureStats.completed}</div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{processedData.fixtureStats.cancelled}</div>
                  <div className="text-sm text-gray-600">Cancelled</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Match</th>
                      <th className="text-left p-2">Sport</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Scheduled At</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.fixtures.reports.slice(0, 10).map((fixture) => (
                      <tr key={fixture.id} className="border-b">
                        <td className="p-2 font-medium">
                          {fixture.team_a?.name || 'Team A'} vs {fixture.team_b?.name || 'Team B'}
                        </td>
                        <td className="p-2">{fixture.sports?.name || 'N/A'}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(fixture.status)}>
                            {fixture.status}
                          </Badge>
                        </td>
                        <td className="p-2">{fixture.scheduled_at ? new Date(fixture.scheduled_at).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-2">{new Date(fixture.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(selectedCategory === 'all' || selectedCategory === 'quizzes') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Quiz Reports
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(filteredData.quizzes.reports, 'quizzes-report')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{processedData.quizStats.total}</div>
                  <div className="text-sm text-purple-600">Total Quizzes</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{processedData.quizStats.attempts}</div>
                  <div className="text-sm text-blue-600">Total Attempts</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{processedData.quizStats.completed}</div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{processedData.quizStats.averageScore}%</div>
                  <div className="text-sm text-yellow-600">Avg Score</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Title</th>
                      <th className="text-left p-2">Difficulty</th>
                      <th className="text-left p-2">Attempts</th>
                      <th className="text-left p-2">Avg Score</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.quizzes.reports.slice(0, 10).map((quiz) => {
                      const quizAttempts = filteredData.quizzes.attempts.filter(a => a.quiz_id === quiz.id)
                      const avgScore = quizAttempts.length > 0 
                        ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
                        : 0
                      
                      return (
                        <tr key={quiz.id} className="border-b">
                          <td className="p-2 font-medium">{quiz.title}</td>
                          <td className="p-2">
                            <Badge variant="outline">{quiz.difficulty}</Badge>
                          </td>
                          <td className="p-2">{quizAttempts.length}</td>
                          <td className="p-2">{avgScore}%</td>
                          <td className="p-2">{new Date(quiz.created_at).toLocaleDateString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(selectedCategory === 'all' || selectedCategory === 'tournaments') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tournament Reports
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(filteredData.tournaments.reports, 'tournaments-report')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{processedData.tournamentStats.total}</div>
                  <div className="text-sm text-yellow-600">Total</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{processedData.tournamentStats.active}</div>
                  <div className="text-sm text-blue-600">Active</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{processedData.tournamentStats.completed}</div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{processedData.tournamentStats.draft}</div>
                  <div className="text-sm text-gray-600">Draft</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Start Date</th>
                      <th className="text-left p-2">End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.tournaments.reports.slice(0, 10).map((tournament) => (
                      <tr key={tournament.id} className="border-b">
                        <td className="p-2 font-medium">{tournament.name}</td>
                        <td className="p-2">
                          <Badge variant="outline">{tournament.tournament_type}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={getStatusColor(tournament.status)}>
                            {tournament.status}
                          </Badge>
                        </td>
                        <td className="p-2">{tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-2">{tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(selectedCategory === 'all' || selectedCategory === 'teams') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Team Reports
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(filteredData.teams.reports, 'teams-report')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{processedData.teamStats.total}</div>
                  <div className="text-sm text-indigo-600">Total Teams</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{processedData.teamStats.active}</div>
                  <div className="text-sm text-green-600">Active Teams</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{processedData.teamStats.registrations}</div>
                  <div className="text-sm text-blue-600">Registrations</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Color</th>
                      <th className="text-left p-2">Registrations</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.teams.reports.slice(0, 10).map((team) => {
                      const teamRegistrations = filteredData.teams.registrations.filter(r => r.official_team_id === team.id)
                      
                      return (
                        <tr key={team.id} className="border-b">
                          <td className="p-2 font-medium">{team.name}</td>
                          <td className="p-2">
                            {team.color && (
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border" 
                                  style={{ backgroundColor: team.color }}
                                />
                                <span className="text-sm">{team.color}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-2">{teamRegistrations.length}</td>
                          <td className="p-2">{new Date(team.created_at).toLocaleDateString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(selectedCategory === 'all' || selectedCategory === 'registrations') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Registration Reports
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV(filteredData.registrations.individual, 'individual-registrations-report')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Individual CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV(filteredData.teams.registrations, 'team-registrations-report')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Team CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{processedData.registrationStats.total}</div>
                  <div className="text-sm text-pink-600">Total Registrations</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{processedData.registrationStats.individual}</div>
                  <div className="text-sm text-blue-600">Individual</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{processedData.registrationStats.team}</div>
                  <div className="text-sm text-green-600">Team</div>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Individual Registrations</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">User</th>
                          <th className="text-left p-2">Sport</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.registrations.individual.slice(0, 5).map((reg) => (
                          <tr key={reg.id} className="border-b">
                            <td className="p-2 font-medium">{reg.profiles?.full_name || 'N/A'}</td>
                            <td className="p-2">{reg.sports?.name || 'N/A'}</td>
                            <td className="p-2">
                              <Badge className={getStatusColor(reg.status)}>
                                {reg.status}
                              </Badge>
                            </td>
                            <td className="p-2">{new Date(reg.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Team Registrations</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">User</th>
                          <th className="text-left p-2">Team Name</th>
                          <th className="text-left p-2">Sport</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.teams.registrations.slice(0, 5).map((reg) => (
                          <tr key={reg.id} className="border-b">
                            <td className="p-2 font-medium">{reg.profiles?.full_name || 'N/A'}</td>
                            <td className="p-2">{reg.team_name || 'N/A'}</td>
                            <td className="p-2">{reg.sports?.name || 'N/A'}</td>
                            <td className="p-2">
                              <Badge className={getStatusColor(reg.status)}>
                                {reg.status}
                              </Badge>
                            </td>
                            <td className="p-2">{new Date(reg.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
