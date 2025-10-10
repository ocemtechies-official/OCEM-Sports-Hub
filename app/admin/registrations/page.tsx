"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Users, User, Eye, MessageSquare, Filter, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notifications } from "@/lib/notifications";

interface Registration {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  registered_at: string;
  admin_notes?: string;
  sports?: {
    name: string;
    icon: string;
  };
}

interface IndividualRegistration extends Registration {
  student_name: string;
  roll_number: string;
  department: string;
  semester: string;
  gender: string;
  contact_number: string;
  email: string;
  skill_level: string;
}

interface TeamRegistration extends Registration {
  team_name: string;
  department: string;
  semester: string;
  gender: string;
  captain_name: string;
  captain_contact: string;
  captain_email: string;
  required_members: number;
  team_registration_members?: Array<{
    member_name: string;
    member_order: number;
    is_captain: boolean;
  }>;
}

export default function AdminRegistrationsPage() {
  const [individualRegistrations, setIndividualRegistrations] = useState<IndividualRegistration[]>([]);
  const [teamRegistrations, setTeamRegistrations] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const supabase = getSupabaseBrowserClient();

      // Fetch individual registrations
      const { data: individualData, error: individualError } = await supabase
        .from('individual_registrations')
        .select(`
          *,
          sports:sport_id (
            name,
            icon
          )
        `)
        .order('registered_at', { ascending: false });

      if (individualError) throw individualError;

      // Fetch team registrations
      const { data: teamData, error: teamError } = await supabase
        .from('team_registrations')
        .select(`
          *,
          sports:sport_id (
            name,
            icon
          ),
          team_registration_members (
            member_name,
            member_order,
            is_captain
          )
        `)
        .order('registered_at', { ascending: false });

      if (teamError) throw teamError;

      setIndividualRegistrations(individualData || []);
      setTeamRegistrations(teamData || []);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching registrations:', error);
      notifications.showError({
        title: "Failed to Load Registrations",
        description: "Please try refreshing the page."
      });
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (registrationId: string, newStatus: string, type: 'individual' | 'team') => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/registrations/${registrationId}?type=${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update registration');
      }

      notifications.showSuccess({
        title: "Updated ✓",
        description: `Registration ${newStatus}`
      });

      // Refresh data
      fetchRegistrations();
      setDialogOpen(false);
      setAdminNotes('');

    } catch (error) {
      console.error('Error updating registration:', error);
      notifications.showError({
        title: "Update Failed ❌",
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      withdrawn: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredIndividualRegistrations = individualRegistrations.filter(reg => {
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      reg.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.sports?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredTeamRegistrations = teamRegistrations.filter(reg => {
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      reg.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.captain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.sports?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Management</h1>
          <p className="text-gray-600">Manage sports event registrations</p>
        </div>

        {/* Filters */}
        <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search registrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Individual ({filteredIndividualRegistrations.length})
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team ({filteredTeamRegistrations.length})
            </TabsTrigger>
          </TabsList>

          {/* Individual Registrations */}
          <TabsContent value="individual" className="mt-6">
            <div className="grid gap-4">
              {filteredIndividualRegistrations.length === 0 ? (
                <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No individual registrations found.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredIndividualRegistrations.map((registration) => (
                  <Card key={registration.id} className="bg-white/95 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{registration.sports?.icon}</span>
                            <h3 className="text-lg font-semibold text-gray-900">{registration.student_name}</h3>
                            {getStatusBadge(registration.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div><span className="font-medium">Sport:</span> {registration.sports?.name}</div>
                            <div><span className="font-medium">Roll No:</span> {registration.roll_number}</div>
                            <div><span className="font-medium">Department:</span> {registration.department}</div>
                            <div><span className="font-medium">Semester:</span> {registration.semester}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRegistration({...registration, type: 'individual'});
                              setDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Team Registrations */}
          <TabsContent value="team" className="mt-6">
            <div className="grid gap-4">
              {filteredTeamRegistrations.length === 0 ? (
                <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No team registrations found.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTeamRegistrations.map((registration) => (
                  <Card key={registration.id} className="bg-white/95 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{registration.sports?.icon}</span>
                            <h3 className="text-lg font-semibold text-gray-900">{registration.team_name}</h3>
                            {getStatusBadge(registration.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div><span className="font-medium">Sport:</span> {registration.sports?.name}</div>
                            <div><span className="font-medium">Captain:</span> {registration.captain_name}</div>
                            <div><span className="font-medium">Department:</span> {registration.department}</div>
                            <div><span className="font-medium">Members:</span> {registration.required_members}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRegistration({...registration, type: 'team'});
                              setDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Registration Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRegistration?.type === 'individual' ? (
                  <>
                    <User className="h-5 w-5" />
                    Individual Registration Details
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5" />
                    Team Registration Details
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedRegistration && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Sport:</span> {selectedRegistration.sports?.name}</div>
                  <div><span className="font-medium">Status:</span> {getStatusBadge(selectedRegistration.status)}</div>
                  <div><span className="font-medium">Department:</span> {selectedRegistration.department}</div>
                  <div><span className="font-medium">Semester:</span> {selectedRegistration.semester}</div>
                  <div><span className="font-medium">Gender:</span> {selectedRegistration.gender}</div>
                  <div><span className="font-medium">Registered:</span> {new Date(selectedRegistration.registered_at).toLocaleDateString()}</div>
                </div>

                {/* Individual specific details */}
                {selectedRegistration.type === 'individual' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Student Name:</span> {selectedRegistration.student_name}</div>
                    <div><span className="font-medium">Roll Number:</span> {selectedRegistration.roll_number}</div>
                    <div><span className="font-medium">Email:</span> {selectedRegistration.email}</div>
                    <div><span className="font-medium">Contact:</span> {selectedRegistration.contact_number}</div>
                    <div><span className="font-medium">Skill Level:</span> {selectedRegistration.skill_level}</div>
                  </div>
                )}

                {/* Team specific details */}
                {selectedRegistration.type === 'team' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Team Name:</span> {selectedRegistration.team_name}</div>
                      <div><span className="font-medium">Captain:</span> {selectedRegistration.captain_name}</div>
                      <div><span className="font-medium">Captain Email:</span> {selectedRegistration.captain_email}</div>
                      <div><span className="font-medium">Captain Contact:</span> {selectedRegistration.captain_contact}</div>
                    </div>
                    
                    {/* Team Members */}
                    {selectedRegistration.team_registration_members && (
                      <div>
                        <h4 className="font-medium mb-2">Team Members ({selectedRegistration.required_members}):</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {selectedRegistration.team_registration_members
                            .sort((a: any, b: any) => a.member_order - b.member_order)
                            .map((member: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 py-1">
                                <span className="text-sm text-gray-600">#{member.member_order}</span>
                                <span>{member.member_name}</span>
                                {member.is_captain && <Badge variant="secondary">Captain</Badge>}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Admin Notes */}
                {selectedRegistration.admin_notes && (
                  <div>
                    <h4 className="font-medium mb-2">Admin Notes:</h4>
                    <p className="text-sm bg-gray-50 rounded-lg p-3">{selectedRegistration.admin_notes}</p>
                  </div>
                )}

                {/* Action Section */}
                {selectedRegistration.status === 'pending' && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Notes (Optional)</label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes for this decision..."
                        className="w-full"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleStatusUpdate(selectedRegistration.id, 'approved', selectedRegistration.type)}
                        disabled={updatingStatus}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-70"
                      >
                        {updatingStatus ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {updatingStatus ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedRegistration.id, 'rejected', selectedRegistration.type)}
                        disabled={updatingStatus}
                        variant="destructive"
                        className="flex-1 disabled:opacity-70"
                      >
                        {updatingStatus ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {updatingStatus ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}