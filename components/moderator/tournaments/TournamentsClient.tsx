'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar } from "lucide-react"
import { CreateTournamentModal } from '@/components/moderator/tournaments/CreateTournamentModal'
import Link from "next/link"
import { useRouter } from 'next/navigation'

interface Tournament {
  id: string
  name: string
  description: string
  sport: {
    id: string
    name: string
    icon: string
  }
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  tournament_type: string
  tournament_teams: { count: number }[]
  max_teams: number
}

interface Sport {
  id: string
  name: string
  icon: string
}

interface TournamentsClientProps {
  tournaments: Tournament[]
  availableSports: Sport[]
}

export default function TournamentsClient({ tournaments, availableSports }: TournamentsClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()

  const handleTournamentCreated = () => {
    router.refresh()
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <Button 
          className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Trophy className="mr-2 h-5 w-5" />
          Create Tournament
        </Button>
        <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
          <Link href="/moderator">
            <Calendar className="mr-2 h-5 w-5" />
            Dashboard
          </Link>
        </Button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {tournaments?.map((tournament) => (
          <Card key={tournament.id} className="bg-white border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-5">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow text-white">
                  {tournament.sport?.icon || '🏆'}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{tournament.name}</h3>
                  <p className="text-sm text-slate-600">{tournament.sport?.name}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="text-sm text-slate-600">
                  <p>{tournament.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{tournament.tournament_type?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Teams:</span>
                    <span>{tournament.tournament_teams?.[0]?.count || 0} / {tournament.max_teams}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">
                    <span className={`inline-block px-3 py-1 rounded-full ${
                      tournament.status === 'active' ? 'bg-green-100 text-green-800' :
                      tournament.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      tournament.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/moderator/tournaments/${tournament.id}`}>
                      Manage
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Tournaments */}
      {(!tournaments || tournaments.length === 0) && (
        <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6 shadow-lg">
              <Trophy className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              No Tournaments Found
            </h3>
            <p className="text-slate-600 max-w-md mx-auto mb-8">
              Get started by creating your first tournament. You can set up brackets, round-robin, or elimination tournaments.
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Trophy className="mr-2 h-5 w-5" />
              Create Tournament
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Tournament Modal */}
      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availableSports={availableSports}
        onSuccess={handleTournamentCreated}
      />
    </>
  )
}