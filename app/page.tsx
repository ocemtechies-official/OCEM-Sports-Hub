import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SportsCarousel from "@/components/ui/SportsCarousel"
import { 
  Trophy, 
  Calendar, 
  Brain, 
  Crown, 
  ArrowRight, 
  Zap, 
  Star, 
  Users2, 
  PlayCircle, 
  Sparkles, 
  Target,
  TrendingUp,
  Clock,
  Award,
  Activity,
  BarChart3,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { CountDown } from "@/components/Home/CountDown"

export default async function HomePage() {
  const supabase = await getSupabaseServerClient()
  const profile = await getCurrentProfile()

  // Fetch data for stats
  const { data: liveFixtures } = await supabase
    .from("fixtures")
    .select("*")
    .eq("status", "live")
    .limit(3)

  const { count: totalTeams } = await supabase.from("teams").select("*", { count: "exact", head: true })
  const { count: totalFixtures } = await supabase.from("fixtures").select("*", { count: "exact", head: true })
  
  // Get distinct sports count
  const { data: sports } = await supabase
    .from("fixtures")
    .select("sport")
    .not("sport", "is", null)

  const uniqueSports = [...new Set(sports?.map(f => f.sport))]

  // Get recent fixtures for activity feed
  const { data: recentFixtures } = await supabase
    .from("fixtures")
    .select("*, teams!fixtures_home_team_id_fkey(name), teams_away:teams!fixtures_away_team_id_fkey(name)")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get current date for the badge
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const currentDate = today.toLocaleDateString('en-US', options);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section with Dark Theme and Curved Bottom */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white overflow-hidden min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Animated Gradient Background */}
          <div className="hero-gradient-animated absolute inset-0 opacity-70"></div>
          
          {/* Floating 3D Spheres */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-float delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-teal-500/20 rounded-full blur-3xl animate-float delay-500"></div>
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-float slow"></div>
          
          {/* Geometric Shapes */}
          <div className="absolute top-20 left-20 w-40 h-40 border border-blue-400/30 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-32 h-32 border border-purple-400/30 rotate-12 animate-pulse delay-1000"></div>
          
          {/* Particle Effects */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-sparkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 items-center min-h-[80vh]">
              {/* Hero Content */}
              <div className="lg:col-span-7 text-center lg:text-left animate-fade-in-up">
                {/* Status Badge */}
                <div className="inline-flex items-center gap-3 bg-emerald-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-emerald-500/30 animate-bounce-in delay-200">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-emerald-300">
                    {liveFixtures?.length ? `${liveFixtures.length} Live Matches Running` : "Tournament Season Active"}
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl xl:text-8xl font-black mb-8 leading-tight tracking-tight animate-fade-in-up delay-300">
                  <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    OCEM Sports
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-glow-pulse">
                    Hub 2025
                  </span>
                </h1>

                {/* Description */}
                <p className="text-xl md:text-2xl text-slate-200 mb-12 leading-relaxed max-w-3xl mx-auto lg:mx-0 font-light animate-fade-in-up delay-400">
                  The ultimate destination for competitive sports featuring 
                  <span className="text-blue-300 font-semibold"> live tracking</span>, 
                  <span className="text-purple-300 font-semibold"> interactive challenges</span>, and 
                  <span className="text-teal-300 font-semibold"> comprehensive analytics</span>.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-16 animate-fade-in-up delay-500">
                  <Button 
                    size="lg" 
                    asChild 
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl btn-glow"
                  >
                    <Link href="/fixtures">
                      <PlayCircle className="mr-3 h-6 w-6" />
                      Watch Live Matches
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-2 border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:text-white hover:border-white/50 hover:shadow-xl backdrop-blur-sm"
                  >
                    <Link href="/leaderboard">
                      <Trophy className="mr-3 h-6 w-6" />
                      View Rankings
                    </Link>
                  </Button>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-600">
                  <div className="flex items-center gap-3 text-slate-200 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-300" />
                    </div>
                    <span className="font-medium">Real-time Updates</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-200 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 bg-purple-500/30 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-purple-300" />
                    </div>
                    <span className="font-medium">Advanced Analytics</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-200 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 bg-teal-500/30 rounded-xl flex items-center justify-center">
                      <Award className="h-5 w-5 text-teal-300" />
                    </div>
                    <span className="font-medium">Tournament Mode</span>
                  </div>
                </div>
              </div>

              {/* Countdown Section replacing Live Status */}
              <div className="lg:col-span-5 animate-fade-in-up delay-700">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group card-hover-glow relative">
                  {/* Playful Date Badge over the countdown */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-4 py-2 rounded-full text-xs shadow-lg whitespace-nowrap">
                      🎉 {currentDate} 🎉
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-2xl">
                        <Clock className="h-8 w-8 text-blue-300" />
                      </div>
                      <div>
                        <div className="text-xl font-bold mb-1">Tournament Countdown</div>
                        <div className="text-sm text-slate-300 font-medium">Get ready for the action</div>
                      </div>
                    </div>
                    
                    {/* Countdown Component */}
                    <div className="mt-4">
                      <CountDown />
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group card-hover-glow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-2xl group-hover:bg-blue-500/30 transition-colors">
                          <Trophy className="h-8 w-8 text-blue-300" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold mb-1">{uniqueSports?.length || 6}</div>
                          <div className="text-sm text-slate-300 font-medium">Sports Categories</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group card-hover-glow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl group-hover:bg-emerald-500/30 transition-colors">
                          <Users2 className="h-8 w-8 text-emerald-300" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold mb-1">{totalTeams || 48}</div>
                          <div className="text-sm text-slate-300 font-medium">Active Teams</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group card-hover-glow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-2xl group-hover:bg-purple-500/30 transition-colors">
                          <Calendar className="h-8 w-8 text-purple-300" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold mb-1">{totalFixtures || 124}</div>
                          <div className="text-sm text-slate-300 font-medium">Total Fixtures</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group card-hover-glow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/20 rounded-2xl group-hover:bg-orange-500/30 transition-colors">
                          <Zap className="h-8 w-8 text-orange-300" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold mb-1">{liveFixtures?.length || 0}</div>
                          <div className="text-sm text-slate-300 font-medium">Live Matches</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="relative block w-full h-24 md:h-32"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" 
              className="fill-current"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" 
              className="fill-current"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="fill-current"
            ></path>
          </svg>
        </div>
      </section>

      {/* Sports Categories Showcase with soft background */}
      <div className="bg-blue-50/30">
        <SportsCarousel />
      </div>

      {/* Live Dashboard Section with soft background */}
      <section className="py-16 bg-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-blue-200 text-blue-700">
              <Activity className="mr-1 h-3 w-3" />
              Live Dashboard
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Real-Time Sports Action
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stay updated with live scores, match statistics, and tournament progress
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Live Matches */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    Live Matches
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-700">
                    {liveFixtures?.length || 0} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {liveFixtures && liveFixtures.length > 0 ? (
                  <div className="space-y-3">
                    {liveFixtures.map((fixture, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">{fixture.sport}</div>
                          <div className="text-xs text-green-600 font-semibold">LIVE</div>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          {fixture.home_team_score} - {fixture.away_team_score}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No live matches currently</p>
                  </div>
                )}
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/fixtures">
                    View All Fixtures
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentFixtures?.slice(0, 4).map((fixture, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{fixture.sport}</div>
                        <div className="text-xs text-slate-500">
                          {fixture.status === 'completed' ? 'Completed' : 'Scheduled'}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(fixture.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  )) || [
                    <div key="empty" className="text-center py-8 text-slate-500">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  ]}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Tournament Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Sports</span>
                    <span className="font-semibold text-slate-900">{uniqueSports?.length || 5}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Active Teams</span>
                    <span className="font-semibold text-slate-900">{totalTeams || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Fixtures</span>
                    <span className="font-semibold text-slate-900">{totalFixtures || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Completion Rate</span>
                    <span className="font-semibold text-green-600">95%</span>
                  </div>
                </div>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/leaderboard">
                    View Leaderboard
                    <Trophy className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Highlights Section with soft background */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-purple-200 text-purple-700">
              <Star className="mr-1 h-3 w-3" />
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for Sports Excellence
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive features designed for athletes, teams, and tournament organizers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <PlayCircle className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Live Streaming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Watch live matches with real-time commentary and interactive features for an immersive experience.
                </p>
                <div className="flex items-center text-blue-600 font-semibold">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  HD Quality streams
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Tournament Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Complete tournament organization with brackets, scheduling, and automated result tracking.
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Automated brackets
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Interactive Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Engage with sports trivia and knowledge competitions with real-time scoring and leaderboards.
                </p>
                <div className="flex items-center text-purple-600 font-semibold">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Real-time scoring
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Crown className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Chess Arena</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Strategic chess matches with tournaments, puzzles, and rating system for competitive play.
                </p>
                <div className="flex items-center text-orange-600 font-semibold">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tournament mode
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}