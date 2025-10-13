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
  Calendar
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
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
        <Play className="w-3 h-3 mr-1" />
        Open
      </Badge> :
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors">
        <Pause className="w-3 h-3 mr-1" />
        Closed
      </Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={() => onViewDetails(setting)}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getSportIcon(setting.sport_id)}</span>
              <div>
                <h3 className="font-bold text-lg">{getSportName(setting.sport_id)}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {isTeamSport(setting.sport_id) ? (
                    <Badge variant="secondary" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Team Sport
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <User className="w-3 h-3 mr-1" />
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
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Period:</span>
              <div className="text-right">
                {setting.registration_start ? (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    {format(new Date(setting.registration_start), 'MMM d')}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Not set</span>
                )}
                <div className="text-gray-400 text-xs">to</div>
                {setting.registration_end ? (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    {format(new Date(setting.registration_end), 'MMM d')}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </div>
            </div>
            
            {isTeamSport(setting.sport_id) && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Team Size:</span>
                <span>
                  {setting.min_team_size || '?'} - {setting.max_team_size || '?'} players
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Approval:</span>
              <div className="flex items-center gap-1">
                {setting.requires_approval ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>{setting.requires_approval ? 'Required' : 'Not Required'}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(setting.id, !setting.registration_open);
              }}
              className="text-xs"
            >
              {setting.registration_open ? (
                <>
                  <Pause className="w-3 h-3 mr-1" />
                  Close
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Open
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
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}