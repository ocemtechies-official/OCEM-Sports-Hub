"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  Users, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle,
  Edit3
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { RescheduleFixtureDialog } from "@/components/admin/reschedule-fixture-dialog";

interface Fixture {
  id: string;
  scheduled_at: string;
  venue: string | null;
  status: string;
  team_a_score: number;
  team_b_score: number;
  team_a: { id: string; name: string } | null;
  team_b: { id: string; name: string } | null;
  sport: { id: string; name: string; icon: string } | null;
}

interface ViewFixtureModalProps {
  fixture: Fixture | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (fixture: Fixture) => void;
}

export function ViewFixtureModal({
  fixture,
  open,
  onOpenChange,
  onEdit
}: ViewFixtureModalProps) {
  if (!fixture) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: {
        icon: <Play className="w-4 h-4 mr-2" />,
        text: "Scheduled",
        className: "bg-blue-100 text-blue-800"
      },
      live: {
        icon: <Play className="w-4 h-4 mr-2" />,
        text: "Live",
        className: "bg-red-100 text-red-800"
      },
      completed: {
        icon: <CheckCircle className="w-4 h-4 mr-2" />,
        text: "Completed",
        className: "bg-green-100 text-green-800"
      },
      cancelled: {
        icon: <XCircle className="w-4 h-4 mr-2" />,
        text: "Cancelled",
        className: "bg-slate-100 text-slate-800"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    
    return (
      <Badge className={`${config.className} px-3 py-1 text-base`}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const getScoreDisplay = () => {
    if (fixture.status === "scheduled") {
      return <span className="text-gray-400">Not played yet</span>;
    }
    
    return (
      <div className="text-2xl font-bold">
        {fixture.team_a_score} - {fixture.team_b_score}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="text-3xl">
              {fixture.sport?.icon || <Trophy className="w-8 h-8 text-blue-600" />}
            </div>
            {fixture.sport?.name || "Unknown Sport"}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Detailed information about this fixture
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header with status and edit button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {getStatusBadge(fixture.status)}
            </div>
            <Button 
              variant="outline" 
              onClick={() => onEdit(fixture)}
              className="flex items-center gap-2 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit Fixture
            </Button>
          </div>
          
          {/* Match details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Users className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Match</div>
                  <div className="font-medium">
                    {fixture.team_a?.name} vs {fixture.team_b?.name}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Date</div>
                  <div className="font-medium">
                    {format(new Date(fixture.scheduled_at), 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Time</div>
                  <div className="font-medium">
                    {format(new Date(fixture.scheduled_at), 'h:mm a')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Venue</div>
                  <div className="font-medium">
                    {fixture.venue || "Not specified"}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Trophy className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Score</div>
                  <div className="font-medium">
                    {getScoreDisplay()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <RescheduleFixtureDialog 
              fixture={fixture} 
              onSuccess={() => window.location.reload()} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}