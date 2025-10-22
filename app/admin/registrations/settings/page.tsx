"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Save, 
  RefreshCw,
  Edit3,
  Eye,
  Play,
  Pause,
  AlertCircle,
  Trophy,
  Search,
  Filter,
  User,
  Settings
} from "lucide-react";
import { notifications } from "@/lib/notifications";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { RegistrationCard } from "@/components/admin/registration/RegistrationCard";
import { ViewRegistrationModal } from "@/components/admin/registration/ViewRegistrationModal";
import { EditRegistrationModal } from "@/components/admin/registration/EditRegistrationModal";
import { RegistrationSkeleton } from "@/components/admin/registration/RegistrationSkeleton";
import { ConfirmationModal } from "@/components/admin/registration/ConfirmationModal";

interface Sport {
  id: string;
  name: string;
  icon: string | null;
  is_team_sport: boolean;
  is_active: boolean;
}

interface RegistrationSetting {
  id: string;
  sport_id: string;
  registration_open: boolean;
  registration_start: string | null;
  registration_end: string | null;
  min_team_size: number | null;
  max_team_size: number | null;
  allow_mixed_gender: boolean;
  allow_mixed_department: boolean;
  requires_approval: boolean;
  max_registrations_per_sport: number | null;
  sport?: Sport;
}

