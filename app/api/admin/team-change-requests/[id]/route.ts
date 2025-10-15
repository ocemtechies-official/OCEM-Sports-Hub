import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

const approveRequestSchema = z.object({
  action: z.enum(['approve', 'reject']),
  admin_notes: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, user } = await requireAdmin()

    if (!isAdmin || !user) {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 })
    }

    const requestId = params.id
    const body = await request.json()
    const { action, admin_notes } = approveRequestSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Get the change request
    const { data: changeRequest, error: fetchError } = await supabase
      .from('team_change_requests')
      .select(`
        *,
        teams (
          id,
          name
        )
      `)
      .eq('id', requestId)
      .single()

    if (fetchError || !changeRequest) {
      return NextResponse.json({ error: "Change request not found" }, { status: 404 })
    }

    if (changeRequest.status !== 'pending') {
      return NextResponse.json({ error: "Request has already been processed" }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update the change request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('team_change_requests')
      .update({
        status: newStatus,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      console.error('Update change request error:', updateError)
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
    }

    // If approved and it's a member change, update the team members
    if (action === 'approve' && changeRequest.change_type === 'members') {
      const payload = changeRequest.payload as any
      const members = payload.members || []

      // Delete existing team members
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', changeRequest.team_id)

      if (deleteError) {
        console.error('Delete team members error:', deleteError)
        // Don't fail the request, just log the error
      }

      // Insert new members
      if (members.length > 0) {
        const membersToInsert = members.map((member: any, index: number) => ({
          team_id: changeRequest.team_id,
          member_name: member.member_name,
          member_contact: member.member_contact || null,
          member_phone: member.member_phone || member.member_contact || null,
          member_email: member.member_email || null,
          member_roll_number: member.member_roll_number || null,
          member_position: member.member_position || null,
          member_order: member.member_order || index,
          is_captain: member.is_captain || false,
          is_substitute: member.is_substitute || false,
          created_at: new Date().toISOString()
        }))

        const { error: insertError } = await supabase
          .from('team_members')
          .insert(membersToInsert)

        if (insertError) {
          console.error('Insert team members error:', insertError)
          // Don't fail the request, just log the error
        }
      }
    }

    return NextResponse.json({
      request: updatedRequest,
      message: `Change request ${action}d successfully`
    })
  } catch (err) {
    console.error('Admin approve change request error:', err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
