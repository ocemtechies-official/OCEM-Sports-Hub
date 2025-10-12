"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  User, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  ArrowRight
} from "lucide-react"

interface UpdateDetailDialogProps {
  update: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateDetailDialog({ update, open, onOpenChange }: UpdateDetailDialogProps) {
  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'score_update': return <TrendingUp className="h-5 w-5" />
      case 'status_change': return <Calendar className="h-5 w-5" />
      case 'note': return <MessageSquare className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
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

  const formatDateTime = (time: string) => {
    return new Date(time).toLocaleString()
  }

  const renderChangeDetails = () => {
    const oldState = update.old_state
    const newState = update.new_state

    if (!oldState || !newState) {
      return (
        <div className="text-slate-500">
          No detailed change information available
        </div>
      )
    }

    const changes = []

    // Score changes
    if (oldState.team_a_score !== newState.team_a_score || oldState.team_b_score !== newState.team_b_score) {
      changes.push({
        type: 'Score',
        old: `${oldState.team_a_score || 0} - ${oldState.team_b_score || 0}`,
        new: `${newState.team_a_score || 0} - ${newState.team_b_score || 0}`
      })
    }

    // Status changes
    if (oldState.status !== newState.status) {
      changes.push({
        type: 'Status',
        old: oldState.status,
        new: newState.status
      })
    }

    // Winner changes
    if (oldState.winner_id !== newState.winner_id) {
      changes.push({
        type: 'Winner',
        old: oldState.winner_id ? 'Set' : 'None',
        new: newState.winner_id ? 'Set' : 'None'
      })
    }

    return (
      <div className="space-y-3">
        {changes.map((change, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-700">{change.type}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                  {change.old}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  {change.new}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getChangeTypeIcon(update.change_type)}
            Update Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Match Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Teams:</span> {update.fixture?.team_a?.name} vs {update.fixture?.team_b?.name}
                </div>
                <div>
                  <span className="font-medium">Sport:</span> {update.fixture?.sport?.name}
                </div>
                <div>
                  <span className="font-medium">Change Type:</span> 
                  <Badge className={`ml-2 ${getChangeTypeColor(update.change_type)}`}>
                    {update.change_type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Changes Made</CardTitle>
            </CardHeader>
            <CardContent>
              {renderChangeDetails()}
            </CardContent>
          </Card>

          {/* Note */}
          {update.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-700">{update.note}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Update Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Updated by:</span> {update.changed_by_profile?.full_name || 'Unknown'}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Time:</span> {formatDateTime(update.change_time)}
                </div>
                {update.ip_address && (
                  <div>
                    <span className="font-medium">IP Address:</span> {update.ip_address}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
