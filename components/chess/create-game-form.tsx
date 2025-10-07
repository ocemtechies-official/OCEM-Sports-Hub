"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CreateGameFormProps {
  userId: string
}

export function CreateGameForm({ userId }: CreateGameFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [timeControl, setTimeControl] = useState("10+0")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateGame = async () => {
    setIsCreating(true)
    const supabase = getSupabaseBrowserClient()

    // For now, create a game with the current user as white
    // In a real app, you'd have matchmaking or invite system
    const { data: game, error } = await supabase
      .from("chess_games")
      .insert({
        white_player_id: userId,
        black_player_id: null, // Will be filled when opponent joins
        game_type: "online",
        status: "active",
        time_control: timeControl,
        fen_position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Starting position
      })
      .select()
      .single()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive",
      })
      setIsCreating(false)
      return
    }

    toast({
      title: "Game Created!",
      description: "Your chess game has been created.",
    })

    router.push(`/chess/game/${game.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="time-control">Time Control</Label>
        <Select value={timeControl} onValueChange={setTimeControl}>
          <SelectTrigger id="time-control">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5+0">5 minutes</SelectItem>
            <SelectItem value="10+0">10 minutes</SelectItem>
            <SelectItem value="15+0">15 minutes</SelectItem>
            <SelectItem value="30+0">30 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleCreateGame} disabled={isCreating} className="w-full" size="lg">
        {isCreating ? "Creating Game..." : "Create Game"}
      </Button>

      <p className="text-sm text-slate-600 text-center">
        Note: This is a practice game. In a full implementation, you would be matched with another player.
      </p>
    </div>
  )
}
