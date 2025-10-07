import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamStats } from "@/components/teams/team-stats"
import { TeamFixtures } from "@/components/teams/team-fixtures"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const { data: team } = await supabase.from("teams").select("*").eq("id", params.id).single()

  if (!team) {
    notFound()
  }

  const { data: players } = await supabase.from("players").select("*").eq("team_id", params.id).order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Link>
        </Button>

        {/* Team Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold"
                style={{ backgroundColor: team.color || "#3b82f6" }}
              >
                {team.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{team.name}</h1>
                <p className="text-slate-600">Competing in Sports Week 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="players" className="space-y-6">
          <TabsList>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle>Team Roster</CardTitle>
              </CardHeader>
              <CardContent>
                {players && players.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {players.map((player) => (
                      <Card key={player.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={player.avatar_url || undefined} />
                              <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900">{player.name}</p>
                              {player.position && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {player.position}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No players registered yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <TeamStats teamId={params.id} />
          </TabsContent>

          <TabsContent value="fixtures">
            <TeamFixtures teamId={params.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
