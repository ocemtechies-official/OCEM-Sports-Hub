import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { FixtureCard } from "@/components/fixtures/fixture-card"
import { SportFilter } from "@/components/fixtures/sport-filter"
import { Calendar, Radio, Trophy, Zap, Clock, CheckCircle, Target, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function FixturesPage({ searchParams }: { searchParams: { sport?: string } }) {
  const supabase = await getSupabaseServerClient()
  const { sport } = await searchParams

  // Fetch sports for filtering
  const { data: sports } = await supabase.from("sports").select("id, name, icon").order("name")

  const sportFilter = sport

  // Helper to build the base select with relations
  const baseSelect = `
    *,
    sport:sports(*),
    team_a:teams!fixtures_team_a_id_fkey(*),
    team_b:teams!fixtures_team_b_id_fkey(*)
  `

  // Live fixtures
  let liveQuery = supabase
    .from("fixtures")
    .select(baseSelect)
    .eq("status", "live")
    .order("scheduled_at", { ascending: true })
  if (sportFilter) liveQuery = liveQuery.eq("sport_id", sportFilter)
  const { data: liveFixtures } = await liveQuery

  // Upcoming fixtures
  let upcomingQuery = supabase
    .from("fixtures")
    .select(baseSelect)
    .eq("status", "scheduled")
    .order("scheduled_at", { ascending: true })
  if (sportFilter) upcomingQuery = upcomingQuery.eq("sport_id", sportFilter)
  const { data: upcomingFixtures } = await upcomingQuery

  // Past fixtures
  let pastQuery = supabase
    .from("fixtures")
    .select(baseSelect)
    .eq("status", "completed")
    .order("scheduled_at", { ascending: false })
    .limit(18)
  if (sportFilter) pastQuery = pastQuery.eq("sport_id", sportFilter)
  const { data: pastFixtures } = await pastQuery

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <Radio className="h-4 w-4" />
            <span className="text-sm font-semibold">Live Fixtures</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
            All Fixtures
          </h1>
          <p className="text-slate-600">Browse live, upcoming, and past fixtures across all sports</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Zap className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium">Live Matches</p>
                <p className="text-xl font-bold text-red-900">{liveFixtures?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Upcoming</p>
                <p className="text-xl font-bold text-blue-900">{upcomingFixtures?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Completed</p>
                <p className="text-xl font-bold text-green-900">{pastFixtures?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white border-0 shadow-lg rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Filter by Sport</h3>
                <p className="text-xs text-slate-600">Choose a specific sport to view fixtures</p>
              </div>
            </div>
            <SportFilter sports={sports || []} basePath="/fixtures" />
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex gap-3 mb-6 justify-center">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
            <Radio className="mr-1.5 h-4 w-4" />
            Regular Fixtures
          </Button>
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm">
            <Link href="/tournaments">
              <Trophy className="mr-1.5 h-4 w-4" />
              Tournament Brackets
            </Link>
          </Button>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="live" className="w-full">
          <div className="bg-white border-0 shadow-lg rounded-xl p-1.5 mb-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-50 rounded-lg">
              <TabsTrigger value="live" className="flex items-center gap-1.5 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-md text-sm">
                <Zap className="h-3.5 w-3.5" />
                Live ({liveFixtures?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-1.5 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-md text-sm">
                <Clock className="h-3.5 w-3.5" />
                Upcoming ({upcomingFixtures?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-1.5 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-md text-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                Past ({pastFixtures?.length || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="live" className="mt-0">
            <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-3">
              {liveFixtures && liveFixtures.length > 0 ? (
                liveFixtures.map((fixture, index) => (
                  <div key={fixture.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <FixtureCard fixture={fixture} isLive />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border-0 shadow-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-full">
                      <Zap className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No Live Matches</h3>
                    <p className="text-slate-600 text-sm">No matches are currently being played</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-3">
              {upcomingFixtures && upcomingFixtures.length > 0 ? (
                upcomingFixtures.map((fixture, index) => (
                  <div key={fixture.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <FixtureCard fixture={fixture} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border-0 shadow-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No Upcoming Fixtures</h3>
                    <p className="text-slate-600 text-sm">No matches are scheduled at the moment</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-3">
              {pastFixtures && pastFixtures.length > 0 ? (
                pastFixtures.map((fixture, index) => (
                  <div key={fixture.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <FixtureCard fixture={fixture} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border-0 shadow-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No Completed Fixtures</h3>
                    <p className="text-slate-600 text-sm">No matches have been completed yet</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


