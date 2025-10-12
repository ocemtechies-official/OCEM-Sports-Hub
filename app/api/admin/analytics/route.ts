import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { isAdmin, user } = await requireAdmin()
    if (!isAdmin || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Use service role client to bypass RLS for admin operations
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch comprehensive analytics data
    const [
      // User analytics
      { count: totalUsers },
      { data: userRegistrations },
      
      // Fixture analytics
      { count: totalFixtures },
      { data: fixtureStats },
      { data: sportPopularity },
      
      // Quiz analytics
      { count: totalQuizzes },
      { data: quizAttempts },
      { data: quizPerformance },
      
      // Tournament analytics
      { count: totalTournaments },
      { data: tournamentStats },
      
      // Recent activity
      { data: recentActivity }
    ] = await Promise.all([
      // User analytics - Use admin client to bypass RLS
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabaseAdmin.from("profiles")
        .select("created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(30),
      
      // Fixture analytics - Use admin client to bypass RLS
      supabaseAdmin.from("fixtures").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabaseAdmin.from("fixtures")
        .select("status, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin.from("fixtures")
        .select("sport_id, sports(name)")
        .is("deleted_at", null)
        .limit(100),
      
      // Quiz analytics - Use admin client to bypass RLS
      supabaseAdmin.from("quizzes").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabaseAdmin.from("quiz_attempts")
        .select("quiz_id, score, completed_at, quizzes(title)")
        .order("completed_at", { ascending: false })
        .limit(100),
      supabaseAdmin.from("quiz_attempts")
        .select("quiz_id, score, quizzes(title)")
        .eq("completed", true)
        .limit(100),
      
      // Tournament analytics - Use admin client to bypass RLS
      supabaseAdmin.from("tournaments").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabaseAdmin.from("tournaments")
        .select("status, tournament_type, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50),
      
      // Recent activity (last 7 days) - Use admin client to bypass RLS
      supabaseAdmin.from("profiles")
        .select("created_at")
        .is("deleted_at", null)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ])

    // Process the data for analytics
    const analyticsData = {
      users: {
        total: totalUsers || 0,
        registrations: userRegistrations || [],
        recentActivity: recentActivity || []
      },
      fixtures: {
        total: totalFixtures || 0,
        stats: fixtureStats || [],
        sportPopularity: sportPopularity || []
      },
      quizzes: {
        total: totalQuizzes || 0,
        attempts: quizAttempts || [],
        performance: quizPerformance || []
      },
      tournaments: {
        total: totalTournaments || 0,
        stats: tournamentStats || []
      }
    }

    return NextResponse.json({ data: analyticsData })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}
