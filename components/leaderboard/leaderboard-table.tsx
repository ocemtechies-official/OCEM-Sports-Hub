"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Row = {
  team_id: string
  team?: { id: string; name: string; logo_url?: string | null; color?: string | null }
  sport_id: string
  gender: string | null
  matches_played: number
  wins: number
  losses: number
  draws: number
  points: number
  goal_diff: number | null
  nrr: number | null
}

export function LeaderboardTable({ rows, showNRR }: { rows: Row[]; showNRR: boolean }) {
  if (!rows || rows.length === 0) {
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
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GD</TableHead>
              {showNRR && <TableHead className="text-center">NRR</TableHead>}
              <TableHead className="text-center font-bold">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={`${r.team_id}-${idx}`}>
                <TableCell className="font-medium">{idx + 1}</TableCell>
                <TableCell className="font-semibold">{r.team?.name ?? "Team"}</TableCell>
                <TableCell className="text-center">{r.matches_played}</TableCell>
                <TableCell className="text-center">{r.wins}</TableCell>
                <TableCell className="text-center">{r.draws}</TableCell>
                <TableCell className="text-center">{r.losses}</TableCell>
                <TableCell className="text-center">{r.goal_diff ?? 0}</TableCell>
                {showNRR && <TableCell className="text-center">{r.nrr?.toFixed(3) ?? "-"}</TableCell>}
                <TableCell className="text-center font-bold">{Number(r.points)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

