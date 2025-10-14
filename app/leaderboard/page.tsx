import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client"

export default async function LeaderboardPage() {
  const supabase = await getSupabaseServerClient()
  const { data: sports } = await supabase.from("sports").select("id, name, icon").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-slate-600">Season and Tournament standings</p>
        </div>

        <Tabs defaultValue="season" className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="season">Season</TabsTrigger>
            <TabsTrigger value="tournament">Tournament</TabsTrigger>
          </TabsList>

          <TabsContent value="season">
            <LeaderboardClient mode="season" sports={sports || []} />
          </TabsContent>

          <TabsContent value="tournament">
            <LeaderboardClient mode="tournament" sports={sports || []} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
