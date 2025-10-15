"use client"

import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Phone, 
  Mail, 
  Hash, 
  Award, 
  UserCheck,
  XCircle,
  CheckCircle
} from "lucide-react"

interface TeamMember {
  id?: string
  member_name: string
  member_contact?: string | null
  member_phone?: string | null
  member_email?: string | null
  member_roll_number?: string | null
  member_position?: string | null
  member_order: number
  is_captain: boolean
  is_substitute: boolean
}

interface MemberComparisonProps {
  currentMembers: TeamMember[]
  proposedMembers: any[]
}

export function MemberComparison({ currentMembers, proposedMembers }: MemberComparisonProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <div className="p-1.5 bg-slate-100 rounded-md">
          <User className="h-5 w-5 text-slate-600" />
        </div>
        Member Comparison
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Current Members */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Current Members
            </h4>
            <Badge className="bg-red-100 text-red-800 text-sm py-1 px-3">
              {currentMembers?.length || 0} members
            </Badge>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {currentMembers.length > 0 ? (
              [...currentMembers]
                .sort((a,b) => (a.member_order ?? 0) - (b.member_order ?? 0))
                .map((member) => (
                  <div 
                    key={member.id} 
                    className="bg-white rounded-lg p-3.5 shadow-sm border border-red-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="bg-red-100 text-red-800 rounded-lg px-2 py-1 text-xs font-bold flex-shrink-0">
                          #{member.member_order ?? 0}
                        </div>
                        <h5 className="font-bold text-base text-slate-900 truncate">{member.member_name}</h5>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {member.is_captain && (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs py-1 px-2">
                            <UserCheck className="h-3 w-3 mr-1" />Captain
                          </Badge>
                        )}
                        {member.is_substitute && (
                          <Badge variant="outline" className="border-slate-300 text-xs py-1 px-2">
                            <Award className="h-3 w-3 mr-1" />Substitute
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {member.member_position && (
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <User className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500">Position</p>
                            <p className="font-medium text-sm">{member.member_position}</p>
                          </div>
                        </div>
                      )}
                      {(member.member_phone || member.member_contact) && (
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <Phone className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500">Phone</p>
                            <p className="font-medium text-sm">{member.member_phone || member.member_contact}</p>
                          </div>
                        </div>
                      )}
                      {member.member_email && (
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="font-medium text-sm">{member.member_email}</p>
                          </div>
                        </div>
                      )}
                      {member.member_roll_number && (
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <Hash className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500">Roll Number</p>
                            <p className="font-medium text-sm">{member.member_roll_number}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-red-100">
                <User className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No current members found</p>
              </div>
            )}
          </div>
        </div>

        {/* Proposed Members */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-bold text-green-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Proposed Members
            </h4>
            <Badge className="bg-green-100 text-green-800 text-sm py-1 px-3">
              {proposedMembers?.length || 0} members
            </Badge>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {proposedMembers?.length > 0 ? (
              proposedMembers.map((member: any, index: number) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg p-3.5 shadow-sm border border-green-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="bg-green-100 text-green-800 rounded-lg px-2 py-1 text-xs font-bold flex-shrink-0">
                        #{member.member_order ?? index}
                      </div>
                      <h5 className="font-bold text-base text-slate-900 truncate">{member.member_name}</h5>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {member.is_captain && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs py-1 px-2">
                          <UserCheck className="h-3 w-3 mr-1" />Captain
                        </Badge>
                      )}
                      {member.is_substitute && (
                        <Badge variant="outline" className="border-slate-300 text-xs py-1 px-2">
                          <Award className="h-3 w-3 mr-1" />Substitute
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {member.member_position && (
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <User className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">Position</p>
                          <p className="font-medium text-sm">{member.member_position}</p>
                        </div>
                      </div>
                    )}
                    {(member.member_phone || member.member_contact) && (
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Phone className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">Phone</p>
                          <p className="font-medium text-sm">{member.member_phone || member.member_contact}</p>
                        </div>
                      </div>
                    )}
                    {member.member_email && (
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="font-medium text-sm">{member.member_email}</p>
                        </div>
                      </div>
                    )}
                    {member.member_roll_number && (
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Hash className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">Roll Number</p>
                          <p className="font-medium text-sm">{member.member_roll_number}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-green-100">
                <User className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No proposed members found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}