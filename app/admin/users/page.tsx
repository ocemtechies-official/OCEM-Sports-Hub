import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EnhancedUserTable } from "@/components/admin/users/enhanced-user-table"
import { updateUserRole } from "./actions"
import AdminPageWrapper from "../admin-page-wrapper"

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
    <AdminPageWrapper>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Manage user roles and permissions with advanced filtering and bulk operations</p>
        </div>
        
        <EnhancedUserTable 
          users={users || []}
          onUpdateUserRole={updateUserRole}
        />
      </div>
    </AdminPageWrapper>
  )
}