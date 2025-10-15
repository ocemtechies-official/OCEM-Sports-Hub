"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { Calendar, Target, Users, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  // Get current sport name for display
  const currentSport = sports?.find(s => s.id === sportId)?.name || "All Sports"

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Filter className="h-5 w-5 text-blue-600" />
            Filter Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Target className="h-4 w-4 text-blue-600" />
                Sport
              </label>
              <select 
                value={sportId} 
                onChange={(e) => setSportId(e.target.value)} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {sports?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-600" />
                Gender
              </label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">All</option>
                <option value="male">Boys</option>
                <option value="female">Girls</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            
            {mode === "season" ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Season
                </label>
                <input 
                  value={season} 
                  onChange={(e) => setSeason(e.target.value)} 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter year"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  Tournament ID
                </label>
                <input 
                  value={tournamentId} 
                  onChange={(e) => setTournamentId(e.target.value)} 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter tournament ID"
                />
              </div>
            )}
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSportId(sports?.[0]?.id ?? "")
                  setGender("")
                  setSeason(new Date().getFullYear().toString())
                  setTournamentId("")
                }}
                className="w-full border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          {/* Current Filter Summary */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Showing standings for: <span className="font-semibold text-slate-900">{currentSport}</span>
              {gender && <span className="font-semibold text-slate-900"> • {gender.charAt(0).toUpperCase() + gender.slice(1)}</span>}
              {mode === "season" && <span className="font-semibold text-slate-900"> • {season}</span>}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <LeaderboardTable rows={rows} showNRR={showNRR} />
    </div>
  )
}