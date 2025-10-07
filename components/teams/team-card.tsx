import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface TeamCardProps {
  team: {
    id: string
    name: string
    color: string | null
    logo_url: string | null
    players?: { count: number }[]
  }
}

export function TeamCard({ team }: TeamCardProps) {
  const playerCount = team.players?.[0]?.count || 0

  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: team.color || "#3b82f6" }}
            >
              {team.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{team.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                <span>{playerCount} players</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="w-full justify-center">
            View Team
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
