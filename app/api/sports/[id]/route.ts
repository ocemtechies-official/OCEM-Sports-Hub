import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser, requireAdmin } from "@/lib/auth"
import { z } from "zod"

const updateSportSchema = z.object({
  name: z.string().min(1, "Sport name is required").optional(),
  icon: z.string().optional(),
  is_team_sport: z.boolean().optional(),
  min_players: z.number().int().min(1).optional(),
  max_players: z.number().int().min(1).optional(),
  description: z.string().optional(),
  rules: z.string().optional(),
  is_active: z.boolean().optional()
})

type UpdateSportData = z.infer<typeof updateSportSchema>

// GET /api/sports/[id] - Get specific sport
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const sportId = params.id

    const { data: sport, error } = await supabase
      .from('sports')
      .select('*')
      .eq('id', sportId)
      .single()

    if (error) {
      console.error('Get sport error:', error)
      return NextResponse.json(
        { error: "Sport not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ sport })

  } catch (error) {
    console.error('Get sport error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/sports/[id] - Update sport
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, user } = await requireAdmin()

    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const sportId = params.id
    const body = await request.json()
    const validatedData = updateSportSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Check if sport exists
    const { data: existingSport, error: fetchError } = await supabase
      .from('sports')
      .select('id, name')
      .eq('id', sportId)
      .single()

    if (fetchError || !existingSport) {
      return NextResponse.json(
        { error: "Sport not found" },
        { status: 404 }
      )
    }

    // Check if name is being changed and if new name already exists
    if (validatedData.name && validatedData.name !== existingSport.name) {
      const { data: nameConflict } = await supabase
        .from('sports')
        .select('id')
        .eq('name', validatedData.name)
        .neq('id', sportId)
        .single()

      if (nameConflict) {
        return NextResponse.json(
          { error: "Sport with this name already exists" },
          { status: 400 }
        )
      }
    }

    // Update sport
    const { data: sport, error: updateError } = await supabase
      .from('sports')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', sportId)
      .select()
      .single()

    if (updateError) {
      console.error('Update sport error:', updateError)
      return NextResponse.json(
        { error: "Failed to update sport" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sport,
      message: "Sport updated successfully"
    })

  } catch (error) {
    console.error('Update sport error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/sports/[id] - Delete sport
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, user } = await requireAdmin()

    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const sportId = params.id
    const supabase = await getSupabaseServerClient()

    // Check if sport exists
    const { data: existingSport, error: fetchError } = await supabase
      .from('sports')
      .select('id, name')
      .eq('id', sportId)
      .single()

    if (fetchError || !existingSport) {
      return NextResponse.json(
        { error: "Sport not found" },
        { status: 404 }
      )
    }

    // Check if sport is being used in fixtures or registrations
    const { data: fixtures } = await supabase
      .from('fixtures')
      .select('id')
      .eq('sport_id', sportId)
      .limit(1)

    const { data: registrations } = await supabase
      .from('individual_registrations')
      .select('id')
      .eq('sport_id', sportId)
      .limit(1)

    const { data: teamRegistrations } = await supabase
      .from('team_registrations')
      .select('id')
      .eq('sport_id', sportId)
      .limit(1)

    if (fixtures?.length > 0 || registrations?.length > 0 || teamRegistrations?.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete sport that is being used in fixtures or registrations" },
        { status: 400 }
      )
    }

    // Delete sport
    const { error: deleteError } = await supabase
      .from('sports')
      .delete()
      .eq('id', sportId)

    if (deleteError) {
      console.error('Delete sport error:', deleteError)
      return NextResponse.json(
        { error: "Failed to delete sport" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Sport deleted successfully"
    })

  } catch (error) {
    console.error('Delete sport error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
