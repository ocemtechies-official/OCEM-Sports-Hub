import { getSupabaseServerClient } from "@/lib/supabase/server"
import { TeamCard } from "@/components/teams/team-card"
import { Card, CardContent } from "@/components/ui/card"

export default async function TeamsPage() {
  const supabase = await getSupabaseServerClient()

  const { data: teams } = await supabase.from("teams").select("*, players(count)").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Teams</h1>
          <p className="text-lg text-slate-600">Meet all the competing teams</p>
        </div>

        {teams && teams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No teams registered yet</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
