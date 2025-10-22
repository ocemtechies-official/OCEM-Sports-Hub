"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Eye,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { RescheduleFixtureDialog } from "@/components/admin/reschedule-fixture-dialog";
import { memo, useMemo, useEffect } from "react";

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

interface FixtureCardProps {
  fixture: Fixture;
  onViewDetails: (fixture: Fixture) => void;
  onEdit?: (fixture: Fixture) => void;
  onDelete?: (fixture: Fixture) => void;
}

function FixtureCardComponent({
  fixture,
  onViewDetails,
  onEdit,
  onDelete
}: FixtureCardProps) {
  // Log when the component re-renders
  useEffect(() => {
    console.log('FixtureCard re-rendered for fixture:', fixture.id);
  }, [fixture]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: {
        icon: <Play className="w-3 h-3 mr-1" />,
        text: "Scheduled",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200"
      },
      live: {
        icon: <Play className="w-3 h-3 mr-1" />,
        text: "Live",
        className: "bg-red-100 text-red-800 hover:bg-red-200"
      },
      completed: {
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        text: "Completed",
        className: "bg-green-100 text-green-800 hover:bg-green-200"
      },
      cancelled: {
        icon: <XCircle className="w-3 h-3 mr-1" />,
        text: "Cancelled",
        className: "bg-slate-100 text-slate-800 hover:bg-slate-200"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    
    return (
      <Badge className={`${config.className} transition-colors px-2 py-0.5 text-xs`}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const getScoreDisplay = () => {
    if (fixture.status === "scheduled") {
      return <span className="text-gray-400">-</span>;
    }
    
    return (
      <span className="font-semibold">
        {fixture.team_a_score} - {fixture.team_b_score}
      </span>
    );
  };

  // Memoize the formatted date to prevent unnecessary re-renders
  const formattedDate = useMemo(() => ({
    date: format(new Date(fixture.scheduled_at), 'MMM d, yyyy'),
    time: format(new Date(fixture.scheduled_at), 'h:mm a')
  }), [fixture.scheduled_at]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(fixture);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={() => onViewDetails(fixture)}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 bg-white rounded-lg">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                {fixture.sport?.icon || <Trophy className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 truncate max-w-[140px]">{fixture.sport?.name || "Unknown Sport"}</h3>
                <div className="mt-1">
                  {getStatusBadge(fixture.status)}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {/* Edit button - opens the edit modal */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(fixture);
                }}
                className="h-8 w-8 p-0 rounded-full transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm"
              >
                <Edit3 className="h-4 w-4 text-blue-600" />
              </Button>
              {/* Delete button - triggers the delete confirmation flow in the parent component */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(fixture);
                }}
                className="h-8 w-8 p-0 rounded-full transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-sm"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          {/* Match Details */}
          <div className="space-y-2.5 mb-3">
            {/* Team Match Line with Gradient Background */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-3 shadow-md">
              <div className="flex items-center justify-center text-sm font-bold text-white">
                <span className="max-w-[100px] truncate">
                  {fixture.team_a?.name || "Team A"}
                </span>
                <span className="mx-2 font-extrabold text-lg">vs</span>
                <span className="max-w-[100px] truncate">
                  {fixture.team_b?.name || "Team B"}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Date:
              </span>
              <div className="text-right">
                <div className="font-medium text-xs">
                  {formattedDate.date}
                </div>
                <div className="text-gray-500 text-xs">
                  {formattedDate.time}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Venue:
              </span>
              <span className="font-medium max-w-[100px] truncate text-xs">
                {fixture.venue || "Not specified"}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                Score:
              </span>
              <span className="font-medium">
                {getScoreDisplay()}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1.5">
            <div onClick={(e) => e.stopPropagation()} className="flex-1">
              <RescheduleFixtureDialog 
                fixture={fixture} 
                onSuccess={() => window.location.reload()} 
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(fixture);
              }}
              className="flex-1 py-1.5 text-xs font-medium rounded-md hover:shadow-sm transition-colors hover:bg-green-50 hover:text-green-700 hover:border-green-200"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const FixtureCard = memo(FixtureCardComponent, (prevProps, nextProps) => {
  // Compare the fixture objects deeply
  return (
    prevProps.fixture.id === nextProps.fixture.id &&
    prevProps.fixture.scheduled_at === nextProps.fixture.scheduled_at &&
    prevProps.fixture.venue === nextProps.fixture.venue &&
    prevProps.fixture.status === nextProps.fixture.status &&
    prevProps.fixture.team_a_score === nextProps.fixture.team_a_score &&
    prevProps.fixture.team_b_score === nextProps.fixture.team_b_score &&
    prevProps.fixture.team_a?.id === nextProps.fixture.team_a?.id &&
    prevProps.fixture.team_a?.name === nextProps.fixture.team_a?.name &&
    prevProps.fixture.team_b?.id === nextProps.fixture.team_b?.id &&
    prevProps.fixture.team_b?.name === nextProps.fixture.team_b?.name &&
    prevProps.fixture.sport?.id === nextProps.fixture.sport?.id &&
    prevProps.fixture.sport?.name === nextProps.fixture.sport?.name &&
    prevProps.fixture.sport?.icon === nextProps.fixture.sport?.icon
  );
});