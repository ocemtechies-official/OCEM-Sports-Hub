import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { isAdmin } = await requireAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()

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
      // User reports
      supabase.from("profiles")
        .select(`
          id,
          full_name,
          email,
          phone,
          created_at,
          updated_at,
          deleted_at
        `)
        .eq("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      supabase.from("profiles")
        .select("created_at")
        .eq("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      // Fixture reports
      supabase.from("fixtures")
        .select(`
          id,
          title,
          sport_id,
          status,
          scheduled_date,
          created_at,
          updated_at,
          sports(name),
          teams(name)
        `)
        .eq("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      supabase.from("fixtures")
        .select("status, created_at, sport_id, sports(name)")
        .eq("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      // Quiz reports
      supabase.from("quizzes")
        .select(`
          id,
          title,
          description,
          difficulty,
          created_at,
          updated_at,
          deleted_at
        `)
        .eq("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      supabase.from("quiz_attempts")
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
      
      // Tournament reports
      supabase.from("tournaments")
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
        .eq("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      supabase.from("tournaments")
        .select("status, tournament_type, created_at")
        .eq("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      // Team reports
      supabase.from("teams")
        .select(`
          id,
          name,
          description,
          sport_id,
          created_at,
          updated_at,
          deleted_at,
          sports(name)
        `)
        .eq("deleted_at", null)
        .order("created_at", { ascending: false }),
      
      supabase.from("team_registrations")
        .select(`
          id,
          team_id,
          user_id,
          status,
          created_at,
          teams(name),
          profiles(full_name)
        `)
        .order("created_at", { ascending: false }),
      
      // Registration reports
      supabase.from("individual_registrations")
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
