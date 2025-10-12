import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser, requireAdmin } from "@/lib/auth"
import { z } from "zod"

const sportSchema = z.object({
  name: z.string().min(1, "Sport name is required"),
  icon: z.string().optional(),
  is_team_sport: z.boolean().default(false),
  min_players: z.number().int().min(1).optional(),
  max_players: z.number().int().min(1).optional(),
  description: z.string().optional(),
  rules: z.string().optional(),
  is_active: z.boolean().default(true)
})

type SportData = z.infer<typeof sportSchema>

// GET /api/sports - Get all sports
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const activeOnly = url.searchParams.get('active_only') === 'true'

    let query = supabase
      .from('sports')
      .select('*')
      .order('name', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: sports, error } = await query

    if (error) {
      console.error('Get sports error:', error)
      return NextResponse.json(
        { error: "Failed to fetch sports" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sports: sports || [],
      count: sports?.length || 0
    })

  } catch (error) {
    console.error('Get sports error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/sports - Create new sport
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, user } = await requireAdmin()

    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = sportSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Check if sport already exists
    const { data: existingSport } = await supabase
      .from('sports')
      .select('id')
      .eq('name', validatedData.name)
      .single()

    if (existingSport) {
      return NextResponse.json(
        { error: "Sport with this name already exists" },
        { status: 400 }
      )
    }

    // Create sport
    const { data: sport, error: createError } = await supabase
      .from('sports')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Create sport error:', createError)
      return NextResponse.json(
        { error: "Failed to create sport" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sport,
      message: "Sport created successfully"
    })

  } catch (error) {
    console.error('Create sport error:', error)
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
