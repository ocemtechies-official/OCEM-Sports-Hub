"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Clock, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  User,
  Activity
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface ModeratorActivityDialogProps {
  moderator: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModeratorActivityDialog({ moderator, open, onOpenChange }: ModeratorActivityDialogProps) {
  const [activity, setActivity] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (open && moderator) {
      loadActivity()
    }
  }, [open, moderator])

  const loadActivity = async () => {
    setLoading(true)
    try {
      // Get recent activity (last 30 days)
      const { data: updates } = await supabase
        .from('match_updates')
        .select(`
          *,
          fixture:fixtures(
            id,
            team_a:teams!fixtures_team_a_id_fkey(name),
            team_b:teams!fixtures_team_b_id_fkey(name),
            sport:sports(name)
          )
        `)
        .eq('changed_by', moderator.id)
        .gte('change_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('change_time', { ascending: false })
        .limit(50)

      // Get stats
      const { data: statsData } = await supabase
        .rpc('get_moderator_stats', {
          p_user_id: moderator.id,
          p_days: 30
        })

      setActivity(updates || [])
      setStats(statsData || {})
    } catch (error) {
      console.error('Error loading activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'score_update': return <TrendingUp className="h-4 w-4" />
      case 'status_change': return <Calendar className="h-4 w-4" />
      case 'note': return <MessageSquare className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'score_update': return 'bg-blue-100 text-blue-800'
      case 'status_change': return 'bg-green-100 text-green-800'
      case 'note': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  const getScoreChange = (update: any) => {
    if (update.change_type !== 'score_update') return null
    
    const oldState = update.old_state
    const newState = update.new_state
    
    if (!oldState || !newState) return null
    
    const oldScore = `${oldState.team_a_score || 0} - ${oldState.team_b_score || 0}`
    const newScore = `${newState.team_a_score || 0} - ${newState.team_b_score || 0}`
    
    return `${oldScore} → ${newScore}`
  }

  const getStatusChange = (update: any) => {
    if (update.change_type !== 'status_change') return null
    
    const oldState = update.old_state
    const newState = update.new_state
    
    if (!oldState || !newState) return null
    
    return `${oldState.status} → ${newState.status}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Moderator Activity: {moderator?.full_name || moderator?.email}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_updates || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Last {stats.days_period || 30} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Updates Today</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.updates_today || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fixtures Updated</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.fixtures_updated || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Unique matches
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                  <p className="text-slate-500 mt-2">Loading activity...</p>
                </div>
              ) : activity.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>Change Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activity.map((update) => (
                        <TableRow key={update.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {update.fixture?.team_a?.name} vs {update.fixture?.team_b?.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {update.fixture?.sport?.name}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge className={getChangeTypeColor(update.change_type)}>
                              {getChangeTypeIcon(update.change_type)}
                              <span className="ml-1 capitalize">
                                {update.change_type.replace('_', ' ')}
                              </span>
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">
                              {update.change_type === 'score_update' && getScoreChange(update) && (
                                <div className="font-mono">{getScoreChange(update)}</div>
                              )}
                              {update.change_type === 'status_change' && getStatusChange(update) && (
                                <div className="font-medium">{getStatusChange(update)}</div>
                              )}
                              {update.change_type === 'note' && update.note && (
                                <div className="text-slate-600 truncate max-w-xs">
                                  "{update.note}"
                                </div>
                              )}
                              {update.change_type === 'update' && (
                                <div className="text-slate-500">General update</div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="h-4 w-4" />
                              {formatDate(update.change_time)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No activity found</h3>
                  <p className="text-slate-500">
                    This moderator hasn't made any updates in the last 30 days.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
