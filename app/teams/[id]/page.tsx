import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamStats } from "@/components/teams/team-stats"
import { TeamFixtures } from "@/components/teams/team-fixtures"
import { ArrowLeft, Users, Trophy, Target, Calendar, MapPin, Phone, Mail, User, UserCheck, VenetianMask, Crown, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params before using
  const { id } = await params;
  
  const supabase = await getSupabaseServerClient()

  const { data: team } = await supabase.from("teams").select("*").eq("id", id).single()

  if (!team) {
    notFound()
  }

  // Fetch team members instead of players
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", id)
    .order("member_order")

  // Fetch team stats for overview
  const { data: teamStats } = await supabase
    .from("leaderboards")
    .select("points, wins, losses, matches_played")
    .eq("team_id", id)
    .single()

  // Get gender icon and color
  const getGenderIcon = () => {
    switch (team.gender) {
      case "male":
        return <User className="h-4 w-4" />
      case "female":
        return <UserCheck className="h-4 w-4" />
      default:
        return <VenetianMask className="h-4 w-4" />
    }
  }

  const getGenderColor = () => {
    switch (team.gender) {
      case "male":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "female":
        return "bg-pink-100 text-pink-800 border-pink-200"
      default:
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  // Find captain
  const captain = teamMembers?.find(member => member.is_captain) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" asChild className="hover:bg-slate-100 transition-colors duration-200">
            <Link href="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hover:bg-slate-100 transition-colors duration-200">
            <Link href="/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Enhanced Team Header */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div 
            className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden"
            style={{ backgroundColor: team.color || "#3b82f6" }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white animate-pulse"></div>
              <div className="absolute bottom-5 right-10 w-24 h-24 rounded-full bg-white animate-pulse delay-300"></div>
            </div>
          </div>
          <CardContent className="p-6 -mt-24 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div 
                className="w-36 h-36 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white transform transition-transform duration-300 hover:scale-105"
                style={{ backgroundColor: team.color || "#3b82f6" }}
              >
                {team.name.charAt(0)}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 animate-fade-in">
                      {team.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge 
                        variant="secondary" 
                        className="px-4 py-2 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      >
                        Active Team
                      </Badge>
                      {team.gender && (
                        <Badge className={`px-4 py-2 text-base font-semibold flex items-center gap-2 ${getGenderColor()} border shadow-sm`}>
                          {getGenderIcon()}
                          {team.gender.charAt(0).toUpperCase() + team.gender.slice(1)} Team
                        </Badge>
                      )}
                      {team.department && (
                        <Badge variant="outline" className="px-4 py-2 text-base font-semibold border-slate-300 shadow-sm">
                          {team.department}
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-slate-600">Competing in OCEM Sports Hub 2025</p>
                  </div>
                </div>
                
                {/* Team Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Trophy className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm text-blue-600 font-medium">Wins</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{teamStats?.wins || 0}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm text-green-600 font-medium">Points</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{teamStats?.points || 0}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Users className="h-5 w-5 text-red-600" />
                      </div>
                      <span className="text-sm text-red-600 font-medium">Losses</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{teamStats?.losses || 0}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-sm text-purple-600 font-medium">Played</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{teamStats?.matches_played || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="players" className="space-y-6">
          <div className="bg-white border-0 shadow-lg rounded-xl p-1 hover:shadow-xl transition-all duration-300">
            <TabsList className="grid w-full grid-cols-3 bg-slate-50 rounded-lg p-1 gap-1">
              <TabsTrigger 
                value="players" 
                className="font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-md py-3 transition-all duration-300 h-full"
              >
                <Users className="mr-2 h-4 w-4" />
                Team Members
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-md py-3 transition-all duration-300 h-full"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Statistics
              </TabsTrigger>
              <TabsTrigger 
                value="fixtures" 
                className="font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-md py-3 transition-all duration-300 h-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Fixtures
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="players" className="mt-0 animate-fade-in">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  Team Members
                  {captain && (
                    <Badge className="ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold px-3 py-1">
                      <Crown className="mr-1 h-3 w-3" />
                      Captain: {captain.member_name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamMembers && teamMembers.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {teamMembers.map((member) => (
                      <Card 
                        key={member.id} 
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="h-16 w-16 ring-4 ring-blue-100 transition-transform duration-300 hover:scale-110">
                                <AvatarImage src={member.member_image_url || undefined} />
                                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {member.member_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {member.is_captain && (
                                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-1">
                                  <Crown className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-slate-900 truncate">{member.member_name}</h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.member_position && (
                                  <Badge variant="secondary" className="text-xs">
                                    {member.member_position}
                                  </Badge>
                                )}
                                {member.is_captain && (
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                    <Star className="mr-1 h-3 w-3" />
                                    Captain
                                  </Badge>
                                )}
                              </div>
                              {member.member_contact && (
                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>{member.member_contact}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                      <Users className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">No Team Members Registered</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      This team doesn't have any members registered yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-0 animate-fade-in">
            <TeamStats teamId={id} />
          </TabsContent>

          <TabsContent value="fixtures" className="mt-0 animate-fade-in">
            <TeamFixtures teamId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
