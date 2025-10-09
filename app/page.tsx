import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { LiveFixturesRealtime } from "@/components/fixtures/live-fixtures-realtime";
import { UpcomingFixtures } from "@/components/fixtures/upcoming-fixtures";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { CountDown } from "@/components/Home/CountDown";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Brain, Crown, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const profile = await getCurrentProfile();

  const { data: sports } = await supabase
    .from("sports")
    .select("*")
    .order("name");

  const { count: totalFixtures } = await supabase
    .from("fixtures")
    .select("*", { count: "exact", head: true });

  const { count: totalTeams } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true });

  const { data: liveFixtures } = await supabase
    .from("fixtures")
    .select(
      `
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `
    )
    .eq("status", "live")
    .order("scheduled_at", { ascending: true });

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Live Now</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
              Sports Week 2025
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 text-pretty max-w-2xl mx-auto">
              Experience the ultimate multi-sport tournament with live scores,
              interactive quizzes, and competitive chess matches
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Link href="/leaderboard">
                  <Trophy className="mr-2 h-5 w-5" />
                  View Leaderboard
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/quiz">
                  <Brain className="mr-2 h-5 w-5" />
                  Take Quiz
                </Link>
              </Button>
            </div>

            {/* Countdown to the start of the event */}
            <CountDown />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">
                  {sports?.length || 0}
                </div>
                <div className="text-sm text-blue-100">Sports</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">{totalTeams || 0}</div>
                <div className="text-sm text-blue-100">Teams</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">
                  {totalFixtures || 0}
                </div>
                <div className="text-sm text-blue-100">Fixtures</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">
                  {liveFixtures?.length || 0}
                </div>
                <div className="text-sm text-blue-100">Live Now</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Track your favorite sports, test your knowledge, and compete in
              chess tournaments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link href="/teams" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 h-full border border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg">
                <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Live Sports
                </h3>
                <p className="text-slate-600 mb-4">
                  Follow live scores across cricket, football, basketball,
                  badminton, and table tennis
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  View Fixtures{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/quiz" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 h-full border border-purple-100 hover:border-purple-300 transition-all hover:shadow-lg">
                <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Sports Trivia
                </h3>
                <p className="text-slate-600 mb-4">
                  Test your sports knowledge with multi-level quizzes and climb
                  the leaderboard
                </p>
                <div className="flex items-center text-purple-600 font-medium">
                  Start Quiz{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/chess" className="group">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 h-full border border-amber-100 hover:border-amber-300 transition-all hover:shadow-lg">
                <div className="bg-amber-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Chess Arena
                </h3>
                <p className="text-slate-600 mb-4">
                  Compete in online chess matches and solve challenging puzzles
                </p>
                <div className="flex items-center text-amber-600 font-medium">
                  Play Chess{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <StatsOverview />
          </Suspense>
        </div>
      </section>

      {liveFixtures && liveFixtures.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Live Now
            </h2>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <LiveFixturesRealtime initialFixtures={liveFixtures || []} />
            </Suspense>
          </div>
        </section>
      )}

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              Upcoming Fixtures
            </h2>
            <Button variant="outline" asChild>
              <Link href="/teams">View All</Link>
            </Button>
          </div>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <UpcomingFixtures />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
