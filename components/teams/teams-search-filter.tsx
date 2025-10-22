"use client"

import { useState } from "react"
import { SearchBar } from "@/components/teams/search-bar"
import { TeamsFilterSystem } from "@/components/teams/teams-filter-system"

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

export function TeamsSearchFilter({ teams, sports, teamsBySport }: { 
  teams: Team[], 
  sports: Sport[], 
  teamsBySport: Record<string, Team[]> 
}) {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <SearchBar onSearch={setSearchTerm} />
          
          {/* Navigation Buttons - Positioned to the right of search bar */}
          <div className="flex gap-3 flex-wrap">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                  <path d="M12 2v2"/>
                  <path d="M12 22v-2"/>
                  <path d="m17 20.66-1-1.73"/>
                  <path d="m11 10.27-2.5-4.33"/>
                  <path d="m20.66 17-1.73-1"/>
                  <path d="m3.34 7 1.73 1"/>
                  <path d="M14 12h8"/>
                  <path d="M2 12h2"/>
                  <path d="m20.66 7-1.73 1"/>
                  <path d="m3.34 17 1.73-1"/>
                  <path d="m17 3.34-1 1.73"/>
                  <path d="m11 13.73-2.5 4.33"/>
                </svg>
                View Fixtures
              </div>
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
                Tournaments
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sport Tabs Filter */}
      <div className="mb-8">
        <TeamsFilterSystem 
          teams={teams} 
          sports={sports} 
          teamsBySport={teamsBySport} 
          searchTerm={searchTerm}
        />
      </div>
    </>
  )
}