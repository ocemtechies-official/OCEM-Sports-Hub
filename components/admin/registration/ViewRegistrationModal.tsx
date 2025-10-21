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
  Edit3
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
      <Badge className="bg-green-100 text-green-800">
        <Play className="w-3 h-3 mr-1" />
        Open
      </Badge> :
      <Badge className="bg-red-100 text-red-800">
        <Pause className="w-3 h-3 mr-1" />
        Closed
      </Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getSportIcon(setting?.sport_id || '')}</span>
            {setting && getSportName(setting.sport_id)} Registration Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about registration settings for this sport
          </DialogDescription>
        </DialogHeader>
        
        {setting && (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Sport Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sport Name:</span>
                    <span className="font-medium">{getSportName(setting.sport_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sport Type:</span>
                    <div>
                      {isTeamSport(setting.sport_id) ? (
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          Team Sport
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <User className="w-3 h-3 mr-1" />
                          Individual Sport
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <div>
                      {getStatusBadge(setting.registration_open)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Registration Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-500 block mb-1">Start Date:</span>
                    {setting.registration_start ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{format(new Date(setting.registration_start), 'MMMM d, yyyy h:mm a')}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">End Date:</span>
                    {setting.registration_end ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{format(new Date(setting.registration_end), 'MMMM d, yyyy h:mm a')}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {isTeamSport(setting.sport_id) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Minimum Players:</span>
                    <span className="font-medium">
                      {setting.min_team_size || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Maximum Players:</span>
                    <span className="font-medium">
                      {setting.max_team_size || 'Not set'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Registration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mixed Gender Allowed:</span>
                  <div className="flex items-center gap-2">
                    {setting.allow_mixed_gender ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>{setting.allow_mixed_gender ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mixed Department Allowed:</span>
                  <div className="flex items-center gap-2">
                    {setting.allow_mixed_department ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>{setting.allow_mixed_department ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Approval Required:</span>
                  <div className="flex items-center gap-2">
                    {setting.requires_approval ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>{setting.requires_approval ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                {setting.max_registrations_per_sport && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Max Registrations:</span>
                    <span className="font-medium">
                      {setting.max_registrations_per_sport}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(setting);
                }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Settings
              </Button>
              <Button
                variant="secondary"
                onClick={() => onToggleStatus(setting.id, !setting.registration_open)}
              >
                {setting.registration_open ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Close Registration
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Open Registration
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}