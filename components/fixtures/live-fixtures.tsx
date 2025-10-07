import { getSupabaseServerClient } from "@/lib/supabase/server"
import { FixtureCard } from "@/components/fixtures/fixture-card"

export async function LiveFixtures() {
  const supabase = await getSupabaseServerClient()

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(
      `
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `,
    )
    .eq("status", "live")
    .order("scheduled_at", { ascending: true })

  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-slate-500">No live matches at the moment</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {fixtures.map((fixture) => (
        <FixtureCard key={fixture.id} fixture={fixture} isLive />
      ))}
    </div>
  )
}
