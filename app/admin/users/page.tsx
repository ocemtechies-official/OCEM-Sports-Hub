import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminUserManagement } from "@/components/admin/user-management"
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
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        
        <AdminUserManagement 
          users={users || []}
          onUpdateUserRole={updateUserRole}
        />
      </div>
    </div>
  )
}