export default function RegistrationSettingsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [settings, setSettings] = useState<RegistrationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editedSettings, setEditedSettings] = useState<Record<string, Partial<RegistrationSetting>>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");
  const [filterType, setFilterType] = useState<"all" | "team" | "individual">("all");
  const [viewingSetting, setViewingSetting] = useState<RegistrationSetting | null>(null);
  const [editingSettingData, setEditingSettingData] = useState<RegistrationSetting | null>(null);
  const [showOpenAllConfirm, setShowOpenAllConfirm] = useState(false);
  const [showCloseAllConfirm, setShowCloseAllConfirm] = useState(false);

  useEffect(() => {
    fetchSportsAndSettings();
  }, []);

  const fetchSportsAndSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch sports
      const sportsResponse = await fetch('/api/sports');
      const sportsData = await sportsResponse.json();
      
      // Fetch registration settings
      const settingsResponse = await fetch('/api/registration/settings');
      const settingsData = await settingsResponse.json();
      
      setSports(sportsData.sports || []);
      setSettings(settingsData.settings || []);
      
      // Initialize edited settings
      const initialEditedSettings: Record<string, Partial<RegistrationSetting>> = {};
      (settingsData.settings || []).forEach((setting: RegistrationSetting) => {
        initialEditedSettings[setting.id] = {};
      });
      setEditedSettings(initialEditedSettings);
    } catch (error) {
      console.error('Error fetching data:', error);
      notifications.showError({
        title: "Load Failed ❌",
        description: "Failed to load sports and registration settings"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingId: string, field: keyof RegistrationSetting, value: any) => {
    setEditedSettings(prev => ({
      ...prev,
      [settingId]: {
        ...prev[settingId],
        [field]: value
      }
    }));
  };

  const saveSetting = async (settingId: string) => {
    try {
      setSaving(true);
      
      const updatedData = {
        ...settings.find(s => s.id === settingId),
        ...editedSettings[settingId]
      };
      
      const response = await fetch(`/api/registration/settings/${settingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update registration setting');
      }
      
      const updatedSetting = await response.json();
      
      // Update local state
      setSettings(prev => prev.map(s => s.id === settingId ? updatedSetting : s));
      setEditedSettings(prev => {
        const newEdited = { ...prev };
        delete newEdited[settingId];
        return newEdited;
      });
      setEditingSetting(null);
      
      notifications.showSuccess({
        title: "Setting Updated ✅",
        description: "Registration setting has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      notifications.showError({
        title: "Update Failed ❌",
        description: "Failed to update registration setting"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleRegistrationOpen = async (settingId: string, isOpen: boolean) => {
    try {
      const response = await fetch(`/api/registration/settings/${settingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registration_open: isOpen }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update registration status');
      }
      
      const updatedSetting = await response.json();
      
      // Update local state
      setSettings(prev => prev.map(s => s.id === settingId ? updatedSetting : s));
      
      notifications.showSuccess({
        title: "Status Updated ✅",
        description: `Registration has been ${isOpen ? 'opened' : 'closed'}`
      });
    } catch (error) {
      console.error('Error updating registration status:', error);
      notifications.showError({
        title: "Update Failed ❌",
        description: "Failed to update registration status"
      });
    }
  };

  const openAllRegistrations = async () => {
    setShowOpenAllConfirm(true);
  };

  const handleOpenAllConfirm = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/registration/settings/open-all', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to open all registrations');
      }
      
      // Refresh data
      await fetchSportsAndSettings();
      
      notifications.showSuccess({
        title: "All Registrations Opened ✅",
        description: "Registration is now open for all sports"
      });
    } catch (error) {
      console.error('Error opening all registrations:', error);
      notifications.showError({
        title: "Operation Failed ❌",
        description: "Failed to open registration for all sports"
      });
    } finally {
      setLoading(false);
    }
  };

  const closeAllRegistrations = async () => {
    setShowCloseAllConfirm(true);
  };

  const handleCloseAllConfirm = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/registration/settings/close-all', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to close all registrations');
      }
      
      // Refresh data
      await fetchSportsAndSettings();
      
      notifications.showSuccess({
        title: "All Registrations Closed ✅",
        description: "Registration is now closed for all sports"
      });
    } catch (error) {
      console.error('Error closing all registrations:', error);
      notifications.showError({
        title: "Operation Failed ❌",
        description: "Failed to close registration for all sports"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSportName = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    return sport ? sport.name : 'Unknown Sport';
  };

  const getSportIcon = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    return sport?.icon || '🏆';
  };

  const isTeamSport = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    return sport?.is_team_sport || false;
  };

  const getStatusBadge = (isOpen: boolean) => {
    return isOpen ? 
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
        <Play className="w-3 h-3 mr-1" />
        Open
      </Badge> :
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors">
        <Pause className="w-3 h-3 mr-1" />
        Closed
      </Badge>;
  };

  // Filter settings based on search term and filters
  const filteredSettings = settings.filter(setting => {
    const sport = sports.find(s => s.id === setting.sport_id);
    const matchesSearch = getSportName(setting.sport_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "open" && setting.registration_open) || 
                         (filterStatus === "closed" && !setting.registration_open);
    const matchesType = filterType === "all" || 
                       (filterType === "team" && sport?.is_team_sport) || 
                       (filterType === "individual" && !sport?.is_team_sport);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return <RegistrationSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header with enhanced styling */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Registration Settings</h1>
          <p className="text-slate-600 mt-2 text-lg">Manage registration periods and settings for all sports</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={openAllRegistrations} 
            variant="outline"
            className="py-3 px-5 text-base font-medium rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors hover:shadow-md"
          >
            <Play className="mr-2 h-5 w-5" />
            Open All
          </Button>
          <Button 
            onClick={closeAllRegistrations} 
            variant="outline"
            className="py-3 px-5 text-base font-medium rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors hover:shadow-md"
          >
            <Pause className="mr-2 h-5 w-5" />
            Close All
          </Button>
          <Button 
            onClick={fetchSportsAndSettings} 
            variant="outline"
            className="py-3 px-5 text-base font-medium rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors hover:shadow-md"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Enhanced filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search Sports</Label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search by sport name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-3 text-base rounded-lg"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium mb-2 block">Registration Status</Label>
                <div>
                  <select
                    id="status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="type" className="text-sm font-medium mb-2 block">Sport Type</Label>
                <div>
                  <select
                    id="type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Types</option>
                    <option value="team">Team Sports</option>
                    <option value="individual">Individual Sports</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <Card className="border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sports</p>
                <p className="text-2xl font-bold">{settings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Registrations</p>
                <p className="text-2xl font-bold">{settings.filter(s => s.registration_open).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Pause className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Closed Registrations</p>
                <p className="text-2xl font-bold">{settings.filter(s => !s.registration_open).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Sports</p>
                <p className="text-2xl font-bold">{settings.filter(s => isTeamSport(s.sport_id)).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sports Cards Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Trophy className="h-6 w-6" />
              Sports Registration Settings
            </CardTitle>
            <CardDescription className="text-base">
              Click on any sport card to view or edit its registration settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSettings.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No registration settings found</h3>
                <p className="text-gray-500 mb-6 text-lg">
                  {settings.length === 0 
                    ? "Registration settings will be created automatically when sports are added." 
                    : "No sports match your current filters."}
                </p>
                {settings.length > 0 && (
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                      setFilterType("all");
                    }} 
                    variant="outline"
                    className="py-2 px-6 text-base rounded-lg"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredSettings.map((setting) => (
                    <RegistrationCard
                      key={setting.id}
                      setting={setting}
                      sports={sports}
                      onToggleStatus={toggleRegistrationOpen}
                      onViewDetails={setViewingSetting}
                      onEdit={setEditingSettingData}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Detail Modal */}
      <ViewRegistrationModal
        setting={viewingSetting}
        sports={sports}
        open={!!viewingSetting}
        onOpenChange={(open) => !open && setViewingSetting(null)}
        onEdit={setEditingSettingData}
        onToggleStatus={toggleRegistrationOpen}
      />

      {/* Edit Modal */}
      <EditRegistrationModal
        setting={editingSettingData}
        sports={sports}
        open={!!editingSettingData}
        onOpenChange={(open) => !open && setEditingSettingData(null)}
        onSave={(updatedSetting) => {
          // Update local state
          setSettings(prev => prev.map(s => s.id === updatedSetting.id ? updatedSetting : s));
          setEditingSettingData(null);
        }}
      />

      {/* Open All Confirm Modal */}
      <ConfirmationModal
        open={showOpenAllConfirm}
        onOpenChange={setShowOpenAllConfirm}
        title="Open All Registrations"
        description="Are you sure you want to open registration for all sports? This will allow users to register for all sports."
        confirmText="Open All"
        cancelText="Cancel"
        onConfirm={handleOpenAllConfirm}
        type="warning"
      />

      {/* Close All Confirm Modal */}
      <ConfirmationModal
        open={showCloseAllConfirm}
        onOpenChange={setShowCloseAllConfirm}
        title="Close All Registrations"
        description="Are you sure you want to close registration for all sports? This will prevent users from registering for any sports."
        confirmText="Close All"
        cancelText="Cancel"
        onConfirm={handleCloseAllConfirm}
        type="warning"
      />
    </div>
  );
}