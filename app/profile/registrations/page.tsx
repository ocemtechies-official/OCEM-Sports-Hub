"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Eye, Plus, User, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notifications } from "@/lib/notifications";
import Link from "next/link";

interface UserRegistration {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  registered_at: string;
  admin_notes?: string;
  sports?: {
    name: string;
    icon: string;
  };
  // Individual specific
  student_name?: string;
  skill_level?: string;
  // Team specific
  team_name?: string;
  captain_name?: string;
  required_members?: number;
  team_registration_members?: Array<{
    member_name: string;
    member_order: number;
    is_captain: boolean;
  }>;
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<UserRegistration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

      if (individualError && individualError.code !== 'PGRST116') { // Ignore "no rows" error
        throw individualError;
      }

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

      if (teamError && teamError.code !== 'PGRST116') { // Ignore "no rows" error
        throw teamError;
      }

      // Combine and mark registration types
      const allRegistrations = [
        ...(individualData || []).map((reg: any) => ({ ...reg, type: 'individual' })),
        ...(teamData || []).map((reg: any) => ({ ...reg, type: 'team' }))
      ].sort((a: any, b: any) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());

      setRegistrations(allRegistrations);
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

  const handleWithdraw = async (registrationId: string, type: string) => {
    try {
      const response = await fetch(`/api/registrations/${registrationId}?type=${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'withdrawn'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to withdraw registration');
      }

      notifications.showSuccess({
        title: "Registration Withdrawn",
        description: "Your registration has been withdrawn successfully."
      });

      // Refresh data
      fetchRegistrations();
      setDialogOpen(false);

    } catch (error) {
      console.error('Error withdrawing registration:', error);
      notifications.showError({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Rejected' },
      withdrawn: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle, text: 'Withdrawn' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1 px-3 py-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getStatusDescription = (status: string) => {
    const descriptions = {
      pending: "Your registration is under review by the admin team.",
      approved: "Congratulations! Your registration has been approved.",
      rejected: "Your registration was not approved. Check admin notes for details.",
      withdrawn: "You have withdrawn this registration.",
    };
    return descriptions[status as keyof typeof descriptions] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Registrations</h1>
          <p className="text-gray-600">Track your sports event registrations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {['pending', 'approved', 'rejected', 'withdrawn'].map((status) => {
            const count = registrations.filter(reg => reg.status === status).length;
            const colors = {
              pending: 'border-yellow-200 bg-yellow-50',
              approved: 'border-green-200 bg-green-50',
              rejected: 'border-red-200 bg-red-50',
              withdrawn: 'border-gray-200 bg-gray-50'
            };
            
            return (
              <Card key={status} className={`${colors[status as keyof typeof colors]} border-2`}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{status}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* New Registration Button */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <Plus className="h-8 w-8 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Register for New Events</h3>
            <p className="text-blue-100 mb-4">Join individual competitions or create team registrations</p>
            <Link href="/register">
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-2" />
                New Registration
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Registrations List */}
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Registrations Yet</h3>
                <p className="text-gray-600 mb-6">You haven't registered for any events. Start by registering for your favorite sports!</p>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Register Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            registrations.map((registration) => (
              <Card key={registration.id} className="bg-white/95 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{registration.sports?.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {(registration as any).type === 'individual' 
                              ? `${registration.sports?.name} - Individual` 
                              : `${registration.team_name} - ${registration.sports?.name}`
                            }
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(registration.status)}
                            {(registration as any).type === 'individual' ? (
                              <Badge variant="outline" className="text-xs">
                                <User className="h-3 w-3 mr-1" />
                                Individual
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Team
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {getStatusDescription(registration.status)}
                      </p>

                      <div className="text-xs text-gray-500">
                        Registered on {new Date(registration.registered_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRegistration(registration);
                          setDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {registration.status === 'pending' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleWithdraw(registration.id, (registration as any).type)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Registration Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRegistration && (
                  <>
                    <span className="text-2xl">{selectedRegistration.sports?.icon}</span>
                    Registration Details
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedRegistration && (
              <div className="space-y-6">
                {/* Status */}
                <div className="text-center">
                  {getStatusBadge(selectedRegistration.status)}
                  <p className="text-sm text-gray-600 mt-2">
                    {getStatusDescription(selectedRegistration.status)}
                  </p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Sport:</span> {selectedRegistration.sports?.name}</div>
                  <div><span className="font-medium">Type:</span> {(selectedRegistration as any).type === 'individual' ? 'Individual' : 'Team'}</div>
                  <div><span className="font-medium">Registered:</span> {new Date(selectedRegistration.registered_at).toLocaleDateString()}</div>
                  <div><span className="font-medium">Status:</span> {selectedRegistration.status}</div>
                </div>

                {/* Individual Details */}
                {(selectedRegistration as any).type === 'individual' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedRegistration.student_name}</div>
                    <div><span className="font-medium">Skill Level:</span> {selectedRegistration.skill_level}</div>
                  </div>
                )}

                {/* Team Details */}
                {(selectedRegistration as any).type === 'team' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Team Name:</span> {selectedRegistration.team_name}</div>
                      <div><span className="font-medium">Captain:</span> {selectedRegistration.captain_name}</div>
                      <div><span className="font-medium">Members:</span> {selectedRegistration.required_members}</div>
                    </div>
                    
                    {/* Team Members List */}
                    {selectedRegistration.team_registration_members && (
                      <div>
                        <h4 className="font-medium mb-2">Team Members:</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          {selectedRegistration.team_registration_members
                            .sort((a, b) => a.member_order - b.member_order)
                            .map((member, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">#{member.member_order}</span>
                                <span className="font-medium">{member.member_name}</span>
                                {member.is_captain && <Badge variant="secondary" className="text-xs">Captain</Badge>}
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
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm">{selectedRegistration.admin_notes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  {selectedRegistration.status === 'pending' && (
                    <Button
                      variant="destructive"
                      onClick={() => handleWithdraw(selectedRegistration.id, (selectedRegistration as any).type)}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Withdraw Registration
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}