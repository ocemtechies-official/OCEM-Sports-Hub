import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Clock, MapPin, Zap, Trophy, Target, Users } from "lucide-react"

interface FixtureCardProps {
  fixture: any
  isLive?: boolean
}

export function FixtureCard({ fixture, isLive = false }: FixtureCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Zap className="h-3 w-3" />
      case 'completed':
        return <Trophy className="h-3 w-3" />
      case 'scheduled':
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'LIVE'
      case 'completed':
        return 'COMPLETED'
      case 'scheduled':
        return 'SCHEDULED'
      default:
        return 'TBD'
    }
  }

  const currentStatus = isLive ? 'live' : fixture.status
  const winner = fixture.status === 'completed' ? 
    (fixture.team_a_score > fixture.team_b_score ? fixture.team_a : fixture.team_b) : null

  return (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border-0 shadow-md hover:shadow-lg ${
      isLive ? 'border-red-500 border-2 shadow-red-100' : ''
    }`}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{fixture.sport?.name}</h3>
                <p className="text-sm text-slate-600">Match Fixture</p>
              </div>
            </div>
            <Badge className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(currentStatus)} flex items-center gap-1.5`}>
              {getStatusIcon(currentStatus)}
              {getStatusText(currentStatus)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Teams and Score */}
          <div className="space-y-4">
            {/* Team A */}
            <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
              winner?.id === fixture.team_a?.id
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 shadow-md'
                : 'bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-purple-50'
            }`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg"
                  style={{ backgroundColor: fixture.team_a?.color || "#3b82f6" }}
                >
                  {fixture.team_a?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">{fixture.team_a?.name}</h4>
                </div>
              </div>
              {(isLive || fixture.status === "completed") && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">{fixture.team_a_score}</span>
                  {winner?.id === fixture.team_a?.id && <Trophy className="h-4 w-4 text-green-600" />}
                </div>
              )}
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-slate-200"></div>
              <div className="px-3 py-1 bg-slate-100 rounded-full">
                <span className="text-xs font-semibold text-slate-600">VS</span>
              </div>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Team B */}
            <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
              winner?.id === fixture.team_b?.id
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 shadow-md'
                : 'bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-purple-50'
            }`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg"
                  style={{ backgroundColor: fixture.team_b?.color || "#ef4444" }}
                >
                  {fixture.team_b?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">{fixture.team_b?.name}</h4>
                </div>
              </div>
              {(isLive || fixture.status === "completed") && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">{fixture.team_b_score}</span>
                  {winner?.id === fixture.team_b?.id && <Trophy className="h-4 w-4 text-green-600" />}
                </div>
              )}
            </div>
          </div>

          {/* Match Details */}
          <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Match Time</p>
                <p className="font-semibold text-blue-900">
                  {format(new Date(fixture.scheduled_at), "MMM dd, h:mm a")}
                </p>
              </div>
            </div>
            
            {fixture.venue && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Venue</p>
                  <p className="font-semibold text-green-900">{fixture.venue}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
