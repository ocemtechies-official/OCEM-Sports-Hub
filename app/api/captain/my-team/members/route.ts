import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { z } from "zod"

const optionalString = z.union([z.string(), z.literal(""), z.null()]).optional()
const optionalEmail = z.union([z.string().email(), z.literal(""), z.null()]).optional()

const memberSchema = z.object({
  member_name: z.string().min(1),
  member_contact: optionalString,
  member_phone: optionalString,
  member_email: optionalEmail,
  member_roll_number: optionalString,
  member_position: optionalString,
  member_order: z.number().int().min(0).optional(),
  is_captain: z.boolean().default(false),
  is_substitute: z.boolean().default(false)
})

const membersRequestSchema = z.object({
  members: z.array(memberSchema).min(1)
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received member change request:', JSON.stringify(body, null, 2))
    const { members } = membersRequestSchema.parse(body)
    console.log('Parsed members:', JSON.stringify(members, null, 2))

    // Find team where current user's email matches captain_email (case insensitive)
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('team_type', 'student_registered')
      .eq('status', 'active')
      .ilike('captain_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!team) {
      return NextResponse.json({ error: "No team found for current user as captain" }, { status: 404 })
    }

    // Clean up empty strings and insert a change request for admin approval
    const payload = {
      members: members.map((m, index) => ({
        member_name: m.member_name,
        member_contact: m.member_contact && m.member_contact !== "" ? m.member_contact : null,
        member_phone: m.member_phone && m.member_phone !== "" ? m.member_phone : (m.member_contact && m.member_contact !== "" ? m.member_contact : null),
        member_email: m.member_email && m.member_email !== "" ? m.member_email : null,
        member_roll_number: m.member_roll_number && m.member_roll_number !== "" ? m.member_roll_number : null,
        member_position: m.member_position && m.member_position !== "" ? m.member_position : null,
        member_order: m.member_order ?? index,
        is_captain: m.is_captain,
        is_substitute: m.is_substitute
      }))
    }

    const { data: changeRequest, error: crError } = await supabase
      .from('team_change_requests')
      .insert({
        team_id: team.id,
        requested_by: user.id,
        change_type: 'members',
        payload,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (crError) {
      console.error('Create change request error:', crError)
      return NextResponse.json({ error: "Failed to submit change request" }, { status: 500 })
    }

    return NextResponse.json({ request: changeRequest, message: 'Member change request submitted for approval' })
  } catch (err) {
    console.error('Captain members POST error:', err)
    if (err instanceof z.ZodError) {
      console.error('Validation errors:', err.errors)
      return NextResponse.json({ 
        error: 'Invalid data', 
        details: err.errors,
        message: 'Please check the member details and try again'
      }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


