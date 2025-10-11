import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Check if user exists and is not already deleted
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', params.id)
      .eq('deleted_at', null)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deletion of the last admin
    if (user.role === 'admin') {
      const { count: adminCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('deleted_at', null)

      if (adminCount && adminCount <= 1) {
        return NextResponse.json({ 
          error: 'Cannot delete the last admin user' 
        }, { status: 400 })
      }
    }

    // Use the soft delete function
    const { data, error } = await supabase
      .rpc('soft_delete_user', { user_id: params.id })

    if (error) {
      console.error('Error soft deleting user:', error)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
