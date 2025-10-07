import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Crown, Puzzle, History, Trophy } from "lucide-react"

export default async function ChessPage() {
  const supabase = await getSupabaseServerClient()
  const user = await getCurrentUser()

  // Fetch user's recent games if logged in
  let recentGames = null
  if (user) {
    const { data } = await supabase
      .from("chess_games")
      .select(
        "*, white_player:profiles!chess_games_white_player_id_fkey(*), black_player:profiles!chess_games_black_player_id_fkey(*)",
      )
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(5)

    recentGames = data
  }

  // Fetch leaderboard
  const { data: leaderboard } = await supabase
    .from("chess_games")
    .select("winner_id, profiles!chess_games_winner_id_fkey(id, full_name, email)")
    .eq("status", "completed")
    .not("winner_id", "is", null)
    .limit(100)

  // Count wins per player
  const winCounts = leaderboard?.reduce((acc: Record<string, any>, game) => {
    const winnerId = game.winner_id
    if (!winnerId) return acc

    if (!acc[winnerId]) {
      acc[winnerId] = {
        player: game.profiles,
        wins: 0,
      }
    }
    acc[winnerId].wins++
    return acc
  }, {})

  const topPlayers = Object.values(winCounts || {})
    .sort((a: any, b: any) => b.wins - a.wins)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Chess Tournament</h1>
          <p className="text-lg text-slate-600">Challenge opponents and solve puzzles</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Online Play */}
          <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Online Play</CardTitle>
              <CardDescription>Challenge other players in real-time matches</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <Button asChild className="w-full">
                  <Link href="/chess/play">Start Game</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/auth/login?redirect=/chess/play">Sign In to Play</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Puzzles */}
          <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                <Puzzle className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Chess Puzzles</CardTitle>
              <CardDescription>Improve your skills with tactical puzzles</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="secondary">
                <Link href="/chess/puzzles">Solve Puzzles</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Match History */}
          <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                <History className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Match History</CardTitle>
              <CardDescription>View your past games and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/chess/history">View History</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/auth/login?redirect=/chess/history">Sign In to View</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Games */}
          {user && recentGames && recentGames.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Your Recent Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentGames.map((game) => {
                    const isWhite = game.white_player_id === user.id
                    const opponent = isWhite ? game.black_player : game.white_player
                    const didWin = game.winner_id === user.id

                    return (
                      <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900">
                            vs {opponent?.full_name || opponent?.email || "Unknown"}
                          </p>
                          <p className="text-sm text-slate-600">Playing as {isWhite ? "White" : "Black"}</p>
                        </div>
                        {game.status === "completed" && (
                          <div>
                            {didWin && <span className="text-green-600 font-semibold">Won</span>}
                            {game.winner_id && !didWin && <span className="text-red-600 font-semibold">Lost</span>}
                            {!game.winner_id && game.result === "draw" && (
                              <span className="text-slate-600 font-semibold">Draw</span>
                            )}
                          </div>
                        )}
                        {game.status === "active" && (
                          <Button asChild size="sm">
                            <Link href={`/chess/game/${game.id}`}>Continue</Link>
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPlayers.length > 0 ? (
                <div className="space-y-3">
                  {topPlayers.map((entry: any, index: number) => (
                    <div key={entry.player.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <p className="font-semibold text-slate-900">{entry.player.full_name || entry.player.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{entry.wins}</p>
                        <p className="text-xs text-slate-600">wins</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">No games completed yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
