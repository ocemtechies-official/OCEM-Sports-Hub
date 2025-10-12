import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Users, UserPlus } from "lucide-react"
import { TeamPlayersTable } from "@/components/admin/team-players-table"

interface TeamPlayersPageProps {
  params: { id: string }
}

export default async function TeamPlayersPage({ params }: TeamPlayersPageProps) {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch the team data
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", params.id)
    .single()

  if (teamError || !team) {
    notFound()
  }

  // Fetch team players
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("team_id", params.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Link>
        </Button>

        <div className="space-y-6">
          {/* Team Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Team Players</h1>
              <p className="text-slate-600 mt-1">
                Manage players for {team.name}
              </p>
            </div>
            <Button asChild>
              <Link href={`/admin/teams/${team.id}/players/add`}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Player
              </Link>
            </Button>
          </div>

          {/* Team Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {team.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: team.color || "#3b82f6" }}
                >
                  {team.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-slate-600">
                    {players?.length || 0} players
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players Table */}
          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamPlayersTable 
                team={team}
                players={players || []} 
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
