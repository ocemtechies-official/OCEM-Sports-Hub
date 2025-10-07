import { getSupabaseServerClient } from "@/lib/supabase/server"
import { FixtureCard } from "@/components/fixtures/fixture-card"
import { format } from "date-fns"

export async function UpcomingFixtures() {
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
    .eq("status", "scheduled")
    .order("scheduled_at", { ascending: true })
    .limit(12)

  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-slate-500">No upcoming fixtures scheduled</p>
      </div>
    )
  }

  // Group fixtures by date
  const groupedFixtures = fixtures.reduce(
    (acc, fixture) => {
      const date = format(new Date(fixture.scheduled_at), "yyyy-MM-dd")
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(fixture)
      return acc
    },
    {} as Record<string, typeof fixtures>,
  )

  return (
    <div className="space-y-8">
      {Object.entries(groupedFixtures).map(([date, dateFixtures]) => (
        <div key={date}>
          <h3 className="text-lg font-semibold text-slate-700 mb-3">{format(new Date(date), "EEEE, MMMM d, yyyy")}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dateFixtures.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
