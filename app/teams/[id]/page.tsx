import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamStats } from "@/components/teams/team-stats"
import { TeamFixtures } from "@/components/teams/team-fixtures"
import { ArrowLeft, Users, Trophy, Target, Calendar, MapPin, Phone, Mail, User, UserCheck, VenetianMask, Crown, Star, Hash, CalendarClock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params before using
  const { id } = await params;
  
  const supabase = await getSupabaseServerClient()

  const { data: team } = await supabase.from("teams").select(`
    *,
    sport:sport_id (
      id,
      name,
      icon
    )
  `).eq("id", id).single()

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
        return <User className="h-3 w-3" />
      case "female":
        return <UserCheck className="h-3 w-3" />
      default:
        return <VenetianMask className="h-3 w-3" />
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
        </div>

        {/* Enhanced Team Header with Modern Design */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-white to-slate-50 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Team Logo with Enhanced Styling */}
              <div className="relative">
                <div 
                  className="w-28 h-28 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl border-4 border-white transform transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: team.color || "#3b82f6" }}
                >
                  {team.name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-1.5">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Team Information */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-2">
                      {team.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      >
                        Active Team
                      </Badge>
                      {team.gender && (
                        <Badge className={`px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5 ${getGenderColor()} border shadow-sm`}>
                          {getGenderIcon()}
                          {team.gender.charAt(0).toUpperCase() + team.gender.slice(1)}
                        </Badge>
                      )}
                      {team.department && (
                        <Badge variant="outline" className="px-3 py-1.5 text-sm font-semibold border-slate-300 shadow-sm">
                          {team.department}
                        </Badge>
                      )}
                      {team.sport && (
                        <Badge variant="outline" className="px-3 py-1.5 text-sm font-semibold border-slate-300 shadow-sm flex items-center gap-1.5">
                          {team.sport.icon && <span dangerouslySetInnerHTML={{ __html: team.sport.icon }} />}
                          {team.sport.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-5">Competing in OCEM Sports Hub 2025</p>
                
                {/* Enhanced Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Trophy className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Wins</p>
                        <p className="text-xl font-bold text-slate-900">{teamStats?.wins || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Points</p>
                        <p className="text-xl font-bold text-slate-900">{teamStats?.points || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Users className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Losses</p>
                        <p className="text-xl font-bold text-slate-900">{teamStats?.losses || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Played</p>
                        <p className="text-xl font-bold text-slate-900">{teamStats?.matches_played || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs styled like main teams page with small buttons */}
        <Tabs defaultValue="players" className="space-y-6">
          <div className="flex overflow-x-auto gap-2 mb-6 p-2 bg-white rounded-xl shadow-lg">
            <TabsList className="flex gap-2 w-max bg-transparent p-0">
              <TabsTrigger 
                value="players" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105"
              >
                <Users className="mr-2 h-4 w-4" />
                Team Members
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Statistics
              </TabsTrigger>
              <TabsTrigger 
                value="fixtures" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Fixtures
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="players" className="mt-0">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  Team Members
                  {captain && (
                    <Badge className="ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold px-2.5 py-0.5">
                      <Crown className="mr-1 h-2.5 w-2.5" />
                      Captain: {captain.member_name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamMembers && teamMembers.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
                    {teamMembers.map((member) => (
                      <Card 
                        key={member.id} 
                        className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 bg-white rounded-lg"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Member Avatar */}
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                                <AvatarImage src={member.member_image_url || undefined} />
                                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {member.member_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {member.is_captain && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-1.5 shadow-md">
                                  <Crown className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            
                            {/* Member Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                <h3 className="font-bold text-lg text-slate-900 truncate">{member.member_name}</h3>
                                <div className="flex flex-wrap gap-1.5">
                                  {member.is_captain && (
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold px-2 py-0.5">
                                      <Crown className="mr-1 h-3 w-3" />
                                      Captain
                                    </Badge>
                                  )}
                                  {member.is_substitute && (
                                    <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                                      <Star className="mr-1 h-3 w-3" />
                                      Substitute
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-500 flex items-center gap-1.5">
                                    <Hash className="h-4 w-4" />
                                    Order
                                  </span>
                                  <span className="font-medium text-slate-900">{member.member_order}</span>
                                </div>
                                
                                {member.member_position && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                      <User className="h-4 w-4" />
                                      Position
                                    </span>
                                    <span className="font-medium text-slate-900">{member.member_position}</span>
                                  </div>
                                )}
                                
                                {member.member_roll_number && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                      <CalendarClock className="h-4 w-4" />
                                      Roll Number
                                    </span>
                                    <span className="font-medium text-slate-900">{member.member_roll_number}</span>
                                  </div>
                                )}
                                
                                {member.member_contact && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                      <Phone className="h-4 w-4" />
                                      Phone
                                    </span>
                                    <span className="font-medium text-slate-900">{member.member_contact}</span>
                                  </div>
                                )}
                                
                                {member.member_email && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                      <Mail className="h-4 w-4" />
                                      Email
                                    </span>
                                    <span className="font-medium text-slate-900 max-w-[180px]">{member.member_email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                      <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Team Members Registered</h3>
                    <p className="text-slate-600 max-w-md mx-auto text-sm">
                      This team doesn't have any members registered yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <TeamStats teamId={id} />
          </TabsContent>

          <TabsContent value="fixtures" className="mt-0">
            <TeamFixtures teamId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}