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

    // Fetch comprehensive data for reports
    const [
      // User reports
      { data: userReports },
      { data: userRegistrations },
      
      // Fixture reports
      { data: fixtureReports },
      { data: fixtureStats },
      
      // Quiz reports
      { data: quizReports },
      { data: quizAttempts },
      
      // Tournament reports
      { data: tournamentReports },
      { data: tournamentStats },
      
      // Team reports
      { data: teamReports },
      { data: teamRegistrations },
      
      // Registration reports
      { data: registrationReports }
    ] = await Promise.all([
      // User reports - Use admin client to bypass RLS
      supabaseAdmin.from("profiles")
        .select(`
          id,
          full_name,
          email,
          created_at,
          updated_at,
          deleted_at
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      supabaseAdmin.from("profiles")
        .select("created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      // Fixture reports - Use admin client to bypass RLS
      supabaseAdmin.from("fixtures")
        .select(`
          id,
          sport_id,
          status,
          scheduled_at,
          created_at,
          updated_at,
          sports(name),
          team_a:teams!fixtures_team_a_id_fkey(name),
          team_b:teams!fixtures_team_b_id_fkey(name)
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      supabaseAdmin.from("fixtures")
        .select("status, created_at, sport_id, sports(name)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      // Quiz reports - Use admin client to bypass RLS
      supabaseAdmin.from("quizzes")
        .select(`
          id,
          title,
          description,
          difficulty,
          created_at,
          updated_at,
          deleted_at
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      supabaseAdmin.from("quiz_attempts")
        .select(`
          id,
          quiz_id,
          user_id,
          score,
          completed,
          completed_at,
          created_at,
          quizzes(title),
          profiles(full_name)
        `)
        .order("completed_at", { ascending: false }),
      
      // Tournament reports - Use admin client to bypass RLS
      supabaseAdmin.from("tournaments")
        .select(`
          id,
          name,
          description,
          tournament_type,
          status,
          start_date,
          end_date,
          created_at,
          updated_at,
          deleted_at
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      supabaseAdmin.from("tournaments")
        .select("status, tournament_type, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      // Team reports - Use admin client to bypass RLS (teams table doesn't have deleted_at or sport_id)
      supabaseAdmin.from("teams")
        .select(`
          id,
          name,
          logo_url,
          color,
          created_at
        `)
        .order("created_at", { ascending: false }),
      
      supabaseAdmin.from("team_registrations")
        .select(`
          id,
          user_id,
          sport_id,
          team_name,
          status,
          created_at,
          official_team_id,
          sports(name),
          profiles(full_name)
        `)
        .order("created_at", { ascending: false }),
      
      // Registration reports
      supabaseAdmin.from("individual_registrations")
        .select(`
          id,
          user_id,
          sport_id,
          status,
          created_at,
          profiles(full_name),
          sports(name)
        `)
        .order("created_at", { ascending: false })
    ])

    // Process the data for reports
    const reportsData = {
      users: {
        reports: userReports || [],
        registrations: userRegistrations || []
      },
      fixtures: {
        reports: fixtureReports || [],
        stats: fixtureStats || []
      },
      quizzes: {
        reports: quizReports || [],
        attempts: quizAttempts || []
      },
      tournaments: {
        reports: tournamentReports || [],
        stats: tournamentStats || []
      },
      teams: {
        reports: teamReports || [],
        registrations: teamRegistrations || []
      },
      registrations: {
        individual: registrationReports || []
      }
    }

    return NextResponse.json({ data: reportsData })
  } catch (error) {
    console.error("Reports API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports data" },
      { status: 500 }
    )
  }
}
