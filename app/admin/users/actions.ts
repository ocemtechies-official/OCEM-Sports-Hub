'use server'

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: 'admin' | 'moderator' | 'viewer') {
  // Verify admin access
  const { user, profile, isAdmin } = await requireAdmin()
  
  if (!user || !profile || !isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await getSupabaseServerClient()
  
  // Prevent demoting the last admin
  if (role !== 'admin') {
    const { data: adminCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'admin')

    if (adminCount && adminCount.length <= 1) {
      throw new Error('Cannot demote the last admin')
    }
  }

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

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
  
  if (error) {
    console.error('Error updating user role:', error)
    throw new Error('Failed to update user role')
  }

  // Revalidate the page to show updated data
  revalidatePath('/admin/users')
  
  return { success: true }
}