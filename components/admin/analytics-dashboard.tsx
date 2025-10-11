"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  Brain, 
  Trophy, 
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target
} from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { LoadingButton } from "@/components/ui/loading-button"

interface AnalyticsData {
  users: {
    total: number
    registrations: Array<{ created_at: string }>
    recentActivity: Array<{ created_at: string }>
  }
  fixtures: {
    total: number
    stats: Array<{ status: string; created_at: string }>
    sportPopularity: Array<{ sport_id: string; sports: { name: string } }>
  }
  quizzes: {
    total: number
    attempts: Array<{ quiz_id: string; score: number; completed_at: string; quizzes: { title: string } }>
    performance: Array<{ quiz_id: string; score: number; quizzes: { title: string } }>
  }
  tournaments: {
    total: number
    stats: Array<{ status: string; tournament_type: string; created_at: string }>
  }
}

interface AnalyticsDashboardProps {
  data?: AnalyticsData
}

export function AnalyticsDashboard({ data: initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialData) {
      fetchAnalyticsData()
    }
  }, [initialData])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Validate data structure
  const safeData = useMemo(() => {
    if (!data) {
      return {
        users: { total: 0, registrations: [], recentActivity: [] },
        fixtures: { total: 0, stats: [], sportPopularity: [] },
        quizzes: { total: 0, attempts: [], performance: [] },
        tournaments: { total: 0, stats: [] }
      }
    }

    return {
      users: {
        total: data.users?.total || 0,
        registrations: Array.isArray(data.users?.registrations) ? data.users.registrations : [],
        recentActivity: Array.isArray(data.users?.recentActivity) ? data.users.recentActivity : []
      },
      fixtures: {
        total: data.fixtures?.total || 0,
        stats: Array.isArray(data.fixtures?.stats) ? data.fixtures.stats : [],
        sportPopularity: Array.isArray(data.fixtures?.sportPopularity) ? data.fixtures.sportPopularity : []
      },
      quizzes: {
        total: data.quizzes?.total || 0,
        attempts: Array.isArray(data.quizzes?.attempts) ? data.quizzes.attempts : [],
        performance: Array.isArray(data.quizzes?.performance) ? data.quizzes.performance : []
      },
      tournaments: {
        total: data.tournaments?.total || 0,
        stats: Array.isArray(data.tournaments?.stats) ? data.tournaments.stats : []
      }
    }
  }, [data])

  // Process user registration trends (last 30 days)
  const userRegistrationsByDay = safeData.users.registrations.reduce((acc, user) => {
    if (user?.created_at) {
      const date = new Date(user.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Process fixture status distribution
  const fixtureStatusCounts = safeData.fixtures.stats.reduce((acc, fixture) => {
    if (fixture?.status) {
      acc[fixture.status] = (acc[fixture.status] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Process sport popularity
  const sportCounts = safeData.fixtures.sportPopularity.reduce((acc, fixture) => {
    if (fixture?.sports?.name) {
      const sportName = fixture.sports.name
      acc[sportName] = (acc[sportName] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Process quiz performance
  const quizPerformance = safeData.quizzes.performance.reduce((acc, attempt) => {
    if (attempt?.quizzes?.title && typeof attempt.score === 'number') {
      const quizTitle = attempt.quizzes.title
      if (!acc[quizTitle]) {
        acc[quizTitle] = { total: 0, sum: 0, count: 0 }
      }
      acc[quizTitle].total += 1
      acc[quizTitle].sum += attempt.score
      acc[quizTitle].count += 1
    }
    return acc
  }, {} as Record<string, { total: number; sum: number; count: number }>)

  // Process tournament status
  const tournamentStatusCounts = safeData.tournaments.stats.reduce((acc, tournament) => {
    if (tournament?.status) {
      acc[tournament.status] = (acc[tournament.status] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Calculate recent activity (last 7 days)
  const recentUserCount = safeData.users.recentActivity.length

  // Calculate average quiz score
  const totalQuizScores = safeData.quizzes.performance.reduce((sum, attempt) => {
    return sum + (typeof attempt.score === 'number' ? attempt.score : 0)
  }, 0)
  const averageQuizScore = safeData.quizzes.performance.length > 0 
    ? Math.round(totalQuizScores / safeData.quizzes.performance.length) 
    : 0

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
      case 'draft':
        return 'bg-slate-100 text-slate-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  // Early returns after all hooks and data processing
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingButton loading={true} disabled>
          Loading analytics data...
        </LoadingButton>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-red-600 text-center">
          <p className="font-medium">Failed to load analytics data</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <LoadingButton onClick={fetchAnalyticsData} loading={loading}>
          Retry
        </LoadingButton>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Users</span>
                <span className="text-2xl font-bold">{safeData.users.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">New This Week</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{recentUserCount}</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Registration trend over last 30 days
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">New Users (7 days)</span>
                <Badge variant="secondary">{recentUserCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Growth Rate</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-sm text-green-600">
                    {safeData.users.total > 0 ? Math.round((recentUserCount / safeData.users.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixture Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fixture Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(fixtureStatusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Sport Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(sportCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([sport, count]) => (
                <div key={sport} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{sport}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / Math.max(...Object.values(sportCounts))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Quizzes</span>
                <span className="text-2xl font-bold">{safeData.quizzes.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Average Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{averageQuizScore}%</span>
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Attempts</span>
                <span className="font-semibold">{safeData.quizzes.attempts.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(quizPerformance)
                .sort(([,a], [,b]) => (b.sum / b.count) - (a.sum / a.count))
                .slice(0, 5)
                .map(([quizTitle, stats]) => {
                  const avgScore = Math.round(stats.sum / stats.count)
                  return (
                    <div key={quizTitle} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{quizTitle}</p>
                        <p className="text-xs text-slate-500">{stats.total} attempts</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{avgScore}%</span>
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${avgScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Tournaments</span>
                <span className="text-2xl font-bold">{safeData.tournaments.total}</span>
              </div>
              <div className="space-y-2">
                {Object.entries(tournamentStatusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge className={getStatusColor(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Tournament Types</h4>
              <div className="space-y-2">
                {Object.entries(safeData.tournaments.stats.reduce((acc, tournament) => {
                  if (tournament?.tournament_type) {
                    acc[tournament.tournament_type] = (acc[tournament.tournament_type] || 0) + 1
                  }
                  return acc
                }, {} as Record<string, number>))
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Active Tournaments</span>
                  <span className="font-semibold">
                    {tournamentStatusCounts.active || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Completed</span>
                  <span className="font-semibold">
                    {tournamentStatusCounts.completed || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Draft</span>
                  <span className="font-semibold">
                    {tournamentStatusCounts.draft || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
