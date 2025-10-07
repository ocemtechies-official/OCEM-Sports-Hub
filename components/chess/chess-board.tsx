"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Flag } from "lucide-react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ChessBoardProps {
  game: any
  moves: any[]
  currentUserId: string
}

export function ChessBoard({ game, moves, currentUserId }: ChessBoardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)

  const isWhite = game.white_player_id === currentUserId
  const opponent = isWhite ? game.black_player : game.white_player

  // Simple 8x8 board representation
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"]
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"]

  // Initial piece positions (simplified)
  const initialPosition: Record<string, string> = {
    a8: "♜",
    b8: "♞",
    c8: "♝",
    d8: "♛",
    e8: "♚",
    f8: "♝",
    g8: "♞",
    h8: "♜",
    a7: "♟",
    b7: "♟",
    c7: "♟",
    d7: "♟",
    e7: "♟",
    f7: "♟",
    g7: "♟",
    h7: "♟",
    a2: "♙",
    b2: "♙",
    c2: "♙",
    d2: "♙",
    e2: "♙",
    f2: "♙",
    g2: "♙",
    h2: "♙",
    a1: "♖",
    b1: "♘",
    c1: "♗",
    d1: "♕",
    e1: "♔",
    f1: "♗",
    g1: "♘",
    h1: "♖",
  }

  const [position, setPosition] = useState(initialPosition)

  const handleSquareClick = (square: string) => {
    if (game.status !== "active") return

    if (!selectedSquare) {
      if (position[square]) {
        setSelectedSquare(square)
      }
    } else {
      // Make move
      if (selectedSquare !== square) {
        const newPosition = { ...position }
        newPosition[square] = position[selectedSquare]
        delete newPosition[selectedSquare]
        setPosition(newPosition)

        // In a real implementation, validate and save the move
        toast({
          title: "Move Made",
          description: `${selectedSquare} to ${square}`,
        })
      }
      setSelectedSquare(null)
    }
  }

  const handleResign = async () => {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase
      .from("chess_games")
      .update({
        status: "completed",
        result: isWhite ? "black_wins" : "white_wins",
        winner_id: isWhite ? game.black_player_id : game.white_player_id,
        completed_at: new Date().toISOString(),
      })
      .eq("id", game.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to resign. Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Game Ended",
      description: "You have resigned from the game.",
    })

    router.push("/chess")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/chess">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chess
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Chess Game</CardTitle>
                  <Badge variant={game.status === "active" ? "default" : "secondary"}>
                    {game.status === "active" ? "In Progress" : "Completed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-square max-w-2xl mx-auto">
                  <div className="grid grid-cols-8 gap-0 border-4 border-slate-800">
                    {ranks.map((rank) =>
                      files.map((file) => {
                        const square = `${file}${rank}`
                        const isLight = (files.indexOf(file) + ranks.indexOf(rank)) % 2 === 0
                        const isSelected = selectedSquare === square
                        const piece = position[square]

                        return (
                          <button
                            key={square}
                            onClick={() => handleSquareClick(square)}
                            className={`
                              aspect-square flex items-center justify-center text-4xl font-bold
                              transition-colors
                              ${isLight ? "bg-amber-100" : "bg-amber-700"}
                              ${isSelected ? "ring-4 ring-blue-500" : ""}
                              hover:opacity-80
                            `}
                          >
                            {piece}
                          </button>
                        )
                      }),
                    )}
                  </div>
                </div>

                <p className="text-center text-sm text-slate-600 mt-4">
                  Click a piece to select it, then click a square to move
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">White</p>
                  <p className="font-semibold text-slate-900">
                    {game.white_player?.full_name || game.white_player?.email || "You"}
                  </p>
                  {isWhite && (
                    <Badge variant="secondary" className="mt-2">
                      You
                    </Badge>
                  )}
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Black</p>
                  <p className="font-semibold text-slate-900">
                    {game.black_player?.full_name || game.black_player?.email || "Waiting..."}
                  </p>
                  {!isWhite && (
                    <Badge variant="secondary" className="mt-2">
                      You
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Time Control:</span>
                  <span className="font-semibold">{game.time_control}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Moves:</span>
                  <span className="font-semibold">{moves.length}</span>
                </div>
              </CardContent>
            </Card>

            {game.status === "active" && (
              <Button variant="destructive" className="w-full" onClick={handleResign}>
                <Flag className="mr-2 h-4 w-4" />
                Resign
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
