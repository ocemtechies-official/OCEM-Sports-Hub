import { requireAuth } from "@/lib/auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const { user, profile } = await requireAuth()
  
  // If not authenticated, redirect to login
  if (!user || !profile) {
    redirect("/auth/login?redirect=/profile")
  }
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{profile.full_name || "User"}</h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Account Information</h3>
                <p className="text-sm text-gray-600">Email verified: {user.email_confirmed_at ? "Yes" : "No"}</p>
                <p className="text-sm text-gray-600">Role: {profile.role}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Activity</h3>
                <p className="text-sm text-gray-600">Last sign in: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}