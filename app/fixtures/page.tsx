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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
            All Fixtures
          </h1>
          <p className="text-slate-600 text-lg">Browse live, upcoming, and past fixtures across all sports</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Live Matches</p>
                <p className="text-2xl font-bold text-red-900">{liveFixtures?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Upcoming</p>
                <p className="text-2xl font-bold text-blue-900">{upcomingFixtures?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{pastFixtures?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white border-0 shadow-lg rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Filter by Sport</h3>
                <p className="text-sm text-slate-600">Choose a specific sport to view fixtures</p>
              </div>
            </div>
            <SportFilter sports={sports || []} basePath="/fixtures" />
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex gap-4 mb-8 justify-center">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Radio className="mr-2 h-5 w-5" />
            Regular Fixtures
          </Button>
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
            <Link href="/tournaments">
              <Trophy className="mr-2 h-5 w-5" />
              Tournament Brackets
            </Link>
          </Button>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="live" className="w-full">
          <div className="bg-white border-0 shadow-lg rounded-2xl p-2 mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-slate-50 rounded-xl">
              <TabsTrigger value="live" className="flex items-center gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg">
                <Zap className="h-4 w-4" />
                Live ({liveFixtures?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg">
                <Clock className="h-4 w-4" />
                Upcoming ({upcomingFixtures?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg">
                <CheckCircle className="h-4 w-4" />
                Past ({pastFixtures?.length || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="live" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {liveFixtures && liveFixtures.length > 0 ? (
                liveFixtures.map((fixture, index) => (
                  <div key={fixture.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <FixtureCard fixture={fixture} isLive />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl border-0 shadow-lg">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-red-100 rounded-full">
                      <Zap className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No Live Matches</h3>
                    <p className="text-slate-600">No matches are currently being played</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {upcomingFixtures && upcomingFixtures.length > 0 ? (
                upcomingFixtures.map((fixture, index) => (
                  <div key={fixture.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <FixtureCard fixture={fixture} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl border-0 shadow-lg">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No Upcoming Fixtures</h3>
                    <p className="text-slate-600">No matches are scheduled at the moment</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pastFixtures && pastFixtures.length > 0 ? (
                pastFixtures.map((fixture, index) => (
                  <div key={fixture.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <FixtureCard fixture={fixture} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl border-0 shadow-lg">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No Completed Fixtures</h3>
                    <p className="text-slate-600">No matches have been completed yet</p>
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


