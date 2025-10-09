import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trophy, Brain, Settings, Shield, Calendar, Target } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const { user, profile, isAdmin } = await requireAdmin()
  
  // If not authenticated or not admin, redirect
  if (!user || !profile || !isAdmin) {
    redirect("/auth/login?redirect=/admin")
  }

  const supabase = await getSupabaseServerClient()
  
  // Fetch stats
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })
  const { count: totalFixtures } = await supabase.from("fixtures").select("*", { count: "exact", head: true })
  const { count: totalTournaments } = await supabase.from("tournaments").select("*", { count: "exact", head: true })
  const { count: totalQuizzes } = await supabase.from("quizzes").select("*", { count: "exact", head: true })
  const { count: liveFixtures } = await supabase.from("fixtures").select("*", { count: "exact", head: true }).eq("status", "live")
  const { count: activeTournaments } = await supabase.from("tournaments").select("*", { count: "exact", head: true }).eq("status", "active")
  
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{color: '#4338CA'}}>Admin Dashboard</h1>
            <p className="text-gray-600">Manage your sports hub platform</p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{backgroundColor: 'rgba(67, 56, 202, 0.1)'}}>
                    <Users className="h-6 w-6" style={{color: '#4338CA'}} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{color: '#4338CA'}}>{totalUsers || 0}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
                    <Calendar className="h-6 w-6" style={{color: '#22C55E'}} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{color: '#22C55E'}}>{totalFixtures || 0}</div>
                    <div className="text-sm text-gray-600">Total Fixtures</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{backgroundColor: 'rgba(234, 179, 8, 0.1)'}}>
                    <Trophy className="h-6 w-6" style={{color: '#EAB308'}} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{color: '#EAB308'}}>{totalTournaments || 0}</div>
                    <div className="text-sm text-gray-600">Tournaments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{backgroundColor: 'rgba(124, 58, 237, 0.1)'}}>
                    <Brain className="h-6 w-6" style={{color: '#7C3AED'}} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{color: '#7C3AED'}}>{totalQuizzes || 0}</div>
                    <div className="text-sm text-gray-600">Quizzes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{backgroundColor: 'rgba(249, 115, 22, 0.1)'}}>
                    <Target className="h-6 w-6" style={{color: '#F97316'}} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{color: '#F97316'}}>{liveFixtures || 0}</div>
                    <div className="text-sm text-gray-600">Live Now</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: '#4338CA'}}>
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage user accounts, roles, and permissions.
                </p>
                <Button asChild className="w-full" style={{backgroundColor: '#4338CA'}}>
                  <Link href="/admin/users">
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: '#22C55E'}}>
                  <Calendar className="h-5 w-5" />
                  Fixtures Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Create, update, and manage sports fixtures and matches.
                </p>
                <Button asChild className="w-full" style={{backgroundColor: '#22C55E'}}>
                  <Link href="/admin/fixtures">
                    <Trophy className="mr-2 h-4 w-4" />
                    Manage Fixtures
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: '#EAB308'}}>
                  <Trophy className="h-5 w-5" />
                  Tournament Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Create and manage tournament brackets and competitions.
                </p>
                <Button asChild className="w-full" style={{backgroundColor: '#EAB308'}}>
                  <Link href="/admin/tournaments">
                    <Target className="mr-2 h-4 w-4" />
                    Manage Tournaments
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: '#7C3AED'}}>
                  <Brain className="h-5 w-5" />
                  Quiz Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Create and manage quiz questions and competitions.
                </p>
                <Button asChild className="w-full" style={{backgroundColor: '#7C3AED'}}>
                  <Link href="/admin/quizzes">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Quizzes
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: '#F97316'}}>
                  <Users className="h-5 w-5" />
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage teams, players, and team statistics.
                </p>
                <Button asChild className="w-full" style={{backgroundColor: '#F97316'}}>
                  <Link href="/admin/teams">
                    <Trophy className="mr-2 h-4 w-4" />
                    Manage Teams
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: '#06B6D4'}}>
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Configure system settings and preferences.
                </p>
                <Button asChild className="w-full" style={{backgroundColor: '#06B6D4'}}>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
