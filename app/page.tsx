import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Calendar, Brain, Crown, ArrowRight, Zap, Star, Users2, PlayCircle, Sparkles, Target } from "lucide-react"
import Link from "next/link"

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

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section with Better Layout */}
      <section className="relative hero-gradient-animated text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
          {/* Floating Elements with New Theme Colors */}
          <div className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-16 w-6 h-6 opacity-30 rounded-full animate-bounce" style={{backgroundColor: '#06B6D4'}}></div>
          <div className="absolute bottom-40 left-20 w-5 h-5 opacity-25 rounded-full animate-pulse" style={{backgroundColor: '#7C3AED'}}></div>
          <div className="absolute top-60 right-32 w-8 h-8 opacity-20 rounded-full animate-float" style={{backgroundColor: '#F97316'}}></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Main Hero Content */}
              <div className="text-center lg:text-left animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <Zap className="h-4 w-4 animate-pulse" style={{color: '#22C55E'}} />
                  <span className="text-sm font-medium">
                    {liveFixtures?.length ? `${liveFixtures.length} Live Matches` : "Tournament Active"}
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight animate-fade-in-up delay-200">
                  OCEM Sports Hub
                  <span className="block text-3xl md:text-4xl lg:text-5xl mt-2" style={{color: '#06B6D4'}}>2025</span>
                </h1>

                <p className="text-lg md:text-xl text-blue-100 mb-8 text-pretty max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-400">
                  Experience the ultimate multi-sport tournament with live scores, interactive quizzes, and competitive
                  chess matches. Join thousands of participants in the most exciting sports hub.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 animate-fade-in-up delay-600">
                  <Button size="lg" asChild className="bg-white hover:bg-blue-50 hover:scale-105 transition-all text-black font-bold btn-glow" style={{backgroundColor: '#F9FAFB', color: '#4338CA'}}>
                    <Link href="/fixtures">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Watch Live Matches
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-white text-white hover:bg-white/10 bg-transparent hover:scale-105 transition-all"
                  >
                    <Link href="/leaderboard">
                      <Trophy className="mr-2 h-5 w-5" />
                      View Rankings
                    </Link>
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start animate-fade-in-up delay-800">
                  <Badge variant="outline" className="border-white/50 text-white hover:bg-white/10 cursor-pointer">
                    <Link href="/quiz" className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Quiz Challenge
                    </Link>
                  </Badge>
                  <Badge variant="outline" className="border-white/50 text-white hover:bg-white/10 cursor-pointer">
                    <Link href="/chess" className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Chess Arena
                    </Link>
                  </Badge>
                  <Badge variant="outline" className="border-white/50 text-white hover:bg-white/10 cursor-pointer">
                    <Link href="/teams" className="flex items-center gap-1">
                      <Users2 className="h-3 w-3" />
                      Team Stats
                    </Link>
                  </Badge>
                </div>
              </div>

              {/* Stats Grid with New Theme Colors */}
              <div className="lg:ml-8 animate-slide-in-right">
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:max-w-none">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all card-hover-glow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(67, 56, 202, 0.3)'}}>
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{uniqueSports?.length || 5}</div>
                          <div className="text-xs" style={{color: '#06B6D4'}}>Sports</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all card-hover-glow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.3)'}}>
                          <Users2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{totalTeams || 0}</div>
                          <div className="text-xs" style={{color: '#06B6D4'}}>Teams</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all card-hover-glow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(124, 58, 237, 0.3)'}}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{totalFixtures || 0}</div>
                          <div className="text-xs" style={{color: '#06B6D4'}}>Fixtures</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all card-hover-glow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(249, 115, 22, 0.3)'}}>
                          <Zap className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{liveFixtures?.length || 0}</div>
                          <div className="text-xs" style={{color: '#06B6D4'}}>Live Now</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Wave Divider with Theme Color */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Enhanced Features Section with New Theme */}
      <section className="py-20" style={{backgroundColor: '#F9FAFB'}}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-2" style={{color: '#4338CA', borderColor: '#4338CA'}}>
              <Star className="mr-1 h-3 w-3" />
              Premium Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{color: '#1E293B'}}>
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{backgroundImage: 'linear-gradient(to right, #4338CA, #7C3AED)'}}>
                Win
              </span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{color: '#64748B'}}>
              Join the ultimate sports experience with real-time tracking, competitive gaming, and comprehensive analytics
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {/* Live Sports with Primary Color */}
            <Link href="/fixtures" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2" style={{background: 'linear-gradient(135deg, #4338CA, #6366f1)'}}>
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg" style={{background: 'linear-gradient(135deg, #F9FAFB, #ffffff)'}}>
                    <Trophy className="h-7 w-7" style={{color: '#4338CA'}} />
                  </div>
                  <CardTitle className="text-2xl text-white group-hover:text-blue-100 transition-colors">
                    Live Sports Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 mb-6 text-base leading-relaxed">
                    Follow real-time scores across cricket, football, basketball, badminton, and table tennis with 
                    instant notifications and detailed match analytics.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-white font-semibold">
                      View Live Matches 
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                    <Badge className="text-white" style={{backgroundColor: '#06B6D4'}}>
                      {liveFixtures?.length || 0} Live
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Sports Quiz with Secondary Color */}
            <Link href="/quiz" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2" style={{background: 'linear-gradient(135deg, #7C3AED, #8b5cf6)'}}>
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg" style={{background: 'linear-gradient(135deg, #F9FAFB, #ffffff)'}}>
                    <Brain className="h-7 w-7" style={{color: '#7C3AED'}} />
                  </div>
                  <CardTitle className="text-2xl text-white group-hover:text-purple-100 transition-colors">
                    Sports Trivia Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-100 mb-6 text-base leading-relaxed">
                    Test your sports knowledge with engaging multi-level quizzes, earn points, and climb the 
                    global leaderboard with other sports enthusiasts.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-white font-semibold">
                      Start Challenge 
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                    <Badge className="text-white" style={{backgroundColor: '#F97316'}}>
                      Trending
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Chess Arena with Accent Color */}
            <Link href="/chess" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2" style={{background: 'linear-gradient(135deg, #F97316, #fb923c)'}}>
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg" style={{background: 'linear-gradient(135deg, #F9FAFB, #ffffff)'}}>
                    <Crown className="h-7 w-7" style={{color: '#F97316'}} />
                  </div>
                  <CardTitle className="text-2xl text-white group-hover:text-orange-100 transition-colors">
                    Strategic Chess Arena
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-100 mb-6 text-base leading-relaxed">
                    Master the royal game with online tournaments, practice matches, and strategic puzzles. 
                    Challenge players worldwide and improve your rating.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-white font-semibold">
                      Play Chess 
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                    <Badge className="text-white" style={{backgroundColor: '#22C55E'}}>
                      New
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4338CA, #7C3AED, #06B6D4, #F97316)'}}>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-float"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 px-4 py-2 text-lg text-white border-white/30" variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Ready to Compete?
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join the Ultimate
            <span className="block text-yellow-300">Sports Experience</span>
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Whether you're a sports fanatic, trivia master, or chess strategist - there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="font-bold hover:scale-105 transition-all" style={{backgroundColor: '#F9FAFB', color: '#4338CA'}}>
              <Link href="/fixtures">
                <Target className="mr-2 h-5 w-5" />
                Start Competing Now
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white/10 bg-transparent hover:scale-105 transition-all"
            >
              <Link href="/leaderboard">
                <Trophy className="mr-2 h-5 w-5" />
                View Champions
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}