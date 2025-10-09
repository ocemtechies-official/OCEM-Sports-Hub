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

export const SportsGrid = () => {
  const router = useRouter();

  const handleSportClick = (sport: Sport) => {
    // Navigate using Next.js router with query parameters
    router.push(`/registration?sport=${sport.id}&type=${sport.type}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sports.map((sport, index) => (
        <Card 
          key={sport.id}
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary overflow-hidden animate-bounce-in"
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => handleSportClick(sport)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${sport.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <sport.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {sport.name}
              </h3>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full mb-3">
                <span className="text-xs font-medium text-secondary-foreground">
                  {sport.type === 'team' ? '👥 Team Sport' : '👤 Individual'}
                </span>
              </div>
              
              {sport.type === 'team' && (
                <p className="text-sm text-muted-foreground">
                  {sport.minPlayers}-{sport.maxPlayers} players
                </p>
              )}
              
              <div className="mt-4 text-blue-600 font-medium text-sm group-hover:underline">
                Click to Register →
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
