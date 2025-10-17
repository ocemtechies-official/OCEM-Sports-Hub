"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { notifications } from "@/lib/notifications";
import { Plus, Save, Users, ImageIcon, Crown, Shield, User, Mail, Phone, Hash, Award, Palette, Link as LinkIcon, Calendar, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Loading from "./loading";

/**
 * Type definitions for team member and team data structures
 * These interfaces define the shape of data we're working with
 */
type TeamMember = {
  id?: string
  member_name: string
  member_contact?: string
  member_phone?: string
  member_email?: string
  member_roll_number?: string
  member_position?: string
  member_order: number
  is_captain: boolean
  is_substitute: boolean
}

type Team = {
  id: string
  name: string
  logo_url?: string | null
  color?: string | null
  captain_name?: string | null
  captain_contact?: string | null
  captain_email?: string | null
  team_members?: TeamMember[]
}

/**
 * MyTeamPage Component
 * 
 * This page allows team captains to manage their team information including:
 * - General team information (name, logo, color, captain contact)
 * - Team member details with the ability to propose changes
 * 
 * The page includes authentication checks to ensure only captains can access it
 */
export default function MyTeamPage() {
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<Team | null>(null)
  const [general, setGeneral] = useState({ name: "", logo_url: "", color: "", captain_contact: "", captain_email: "" })
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isCaptain, setIsCaptain] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  // Check if the current user is a team captain on component mount
  useEffect(() => {
    // Optimistic: use cached captain flag to avoid flash and extra wait
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('ocem_is_captain') : null
      if (cached === 'true') {
        setIsCaptain(true)
        setAuthLoading(false)
        fetchTeam()
        // Revalidate in background
        checkCaptainAccess(true)
        return
      }
    } catch {}
    checkCaptainAccess(false)
  }, [])

  /**
   * Verify that the current user has captain privileges
   * Redirects to profile page if not authorized
   */
  const checkCaptainAccess = async (background?: boolean) => {
    try {
      const res = await fetch("/api/captain/my-team", { cache: 'no-store' })
      if (res.ok) {
        setIsCaptain(true)
        if (!background) {
          fetchTeam()
        }
        try { localStorage.setItem('ocem_is_captain', 'true') } catch {}
      } else {
        setIsCaptain(false)
        notifications.showError({
          title: "Access Denied",
          description: "Only team captains can manage teams."
        })
        try { localStorage.setItem('ocem_is_captain', 'false') } catch {}
        router.push("/profile")
      }
    } catch (e) {
      console.error(e)
      setIsCaptain(false)
      notifications.showError({
        title: "Error",
        description: "Unable to verify captain access."
      })
      try { localStorage.setItem('ocem_is_captain', 'false') } catch {}
      router.push("/profile")
    } finally {
      setAuthLoading(false)
    }
  }

  /**
   * Fetch the current team data from the API
   * Populates the form fields with existing team information
   */
  const fetchTeam = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/captain/my-team", { cache: 'no-store' })
      if (!res.ok) throw new Error("Failed to load team")
      const data = await res.json()
      const t: Team = data.team
      setTeam(t)
      setGeneral({
        name: t.name,
        logo_url: t.logo_url || "",
        color: t.color || "",
        captain_contact: t.captain_contact || "",
        captain_email: t.captain_email || ""
      })
      const sortedMembers = (t.team_members || []).slice().sort((a, b) => (a.member_order ?? 0) - (b.member_order ?? 0))
      setMembers(sortedMembers)
    } catch (e) {
      console.error(e)
      notifications.showError({
        title: "Error",
        description: "Unable to load your team."
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Save general team information changes
   * Updates team name, logo, color, and captain contact details
   */
  const handleGeneralSave = async () => {
    try {
      const res = await fetch("/api/captain/my-team", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(general)
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Update failed')
      }
      notifications.showSuccess("Team updated.")
      fetchTeam()
    } catch (e: any) {
      notifications.showError({
        title: "Update Failed",
        description: e.message || "Failed to update."
      })
    }
  }

  /**
   * Add a new empty member row to the members form
   * Allows captains to add new team members
   */
  const addMember = () => {
    setMembers(prev => ([
      ...prev,
      { member_name: "", member_order: prev.length, is_captain: false, is_substitute: false }
    ]))
  }

  /**
   * Update a specific field for a team member
   * @param index - The index of the member in the members array
   * @param field - The field to update
   * @param value - The new value for the field
   */
  const updateMember = (index: number, field: keyof TeamMember, value: any) => {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  /**
   * Submit member changes for approval
   * Sends updated member list to the backend for admin approval
   */
  const submitMemberChanges = async () => {
    try {
      // Ensure one captain in list if any captain flagged
      const captainCount = members.filter(m => m.is_captain).length
      if (captainCount > 1) {
        notifications.showError({
          title: "Invalid Selection",
          description: "Only one member can be captain."
        })
        return
      }

      const res = await fetch("/api/captain/my-team/members", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: members.map(({ id, ...rest }) => rest) })
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Submission failed')
      }
      notifications.showSuccess("Member change request submitted for approval.")
      fetchRequests()
    } catch (e: any) {
      notifications.showError({
        title: "Submission Failed",
        description: e.message || "Failed to submit member changes."
      })
    }
  }
  
  // Track recent change requests for status visibility
  const [requests, setRequests] = useState<any[]>([])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/captain/my-team/requests', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setRequests(data.requests || [])
    } catch {}
  }
  useEffect(() => { fetchRequests() }, [])

  const initials = useMemo(() => (team?.name || 'T').slice(0, 2).toUpperCase(), [team?.name])

  // Loading state - shown while verifying captain access or loading team data
  // Route-level skeleton handles loading; avoid in-page spinners

  // Access denied state - shown when user is not a team captain
  if (!isCaptain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-red-600">Access Denied</CardTitle>
          <CardContent className="pt-4">
            <p>Only team captains can access this page.</p>
            <p className="text-sm text-gray-600 mt-2">
              Your email must match the captain email registered for the team.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No team found state - shown when captain has no team assigned
  if (!team) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6 relative z-10">
        {/* Team Header Card with Avatar and Title */}
        <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-2xl transition-all duration-300 group-hover:scale-105">
                  {team.logo_url ? (
                    <AvatarImage src={team.logo_url} alt={team.name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-blue-400 to-indigo-600 text-white">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg border-2 border-white transition-all duration-300 group-hover:rotate-12">
                  <Crown className="h-5 w-5 text-yellow-800" />
                </div>
              </div>
              <div className="text-center md:text-left text-white">
                <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-3">
                  {team.name}
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm animate-pulse">
                    <User className="h-4 w-4 inline mr-1" /> Captain
                  </span>
                </h1>
                <p className="text-blue-100 mt-3 text-lg">Manage your team's information and member roster</p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-base font-medium transition-all duration-300 hover:bg-white/30">
                    <Users className="h-5 w-5" /> {members.length} Members
                  </span>
                  <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-base font-medium transition-all duration-300 hover:bg-white/30">
                    <Palette className="h-5 w-5" /> {general.color || "No Color"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-0">
            {/* Enhanced Tabs Interface - Fixed size and containment issues */}
            <Tabs defaultValue="general" className="w-full">
              <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-4">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-none rounded-t-lg h-12">
                    <TabsTrigger 
                      value="general" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white rounded-tl-lg h-full flex items-center justify-center"
                    >
                      <Palette className="h-4 w-4 mr-2" /> Team Information
                    </TabsTrigger>
                    <TabsTrigger 
                      value="members" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white rounded-tr-lg h-full flex items-center justify-center"
                    >
                      <Users className="h-4 w-4 mr-2" /> Team Members
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* General Information Tab */}
              <TabsContent value="general" className="mt-0 p-4 md:p-6">
                <div className="space-y-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-900">General Information</h2>
                    <p className="text-slate-600 mt-2">Update your team's basic information and appearance</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Team Name */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 text-base font-medium text-slate-700">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Crown className="h-5 w-5 text-blue-600" />
                        </div>
                        Team Name
                      </label>
                      <Input 
                        value={general.name} 
                        onChange={e => setGeneral(g => ({ ...g, name: e.target.value }))}
                        className="py-3 text-base border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Enter team name"
                      />
                    </div>
                    
                    {/* Primary Color */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 text-base font-medium text-slate-700">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Palette className="h-5 w-5 text-indigo-600" />
                        </div>
                        Primary Color
                      </label>
                      <div className="flex gap-3">
                        <Input 
                          value={general.color || ''} 
                          onChange={e => setGeneral(g => ({ ...g, color: e.target.value }))}
                          placeholder="#123456"
                          className="py-3 text-base border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 flex-1"
                        />
                        {general.color && (
                          <div 
                            className="w-12 h-12 rounded-lg border-2 border-slate-300 shadow-sm"
                            style={{ backgroundColor: general.color }}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Captain Contact */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 text-base font-medium text-slate-700">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        Captain Contact
                      </label>
                      <Input 
                        value={general.captain_contact || ''} 
                        onChange={e => setGeneral(g => ({ ...g, captain_contact: e.target.value }))}
                        className="py-3 text-base border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        placeholder="Phone number"
                      />
                    </div>
                    
                    {/* Captain Email */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 text-base font-medium text-slate-700">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        Captain Email
                      </label>
                      <Input 
                        value={general.captain_email || ''} 
                        onChange={e => setGeneral(g => ({ ...g, captain_email: e.target.value }))}
                        className="py-3 text-base border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    {/* Logo URL */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="flex items-center gap-3 text-base font-medium text-slate-700">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <LinkIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        Logo URL
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input 
                          value={general.logo_url || ''} 
                          onChange={e => setGeneral(g => ({ ...g, logo_url: e.target.value }))}
                          placeholder="https://example.com/logo.png"
                          className="py-3 text-base border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 flex-1"
                        />
                        <Button variant="secondary" className="px-4 py-3">
                          <ImageIcon className="h-4 w-4 mr-2" /> Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Save Button */}
                  <div className="pt-6 flex justify-center md:justify-start">
                    <Button 
                      onClick={handleGeneralSave} 
                      className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                </div>
                
                {/* Recent Requests */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Requests</h3>
                  <div className="space-y-3">
                    {requests.length === 0 && (
                      <p className="text-sm text-slate-500">No requests yet.</p>
                    )}
                    {requests.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl border bg-white">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-semibold">{r.change_type === 'members' ? 'Member Change' : r.change_type}</div>
                            <div className="text-slate-600">{new Date(r.created_at).toLocaleString()}</div>
                            {r.admin_notes && <div className="text-slate-700 mt-1">Admin Notes: {r.admin_notes}</div>}
                          </div>
                          <div className="flex items-center gap-3">
                            <Dialog open={detailsOpen && selectedRequest?.id === r.id} onOpenChange={setDetailsOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedRequest(r)}
                                >
                                  View details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Submitted Change Details</DialogTitle>
                                </DialogHeader>
                                {selectedRequest?.change_type === 'members' && Array.isArray(selectedRequest?.payload?.members) ? (
                                  <div className="space-y-3">
                                    {selectedRequest.payload.members.map((m: any, idx: number) => (
                                      <div key={idx} className="p-3 rounded bg-slate-50 border">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div className="font-medium">{m.member_name}</div>
                                          <div className="text-xs">
                                            <span className="mr-2">Order: {m.member_order ?? idx}</span>
                                            {m.is_captain && <span className="mr-2">Captain</span>}
                                            {m.is_substitute && <span>Substitute</span>}
                                          </div>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-600 grid gap-2 md:grid-cols-2">
                                          {m.member_position && <span>Position: {m.member_position}</span>}
                                          {(m.member_phone || m.member_contact) && <span>Phone: {m.member_phone || m.member_contact}</span>}
                                          {m.member_email && <span>Email: {m.member_email}</span>}
                                          {m.member_roll_number && <span>Roll: {m.member_roll_number}</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-slate-600">No details available.</div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {r.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Team Members Tab - Redesigned with spacious layout */}
              <TabsContent value="members" className="mt-0 p-4 md:p-6">
                <div className="space-y-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-900">Team Members</h2>
                    <p className="text-slate-600 mt-2">Manage your team roster. Changes require admin approval.</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Members List - Spacious layout */}
                    {members.map((m, idx) => (
                      <Card 
                        key={idx} 
                        className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <CardContent className="p-0">
                          {/* Member Header */}
                          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold">
                                {idx + 1}
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-slate-800">Member #{idx + 1}</h3>
                                <p className="text-slate-600 text-sm">Player information and role</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {m.is_captain && (
                                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1.5 rounded-full text-sm font-bold shadow">
                                  <Crown className="h-3.5 w-3.5" /> Captain
                                </span>
                              )}
                              {m.is_substitute && (
                                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow">
                                  <Award className="h-3.5 w-3.5" /> Substitute
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Member Details - Spacious form layout */}
                          <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Left Column */}
                              <div className="space-y-6">
                                {/* Member Name */}
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3 text-base font-semibold text-slate-700">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    Full Name
                                  </label>
                                  <Input 
                                    value={m.member_name} 
                                    onChange={e => updateMember(idx, 'member_name', e.target.value)}
                                    placeholder="Enter member's full name"
                                    className="py-4 text-base border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  />
                                </div>
                                
                                {/* Position */}
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3 text-base font-semibold text-slate-700">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                      <UserCheck className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    Position
                                  </label>
                                  <Input 
                                    value={m.member_position || ''} 
                                    onChange={e => updateMember(idx, 'member_position', e.target.value)}
                                    placeholder="Player position"
                                    className="py-4 text-base border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                  />
                                </div>
                                
                                {/* Roll Number */}
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3 text-base font-semibold text-slate-700">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                      <Hash className="h-5 w-5 text-purple-600" />
                                    </div>
                                    Roll Number
                                  </label>
                                  <Input 
                                    value={m.member_roll_number || ''} 
                                    onChange={e => updateMember(idx, 'member_roll_number', e.target.value)}
                                    placeholder="Student roll number"
                                    className="py-4 text-base border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 w-48"
                                  />
                                </div>
                              </div>
                              
                              {/* Right Column */}
                              <div className="space-y-6">
                                {/* Phone */}
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3 text-base font-semibold text-slate-700">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                      <Phone className="h-5 w-5 text-green-600" />
                                    </div>
                                    Phone Number
                                  </label>
                                  <Input 
                                    value={m.member_phone || m.member_contact || ''} 
                                    onChange={e => updateMember(idx, 'member_phone', e.target.value)}
                                    placeholder="Phone number"
                                    className="py-4 text-base border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                  />
                                </div>
                                
                                {/* Email */}
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3 text-base font-semibold text-slate-700">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    Email Address
                                  </label>
                                  <Input 
                                    value={m.member_email || ''} 
                                    onChange={e => updateMember(idx, 'member_email', e.target.value)}
                                    placeholder="email@example.com"
                                    className="py-4 text-base border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  />
                                </div>
                                
                                {/* Order and Roles */}
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3 text-base font-semibold text-slate-700">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                      <Calendar className="h-5 w-5 text-amber-600" />
                                    </div>
                                    Member Order & Roles
                                  </label>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Order */}
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-600">Order</label>
                                      <Input 
                                        type="number"
                                        value={m.member_order ?? idx} 
                                        onChange={e => updateMember(idx, 'member_order', Number(e.target.value) || 0)}
                                        className="py-3 border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                      />
                                    </div>
                                    
                                    {/* Captain Role */}
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-600">Captain</label>
                                      <div className="flex items-center">
                                        <label className="flex items-center cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            checked={!!m.is_captain} 
                                            onChange={e => updateMember(idx, 'is_captain', e.target.checked)}
                                            className="hidden"
                                          />
                                          <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${m.is_captain ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${m.is_captain ? 'translate-x-6' : ''}`}></div>
                                          </div>
                                          <span className="ml-2 text-sm text-slate-600">
                                            {m.is_captain ? 'Yes' : 'No'}
                                          </span>
                                        </label>
                                      </div>
                                    </div>
                                    
                                    {/* Substitute Role */}
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-600">Substitute</label>
                                      <div className="flex items-center">
                                        <label className="flex items-center cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            checked={!!m.is_substitute} 
                                            onChange={e => updateMember(idx, 'is_substitute', e.target.checked)}
                                            className="hidden"
                                          />
                                          <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${m.is_substitute ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${m.is_substitute ? 'translate-x-6' : ''}`}></div>
                                          </div>
                                          <span className="ml-2 text-sm text-slate-600">
                                            {m.is_substitute ? 'Yes' : 'No'}
                                          </span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Add Member Button */}
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        onClick={addMember} 
                        className="gap-3 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 py-4 px-6 text-base w-full md:w-auto"
                      >
                        <Plus className="h-5 w-5" /> Add New Team Member
                      </Button>
                    </div>
                  </div>
                  
                  {/* Submit Changes Section */}
                  <Separator className="my-8" />
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                        <h3 className="font-bold text-2xl text-slate-900 flex items-center gap-3 justify-center md:justify-start">
                          <Users className="h-6 w-6 text-blue-600" /> Submit Member Changes
                        </h3>
                        <p className="text-slate-600 mt-2 max-w-2xl">All changes require admin approval before they take effect. Please review all information before submitting.</p>
                      </div>
                      <Button 
                        onClick={submitMemberChanges} 
                        className="gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-base px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 whitespace-nowrap"
                      >
                        <Users className="h-5 w-5" /> Submit for Approval
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}