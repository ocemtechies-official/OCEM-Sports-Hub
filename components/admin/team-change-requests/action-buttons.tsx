"use client"

import { Button } from "@/components/ui/button"
import { XCircle, CheckCircle } from "lucide-react"

interface ActionButtonsProps {
  onApprove: () => void
  onReject: () => void
  onCancel: () => void
  isProcessing: boolean
  processingAction?: 'approve' | 'reject'
  isPending: boolean
}

export function ActionButtons({ 
  onApprove, 
  onReject, 
  onCancel, 
  isProcessing, 
  processingAction,
  isPending
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 border-t border-slate-200">
      <Button
        variant="outline"
        onClick={onCancel}
        className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base border-slate-300 hover:bg-slate-50"
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={onReject}
        disabled={isProcessing || !isPending}
        className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isProcessing && processingAction === 'reject' ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Rejecting...
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Reject Changes</span>
            <span className="xs:hidden">Reject</span>
          </>
        )}
      </Button>
      <Button
        onClick={onApprove}
        disabled={isProcessing || !isPending}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isProcessing && processingAction === 'approve' ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Approving...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Approve Changes</span>
            <span className="xs:hidden">Approve</span>
          </>
        )}
      </Button>
    </div>
  )
}