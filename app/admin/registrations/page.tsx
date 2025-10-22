"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  User, 
  Eye, 
  MessageSquare, 
  Filter, 
  Search, 
  Loader2, 
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Calendar,
  MapPin,
  Phone,
  Trophy,
  Target,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notifications } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";
import RegistrationDetailModal from "@/components/admin/RegistrationDetailModal";

// Enhanced interface definitions with better typing
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

// Enhanced status configuration with animations
const statusConfig = {
  pending: { 
    color: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 hover:from-yellow-200 hover:to-amber-200', 
    icon: Clock,
    label: 'Pending Review',
    description: 'Awaiting admin approval'
  },
  approved: { 
    color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 hover:from-green-200 hover:to-emerald-200', 
    icon: CheckCircle,
    label: 'Approved',
    description: 'Registration confirmed'
  },
  rejected: { 
    color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 hover:from-red-200 hover:to-rose-200', 
    icon: XCircle,
    label: 'Rejected',
    description: 'Registration declined'
  },
  withdrawn: { 
    color: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 hover:from-gray-200 hover:to-slate-200', 
    icon: AlertTriangle,
    label: 'Withdrawn',
    description: 'Registration cancelled'
  },
};

export default function AdminRegistrationsPage() {
  // Enhanced state management with better typing
  const [individualRegistrations, setIndividualRegistrations] = useState<IndividualRegistration[]>([]);
  const [teamRegistrations, setTeamRegistrations] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Optimized data fetching with better error handling
  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseBrowserClient();

      // Fetch both individual and team registrations in parallel
      const [individualResult, teamResult] = await Promise.all([
        supabase
          .from('individual_registrations')
          .select(`
            *,
            sports:sport_id (
              name,
              icon
            )
          `)
          .order('registered_at', { ascending: false }),
        supabase
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
          .order('registered_at', { ascending: false })
      ]);

      if (individualResult.error) {
        console.error('Individual registrations error:', individualResult.error);
        throw new Error(`Failed to load individual registrations: ${individualResult.error.message}`);
      }

      if (teamResult.error) {
        console.error('Team registrations error:', teamResult.error);
        throw new Error(`Failed to load team registrations: ${teamResult.error.message}`);
      }

      setIndividualRegistrations(individualResult.data || []);
      setTeamRegistrations(teamResult.data || []);

    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load registrations');
      
      notifications.showError({
        title: "Loading Failed ❌",
        description: "Unable to load registrations. Please try again."
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced initialization with retry logic
  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      if (isMounted) {
        await fetchRegistrations();
      }
    };
    
    initializeData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchRegistrations]);

  // Enhanced status update with better UX
  const handleStatusUpdate = useCallback(async (registrationId: string, newStatus: string, type: 'individual' | 'team') => {
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
        title: "Updated ✅",
        description: `Registration ${newStatus} successfully`
      });

      // Update local state instead of refetching all data
      const updateRegistration = (registrations: any[], id: string, status: string) => {
        return registrations.map(reg => 
          reg.id === id ? { ...reg, status, admin_notes: adminNotes } : reg
        );
      };

      if (type === 'individual') {
        setIndividualRegistrations(prev => updateRegistration(prev, registrationId, newStatus));
      } else {
        setTeamRegistrations(prev => updateRegistration(prev, registrationId, newStatus));
      }

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
  }, [adminNotes, fetchRegistrations]);

  // Enhanced retry mechanism
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Enhanced status badge component
  const getStatusBadge = useCallback((status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Badge className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border shadow-sm hover:shadow-md hover:scale-105",
          config.color
        )}>
          <IconComponent className="w-3 h-3" />
          {config.label}
        </Badge>
      </motion.div>
    );
  }, []);

  // Memoized filtered data for performance
  const filteredData = useMemo(() => {
    const filterByStatus = (items: any[]) => {
      return statusFilter === 'all' ? items : items.filter(item => item.status === statusFilter);
    };

    const filterBySearch = (items: any[]) => {
      if (!searchTerm) return items;
      const term = searchTerm.toLowerCase();
      return items.filter(item => 
        (item.student_name?.toLowerCase().includes(term)) ||
        (item.team_name?.toLowerCase().includes(term)) ||
        (item.roll_number?.toLowerCase().includes(term)) ||
        (item.department?.toLowerCase().includes(term)) ||
        (item.sports?.name?.toLowerCase().includes(term))
      );
    };

    return {
      individual: filterBySearch(filterByStatus(individualRegistrations)),
      team: filterBySearch(filterByStatus(teamRegistrations))
    };
  }, [individualRegistrations, teamRegistrations, statusFilter, searchTerm]);

  // Enhanced statistics
  const stats = useMemo(() => {
    const allRegistrations = [...individualRegistrations, ...teamRegistrations];
    return {
      total: allRegistrations.length,
      pending: allRegistrations.filter(r => r.status === 'pending').length,
      approved: allRegistrations.filter(r => r.status === 'approved').length,
      rejected: allRegistrations.filter(r => r.status === 'rejected').length,
    };
  }, [individualRegistrations, teamRegistrations]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="animate-pulse">
            <CardHeader className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-12"
    >
      <Card className="border-dashed border-2 border-destructive/50 bg-destructive/5">
        <CardContent className="pt-8">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Failed to Load Registrations</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetry} className="hover:scale-105 transition-transform">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry ({retryCount})
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Enhanced registration card component
  const RegistrationCard = ({ registration, type }: { registration: any; type: 'individual' | 'team' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:shadow-blue-100/50 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                  {type === 'individual' ? (
                    <User className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Users className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {type === 'individual' ? registration.student_name : registration.team_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {registration.sports?.name || 'Unknown Sport'} • ID: {registration.id.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(registration.status)}
              <span className="text-xs text-gray-500">
                {new Date(registration.registered_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Registration Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {type === 'individual' ? registration.roll_number : registration.captain_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {type === 'individual' ? registration.contact_number : registration.captain_contact}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {registration.department} - Sem {registration.semester}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {registration.gender} • {type === 'individual' ? registration.skill_level : `${registration.team_registration_members?.length || 0} members`}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-gray-100">
            <Button
              onClick={() => {
                setSelectedRegistration({ ...registration, type });
                setDialogOpen(true);
                setAdminNotes(registration.admin_notes || '');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Review Registration
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Main render with enhanced UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-purple-50/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-2 md:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-start animate-fade-in-up mb-2"
        >
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Registration Management
            </h1>
            <p className="text-gray-500 text-sm">Manage and review sports event registrations</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <Link href="/admin/registrations/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Total', value: stats.total, icon: Users, color: 'from-blue-500 to-blue-600' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-orange-500' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-rose-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={cn("p-3 rounded-xl bg-gradient-to-r shadow-lg", stat.color)}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search registrations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-white/80 border-gray-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-0 shadow-md p-1">
              <TabsTrigger 
                value="individual" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                <User className="h-4 w-4 mr-2" />
                Individual ({filteredData.individual.length})
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Team ({filteredData.team.length})
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <LoadingSkeleton />
                ) : error ? (
                  <ErrorState />
                ) : (
                  <>
                    <TabsContent value="individual" className="space-y-4">
                      {filteredData.individual.length > 0 ? (
                        <div className="grid gap-4">
                          {filteredData.individual.map((registration) => (
                            <RegistrationCard 
                              key={registration.id} 
                              registration={registration} 
                              type="individual" 
                            />
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12"
                        >
                          <Card className="border-dashed border-2">
                            <CardContent className="pt-8">
                              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No individual registrations found</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </TabsContent>

                    <TabsContent value="team" className="space-y-4">
                      {filteredData.team.length > 0 ? (
                        <div className="grid gap-4">
                          {filteredData.team.map((registration) => (
                            <RegistrationCard 
                              key={registration.id} 
                              registration={registration} 
                              type="team" 
                            />
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12"
                        >
                          <Card className="border-dashed border-2">
                            <CardContent className="pt-8">
                              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No team registrations found</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </TabsContent>
                  </>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>

        {/* Registration Detail Modal */}
        <RegistrationDetailModal
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          registration={selectedRegistration}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
          onStatusUpdate={handleStatusUpdate}
          updatingStatus={updatingStatus}
        />

      </div>
    </div>
  );
}