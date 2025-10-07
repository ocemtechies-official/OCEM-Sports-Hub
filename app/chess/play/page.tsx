import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateGameForm } from "@/components/chess/create-game-form"
import { Users } from "lucide-react"

export default async function ChessPlayPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login?redirect=/chess/play")
  }

  const supabase = await getSupabaseServerClient()

  // Check for active games
  const { data: activeGames } = await supabase
    .from("chess_games")
    .select(
      "*, white_player:profiles!chess_games_white_player_id_fkey(*), black_player:profiles!chess_games_black_player_id_fkey(*)",
    )
    .eq("status", "active")
    .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Start a Game</h1>
            <p className="text-lg text-slate-600">Create a new chess match</p>
          </div>

          {activeGames && activeGames.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Active Games</CardTitle>
                <CardDescription>You have ongoing games</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeGames.map((game) => {
                    const isWhite = game.white_player_id === user.id
                    const opponent = isWhite ? game.black_player : game.white_player

                    return (
                      <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900">
                            vs {opponent?.full_name || opponent?.email || "Waiting for opponent..."}
                          </p>
                          <p className="text-sm text-slate-600">Playing as {isWhite ? "White" : "Black"}</p>
                        </div>
                        <Button asChild>
                          <a href={`/chess/game/${game.id}`}>Continue</a>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>New Game</CardTitle>
              <CardDescription>Set up a new chess match</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateGameForm userId={user.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
