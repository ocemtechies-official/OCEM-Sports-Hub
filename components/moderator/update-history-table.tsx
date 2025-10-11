"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  User, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  Eye
} from "lucide-react"
import { useState } from "react"
import { UpdateDetailDialog } from "./update-detail-dialog"

interface UpdateHistoryTableProps {
  updates: any[]
}

export function UpdateHistoryTable({ updates }: UpdateHistoryTableProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null)

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

  const formatChangeTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match</TableHead>
              <TableHead>Change Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.map((update) => (
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
                    {formatChangeTime(update.change_time)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUpdate(update)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Update Detail Dialog */}
      {selectedUpdate && (
        <UpdateDetailDialog
          update={selectedUpdate}
          open={!!selectedUpdate}
          onOpenChange={(open) => !open && setSelectedUpdate(null)}
        />
      )}
    </>
  )
}
