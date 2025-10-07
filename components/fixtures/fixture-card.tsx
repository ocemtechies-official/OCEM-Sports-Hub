import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Clock, MapPin } from "lucide-react"

interface FixtureCardProps {
  fixture: any
  isLive?: boolean
}

export function FixtureCard({ fixture, isLive = false }: FixtureCardProps) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${isLive ? "border-red-500 border-2" : ""}`}>
      <CardContent className="p-6">
        {/* Sport Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="text-xs">
            {fixture.sport?.icon} {fixture.sport?.name}
          </Badge>
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </div>

        {/* Teams and Score */}
        <div className="space-y-3">
          {/* Team A */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: fixture.team_a?.color || "#3b82f6" }}
              >
                {fixture.team_a?.name?.charAt(0)}
              </div>
              <span className="font-semibold text-slate-900">{fixture.team_a?.name}</span>
            </div>
            {(isLive || fixture.status === "completed") && (
              <span className="text-2xl font-bold text-slate-900">{fixture.team_a_score}</span>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-center text-sm text-slate-400 font-medium">VS</div>

          {/* Team B */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: fixture.team_b?.color || "#ef4444" }}
              >
                {fixture.team_b?.name?.charAt(0)}
              </div>
              <span className="font-semibold text-slate-900">{fixture.team_b?.name}</span>
            </div>
            {(isLive || fixture.status === "completed") && (
              <span className="text-2xl font-bold text-slate-900">{fixture.team_b_score}</span>
            )}
          </div>
        </div>

        {/* Match Details */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(fixture.scheduled_at), "h:mm a")}</span>
          </div>
          {fixture.venue && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{fixture.venue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
