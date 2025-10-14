import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const scopeType = body.scope_type as string | undefined
    const scopeId = body.scope_id as string | null | undefined
    const sportId = body.sport_id as string | undefined
    const gender = (body.gender as string | null | undefined) ?? null

    if (!scopeType || !sportId) {
      return NextResponse.json({ error: "scope_type and sport_id are required" }, { status: 400 })
    }

    const { data, error } = await supabase.rpc("recompute_leaderboard_snapshot", {
      p_scope_type: scopeType,
      p_scope_id: scopeId ?? null,
      p_sport: sportId,
      p_gender: gender,
    })

    if (error) {
      console.error("recompute_leaderboard_snapshot error:", error)
      return NextResponse.json({ error: "Failed to recompute leaderboard" }, { status: 500 })
    }

    return NextResponse.json({ success: true, result: data })
  } catch (err) {
    console.error("POST /api/admin/leaderboard/recompute error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


