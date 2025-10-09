import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { FixtureCard } from "@/components/fixtures/fixture-card"
import { SportFilter } from "@/components/fixtures/sport-filter"
import { Calendar, Radio, Trophy } from "lucide-react"
import Link from "next/link"

export default async function FixturesPage({ searchParams }: { searchParams: { sport?: string } }) {
  const supabase = await getSupabaseServerClient()

  // Fetch sports for filtering
  const { data: sports } = await supabase.from("sports").select("id, name, icon").order("name")

  const sportFilter = searchParams?.sport

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full mb-3">
            <Radio className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Fixtures</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">All Fixtures</h1>
          <p className="text-slate-600 mt-1">Browse live, upcoming, and past fixtures across all sports</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Filter by sport</span>
            </div>
            <SportFilter sports={sports || []} basePath="/fixtures" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6">
          <Button variant="default">
            <Radio className="mr-2 h-4 w-4" />
            Regular Fixtures
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/tournaments">
              <Trophy className="mr-2 h-4 w-4" />
              Tournament Brackets
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="live" className="w-full">
          <div className="bg-white border border-slate-200 rounded-xl p-2 mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="live" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {liveFixtures && liveFixtures.length > 0 ? (
                liveFixtures.map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} isLive />
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-500">No live matches at the moment</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingFixtures && upcomingFixtures.length > 0 ? (
                upcomingFixtures.map((fixture) => <FixtureCard key={fixture.id} fixture={fixture} />)
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-500">No upcoming fixtures scheduled</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastFixtures && pastFixtures.length > 0 ? (
                pastFixtures.map((fixture) => <FixtureCard key={fixture.id} fixture={fixture} />)
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-500">No completed fixtures found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


