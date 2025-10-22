"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  User, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Eye,
  Calendar,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
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

interface RegistrationCardProps {
  setting: RegistrationSetting;
  sports: Sport[];
  onToggleStatus: (settingId: string, isOpen: boolean) => void;
  onViewDetails: (setting: RegistrationSetting) => void;
  onEdit: (setting: RegistrationSetting) => void;
}

export function RegistrationCard({
  setting,
  sports,
  onToggleStatus,
  onViewDetails,
  onEdit
}: RegistrationCardProps) {
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
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors px-3 py-1 text-xs">
        <Play className="w-3 h-3 mr-1" />
        Open
      </Badge> :
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors px-3 py-1 text-xs">
        <Pause className="w-3 h-3 mr-1" />
        Closed
      </Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
      onClick={() => onViewDetails(setting)}
    >
      <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 bg-white/90 backdrop-blur-sm rounded-xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-4">
              <div className="text-4xl p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                {getSportIcon(setting.sport_id)}
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">{getSportName(setting.sport_id)}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {isTeamSport(setting.sport_id) ? (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1 px-3 py-1">
                      <Users className="w-3 h-3" />
                      Team Sport
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1 px-3 py-1">
                      <User className="w-3 h-3" />
                      Individual
                    </Badge>
                  )}
                  {getStatusBadge(setting.registration_open)}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(setting);
              }}
              className="h-9 w-9 p-0 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:text-blue-700 hover:shadow-sm"
            >
              <Edit3 className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          
          {/* Details */}
          <div className="space-y-4 mb-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Registration Period:
              </span>
              <div className="text-right">
                {setting.registration_start ? (
                  <div className="font-medium">
                    {format(new Date(setting.registration_start), 'MMM d, yyyy')}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Not set</span>
                )}
                <div className="text-gray-400 text-xs flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  to
                </div>
                {setting.registration_end ? (
                  <div className="font-medium">
                    {format(new Date(setting.registration_end), 'MMM d, yyyy')}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </div>
            </div>
            
            {isTeamSport(setting.sport_id) && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Size:
                </span>
                <span className="font-medium">
                  {setting.min_team_size || '?'} - {setting.max_team_size || '?'} players
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approval Required:
              </span>
              <div className="flex items-center gap-2">
                {setting.requires_approval ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">{setting.requires_approval ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(setting.id, !setting.registration_open);
              }}
              className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
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
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(setting);
              }}
              className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}