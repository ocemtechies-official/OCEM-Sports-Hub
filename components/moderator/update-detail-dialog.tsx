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
  ArrowRight,
  Hash,
  Flag,
  StickyNote,
  Trophy,
  Radio,
  Zap,
  CheckCircle
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
      case 'score_update': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200'
      case 'status_change': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
      case 'note': return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200'
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
    }
  }

  const getChangeTypeHeaderBg = (type: string) => {
    switch (type) {
      case 'score_update': return 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100'
      case 'status_change': return 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100'
      case 'note': return 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100'
      default: return 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100'
    }
  }

  const getChangeTypeAccent = (type: string) => {
    switch (type) {
      case 'score_update': return 'from-blue-500 to-cyan-500'
      case 'status_change': return 'from-green-500 to-emerald-500'
      case 'note': return 'from-purple-500 to-violet-500'
      default: return 'from-gray-500 to-slate-500'
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
        <div className="text-slate-500 italic p-4 text-center">
          No detailed change information available
        </div>
      )
    }

    const changes = []

    // Score changes
    if (oldState.team_a_score !== newState.team_a_score || oldState.team_b_score !== newState.team_b_score) {
      changes.push({
        type: 'Score',
        icon: <Hash className="h-4 w-4" />,
        old: `${oldState.team_a_score || 0} - ${oldState.team_b_score || 0}`,
        new: `${newState.team_a_score || 0} - ${newState.team_b_score || 0}`
      })
    }

    // Status changes
    if (oldState.status !== newState.status) {
      changes.push({
        type: 'Status',
        icon: <Flag className="h-4 w-4" />,
        old: oldState.status,
        new: newState.status
      })
    }

    // Winner changes
    if (oldState.winner_id !== newState.winner_id) {
      changes.push({
        type: 'Winner',
        icon: <Trophy className="h-4 w-4" />,
        old: oldState.winner_id ? 'Set' : 'None',
        new: newState.winner_id ? 'Set' : 'None'
      })
    }

    return (
      <div className="space-y-4">
        {changes.map((change, index) => (
          <div key={index} className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="mt-1 p-2 rounded-lg bg-slate-100">
              {change.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-700 mb-2">{change.type}</div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-100">
                  {change.old}
                </span>
                <ArrowRight className="h-5 w-5 text-slate-400" />
                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-100">
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className={`${getChangeTypeHeaderBg(update.change_type)} p-6 rounded-t-xl`}>
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-2xl">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getChangeTypeAccent(update.change_type)} shadow-lg`}>
              {getChangeTypeIcon(update.change_type)}
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-900">Update Details</div>
              <Badge className={`mt-2 ${getChangeTypeColor(update.change_type)} px-4 py-1.5 rounded-full text-sm font-bold border`}>
                {update.change_type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Match Info */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
                Match Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="p-2 rounded-lg bg-white border border-blue-200">
                    <Radio className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Teams</div>
                    <div className="font-bold text-slate-900">{update.fixture?.team_a?.name} <span className="text-slate-400">vs</span> {update.fixture?.team_b?.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                  <div className="p-2 rounded-lg bg-white border border-purple-200">
                    <Trophy className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Sport</div>
                    <div className="font-bold text-slate-900">{update.fixture?.sport?.name}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Details */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 border-b border-slate-200 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
                </div>
                Changes Made
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {renderChangeDetails()}
            </CardContent>
          </Card>

          {/* Note */}
          {update.note && (
            <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className="p-2 rounded-lg bg-white border border-amber-200 shadow-sm">
                    <StickyNote className="h-5 w-5 text-amber-700" />
                  </div>
                  Moderator Note
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm">
                  <p className="text-slate-700">{update.note}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Update Info */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                Update Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                  <div className="p-2.5 rounded-lg bg-white border border-indigo-200 shadow-sm">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide">Updated by</div>
                    <div className="font-bold text-slate-900">{update.changed_by_profile?.full_name || 'Unknown'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                  <div className="p-2.5 rounded-lg bg-white border border-cyan-200 shadow-sm">
                    <Clock className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="text-xs text-cyan-600 font-medium uppercase tracking-wide">Time</div>
                    <div className="font-bold text-slate-900">{formatDateTime(update.change_time)}</div>
                  </div>
                </div>
                {update.ip_address && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-100 md:col-span-2">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <Hash className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-medium uppercase tracking-wide">IP Address</div>
                      <div className="font-mono font-bold text-slate-900">{update.ip_address}</div>
                    </div>
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