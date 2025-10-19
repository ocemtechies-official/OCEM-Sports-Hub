import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { fixtureId } = await request.json()

    if (!fixtureId) {
      return NextResponse.json(
        { error: "Fixture ID is required" },
        { status: 400 }
      )
    }

    // Get the fixture to check if it's cricket
    const { data: fixture, error: fetchError } = await supabase
      .from('fixtures')
      .select(`
        *,
        sport:sports(*)
      `)
      .eq('id', fixtureId)
      .single()

    if (fetchError || !fixture) {
      return NextResponse.json(
        { error: "Fixture not found" },
        { status: 404 }
      )
    }

    // Check if it's a cricket fixture
    if (!fixture.sport?.name?.toLowerCase().includes('cricket')) {
      return NextResponse.json(
        { error: "This is not a cricket fixture" },
        { status: 400 }
      )
    }

    // Initialize cricket data
    const cricketData = {
      cricket: {
        team_a: {
          runs: 0,
          wickets: 0,
          overs: 0,
          extras: 0,
          balls_faced: 0,
          fours: 0,
          sixes: 0,
          wides: 0,
          no_balls: 0,
          byes: 0,
          leg_byes: 0,
          run_rate: 0
        },
        team_b: {
          runs: 0,
          wickets: 0,
          overs: 0,
          extras: 0,
          balls_faced: 0,
          fours: 0,
          sixes: 0,
          wides: 0,
          no_balls: 0,
          byes: 0,
          leg_byes: 0,
          run_rate: 0
        }
      }
    }

    // Update the fixture with cricket data
    const { data: updatedFixture, error: updateError } = await supabase
      .from('fixtures')
      .update({
        extra: cricketData
      })
      .eq('id', fixtureId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update fixture" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      fixture: updatedFixture,
      message: "Cricket data initialized successfully"
    })

  } catch (error) {
    console.error('Error initializing cricket data:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
