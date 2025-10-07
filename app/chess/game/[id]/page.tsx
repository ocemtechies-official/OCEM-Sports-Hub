import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { ChessBoard } from "@/components/chess/chess-board"

export default async function ChessGamePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await getSupabaseServerClient()

  const { data: game } = await supabase
    .from("chess_games")
    .select(
      "*, white_player:profiles!chess_games_white_player_id_fkey(*), black_player:profiles!chess_games_black_player_id_fkey(*)",
    )
    .eq("id", params.id)
    .single()

  if (!game) {
    notFound()
  }

  // Check if user is part of this game
  if (game.white_player_id !== user.id && game.black_player_id !== user.id) {
    redirect("/chess")
  }

  const { data: moves } = await supabase
    .from("chess_moves")
    .select("*")
    .eq("game_id", params.id)
    .order("move_number", { ascending: true })

  return <ChessBoard game={game} moves={moves || []} currentUserId={user.id} />
}
