"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Calendar, 
  Users, 
  User, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  Settings,
  Edit3,
  Clock,
  Hash,
  VenetianMask,
  Building
} from "lucide-react";
import { format } from "date-fns";

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

interface ViewRegistrationModalProps {
  setting: RegistrationSetting | null;
  sports: Sport[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (setting: RegistrationSetting) => void;
  onToggleStatus: (settingId: string, isOpen: boolean) => void;
}

export function ViewRegistrationModal({
  setting,
  sports,
  open,
  onOpenChange,
  onEdit,
  onToggleStatus
}: ViewRegistrationModalProps) {
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
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors px-3 py-1 text-sm">
        <Play className="w-4 h-4 mr-1" />
        Open
      </Badge> :
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors px-3 py-1 text-sm">
        <Pause className="w-4 h-4 mr-1" />
        Closed
      </Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-xl">
        {setting && (
          <>
            {/* Header with enhanced gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white rounded-t-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4 text-3xl font-bold">
                  <span className="text-4xl">{getSportIcon(setting.sport_id)}</span>
                  <div>
                    <div className="flex items-center gap-3">
                      {getSportName(setting.sport_id)}
                      {getStatusBadge(setting.registration_open)}
                    </div>
                    <div className="text-xl font-normal opacity-90 mt-1">
                      Registration Settings
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-3 text-lg">
                  Detailed configuration for {getSportName(setting.sport_id)} registration
                </DialogDescription>
              </DialogHeader>
            </div>
            
            {/* Content with improved spacing and layout */}
            <div className="p-6 space-y-6 bg-gray-50">
              {/* Sport Information Card */}
              <Card className="border-0 shadow-lg rounded-xl">
                <CardHeader className="pb-4 border-b bg-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <Trophy className="h-6 w-6 text-blue-600" />
                    Sport Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 bg-white rounded-b-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1">Sport Name</span>
                      <span className="font-medium text-lg">{getSportName(setting.sport_id)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1">Sport Type</span>
                      <div>
                        {isTeamSport(setting.sport_id) ? (
                          <Badge variant="secondary" className="flex items-center gap-2 py-1 px-3 text-sm">
                            <Users className="w-4 h-4" />
                            Team Sport
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-2 py-1 px-3 text-sm">
                            <User className="w-4 h-4" />
                            Individual Sport
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1">Current Status</span>
                      <div>
                        {getStatusBadge(setting.registration_open)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Registration Period Card */}
              <Card className="border-0 shadow-lg rounded-xl">
                <CardHeader className="pb-4 border-b bg-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    Registration Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 bg-white rounded-b-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Start Date & Time
                      </span>
                      {setting.registration_start ? (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="font-medium text-lg">{format(new Date(setting.registration_start), 'MMMM d, yyyy')}</span>
                          <div className="text-gray-600 mt-1">{format(new Date(setting.registration_start), 'h:mm a')}</div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 text-gray-500 italic">
                          Not set
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        End Date & Time
                      </span>
                      {setting.registration_end ? (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="font-medium text-lg">{format(new Date(setting.registration_end), 'MMMM d, yyyy')}</span>
                          <div className="text-gray-600 mt-1">{format(new Date(setting.registration_end), 'h:mm a')}</div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 text-gray-500 italic">
                          Not set
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Team Configuration Card (only for team sports) */}
              {isTeamSport(setting.sport_id) && (
                <Card className="border-0 shadow-lg rounded-xl">
                  <CardHeader className="pb-4 border-b bg-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <Users className="h-6 w-6 text-blue-600" />
                      Team Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 bg-white rounded-b-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm mb-1 flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          Minimum Players
                        </span>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="font-medium text-2xl">
                            {setting.min_team_size || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm mb-1 flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          Maximum Players
                        </span>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="font-medium text-2xl">
                            {setting.max_team_size || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Registration Settings Card */}
              <Card className="border-0 shadow-lg rounded-xl">
                <CardHeader className="pb-4 border-b bg-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <Settings className="h-6 w-6 text-blue-600" />
                    Registration Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 bg-white rounded-b-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <VenetianMask className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Mixed Gender Allowed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {setting.allow_mixed_gender ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <span className="font-medium">{setting.allow_mixed_gender ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Mixed Department Allowed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {setting.allow_mixed_department ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <span className="font-medium">{setting.allow_mixed_department ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Approval Required</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {setting.requires_approval ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <span className="font-medium">{setting.requires_approval ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    {setting.max_registrations_per_sport && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Hash className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700">Max Registrations</span>
                        </div>
                        <span className="font-medium text-xl">
                          {setting.max_registrations_per_sport}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(setting);
                  }}
                  className="flex-1 py-3 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-md hover:bg-blue-50 hover:text-blue-700"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit Settings
                </Button>
                <Button
                  variant={setting.registration_open ? "destructive" : "default"}
                  onClick={() => onToggleStatus(setting.id, !setting.registration_open)}
                  className="flex-1 py-3 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  {setting.registration_open ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Close Registration
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Open Registration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}