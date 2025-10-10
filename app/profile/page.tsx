import { requireAuth } from "@/lib/auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Trophy, 
  Users, 
  Settings,
  Edit3,
  Camera,
  CheckCircle,
  Clock,
  Award,
  Star
} from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const { user, profile } = await requireAuth()
  
  // If not authenticated, redirect to login
  if (!user || !profile) {
    redirect("/auth/login?redirect=/profile")
  }

  const initials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || profile.email[0].toUpperCase()

  // Calculate member since date
  const memberSince = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : 'Unknown'

  // Calculate last sign in date
  const lastSignIn = user.last_sign_in_at 
    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) 
    : 'Never'

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    {/* Avatar with Gradient Ring */}
                    <div className="relative mb-5">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-0.5"></div>
                      <div className="relative bg-white rounded-full p-1">
                        <Avatar className="h-24 w-24">
                          <AvatarImage 
                            src={profile.avatar_url || undefined} 
                            alt={profile.full_name || profile.email} 
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 rounded-full">
                          <Camera className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="text-center mb-5">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.full_name || "User"}</h2>
                      <p className="text-gray-600 flex items-center justify-center text-sm">
                        <Mail className="h-4 w-4 mr-1 text-blue-500" />
                        {user.email}
                      </p>
                      
                      {profile.role === "admin" && (
                        <Badge className="mt-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center text-sm text-gray-500 mb-6">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      Member since {memberSince}
                    </div>

                    {/* Edit Profile Button */}
                    <Button 
                      variant="outline" 
                      className="w-full bg-gradient-to-r from-white to-white hover:from-blue-50 hover:to-purple-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-all duration-300"
                      asChild
                    >
                      <Link href="/settings" className="flex items-center justify-center">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status Card */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-gray-700">Email Verified</span>
                      </div>
                      <Badge variant={user.email_confirmed_at ? "default" : "destructive"}>
                        {user.email_confirmed_at ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="text-gray-700">Account Role</span>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {profile.role}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-gray-700">Last Sign In</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{lastSignIn}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Activity and Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/profile/registrations" className="block">
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300 cursor-pointer">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">My Registrations</h3>
                            <p className="text-sm text-gray-600">View your event registrations</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/settings" className="block">
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300 cursor-pointer">
                        <div className="flex items-center">
                          <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <Settings className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Account Settings</h3>
                            <p className="text-sm text-gray-600">Update your preferences</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {profile.role === "admin" && (
                      <Link href="/admin" className="block md:col-span-2">
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                              <Shield className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">Admin Panel</h3>
                              <p className="text-sm text-gray-600">Manage the platform</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start p-3 rounded-lg hover:bg-blue-50 transition-colors duration-300">
                      <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Registered for Chess Tournament</p>
                        <p className="text-sm text-gray-600">2 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 rounded-lg hover:bg-green-50 transition-colors duration-300">
                      <div className="bg-green-100 p-2 rounded-full mr-3 mt-0.5">
                        <Trophy className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Completed Quiz: Sports History</p>
                        <p className="text-sm text-gray-600">1 week ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 rounded-lg hover:bg-purple-50 transition-colors duration-300">
                      <div className="bg-purple-100 p-2 rounded-full mr-3 mt-0.5">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Updated profile information</p>
                        <p className="text-sm text-gray-600">2 weeks ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center py-4">
                      <Button variant="outline" size="sm" className="hover:shadow-sm transition-all duration-300" asChild>
                        <Link href="/profile/registrations">
                          View All Activity
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Overview */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Participation Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors duration-300">
                      <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">5</div>
                      <div className="text-sm text-gray-600">Events</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center hover:bg-green-100 transition-colors duration-300">
                      <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">3</div>
                      <div className="text-sm text-gray-600">Quizzes</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors duration-300">
                      <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">12</div>
                      <div className="text-sm text-gray-600">Points</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center hover:bg-amber-100 transition-colors duration-300">
                      <Award className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-amber-600">2</div>
                      <div className="text-sm text-gray-600">Teams</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}