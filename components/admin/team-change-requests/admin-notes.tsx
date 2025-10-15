"use client"

import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"

interface AdminNotesProps {
  adminNotes: string
  setAdminNotes: (notes: string) => void
  previousNotes?: string
}

export function AdminNotes({ adminNotes, setAdminNotes, previousNotes }: AdminNotesProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-5 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <div className="p-1.5 bg-indigo-100 rounded-md">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
        </div>
        Admin Notes
      </h3>
      
      {previousNotes && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 mb-5">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-4 w-4 text-slate-500 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 mb-1.5">Previous Notes</p>
              <p className="text-slate-700">{previousNotes}</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Add Your Notes (Optional)
        </label>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Add any notes about this decision that might be helpful for future reference..."
          rows={3}
          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-base p-3 w-full"
        />
      </div>
    </div>
  )
}