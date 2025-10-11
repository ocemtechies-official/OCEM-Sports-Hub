"use client"

import { useState, useEffect } from "react"
import { Activity, Users, Clock, AlertCircle } from "lucide-react"

interface AdminStats {
  activeUsers: number
  liveFixtures: number
  pendingRegistrations: number
  activeTournaments: number
  totalQuizzes: number
  totalTeams: number
  lastUpdated: string
}

export function DynamicSidebarStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        
        const { data } = await response.json()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching admin stats:', err)
        setError('Failed to load stats')
        // Fallback to default values
        setStats({
          activeUsers: 0,
          liveFixtures: 0,
          pendingRegistrations: 0,
          activeTournaments: 0,
          totalQuizzes: 0,
          totalTeams: 0,
          lastUpdated: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="px-6 py-4 border-t flex-shrink-0">
        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 p-4 border border-indigo-100">
          <div className="text-xs font-medium text-slate-600 mb-3">
            Quick Stats
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Loading...</span>
              <div className="w-8 h-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Loading...</span>
              <div className="w-8 h-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Loading...</span>
              <div className="w-8 h-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 py-4 border-t flex-shrink-0">
        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
          <div className="flex items-center gap-2 text-xs text-red-600 mb-2">
            <AlertCircle className="h-3 w-3" />
            Stats Error
          </div>
          <div className="text-xs text-red-500">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-4 border-t flex-shrink-0">
      <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 p-4 border border-indigo-100">
        <div className="text-xs font-medium text-slate-600 mb-3 flex items-center justify-between">
          <span>Quick Stats</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600">Live</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-slate-500" />
              <span className="text-xs text-slate-600">Active Users</span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {stats?.activeUsers.toLocaleString() || 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-red-500" />
              <span className="text-xs text-slate-600">Live Fixtures</span>
            </div>
            <span className="text-sm font-bold text-red-600">
              {stats?.liveFixtures || 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-slate-600">Pending</span>
            </div>
            <span className="text-sm font-bold text-orange-600">
              {stats?.pendingRegistrations || 0}
            </span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-indigo-100">
          <div className="text-xs text-slate-500">
            Updated {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>
    </div>
  )
}
