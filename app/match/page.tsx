import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Zap } from "lucide-react"

export default async function MatchesPage() {
  const supabase = await getSupabaseServerClient()

  const { data: fixtures } = await supabase
    .from('fixtures')
    .select(`
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `)
    .order('scheduled_at', { ascending: true })

  const list = fixtures || []
  const live = list.filter((f: any) => f.status === 'live')
  const upcoming = list.filter((f: any) => f.status === 'scheduled')
  const completed = list.filter((f: any) => f.status === 'completed')

  const Section = ({ title, items }: { title: string, items: any[] }) => (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">No matches</CardContent>
        </Card>
      ) : items.map((f: any, index: number) => (
        <Card key={f.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md hover:shadow-2xl animate-fade-in-up" style={{ animationDelay: `${index * 75}ms` }}>
          <CardContent className="p-0">
            <div className="relative p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors duration-300 mb-1">
                      {f.team_a?.name} vs {f.team_b?.name}
                    </h3>
                    <div className="text-xs text-slate-600">{f.sport?.name} • {f.venue || 'TBD'}</div>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-full text-[10px] font-semibold border bg-slate-100 text-slate-700 border-slate-200 capitalize flex items-center gap-1">
                  {f.status === 'live' ? <Zap className="h-3 w-3 text-red-500" /> : <Clock className="h-3 w-3" />} {f.status}
                </div>
              </div>
              <div className="text-xs text-slate-500">{new Date(f.scheduled_at).toLocaleString()}</div>
            </div>
            <div className="p-6">
              <Link href={`/match/${f.id}`} className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                View Match
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-bold">Matches</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
            Live & Upcoming Matches
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Browse live, scheduled, and completed matches across all sports.</p>
        </div>
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="live">
            <Section title="Live" items={live} />
          </TabsContent>
          <TabsContent value="upcoming">
            <Section title="Upcoming" items={upcoming} />
          </TabsContent>
          <TabsContent value="completed">
            <Section title="Completed" items={completed} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}