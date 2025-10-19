import { requireModerator } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  User,
  Trophy,
  Zap,
  CheckCircle,
  X,
  ArrowLeft
} from "lucide-react"
import { QuickUpdateCard } from "@/components/moderator/quick-update-card"
import { EnhancedCricketScorecard } from "@/components/cricket/enhanced-cricket-scorecard"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ModeratorFixtureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user, profile, isModerator } = await requireModerator()
  
  if (!user || !isModerator) {
    return null
  }

  const supabase = await getSupabaseServerClient()

  // Fetch the specific fixture
  const { data: fixture, error } = await supabase
    .from('fixtures')
    .select(`
      *,
      sport:sports(id, name, icon),
      team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
      team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url),
      updated_by_profile:profiles!fixtures_updated_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error || !fixture) {
    return notFound()
  }

  // Check if moderator is assigned to this sport (if not admin)
  if (profile.role !== 'admin') {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('assigned_sports')
      .eq('id', user.id)
      .single()

    if (profileData && profileData.assigned_sports !== null) {
      const assignedSports = profileData.assigned_sports || []
      if (!assignedSports.includes(fixture.sport?.name)) {
        return notFound()
      }
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Zap className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button asChild variant="outline" className="border-slate-300">
            <Link href="/moderator/fixtures">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fixtures
            </Link>
          </Button>
          
          <Badge className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(fixture.status)}`}>
            {getStatusIcon(fixture.status)}
            <span className="ml-2 capitalize">{fixture.status}</span>
          </Badge>
        </div>

        {/* Match Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-bold">{fixture.sport?.name}</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            {fixture.team_a?.name} vs {fixture.team_b?.name}
          </h1>
          <p className="text-xl text-slate-600">
            {new Date(fixture.scheduled_at).toLocaleString()}
          </p>
        </div>

        {/* Main Content - Score Management Cards */}
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Enhanced Cricket Scorecard for Cricket matches */}
          {fixture.sport?.name?.toLowerCase() === 'cricket' && (
            <EnhancedCricketScorecard
              fixtureId={fixture.id}
              teamAName={fixture.team_a?.name || 'Team A'}
              teamBName={fixture.team_b?.name || 'Team B'}
              teamAScore={fixture.team_a_score || 0}
              teamBScore={fixture.team_b_score || 0}
              status={fixture.status}
              initialData={{
                cricket: fixture.extra?.cricket
              }}
            />
          )}
          
          {/* Standard Quick Update Card for all sports */}
          <QuickUpdateCard fixture={fixture} />
        </div>
      </div>
    </div>
  )
}