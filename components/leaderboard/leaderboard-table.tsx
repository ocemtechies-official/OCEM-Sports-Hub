"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Target, Users, Zap } from "lucide-react"
import Link from "next/link"

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
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Trophy className="h-5 w-5 text-blue-600" />
            Current Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Standings Available</h3>
          <p className="text-slate-600">Standings will appear once matches are played.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Trophy className="h-5 w-5 text-blue-600" />
          Current Standings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-16 font-semibold text-slate-700">Rank</TableHead>
              <TableHead className="font-semibold text-slate-700">Team</TableHead>
              <TableHead className="text-center font-semibold text-slate-700">P</TableHead>
              <TableHead className="text-center font-semibold text-slate-700">W</TableHead>
              <TableHead className="text-center font-semibold text-slate-700">D</TableHead>
              <TableHead className="text-center font-semibold text-slate-700">L</TableHead>
              <TableHead className="text-center font-semibold text-slate-700">GD</TableHead>
              {showNRR && <TableHead className="text-center font-semibold text-slate-700">NRR</TableHead>}
              <TableHead className="text-center font-bold text-slate-900">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => {
              // Determine rank medal colors
              const getRankColor = () => {
                if (idx === 0) return "text-yellow-500"
                if (idx === 1) return "text-gray-400"
                if (idx === 2) return "text-amber-700"
                return "text-slate-600"
              }
              
              const getRankBg = () => {
                if (idx === 0) return "bg-yellow-50"
                if (idx === 1) return "bg-gray-50"
                if (idx === 2) return "bg-amber-50"
                return ""
              }
              
              return (
                <TableRow 
                  key={`${r.team_id}-${idx}`} 
                  className={`hover:bg-blue-50 transition-colors ${getRankBg()}`}
                >
                  <TableCell className={`font-bold ${getRankColor()}`}>
                    <div className="flex items-center gap-2">
                      <span>{idx + 1}</span>
                      {idx === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    <Link href={`/teams/${r.team?.id}`} className="hover:underline">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
                          style={{ backgroundColor: r.team?.color || "#3b82f6" }}
                        >
                          {r.team?.name?.charAt(0)}
                        </div>
                        <span>{r.team?.name ?? "Team"}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center font-medium">{r.matches_played}</TableCell>
                  <TableCell className="text-center text-green-600 font-semibold">{r.wins}</TableCell>
                  <TableCell className="text-center text-slate-600">{r.draws}</TableCell>
                  <TableCell className="text-center text-red-600 font-semibold">{r.losses}</TableCell>
                  <TableCell 
                    className={`text-center font-semibold ${
                      (r.goal_diff ?? 0) > 0 ? "text-green-600" : 
                      (r.goal_diff ?? 0) < 0 ? "text-red-600" : "text-slate-600"
                    }`}
                  >
                    {(r.goal_diff ?? 0) > 0 ? "+" : ""}{r.goal_diff ?? 0}
                  </TableCell>
                  {showNRR && (
                    <TableCell className="text-center">
                      {r.nrr !== null ? r.nrr.toFixed(3) : "-"}
                    </TableCell>
                  )}
                  <TableCell className="text-center font-bold text-lg text-blue-600">{Number(r.points)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}