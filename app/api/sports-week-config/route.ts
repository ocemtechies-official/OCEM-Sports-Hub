import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"

// GET endpoint to fetch the current sports week configuration
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Fetch the active sports week configuration
    const { data, error } = await supabase
      .from("sports_week_config")
      .select("*")
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching sports week config:", error)
      return NextResponse.json(
        { error: "Failed to fetch sports week configuration" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in GET /api/sports-week-config:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST endpoint to update the sports week configuration (admin only)
export async function POST(request: Request) {
  try {
    // Verify admin access
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      )
    }

    const { startDate, endDate, name, description } = await request.json()
    const supabase = await getSupabaseServerClient()

    // First, deactivate any existing active configurations
    await supabase
      .from("sports_week_config")
      .update({ is_active: false })
      .eq("is_active", true)

    // Insert the new configuration
    const { data, error } = await supabase
      .from("sports_week_config")
      .insert({
        start_date: startDate,
        end_date: endDate,
        name: name || "Sports Week",
        description: description || "",
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating sports week config:", error)
      return NextResponse.json(
        { error: "Failed to update sports week configuration" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in POST /api/sports-week-config:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}