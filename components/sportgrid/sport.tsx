"use client";

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
  MessageSquare
} from "lucide-react";

interface Sport {
  id: string;
  name: string;
  icon: any;
  type: 'team' | 'individual';
  minPlayers?: number;
  maxPlayers?: number;
  color: string;
}

const sports: Sport[] = [
  { id: 'cricket', name: 'Cricket', icon: Dribbble, type: 'team', minPlayers: 11, maxPlayers: 15, color: 'from-blue-500 to-blue-600' },
  { id: 'football', name: 'Football', icon: Trophy, type: 'team', minPlayers: 9, maxPlayers: 11, color: 'from-green-500 to-green-600' },
  { id: 'basketball', name: 'Basketball', icon: Target, type: 'team', minPlayers: 5, maxPlayers: 8, color: 'from-orange-500 to-orange-600' },
  { id: 'volleyball', name: 'Volleyball', icon: Volleyball, type: 'team', minPlayers: 6, maxPlayers: 9, color: 'from-yellow-500 to-yellow-600' },
  { id: 'tug-of-war', name: 'Tug of War', icon: Users, type: 'team', minPlayers: 8, maxPlayers: 8, color: 'from-purple-500 to-purple-600' },
  { id: 'table-tennis', name: 'Table Tennis', icon: Table, type: 'individual', color: 'from-red-500 to-red-600' },
  { id: 'badminton', name: 'Badminton', icon: Dumbbell, type: 'individual', color: 'from-pink-500 to-pink-600' },
  { id: 'chess', name: 'Chess', icon: Brain, type: 'individual', color: 'from-indigo-500 to-indigo-600' },
  { id: 'quiz', name: 'Quiz', icon: MessageSquare, type: 'individual', color: 'from-teal-500 to-teal-600' },
];

interface SportsGridProps {
  onSportSelect?: (sport: { id: string; type: 'team' | 'individual' }) => void;
}

export const SportsGrid = ({ onSportSelect }: SportsGridProps) => {
  const router = useRouter();

  const handleSportClick = (sport: Sport) => {
    if (onSportSelect) {
      // Use callback for consolidated page
      onSportSelect({ id: sport.id, type: sport.type });
    } else {
      // Navigate using Next.js router with query parameters (fallback)
      router.push(`/registration?sport=${sport.id}&type=${sport.type}`);
    }
  };

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
              {sport.type === 'team' && (
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
