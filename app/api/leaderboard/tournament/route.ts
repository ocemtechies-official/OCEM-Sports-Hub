import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    const url = new URL(request.url)

    const tournamentId = url.searchParams.get("tournament_id")
    const gender = url.searchParams.get("gender")
    const limit = parseInt(url.searchParams.get("limit") || "50", 10)
    const offset = parseInt(url.searchParams.get("offset") || "0", 10)

    if (!tournamentId) {
      return NextResponse.json({ error: "tournament_id is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .rpc("get_leaderboard_tournament", {
        p_tournament: tournamentId,
        p_gender: gender,
        p_limit: limit,
        p_offset: offset,
      })

    if (error) {
      console.error("get_leaderboard_tournament error:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error("GET /api/leaderboard/tournament error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


