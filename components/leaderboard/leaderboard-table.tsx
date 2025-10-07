import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import Link from "next/link"

interface LeaderboardTableProps {
  sportId: string | null
}

export async function LeaderboardTable({ sportId }: LeaderboardTableProps) {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("leaderboards")
    .select("*, team:teams(*), sport:sports(*)")
    .order("points", { ascending: false })
    .order("goals_for", { ascending: false })

  if (sportId) {
    query = query.eq("sport_id", sportId)
  }

  const { data: standings } = await query

  if (!standings || standings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-500">No standings available yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Team</TableHead>
              {!sportId && <TableHead>Sport</TableHead>}
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GF</TableHead>
              <TableHead className="text-center">GA</TableHead>
              <TableHead className="text-center">GD</TableHead>
              <TableHead className="text-center font-bold">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((standing, index) => (
              <TableRow key={standing.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {index + 1}
                    {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/teams/${standing.team?.id}`} className="hover:underline">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: standing.team?.color || "#3b82f6" }}
                      >
                        {standing.team?.name?.charAt(0)}
                      </div>
                      <span className="font-semibold">{standing.team?.name}</span>
                    </div>
                  </Link>
                </TableCell>
                {!sportId && (
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {standing.sport?.icon} {standing.sport?.name}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="text-center">{standing.matches_played}</TableCell>
                <TableCell className="text-center text-green-600 font-semibold">{standing.wins}</TableCell>
                <TableCell className="text-center text-slate-600">{standing.draws}</TableCell>
                <TableCell className="text-center text-red-600 font-semibold">{standing.losses}</TableCell>
                <TableCell className="text-center">{standing.goals_for}</TableCell>
                <TableCell className="text-center">{standing.goals_against}</TableCell>
                <TableCell
                  className={`text-center font-semibold ${
                    standing.goals_for - standing.goals_against > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {standing.goals_for - standing.goals_against > 0 ? "+" : ""}
                  {standing.goals_for - standing.goals_against}
                </TableCell>
                <TableCell className="text-center font-bold text-lg">{standing.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
