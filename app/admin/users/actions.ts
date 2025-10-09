'use server'

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: 'admin' | 'viewer') {
  // Verify admin access
  const { user, profile, isAdmin } = await requireAdmin()
  
  if (!user || !profile || !isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await getSupabaseServerClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
  
  if (error) {
    console.error('Error updating user role:', error)
    throw new Error('Failed to update user role')
  }

  // Revalidate the page to show updated data
  revalidatePath('/admin/users')
  
  return { success: true }
}