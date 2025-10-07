import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaderboardTableRealtime } from "@/components/leaderboard/leaderboard-table-realtime"

export default async function LeaderboardPage() {
  const supabase = await getSupabaseServerClient()

  const { data: sports } = await supabase.from("sports").select("*").order("name")

  const { data: allStandings } = await supabase
    .from("leaderboards")
    .select("*, team:teams(*), sport:sports(*)")
    .order("points", { ascending: false })
    .order("goals_for", { ascending: false })

  const sportStandings: Record<string, any[]> = {}
  if (sports) {
    for (const sport of sports) {
      const { data } = await supabase
        .from("leaderboards")
        .select("*, team:teams(*), sport:sports(*)")
        .eq("sport_id", sport.id)
        .order("points", { ascending: false })
        .order("goals_for", { ascending: false })

      sportStandings[sport.id] = data || []
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-slate-600">Current standings across all sports</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All Sports</TabsTrigger>
            {sports?.map((sport) => (
              <TabsTrigger key={sport.id} value={sport.id}>
                {sport.icon} {sport.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <LeaderboardTableRealtime sportId={null} initialStandings={allStandings || []} />
          </TabsContent>

          {sports?.map((sport) => (
            <TabsContent key={sport.id} value={sport.id}>
              <LeaderboardTableRealtime sportId={sport.id} initialStandings={sportStandings[sport.id] || []} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}
