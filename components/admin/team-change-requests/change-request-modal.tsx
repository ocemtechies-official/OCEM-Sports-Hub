"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
} from "@/components/ui/dialog"
import { XCircle, Users } from "lucide-react"
import { ChangeRequestDetails } from "@/components/admin/team-change-requests/change-request-details"
import { MemberComparison } from "@/components/admin/team-change-requests/member-comparison"
import { AdminNotes } from "@/components/admin/team-change-requests/admin-notes"
import { ActionButtons } from "@/components/admin/team-change-requests/action-buttons"

interface TeamChangeRequest {
  id: string
  change_type: string
  status: 'pending' | 'approved' | 'rejected'
  payload: any
  admin_notes?: string
  created_at: string
  approved_at?: string
  teams: {
    id: string
    name: string
    captain_name?: string
    captain_email?: string
    team_members?: Array<{
      id: string
      member_name: string
      member_contact?: string | null
      member_phone?: string | null
      member_email?: string | null
      member_roll_number?: string | null
      member_position?: string | null
      member_order: number
      is_captain: boolean
      is_substitute: boolean
    }>
  }
  requested_by_profile: {
    id: string
    full_name?: string
    email: string
  }
  approved_by_profile?: {
    id: string
    full_name?: string
  }
}

interface ChangeRequestModalProps {
  request: TeamChangeRequest
  isOpen: boolean
  onClose: () => void
  onApprove: (requestId: string, action: 'approve' | 'reject') => void
  adminNotes: string
  setAdminNotes: (notes: string) => void
  processing: string | null
  formatDate: (dateString: string) => string
}

export function ChangeRequestModal({ 
  request, 
  isOpen, 
  onClose, 
  onApprove, 
  adminNotes, 
  setAdminNotes,
  processing,
  formatDate
}: ChangeRequestModalProps) {
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = async () => {
    setProcessingAction('approve')
    await onApprove(request.id, 'approve')
    setProcessingAction(null)
  }

  const handleReject = async () => {
    setProcessingAction('reject')
    await onApprove(request.id, 'reject')
    setProcessingAction(null)
  }

  const isProcessing = processing === request.id
  const isPending = request.status === 'pending'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto rounded-lg shadow-lg p-0 w-[90vw] lg:w-[85vw] xl:w-[80vw] 2xl:w-[75vw] min-w-[280px]" style={{ minWidth: '280px', width: '90vw', maxWidth: '1260px' }} showCloseButton={false}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-white/20 rounded-md flex-shrink-0">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg font-bold text-white truncate">
                  Review Change Request
                </DialogTitle>
                <p className="text-blue-100 text-xs mt-1 truncate">
                  Team: {request.teams.name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full flex-shrink-0 h-8 w-8"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="space-y-3.5 p-3.5 md:p-4">
          <ChangeRequestDetails request={request} formatDate={formatDate} />
          <MemberComparison 
            currentMembers={request.teams.team_members || []} 
            proposedMembers={request.payload.members || []} 
          />
          <AdminNotes 
            adminNotes={adminNotes} 
            setAdminNotes={setAdminNotes} 
            previousNotes={request.admin_notes} 
          />
          <ActionButtons 
            onApprove={handleApprove}
            onReject={handleReject}
            onCancel={onClose}
            isProcessing={isProcessing}
            processingAction={processingAction || undefined}
            isPending={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}