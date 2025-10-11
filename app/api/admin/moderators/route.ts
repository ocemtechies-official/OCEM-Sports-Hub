import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

const createModeratorSchema = z.object({
  userId: z.string().uuid(),
  assignedSports: z.array(z.string()).nullable().optional(),
  assignedVenues: z.array(z.string()).nullable().optional(),
  moderatorNotes: z.string().nullable().optional()
})

const updateModeratorSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['moderator', 'viewer'])
})

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, profile, isAdmin } = await requireAdmin()
    
    if (!user || !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()
    
    // Validate request body
    const validatedData = createModeratorSchema.parse(body)
    
    const { userId, assignedSports, assignedVenues, moderatorNotes } = validatedData

    // Check if user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user is already a moderator or admin
    if (targetUser.role === 'moderator' || targetUser.role === 'admin') {
      return NextResponse.json(
        { error: "User is already a moderator or admin" },
        { status: 400 }
      )
    }

    // Update user to moderator role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'moderator',
        assigned_sports: assignedSports,
        assigned_venues: assignedVenues,
        moderator_notes: moderatorNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error("Error updating user to moderator:", updateError)
      return NextResponse.json(
        { error: "Failed to create moderator" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Moderator created successfully",
      moderator: {
        id: userId,
        email: targetUser.email,
        full_name: targetUser.full_name,
        role: 'moderator',
        assigned_sports: assignedSports,
        assigned_venues: assignedVenues,
        moderator_notes: moderatorNotes
      }
    })
  } catch (error) {
    console.error("Error in create moderator API:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, profile, isAdmin } = await requireAdmin()
    
    if (!user || !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()
    
    // Validate request body
    const validatedData = updateModeratorSchema.parse(body)
    
    const { userId, role } = validatedData

    // Check if user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent demoting the last admin
    if (targetUser.role === 'admin' && role !== 'admin') {
      const { data: adminCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'admin')

      if (adminCount && adminCount.length <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last admin" },
          { status: 400 }
        )
      }
    }

    // Update user role
    const updateData: any = {
      role,
      updated_at: new Date().toISOString()
    }

    // Clear moderator-specific fields if demoting to viewer
    if (role === 'viewer') {
      updateData.assigned_sports = null
      updateData.assigned_venues = null
      updateData.moderator_notes = null
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error("Error updating user role:", updateError)
      return NextResponse.json(
        { error: "Failed to update user role" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: userId,
        email: targetUser.email,
        full_name: targetUser.full_name,
        role
      }
    })
  } catch (error) {
    console.error("Error in update moderator API:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
