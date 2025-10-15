import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client"
import { Trophy, Target, Calendar } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = await getSupabaseServerClient()
  const { data: sports } = await supabase.from("sports").select("id, name, icon").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-semibold">Leaderboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Rankings & Standings
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Track team performance across seasons and tournaments. See who's leading the competition!
          </p>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex gap-3 mb-8 justify-center">
          <Tabs defaultValue="season" className="w-full max-w-4xl tab-container">
            <div className="bg-white border-0 shadow-lg rounded-xl p-1.5 mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-50 rounded-lg p-1 tab-list">
                <TabsTrigger 
                  value="season" 
                  className="flex items-center justify-center gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-md py-3 tab-trigger"
                >
                  <Calendar className="h-4 w-4" />
                  Season Standings
                </TabsTrigger>
                <TabsTrigger 
                  value="tournament" 
                  className="flex items-center justify-center gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-md py-3 tab-trigger"
                >
                  <Target className="h-4 w-4" />
                  Tournament Brackets
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="season" className="mt-0">
              <LeaderboardClient mode="season" sports={sports || []} />
            </TabsContent>

            <TabsContent value="tournament" className="mt-0">
              <LeaderboardClient mode="tournament" sports={sports || []} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}