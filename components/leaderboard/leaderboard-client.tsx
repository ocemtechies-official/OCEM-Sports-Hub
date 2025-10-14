"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"

type Sport = { id: string; name: string; icon?: string | null }

export function LeaderboardClient({ mode, sports }: { mode: "season" | "tournament"; sports: Sport[] }) {
  const [rows, setRows] = useState<any[]>([])
  const [sportId, setSportId] = useState<string>(sports?.[0]?.id ?? "")
  const [gender, setGender] = useState<string>("")
  const [season, setSeason] = useState<string>(new Date().getFullYear().toString())
  const [tournamentId, setTournamentId] = useState<string>("")

  const showNRR = useMemo(() => {
    const s = sports?.find((sp) => sp.id === sportId)
    return (s?.name || "").toLowerCase() === "cricket"
  }, [sports, sportId])

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams()
        if (mode === "season") {
          if (sportId) params.set("sport_id", sportId)
          if (gender) params.set("gender", gender)
          if (season) params.set("season", season)
          const res = await fetch(`/api/leaderboard/season?${params.toString()}`, { cache: "no-store" })
          const json = await res.json()
          setRows(json.data || [])
        } else {
          if (tournamentId) params.set("tournament_id", tournamentId)
          if (gender) params.set("gender", gender)
          const res = await fetch(`/api/leaderboard/tournament?${params.toString()}`, { cache: "no-store" })
          const json = await res.json()
          setRows(json.data || [])
        }
      } catch (e) {
        console.error("leaderboard fetch error", e)
        setRows([])
      }
    }
    run()
  }, [mode, sportId, gender, season, tournamentId])

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Sport</label>
            <select value={sportId} onChange={(e) => setSportId(e.target.value)} className="w-full border rounded px-3 py-2">
              {sports?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">All</option>
              <option value="male">Boys</option>
              <option value="female">Girls</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          {mode === "season" ? (
            <div>
              <label className="block text-sm text-slate-600 mb-1">Season</label>
              <input value={season} onChange={(e) => setSeason(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tournament ID</label>
              <input value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <LeaderboardTable rows={rows} showNRR={showNRR} />
    </div>
  )
}


