"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { notifications } from "@/lib/notifications"
import { Clock, CheckCircle, XCircle, Users, Eye } from "lucide-react"
import { ChangeRequestModal } from "@/components/admin/team-change-requests/change-request-modal"

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

export default function TeamChangeRequestsPage() {
  const [requests, setRequests] = useState<TeamChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<TeamChangeRequest | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/team-change-requests")
      if (!res.ok) throw new Error("Failed to fetch requests")
      const data = await res.json()
      setRequests(data.requests)
    } catch (e) {
      console.error(e)
      notifications.showError({
        title: "Error",
        description: "Failed to load change requests"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessing(requestId)
    try {
      const res = await fetch(`/api/admin/team-change-requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_notes: adminNotes })
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to process request')
      }

      notifications.showSuccess(`Request ${action}d successfully`)
      setDialogOpen(false)
      setAdminNotes("")
      fetchRequests()
    } catch (e: any) {
      notifications.showError({
        title: "Error",
        description: e.message || "Failed to process request"
      })
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'from-yellow-50 to-amber-50 border-yellow-200'
      case 'approved': return 'from-green-50 to-emerald-50 border-green-200'
      case 'rejected': return 'from-red-50 to-rose-50 border-red-200'
      default: return 'from-slate-50 to-slate-100 border-slate-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading change requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center py-5">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-full mb-5 shadow-md">
            <Users className="h-5 w-5" />
            <h1 className="text-xl font-bold">Team Change Requests</h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Member Management
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Review and approve team member changes submitted by captains. 
            Compare current and proposed member lists before making decisions.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-blue-600 font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-blue-900">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-red-600 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-900">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card className="text-center py-20 bg-white/50 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6 shadow-md">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Change Requests</h3>
              <p className="text-base text-slate-600 mb-6 max-w-xl mx-auto">
                No team change requests have been submitted yet. Check back later for new requests.
              </p>
              <Button 
                onClick={fetchRequests}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Refresh Requests
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5">
            {requests.map((request) => (
              <Card 
                key={request.id} 
                className={`overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${getStatusColor(request.status)} rounded-xl`}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900">
                          {request.teams.name}
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                          Requested by <span className="font-semibold">{request.requested_by_profile.full_name || request.requested_by_profile.email}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusBadge(request.status)}
                      <Button
                        variant="outline"
                        className="bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200 shadow-sm rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          setSelectedRequest(request)
                          setDialogOpen(true)
                        }}
                        disabled={request.status !== 'pending'}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm text-slate-600 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Submitted: {formatDate(request.created_at)}</span>
                    </div>
                    {request.approved_at && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}: {formatDate(request.approved_at)}
                          {request.approved_by_profile && ` by ${request.approved_by_profile.full_name}`}
                        </span>
                      </div>
                    )}
                  </div>
                  {request.admin_notes && (
                    <div className="mt-3 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-slate-200">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-slate-100 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 text-sm mb-1">Admin Notes:</p>
                          <p className="text-slate-600 text-sm">{request.admin_notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Change Request Modal */}
        {selectedRequest && (
          <ChangeRequestModal
            request={selectedRequest}
            isOpen={dialogOpen}
            onClose={() => {
              setDialogOpen(false)
              setSelectedRequest(null)
              setAdminNotes("")
            }}
            onApprove={handleApprove}
            adminNotes={adminNotes}
            setAdminNotes={setAdminNotes}
            processing={processing}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  )
}