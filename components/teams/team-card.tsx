import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Target, User, UserCheck, VenetianMask } from "lucide-react"

interface TeamCardProps {
  team: {
    id: string
    name: string
    color: string | null
    logo_url: string | null
    gender: string | null
    team_members?: { count: number }[]
  }
}

export function TeamCard({ team }: TeamCardProps) {
  const playerCount = team.team_members?.[0]?.count || 0
  const gender = team.gender || "mixed"

  // Get gender icon and color
  const getGenderIcon = () => {
    switch (gender) {
      case "male":
        return <User className="h-3 w-3" />
      case "female":
        return <UserCheck className="h-3 w-3" />
      default:
        return <VenetianMask className="h-3 w-3" />
    }
  }

  const getGenderColor = () => {
    switch (gender) {
      case "male":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "female":
        return "bg-pink-100 text-pink-800 border-pink-200"
      default:
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white border-0 shadow-lg h-full transform hover:scale-[1.02]">
        <CardContent className="p-0">
          {/* Header with gradient background */}
          <div 
            className="relative p-5 bg-gradient-to-br from-slate-50 to-blue-50 border-b-2 border-slate-100"
            style={{ borderBottomColor: team.color || "#3b82f6" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-all duration-300 transform"
                style={{ backgroundColor: team.color || "#3b82f6" }}
              >
                {team.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 truncate">
                  {team.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>{playerCount} players</span>
                </div>
                {/* Gender Badge */}
                <Badge className={`mt-2 flex items-center gap-1 text-xs font-semibold ${getGenderColor()} border`}>
                  {getGenderIcon()}
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
                <Trophy className="h-4 w-4 text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-blue-900">0</span>
                <span className="text-xs text-blue-600">Wins</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors duration-200">
                <Target className="h-4 w-4 text-green-600 mb-1" />
                <span className="text-xs font-semibold text-green-900">0</span>
                <span className="text-xs text-green-600">Points</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors duration-200">
                <Users className="h-4 w-4 text-purple-600 mb-1" />
                <span className="text-xs font-semibold text-purple-900">{playerCount}</span>
                <span className="text-xs text-purple-600">Players</span>
              </div>
            </div>

            {/* Action Button */}
            <Badge 
              variant="secondary" 
              className="w-full justify-center py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group-hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-lg transform"
            >
              View Team Details
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}