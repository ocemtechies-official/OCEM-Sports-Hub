"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TeamCard } from "@/components/teams/team-card"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"

interface Team {
  id: string
  name: string
  color: string | null
  logo_url: string | null
  gender: string | null
  team_members?: { count: number }[]
  sport?: {
    id: string
    name: string
    icon: string | null
  } | null
}

interface Sport {
  id: string
  name: string
  icon: string | null
}

// Client component for gender filters
function GenderFilter({ 
  activeFilter, 
  onFilterChange 
}: { 
  activeFilter: string; 
  onFilterChange: (filter: string) => void 
}) {
  return (
    <div className="flex gap-2 mb-6">
      <button 
        onClick={() => onFilterChange('all')}
        className={`font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg ${
          activeFilter === 'all' 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50'
        }`}
      >
        All
      </button>
      <button 
        onClick={() => onFilterChange('male')}
        className={`font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg ${
          activeFilter === 'male' 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-100 hover:text-blue-600'
        }`}
      >
        Boys
      </button>
      <button 
        onClick={() => onFilterChange('female')}
        className={`font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg ${
          activeFilter === 'female' 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-white text-slate-700 border border-slate-200 hover:bg-pink-100 hover:text-pink-600'
        }`}
      >
        Girls
      </button>
    </div>
  )
}

// Client component for teams display with filtering
function FilteredTeamsGrid({ teams, genderFilter, searchTerm }: { teams: Team[], genderFilter: string, searchTerm: string }) {
  // Apply gender filter
  const genderFilteredTeams = genderFilter === 'all' 
    ? teams 
    : teams.filter(team => team.gender === genderFilter)
    
  // Apply search filter
  const filteredTeams = searchTerm 
    ? genderFilteredTeams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : genderFilteredTeams
    
  if (filteredTeams.length === 0) {
    return (
      <Card className="col-span-full text-center py-16 bg-white rounded-xl border-0 shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-slate-100 rounded-full">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">No Teams Found</h3>
          <p className="text-slate-600 max-w-md">
            {searchTerm 
              ? `No teams found matching "${searchTerm}".` 
              : genderFilter === 'all' 
                ? "There are currently no teams registered." 
                : genderFilter === 'male' 
                  ? "There are currently no boys teams registered." 
                  : "There are currently no girls teams registered."}
          </p>
        </div>
      </Card>
    )
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredTeams.map((team, index) => (
        <div 
          key={team.id} 
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <TeamCard team={team} />
        </div>
      ))}
    </div>
  )
}

// Client component for the entire filter system
export function TeamsFilterSystem({ teams, sports, teamsBySport, searchTerm = "" }: { teams: Team[], sports: Sport[], teamsBySport: Record<string, Team[]>, searchTerm?: string }) {
  const [activeGenderFilter, setActiveGenderFilter] = useState('all')
  
  return (
    <Tabs defaultValue="all" className="w-full">
      {/* Top-level Sport Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 p-2 bg-white rounded-xl shadow-lg scrollbar-hide">
        <TabsList className="flex gap-2 w-max bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 hover:bg-blue-100 hover:text-blue-600"
          >
            All Teams
          </TabsTrigger>
          {sports?.map((sport) => (
            <TabsTrigger 
              key={sport.id} 
              value={sport.name}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 hover:bg-blue-100 hover:text-blue-600 whitespace-nowrap"
            >
              {sport.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {/* All Teams Tab with Gender Filters */}
      <TabsContent value="all" className="mt-6">
        <GenderFilter 
          activeFilter={activeGenderFilter} 
          onFilterChange={setActiveGenderFilter} 
        />
        <FilteredTeamsGrid 
          teams={teams} 
          genderFilter={activeGenderFilter} 
          searchTerm={searchTerm}
        />
      </TabsContent>
      
      {/* Sport-specific Tabs with Gender Filters */}
      {sports?.map((sport) => {
        const sportTeams = teamsBySport[sport.name] || []
        
        return (
          <TabsContent key={sport.id} value={sport.name} className="mt-6">
            <GenderFilter 
              activeFilter={activeGenderFilter} 
              onFilterChange={setActiveGenderFilter} 
            />
            <FilteredTeamsGrid 
              teams={sportTeams} 
              genderFilter={activeGenderFilter} 
              searchTerm={searchTerm}
            />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}