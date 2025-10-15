"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Users, 
  UserCheck, 
  User, 
  Calendar, 
  MessageSquare,
  XCircle,
  CheckCircle
} from "lucide-react"

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

interface ChangeRequestDetailsProps {
  request: TeamChangeRequest
  formatDate: (dateString: string) => string
}

export function ChangeRequestDetails({ request, formatDate }: ChangeRequestDetailsProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <div className="p-1.5 bg-blue-100 rounded-md">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
        Request Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium">Team</p>
              <p className="font-bold text-lg text-slate-900 mt-1 truncate">{request.teams.name}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium">Captain</p>
              <p className="font-bold text-lg text-slate-900 mt-1 truncate">{request.teams.captain_name || "Not assigned"}</p>
              <p className="text-sm text-slate-600 truncate">{request.teams.captain_email}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium">Requested By</p>
              <p className="font-bold text-lg text-slate-900 mt-1 truncate">{request.requested_by_profile.full_name || "Unknown"}</p>
              <p className="text-sm text-slate-600 truncate">{request.requested_by_profile.email}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Submitted</p>
              <p className="font-bold text-base text-slate-900 mt-1">{formatDate(request.created_at)}</p>
            </div>
          </div>
        </div>
        {request.approved_at && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  {request.status === 'approved' ? 'Approved' : 'Rejected'}
                </p>
                <p className="font-bold text-base text-slate-900 mt-1">{formatDate(request.approved_at)}</p>
                {request.approved_by_profile && (
                  <p className="text-sm text-slate-600 mt-1 truncate">
                    by {request.approved_by_profile.full_name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}