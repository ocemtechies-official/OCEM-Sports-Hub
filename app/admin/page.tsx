import { isAdmin } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const { user, profile, isAdmin } = await requireAdmin()
  
  // If not authenticated or not admin, redirect
  if (!user || !profile || !isAdmin) {
    redirect("/auth/login?redirect=/admin")
  }
  
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-gray-600">Total registered users</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Fixtures</h2>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-gray-600">Active fixtures</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quizzes</h2>
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-gray-600">Total quizzes</p>
            </div>
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
