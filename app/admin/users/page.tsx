import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EnhancedUserTable } from "@/components/admin/users/enhanced-user-table"
import { updateUserRole } from "./actions"

export default async function AdminUsersPage() {
  const { user, profile, isAdmin } = await requireAdmin()
  
  if (!user || !profile || !isAdmin) {
    redirect("/auth/login?redirect=/admin/users")
  }

  const supabase = await getSupabaseServerClient()
  
  // Fetch all users
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return <div>Error loading users</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-1">Manage user roles and permissions with advanced filtering and bulk operations</p>
      </div>
      
      <EnhancedUserTable 
        users={users || []}
        onUpdateUserRole={updateUserRole}
      />
    </div>
  )
}