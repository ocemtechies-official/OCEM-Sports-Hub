'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Team {
  id: string
  name: string
  logo_url?: string
}

interface TournamentTeamManagementProps {
  tournamentId: string
  currentTeams: Team[]
  availableTeams: Team[]
  maxTeams: number
  isOpen: boolean
  onClose: () => void
}

export function TournamentTeamManagement({
  tournamentId,
  currentTeams,
  availableTeams,
  maxTeams,
  isOpen,
  onClose
}: TournamentTeamManagementProps) {
  const router = useRouter()
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClientComponentClient()

  const remainingSlots = maxTeams - currentTeams.length
  const canAddTeams = remainingSlots > 0

  const handleAddTeam = async () => {
    if (!selectedTeamId) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('tournament_teams')
        .insert({
          tournament_id: tournamentId,
          team_id: selectedTeamId,
          seed: currentTeams.length + 1
        })

      if (error) throw error

      setSelectedTeamId('')
      router.refresh()
    } catch (error) {
      console.error('Error adding team:', error)
      // Add error handling UI here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveTeam = async (teamId: string) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('tournament_teams')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('team_id', teamId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error removing team:', error)
      // Add error handling UI here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Tournament Teams</DialogTitle>
          <DialogDescription>
            Add or remove teams from the tournament. Teams added first will have higher seeds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {canAddTeams && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Add Team</Label>
                <span className="text-sm text-slate-600">
                  {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
                </span>
              </div>

              <div className="flex gap-2">
                <Select
                  value={selectedTeamId}
                  onValueChange={setSelectedTeamId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams
                      .filter(team => !currentTeams.some(ct => ct.id === team.id))
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          <div className="flex items-center gap-2">
                            {team.logo_url && (
                              <img 
                                src={team.logo_url} 
                                alt={team.name} 
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span>{team.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddTeam} 
                  disabled={!selectedTeamId || isSubmitting}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label>Current Teams ({currentTeams.length} / {maxTeams})</Label>
            <div className="space-y-2">
              {currentTeams.map((team, index) => (
                <div 
                  key={team.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      {team.logo_url && (
                        <img 
                          src={team.logo_url} 
                          alt={team.name} 
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="font-medium">{team.name}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isSubmitting}
                    onClick={() => handleRemoveTeam(team.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {currentTeams.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No teams added yet
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}