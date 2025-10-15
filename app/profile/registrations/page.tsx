"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Eye, Plus, User, Users, Calendar, TrendingUp, Target, Award, Zap, Crown } from "lucide-react";
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
      <Badge className={`${config.color} border flex items-center gap-1 px-3 py-1 font-semibold`}>
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

  // Calculate stats for overview
  const pendingCount = registrations.filter(reg => reg.status === 'pending').length;
  const approvedCount = registrations.filter(reg => reg.status === 'approved').length;
  const rejectedCount = registrations.filter(reg => reg.status === 'rejected').length;
  const withdrawnCount = registrations.filter(reg => reg.status === 'withdrawn').length;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-semibold">My Registrations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
            Registration Dashboard
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Track and manage all your sports event registrations in one place
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-yellow-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900">{withdrawnCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Registration Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Plus className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Ready for New Adventures?</h3>
            <p className="text-blue-100 mb-5 max-w-2xl mx-auto">
              Join individual competitions or create team registrations to showcase your skills
            </p>
            <Link href="/register">
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Register for Events
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Registrations List */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Recent Registrations
            </h2>
            <Badge variant="secondary" className="text-sm font-semibold">
              {registrations.length} Total
            </Badge>
          </div>

          {registrations.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl rounded-xl">
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                  <Calendar className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Registrations Yet</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  You haven't registered for any events. Start by registering for your favorite sports!
                </p>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="h-5 w-5 mr-2" />
                    Register Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5">
              {registrations.map((registration, index) => (
                <Card 
                  key={registration.id} 
                  className="bg-white/95 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="text-3xl p-2 bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl">
                            {registration.sports?.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">
                              {(registration as any).type === 'individual' 
                                ? `${registration.sports?.name} - Individual` 
                                : `${registration.team_name} - ${registration.sports?.name}`
                              }
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {getStatusBadge(registration.status)}
                              {(registration as any).type === 'individual' ? (
                                <Badge variant="outline" className="text-xs font-semibold border-2 border-blue-200 text-blue-700">
                                  <User className="h-3 w-3 mr-1" />
                                  Individual
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs font-semibold border-2 border-purple-200 text-purple-700">
                                  <Users className="h-3 w-3 mr-1" />
                                  Team
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">
                              {getStatusDescription(registration.status)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Registered on {new Date(registration.registered_at).toLocaleDateString()}</span>
                          </div>
                          {(registration as any).type === 'team' && registration.required_members && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              <span>{registration.required_members} members</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setDialogOpen(true);
                          }}
                          className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View Details
                        </Button>
                        
                        {registration.status === 'pending' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleWithdraw(registration.id, (registration as any).type)}
                            className="font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <XCircle className="h-4 w-4 mr-1.5" />
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Registration Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            <DialogHeader className="border-b border-slate-100 pb-4">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                {selectedRegistration && (
                  <>
                    <div className="text-3xl p-2 bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl">
                      {selectedRegistration.sports?.icon}
                    </div>
                    Registration Details
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedRegistration && (
              <div className="space-y-6 py-4">
                {/* Status */}
                <div className="text-center p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
                  <div className="inline-block">
                    {getStatusBadge(selectedRegistration.status)}
                  </div>
                  <p className="text-sm text-slate-600 mt-3">
                    {getStatusDescription(selectedRegistration.status)}
                  </p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Sport</p>
                      <p className="font-semibold text-slate-900">{selectedRegistration.sports?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Type</p>
                      <p className="font-semibold text-slate-900">
                        {(selectedRegistration as any).type === 'individual' ? 'Individual' : 'Team'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Registered</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(selectedRegistration.registered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Award className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Status</p>
                      <p className="font-semibold text-slate-900 capitalize">{selectedRegistration.status}</p>
                    </div>
                  </div>
                </div>

                {/* Individual Details */}
                {(selectedRegistration as any).type === 'individual' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <User className="h-5 w-5 text-blue-600" />
                        Individual Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Name</p>
                        <p className="font-semibold text-slate-900">{selectedRegistration.student_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Skill Level</p>
                        <p className="font-semibold text-slate-900">{selectedRegistration.skill_level}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Team Details */}
                {(selectedRegistration as any).type === 'team' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <Users className="h-5 w-5 text-purple-600" />
                        Team Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Team Name</p>
                          <p className="font-semibold text-slate-900">{selectedRegistration.team_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Captain</p>
                          <p className="font-semibold text-slate-900">{selectedRegistration.captain_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Members</p>
                          <p className="font-semibold text-slate-900">{selectedRegistration.required_members}</p>
                        </div>
                      </div>
                      
                      {/* Team Members List */}
                      {selectedRegistration.team_registration_members && (
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            Team Members
                          </h4>
                          <div className="space-y-2">
                            {selectedRegistration.team_registration_members
                              .sort((a, b) => a.member_order - b.member_order)
                              .map((member, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                    {member.member_name.charAt(0)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-900">{member.member_name}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {member.is_captain && (
                                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold">
                                        <Crown className="h-3 w-3 mr-1" />
                                        Captain
                                      </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-xs font-semibold">
                                      #{member.member_order}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Admin Notes */}
                {selectedRegistration.admin_notes && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <Zap className="h-5 w-5 text-amber-600" />
                        Admin Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-slate-700">{selectedRegistration.admin_notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                  {selectedRegistration.status === 'pending' && (
                    <Button
                      variant="destructive"
                      onClick={() => handleWithdraw(selectedRegistration.id, (selectedRegistration as any).type)}
                      className="flex-1 font-semibold py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Withdraw Registration
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-all duration-300"
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