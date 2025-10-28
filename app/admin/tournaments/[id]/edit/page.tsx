import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EditTournamentForm } from "@/components/admin/edit-tournament-form"
import { TournamentFormatConfig } from "@/components/admin/tournaments/TournamentFormatConfig"
import { TeamManagement } from "@/components/admin/tournaments/TeamManagement"
import { MatchScheduling } from "@/components/admin/tournaments/MatchScheduling"
import { TournamentRules } from "@/components/admin/tournaments/TournamentRules"
import { BracketManagement } from "@/components/admin/tournaments/BracketManagement"

interface EditTournamentPageProps {
  params: { id: string }
}

// Define types for our data
interface SimpleTournament {
  id: string
  name: string
  deleted_at: string | null
}

export default async function EditTournamentPage({ params }: EditTournamentPageProps) {
  // In Next.js 15, params are automatically awaited, so we can use params.id directly
  const id = params.id
  
  const { isAdmin, user, profile } = await requireAdmin()

  console.log("User:", user)
  console.log("Profile:", profile)
  console.log("Is Admin:", isAdmin)
  console.log("Tournament ID:", id)

  if (!isAdmin) {
    console.log("User is not admin, redirecting to home")
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // First, let's do a simple check to see if the tournament exists
  const { data: simpleTournament, error: simpleError } = await supabase
    .from("tournaments")
    .select("id, name, deleted_at")
    .eq("id", id)
    .is('deleted_at', null) // Use .is() for proper null checking
    .single()

  console.log("Simple tournament check:", { simpleTournament, simpleError })

  if (simpleError || !simpleTournament) {
    console.log("Simple check failed, showing 404")
    console.log("Simple error details:", simpleError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Tournament Not Found</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Error Details</h2>
            <p className="text-red-600 mb-4">The tournament could not be found or accessed.</p>
            <div className="bg-white p-4 rounded-md">
              <p><strong>Tournament ID:</strong> {id}</p>
              <p><strong>Error:</strong> {simpleError?.message || 'No data returned'}</p>
              {simpleTournament && (
                <p><strong>Deleted:</strong> {(simpleTournament as SimpleTournament).deleted_at ? 'Yes' : 'No'}</p>
              )}
            </div>
            <div className="mt-6">
              <Button asChild>
                <Link href="/admin/tournaments">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tournaments
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fetch the tournament data with all related information
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select(`
      *,
      sport:sports(name),
      winner:teams!tournaments_winner_id_fkey(name),
      tournament_teams(
        *,
        team:teams(name)
      ),
      tournament_rounds(
        *,
        fixtures(
          *,
          team_a:teams!fixtures_team_a_id_fkey(name),
          team_b:teams!fixtures_team_b_id_fkey(name)
        )
      )
    `)
    .eq("id", id)
    .is('deleted_at', null) // Use .is() for proper null checking
    .is('tournament_rounds.fixtures.deleted_at', null) // Filter out deleted fixtures
    .single()

  console.log("Full tournament query result:", { tournament, tournamentError })

  if (tournamentError || !tournament) {
    console.log("Full tournament query failed, showing error page")
    console.log("Full tournament error details:", tournamentError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Tournament Data Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Failed to Load Tournament Data</h2>
            <p className="text-red-600 mb-4">There was an error loading the tournament details.</p>
            <div className="bg-white p-4 rounded-md">
              <p><strong>Error:</strong> {tournamentError?.message || 'Unknown error'}</p>
            </div>
            <div className="mt-6">
              <Button asChild>
                <Link href="/admin/tournaments">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tournaments
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fetch sports and teams for the form
  const [{ data: sports, error: sportsError }, { data: teams, error: teamsError }] = await Promise.all([
    supabase.from("sports").select("*").order("name"),
    supabase.from("teams").select("*").order("name"),
  ])

  console.log("Sports query result:", { sports, sportsError })
  console.log("Teams query result:", { teams, teamsError })

  if (sportsError || teamsError) {
    console.log("Sports or teams query failed")
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Data Loading Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Failed to Load Reference Data</h2>
            <p className="text-red-600 mb-4">There was an error loading sports or teams data.</p>
            <div className="bg-white p-4 rounded-md">
              {sportsError && <p><strong>Sports Error:</strong> {sportsError.message}</p>}
              {teamsError && <p><strong>Teams Error:</strong> {teamsError.message}</p>}
            </div>
            <div className="mt-6">
              <Button asChild>
                <Link href="/admin/tournaments">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tournaments
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/tournaments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournaments
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Edit Tournament</h1>
          <p className="text-lg text-slate-600">
            {tournament.name} • {tournament.sport?.name}
          </p>
        </div>

        {/* Edit Form with Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="bracket" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="general">General Info</TabsTrigger>
              <TabsTrigger value="format">Tournament Format</TabsTrigger>
              <TabsTrigger value="teams">Teams & Seeding</TabsTrigger>
              <TabsTrigger value="bracket">Bracket Management</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="rules">Rules & Settings</TabsTrigger>
            </TabsList>

            <Card>
              <CardContent className="p-6">
                <TabsContent value="general" className="mt-0">
                  <EditTournamentForm 
                    tournament={tournament}
                    sports={sports || []} 
                    teams={teams || []} 
                  />
                </TabsContent>

                <TabsContent value="format" className="mt-0">
                  <TournamentFormatConfig 
                    tournament={tournament}
                  />
                </TabsContent>

                <TabsContent value="teams" className="mt-0">
                  <TeamManagement
                    tournament={tournament}
                    availableTeams={teams || []}
                  />
                </TabsContent>

                <TabsContent value="bracket" className="mt-0">
                  <BracketManagement
                    tournament={tournament}
                  />
                </TabsContent>

                <TabsContent value="schedule" className="mt-0">
                  <MatchScheduling
                    tournament={tournament}
                  />
                </TabsContent>

                <TabsContent value="rules" className="mt-0">
                  <TournamentRules
                    tournament={tournament}
                  />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
    </div>
  )
}






