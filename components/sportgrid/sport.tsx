"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Trophy, 
  Users, 
  Dumbbell,
  Target,
  Volleyball,
  Dribbble,
  Table,
  Brain,
  MessageSquare,
  Loader2
} from "lucide-react";

interface DatabaseSport {
  id: string;
  name: string;
  icon: string | null;
  is_team_sport: boolean;
  min_players: number | null;
  max_players: number | null;
  description: string | null;
  is_active: boolean;
}

interface Sport {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'team' | 'individual';
  minPlayers?: number;
  maxPlayers?: number;
  color: string;
}

// Icon mapping for database sports
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Cricket': Dribbble,
  'Football': Trophy,
  'Basketball': Target,
  'Volleyball': Volleyball,
  'Badminton': Dumbbell,
  'Table Tennis': Table,
  'Chess': Brain,
  'Quiz': MessageSquare,
};

// Color mapping for sports
const colorMap: Record<string, string> = {
  'Cricket': 'from-blue-500 to-blue-600',
  'Football': 'from-green-500 to-green-600',
  'Basketball': 'from-orange-500 to-orange-600',
  'Volleyball': 'from-yellow-500 to-yellow-600',
  'Badminton': 'from-pink-500 to-pink-600',
  'Table Tennis': 'from-red-500 to-red-600',
  'Chess': 'from-indigo-500 to-indigo-600',
  'Quiz': 'from-teal-500 to-teal-600',
};

interface SportsGridProps {
  onSportSelect?: (sport: { id: string; type: 'team' | 'individual' }) => void;
}

export const SportsGrid = ({ onSportSelect }: SportsGridProps) => {
  const router = useRouter();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/sports?active_only=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch sports');
        }
        
        const data = await response.json();
        const databaseSports: DatabaseSport[] = data.sports || [];
        
        // Convert database sports to display format
        const displaySports: Sport[] = databaseSports.map(dbSport => {
          const IconComponent = iconMap[dbSport.name] || Trophy;
          const color = colorMap[dbSport.name] || 'from-gray-500 to-gray-600';
          
          return {
            id: dbSport.id,
            name: dbSport.name,
            icon: IconComponent,
            type: dbSport.is_team_sport ? 'team' : 'individual',
            minPlayers: dbSport.min_players || undefined,
            maxPlayers: dbSport.max_players || undefined,
            color: color
          };
        });
        
        setSports(displaySports);
      } catch (err) {
        console.error('Error fetching sports:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sports');
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  const handleSportClick = (sport: Sport) => {
    if (onSportSelect) {
      // Use callback for consolidated page
      onSportSelect({ id: sport.id, type: sport.type });
    } else {
      // Navigate using Next.js router with query parameters (fallback)
      router.push(`/registration?sport=${sport.id}&type=${sport.type}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading sports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Trophy className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Failed to load sports</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sports.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sports available</h3>
        <p className="text-gray-600">No active sports are currently available for registration.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sports.map((sport, index) => (
        <Card 
          key={sport.id}
          className="group relative cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:bg-white hover:-translate-y-3 hover:rotate-1 overflow-hidden animate-bounce-in"
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => handleSportClick(sport)}
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10"></div>
          
          <CardContent className="relative p-6 h-full">
            <div className="flex flex-col items-center text-center h-full">
              {/* Icon with enhanced effects */}
              <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${sport.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                  <sport.icon className="h-10 w-10 text-white drop-shadow-md" />
                </div>
                {/* Sparkle effects */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300" style={{ animationDelay: '0.2s' }}></div>
              </div>
              
              {/* Sport name with gradient text on hover */}
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                {sport.name}
              </h3>
              
              {/* Type badge with improved styling */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-purple-100 rounded-full mb-4 transition-all duration-300">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                  {sport.type === 'team' ? '👥 Team Sport' : '👤 Individual'}
                </span>
              </div>
              
              {/* Player count for team sports */}
              {sport.type === 'team' && sport.minPlayers && sport.maxPlayers && (
                <div className="bg-blue-50 group-hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium mb-4 transition-colors duration-300">
                  {sport.minPlayers}-{sport.maxPlayers} players
                </div>
              )}
              
              {/* Call to action with enhanced styling */}
              <div className="mt-auto flex items-center gap-2 text-blue-600 group-hover:text-purple-600 font-semibold text-sm group-hover:scale-105 transition-all duration-300">
                <span>Register Now</span>
                <div className="w-5 h-5 rounded-full bg-blue-600 group-hover:bg-purple-600 flex items-center justify-center text-white text-xs group-hover:translate-x-1 transition-all duration-300">
                  →
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};